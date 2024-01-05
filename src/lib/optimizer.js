import { GPUOptimizer } from "./gpuOptimizer";
import { Constants } from "./constants";
import { OptimizerTabController } from './optimizerTabController';
import { Utils } from './utils';
import DB from "./db";
import { WorkerPool } from "./workerPool";
import {BufferPacker} from "./bufferPacker";

let MAX_INT = 2147483647;

let WIDTH = 100000;
let HEIGHT = 1;
let MAX_RESULTS = 2_000_000;

// Flatten a relic's augmented stats + part to a single array & percents -> decimals + zeroing undefined
function relicToArray(relic) {
  let partToNumber = {
    [Constants.Parts.Head]: 0,
    [Constants.Parts.Hands]: 1,
    [Constants.Parts.Body]: 2,
    [Constants.Parts.Feet]: 3,
    [Constants.Parts.PlanarSphere]: 4,
    [Constants.Parts.LinkRope]: 5
  }

  let setToNumber = {}
  if (relic.part == Constants.Parts.PlanarSphere || relic.part == Constants.Parts.LinkRope) {
    for (let i = 0; i < Object.values(Constants.SetsOrnaments).length; i++) {
      setToNumber[Object.values(Constants.SetsOrnaments)[i]] = i
    }
  } else {
    for (let i = 0; i < Object.values(Constants.SetsRelics).length; i++) {
      setToNumber[Object.values(Constants.SetsRelics)[i]] = i
    }
  }

  let result = []
  for (let i = 0; i < Object.values(Constants.Stats).length; i++) {
    let stat = Object.values(Constants.Stats)[i];
    result[i] = relic.augmentedStats[stat] || 0
  }

  result.push(partToNumber[relic.part]);
  result.push(setToNumber[relic.set]);

  return result;
}

// Flatten a character's stats to arrays & percents -> decimals + zeroing undefined
function characterToArrays(character) {
  let result = {
    base: [],
    traces: [],
    lightCone: []
  }

  for (let i = 0; i < Object.values(Constants.Stats).length; i++) {
    let stat = Object.values(Constants.Stats)[i];
    result.base[i] = character.base[stat] || 0
    result.traces[i] = character.traces[stat] || 0
    result.lightCone[i] = character.lightCone[stat] || 0
    
  }

  console.log('Convert', character, result);

  return result;
}

let CANCEL = false;

export const Optimizer = {
  cancel: (id) => {
    CANCEL = true
    WorkerPool.cancel(id)
  },

  optimize: async function(request, topRow) {
    CANCEL = false

    store.getState().setPermutationsSearched(0)
    store.getState().setPermutationsResults(0)

    let lightConeMetadata = DB.getMetadata().lightCones[request.lightCone];
    let lightConeStats = lightConeMetadata.promotions[request.lightConeLevel]
    let lightConeSuperimposition = lightConeMetadata.superimpositions[request.lightConeSuperimposition]

    let characterMetadata = DB.getMetadata().characters[request.characterId]
    let characterStats = characterMetadata.promotions[request.characterLevel]

    console.log({lightConeStats})
    console.log({characterStats})

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

    let relics = DB.getRelics();

    relics = JSON.parse(JSON.stringify(relics))
    relics = RelicFilters.applyEnhanceFilter(request, relics);
    relics = RelicFilters.applyRankFilter(request, relics);

    // Pre-split filters
    let preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics);

    relics = applyMainFilter(request, relics);
    relics = addMainStatToAugmentedStats(relics);
    relics = applyMaxedMainStatsFilter(request, relics);
    relics = RelicFilters.applySetFilter(request, relics)

    // Post-split filters
    relics = splitRelicsByPart(relics);

    relics = RelicFilters.applyCurrentFilter(request, relics);
    relics = RelicFilters.applyTopFilter(request, relics, preFilteredRelicsByPart);

    let relicsArrays = relicsByPartToArray(relics);

    let elementalMultipliers = [
      element == 'Physical' ? 1 : 0,
      element == 'Fire' ? 1 : 0,
      element == 'Ice' ? 1 : 0,
      element == 'Thunder' ? 1 : 0,
      element == 'Wind' ? 1 : 0,
      element == 'Quantum' ? 1 : 0,
      element == 'Imaginary' ? 1 : 0,
    ]

    let character = characterToArrays(baseStats);
    console.log('Optimize request', request)
    console.log('Current state', Constants)
    console.log('Optimize relics', relics)
    console.log('Optimize relics arrays', relicsArrays)
    console.log('Optimize character', character)
    console.log('Optimize elemental multipliers', elementalMultipliers)
    
    let { relicSetAllowList, relicSetSolutions } = generateRelicSetAllowList(request)
    let ornamentSetSolutions = generateOrnamentSetAllowList(request)
    
    let hSize = relicsArrays.Head.length
    let gSize = relicsArrays.Hands.length
    let bSize = relicsArrays.Body.length
    let fSize = relicsArrays.Feet.length
    let pSize = relicsArrays.PlanarSphere.length
    let lSize = relicsArrays.LinkRope.length

    let permutations = hSize * gSize * bSize * fSize * pSize * lSize;

    console.log(`Building kernel, permutations: ${permutations}, blocksize: ${WIDTH * HEIGHT}`)
    let consts = GPUOptimizer.createConstants(
      HEIGHT, 
      WIDTH, 
      request, 
      relicsArrays, 
      character, 
      relicSetAllowList, 
      relicSetSolutions, 
      ornamentSetSolutions,
      elementalMultipliers
    );

    if (permutations == 0) {
      OptimizerTabController.setMetadata(consts, relics)
      OptimizerTabController.setRows([])
      OptimizerTabController.resetDataSource()
    }

    if (CANCEL) return;

    optimizerGrid.current.api.showLoadingOverlay()

    let results = []
    let increment = (WIDTH * HEIGHT)
    let searched = 0
    let runs = Math.ceil(permutations / increment) 
    let inProgress = runs

    let resultsShown = false

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    function handleTopRow() {
      let relics = DB.getRelics();
      relics = relics.filter(x => x.equippedBy == request.characterId)
      relics = addMainStatToAugmentedStats(relics);
      relics = applyMaxedMainStatsFilter(request, relics);
      if (relics.length < 6) return

      relics = splitRelicsByPart(relics);

      let callback = (result) => {
        let resultArr = new Float32Array(result.buffer)
        console.log(`Top row complete`)

        let rowData = []
        BufferPacker.extractArrayToResults(resultArr, 1, rowData);
        if (rowData.length > 0) {
          OptimizerTabController.setTopRow(rowData[0])
        }
      }

      let input = {
        topRow: true, // Skip all filters for top row
        setAllowList: relicSetAllowList,
        relics: relics,
        character: baseStats,
        Constants: Constants,
        consts: consts,
        WIDTH: WIDTH,
        HEIGHT: HEIGHT,
        skip: 0,
        permutations: 1,
        relicSetToIndex: Constants.RelicSetToIndex,
        ornamentSetToIndex: Constants.OrnamentSetToIndex,
        elementalMultipliers: elementalMultipliers,
        request: request,
      }

      WorkerPool.execute(input, callback, request.optimizationId)
    }
    handleTopRow()

    for (let run = 0; run < runs; run++) {
      // const arr = new Float32Array(WIDTH * HEIGHT * 40) // todo reuse these

      let input = {
        setAllowList: relicSetAllowList,
        relics: relics,
        character: baseStats,
        Constants: Constants,
        consts: consts,
        WIDTH: WIDTH,
        HEIGHT: HEIGHT,
        skip: run * increment,
        permutations: permutations,
        relicSetToIndex: Constants.RelicSetToIndex,
        ornamentSetToIndex: Constants.OrnamentSetToIndex,
        elementalMultipliers: elementalMultipliers,
        request: request,
      }

      let callback = (result) => {
        searched += increment
        inProgress -= 1

        if (CANCEL && resultsShown) {
          return
        }

        let resultArr = new Float32Array(result.buffer)
        // console.log(`Optimizer results`, result, resultArr)

        BufferPacker.extractArrayToResults(resultArr, WIDTH * HEIGHT, results);

        console.log(`Thread complete - status: inProgress ${inProgress}, results: ${results.length}}`)

        store.getState().setPermutationsResults(results.length)
        store.getState().setPermutationsSearched(Math.min(permutations, searched))

        if (inProgress == 0 || CANCEL) {
          OptimizerTabController.setMetadata(consts, relics)
          OptimizerTabController.setRows(results)

          optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
          console.log('Done', results.length);
          resultsShown = true
          return
        }

        if ((results.length >= MAX_RESULTS) && !CANCEL) {
          CANCEL = true;
          Message.error('Too many results, stopping at 2,000,000 - please narrow your filters to reduce results', 10)
        }
      }

      
      // WorkerPool.execute(input, callback)
      setTimeout(() => WorkerPool.execute(input, callback, request.optimizationId), 50)
    }
  }
}

function applyMainFilter(request, relics) {
  let out = []
  out.push(...relics.filter(x => x.part == Constants.Parts.Head).filter(x => request.mainHead.length == 0 || request.mainHead.includes(x.main.stat)))
  out.push(...relics.filter(x => x.part == Constants.Parts.Hands).filter(x => request.mainHands.length == 0 || request.mainHands.includes(x.main.stat)))
  out.push(...relics.filter(x => x.part == Constants.Parts.Body).filter(x => request.mainBody.length == 0 || request.mainBody.includes(x.main.stat)))
  out.push(...relics.filter(x => x.part == Constants.Parts.Feet).filter(x => request.mainFeet.length == 0 || request.mainFeet.includes(x.main.stat)))
  out.push(...relics.filter(x => x.part == Constants.Parts.PlanarSphere).filter(x => request.mainPlanarSphere.length == 0 || request.mainPlanarSphere.includes(x.main.stat)))
  out.push(...relics.filter(x => x.part == Constants.Parts.LinkRope).filter(x => request.mainLinkRope.length == 0 || request.mainLinkRope.includes(x.main.stat)))

  return out;
}

function applyMaxedMainStatsFilter(request, relics) {
  if (request.predictMaxedMainStat) {
    relics.map(x => x.augmentedStats[x.main.stat] = Utils.isFlat(x.main.stat) ? StatCalculator.getMaxedMainStat(x) : StatCalculator.getMaxedMainStat(x) / 100)
  }
  return relics
}

function relicsByPartToArray(relics) {
  return {
    Head: relics.Head.map(x => relicToArray(x)),
    Hands: relics.Hands.map(x => relicToArray(x)),
    Body: relics.Body.map(x => relicToArray(x)),
    Feet: relics.Feet.map(x => relicToArray(x)),
    PlanarSphere: relics.PlanarSphere.map(x => relicToArray(x)),
    LinkRope: relics.LinkRope.map(x => relicToArray(x))
  }
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
      let index1D = x[0] + x[1]*Math.pow(len, 1) + x[2]*Math.pow(len, 2) + x[3]*Math.pow(len, 3)
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