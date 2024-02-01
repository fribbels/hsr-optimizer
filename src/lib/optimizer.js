import { Constants } from "./constants.ts";
import { OptimizerTabController } from './optimizerTabController';
import { Utils } from './utils';
import DB from "./db";
import { WorkerPool } from "./workerPool";
import { BufferPacker } from "./bufferPacker";
import { RelicFilters } from "./relicFilters";
import { CharacterStats } from "./characterStats";
import { Message } from "./message";
import { StatCalculator } from "./statCalculator";

let MAX_RESULTS = 2_000_000;

let CANCEL = false;

export const Optimizer = {
  cancel: (id) => {
    CANCEL = true
    WorkerPool.cancel(id)
  },

  getFilteredRelics: (request) => {
    let relics = Utils.clone(DB.getRelics());
    RelicFilters.calculateWeightScore(request, relics)

    relics = RelicFilters.applyEquippedFilter(request, relics); // will reduce iterations if "off" is selected
    relics = RelicFilters.applyEnhanceFilter(request, relics);
    relics = RelicFilters.applyRankFilter(request, relics);

    // Pre-split filters
    let preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics);

    relics = RelicFilters.applyMainFilter(request, relics);
    relics = addMainStatToAugmentedStats(relics);
    relics = applyMaxedMainStatsFilter(request, relics);
    relics = RelicFilters.applySetFilter(request, relics)

    // Post-split filters
    relics = splitRelicsByPart(relics);

    relics = RelicFilters.applyCurrentFilter(request, relics);
    relics = RelicFilters.applyTopFilter(request, relics, preFilteredRelicsByPart);

    return [relics, preFilteredRelicsByPart];
  },

  optimize: function (request) {
    CANCEL = false

    global.store.getState().setPermutationsSearched(0)
    global.store.getState().setPermutationsResults(0)

    let lightConeMetadata = DB.getMetadata().lightCones[request.lightCone];
    let lightConeStats = lightConeMetadata.promotions[request.lightConeLevel]
    let lightConeSuperimposition = lightConeMetadata.superimpositions[request.lightConeSuperimposition]

    let characterMetadata = DB.getMetadata().characters[request.characterId]
    let characterStats = characterMetadata.promotions[request.characterLevel]

    console.log({ lightConeStats })
    console.log({ characterStats })

    let element = characterMetadata.element

    let baseStats = {
      base: {
        ...CharacterStats.getZeroes(),
        ...characterStats
      },
      traces: {
        ...CharacterStats.getZeroes(),
        ...characterMetadata.traces
      },
      lightCone: {
        ...CharacterStats.getZeroes(),
        ...lightConeStats,
        ...lightConeSuperimposition
      }
    }

    const [relics] = this.getFilteredRelics(request);

    let elementalMultipliers = [
      element == 'Physical' ? 1 : 0,
      element == 'Fire' ? 1 : 0,
      element == 'Ice' ? 1 : 0,
      element == 'Thunder' ? 1 : 0,
      element == 'Wind' ? 1 : 0,
      element == 'Quantum' ? 1 : 0,
      element == 'Imaginary' ? 1 : 0,
    ]

    console.log('Optimize request', request)
    console.log('Current state', Constants)
    console.log('Optimize relics', relics)
    console.log('Optimize relics arrays', relics)
    console.log('Optimize elemental multipliers', elementalMultipliers)

    let { relicSetAllowList, relicSetSolutions } = generateRelicSetAllowList(request)
    let ornamentSetSolutions = generateOrnamentSetAllowList(request)
    console.log('relicSetAllowList, relicSetSolutions', relicSetAllowList, relicSetSolutions)

    const sizes = {
      hSize: relics.Head.length,
      gSize: relics.Hands.length,
      bSize: relics.Body.length,
      fSize: relics.Feet.length,
      pSize: relics.PlanarSphere.length,
      lSize: relics.LinkRope.length,
    }

    let permutations = sizes.hSize * sizes.gSize * sizes.bSize * sizes.fSize * sizes.pSize * sizes.lSize;

    OptimizerTabController.setMetadata(sizes, relics)

    console.log(`Optimization permutations: ${permutations}, blocksize: ${Constants.THREAD_BUFFER_LENGTH}`)

    if (permutations == 0) {
      OptimizerTabController.setRows([])
      OptimizerTabController.resetDataSource()
      return
    }

    if (CANCEL) return;

    global.optimizerGrid.current.api.showLoadingOverlay()

    let results = []
    let searched = 0

    let resultsShown = false

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    function handleTopRow() {
      let relics = Utils.clone(DB.getRelics());
      RelicFilters.calculateWeightScore(request, relics)
      relics = relics.filter(x => x.equippedBy == request.characterId)
      relics = addMainStatToAugmentedStats(relics);
      relics = applyMaxedMainStatsFilter(request, relics);
      if (relics.length < 6) return

      relics = splitRelicsByPart(relics);

      let callback = (result) => {
        let resultArr = new Float64Array(result.buffer)
        console.log(`Top row complete`)

        let rowData = []
        BufferPacker.extractArrayToResults(resultArr, 1, rowData);
        if (rowData.length > 0) {
          OptimizerTabController.setTopRow(rowData[0])
        }
      }

      let input = {
        topRow: true, // Skip all filters for top row
        relics: relics,
        character: baseStats,
        WIDTH: 1,
        skip: 0,
        permutations: 1,
        relicSetToIndex: Constants.RelicSetToIndex,
        ornamentSetToIndex: Constants.OrnamentSetToIndex,
        elementalMultipliers: elementalMultipliers,
        relicSetSolutions: relicSetSolutions,
        ornamentSetSolutions: ornamentSetSolutions,
        request: request,
      }

      WorkerPool.execute(input, callback, request.optimizationId)
    }
    handleTopRow()

    // Incrementally increase the optimization run sizes instead of having a fixed size, so it doesnt lag for 2 seconds on Start
    let increment = 20000
    let runSize = 0
    let maxSize = Constants.THREAD_BUFFER_LENGTH

    // Generate runs
    let runs = []
    for (let currentSkip = 0; currentSkip < permutations; currentSkip += runSize) {
      runSize = Math.min(maxSize, runSize + increment)
      runs.push({
        skip: currentSkip,
        runSize: runSize,
      })
    }

    let inProgress = runs.length
    for (let run of runs) {
      let input = {
        relics: relics,
        character: baseStats,
        WIDTH: run.runSize,
        skip: run.skip,
        permutations: permutations,
        relicSetToIndex: Constants.RelicSetToIndex,
        ornamentSetToIndex: Constants.OrnamentSetToIndex,
        elementalMultipliers: elementalMultipliers,
        relicSetSolutions: relicSetSolutions,
        ornamentSetSolutions: ornamentSetSolutions,
        request: request,
      }

      let callback = (result) => {
        searched += run.runSize
        inProgress -= 1

        if (CANCEL && resultsShown) {
          return
        }

        let resultArr = new Float64Array(result.buffer)
        // console.log(`Optimizer results`, result, resultArr, run)

        BufferPacker.extractArrayToResults(resultArr, run.runSize, results);

        console.log(`Thread complete - status: inProgress ${inProgress}, results: ${results.length}`)

        global.store.getState().setPermutationsResults(results.length)
        global.store.getState().setPermutationsSearched(Math.min(permutations, searched))

        if (inProgress == 0 || CANCEL) {
          OptimizerTabController.setRows(results)

          global.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
          console.log('Done', results.length);
          resultsShown = true
          return
        }

        if ((results.length >= MAX_RESULTS) && !CANCEL) {
          CANCEL = true;
          Optimizer.cancel(request.optimizationId)
          Message.error('Too many results, stopping at 2,000,000 - please narrow your filters to limit results', 10)
        }
      }

      WorkerPool.execute(input, callback)
    }
  }
}

function applyMaxedMainStatsFilter(request, relics) {
  if (request.predictMaxedMainStat) {
    relics.map(x => x.augmentedStats[x.main.stat] = Utils.isFlat(x.main.stat) ? StatCalculator.getMaxedMainStat(x) : StatCalculator.getMaxedMainStat(x) / 100)
  }
  return relics
}

function addMainStatToAugmentedStats(relics) {
  relics = relics.map(x => structuredClone(x))

  for (let relic of relics) {
    relic.augmentedStats[relic.augmentedStats.mainStat] = relic.augmentedStats.mainValue
  }
  return relics;
}

function splitRelicsByPart(relics) {
  return {
    Head: relics.filter(x => x.part == Constants.Parts.Head),
    Hands: relics.filter(x => x.part == Constants.Parts.Hands),
    Body: relics.filter(x => x.part == Constants.Parts.Body),
    Feet: relics.filter(x => x.part == Constants.Parts.Feet),
    PlanarSphere: relics.filter(x => x.part == Constants.Parts.PlanarSphere),
    LinkRope: relics.filter(x => x.part == Constants.Parts.LinkRope)
  }
}

function generateEmptyArr(n) {
  return Array(n).fill(0)
}

// [0, 0, 0, 2, 0, 2] => [3, 3, 5, 5]
function relicSetAllowListToIndices(arr) {
  let out = []
  for (let i = 0; i < arr.length; i++) {
    while (arr[i]) {
      arr[i]--
      out.push(i);
    }
  }

  return out;
}

// [5, 5] => [[5,5,0,0], [5,5,0,1], [5,5,1,1], [5,5,1,2], ...]
function fillRelicSetArrPossibilities(arr, len) {
  let out = []
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      let newArr = Utils.arrayOfZeroes(4)
      newArr[0] = arr[0]
      newArr[1] = arr[1]
      newArr[2] = i
      newArr[3] = j

      out.push(newArr)
    }
  }

  return out;
}

const permutator = (inputArr) => {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
      }
    }
  }

  permute(inputArr)
  return result;
}

// [[5,5,0,0], [5,5,0,1], [5,5,1,1], [5,5,1,2], ...] => [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0..]
function convertRelicSetIndicesTo1D(setIndices) {
  let len = Constants.SetsRelicsNames.length
  if (setIndices.length == 0) {
    return Utils.arrayOfValue(Math.pow(len, 4), 1);
  }

  let arr = Utils.arrayOfZeroes(Math.pow(len, 4))

  for (let i = 0; i < setIndices.length; i++) {
    let y = setIndices[i] // [5,5,2,3]
    let permutations = permutator(y)
    for (let x of permutations) {
      let index1D = x[0] + x[1] * Math.pow(len, 1) + x[2] * Math.pow(len, 2) + x[3] * Math.pow(len, 3)
      arr[index1D] = 1
    }
  }

  return arr
}
function generateOrnamentSetAllowList(request) {
  let setRequest = request.ornamentSets || [];

  let len = Constants.SetsOrnamentsNames.length;

  if (setRequest.length == 0) {
    return Utils.arrayOfValue(len * len, 1);
  }

  let arr = Utils.arrayOfZeroes(len * len)

  for (let set of setRequest) {
    let setIndex = Constants.OrnamentSetToIndex[set]
    let index1D = setIndex + setIndex * len
    arr[index1D] = 1
  }

  // console.log('ornamentSetSolutions', arr);

  return arr
}

function generateRelicSetAllowList(request) {
  // Init
  let setRequest = request.relicSets || [];
  let len = Constants.SetsRelicsNames.length;
  let relicSetAllowList = []
  let setIndices = []

  // console.log('setRequest', setRequest)
  for (let setArr of setRequest) {
    if (setArr[0] == '4 Piece') {
      // ok
      if (setArr.length == 1) {
        // All 4 pieces
        for (let i = 0; i < len; i++) {
          let arr = generateEmptyArr(len)
          arr[i] = 4
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices);
        }
      }

      // ok
      if (setArr.length == 2) {
        // Specific 4 piece
        let index = Constants.RelicSetToIndex[setArr[1]];
        let arr = generateEmptyArr(len)
        arr[index] = 4
        relicSetAllowList.push(arr.join())
        let indices = relicSetAllowListToIndices(arr)
        setIndices.push(indices);
      }
    }

    if (setArr[0] == '2 Piece') {
      // ok
      if (setArr.length == 1) {
        // Any 2 piece + Any
        for (let i = 0; i < len; i++) {
          let arr = generateEmptyArr(len)
          arr[i] = 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          // setIndices.push(indices);
          let filledIndices = fillRelicSetArrPossibilities(indices, len)
          setIndices.push(...filledIndices);
        }

        // Also means 2 + 2 pieces are allowed
        for (let i = 0; i < len; i++) {
          for (let j = 0; j < len; j++) {
            let arr = generateEmptyArr(len)
            arr[i] += 2
            arr[j] += 2
            relicSetAllowList.push(arr.join())
            let indices = relicSetAllowListToIndices(arr)
            setIndices.push(indices);
          }
        }
      }

      // ok
      if (setArr.length == 2) {
        // Single 2 piece + Any

        // 2 + 2s
        let index = Constants.RelicSetToIndex[setArr[1]];
        for (let i = 0; i < len; i++) {
          let arr = generateEmptyArr(len)
          arr[index] = 2
          arr[i] += 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices);
        }

        // 2 + 0
        let arr = generateEmptyArr(len)
        arr[index] = 2
        relicSetAllowList.push(arr.join())
        let indices = relicSetAllowListToIndices(arr)
        // setIndices.push(indices);
        let filledIndices = fillRelicSetArrPossibilities(indices, len)
        setIndices.push(...filledIndices);
      }

      // ok
      if (setArr.length == 3) {
        // Specific 2 piece + (2 piece OR any)

        if (setArr[2] == 'Any') {
          let index = Constants.RelicSetToIndex[setArr[1]];
          for (let i = 0; i < len; i++) {
            let arr = generateEmptyArr(len)
            arr[index] = 2
            arr[i] += 2
            relicSetAllowList.push(arr.join())
            let indices = relicSetAllowListToIndices(arr)
            setIndices.push(indices);
          }

          // 2 + 0
          let arr = generateEmptyArr(len)
          arr[index] = 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          let filledIndices = fillRelicSetArrPossibilities(indices, len)
          setIndices.push(...filledIndices);
        } else {
          let arr = generateEmptyArr(len)
          let index1 = Constants.RelicSetToIndex[setArr[1]];
          let index2 = Constants.RelicSetToIndex[setArr[2]];
          arr[index1] += 2
          arr[index2] += 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices);
        }
      }
    }
  }
  let relicSetSolutions = convertRelicSetIndicesTo1D(setIndices);

  relicSetAllowList = [...new Set(relicSetAllowList)]
  return {
    relicSetAllowList,
    relicSetSolutions
  }
}