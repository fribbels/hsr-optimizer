import { Constants, MAX_RESULTS, Stats } from 'lib/constants.ts'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Utils } from 'lib/utils'
import DB from 'lib/db'
import { WorkerPool } from 'lib/workerPool'
import { BufferPacker } from 'lib/bufferPacker'
import { RelicFilters } from 'lib/relicFilters'
import { CharacterStats } from 'lib/characterStats'
import { Message } from 'lib/message'
import { generateOrnamentSetSolutions, generateRelicSetSolutions } from 'lib/optimizer/relicSetSolver'

let CANCEL = false

const elementToDamageMapping = {
  Physical: Stats.Physical_DMG,
  Fire: Stats.Fire_DMG,
  Ice: Stats.Ice_DMG,
  Thunder: Stats.Lightning_DMG,
  Wind: Stats.Wind_DMG,
  Quantum: Stats.Quantum_DMG,
  Imaginary: Stats.Imaginary_DMG,
}

export const Optimizer = {
  cancel: (id) => {
    CANCEL = true
    WorkerPool.cancel(id)
  },

  getFilteredRelics: (request) => {
    let relics = Utils.clone(DB.getRelics())
    RelicFilters.calculateWeightScore(request, relics)

    relics = RelicFilters.applyEquippedFilter(request, relics) // will reduce iterations if "off" is selected
    relics = RelicFilters.applyEnhanceFilter(request, relics)
    relics = RelicFilters.applyRankFilter(request, relics)

    // Pre-split filters
    let preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics)

    relics = RelicFilters.applyMainFilter(request, relics)
    relics = addMainStatToAugmentedStats(relics)
    relics = RelicFilters.applyMaxedMainStatsFilter(request, relics)
    relics = RelicFilters.applySetFilter(request, relics)

    // Post-split filters
    relics = RelicFilters.splitRelicsByPart(relics)

    relics = RelicFilters.applyCurrentFilter(request, relics)
    relics = RelicFilters.applyTopFilter(request, relics, preFilteredRelicsByPart)

    return [relics, preFilteredRelicsByPart]
  },

  optimize: function(request) {
    CANCEL = false

    window.store.getState().setPermutationsSearched(0)
    window.store.getState().setPermutationsResults(0)

    let lightConeMetadata = DB.getMetadata().lightCones[request.lightCone]
    let lightConeStats = lightConeMetadata.promotions[request.lightConeLevel]
    let lightConeSuperimposition = lightConeMetadata.superimpositions[request.lightConeSuperimposition]

    let characterMetadata = DB.getMetadata().characters[request.characterId]
    let characterStats = characterMetadata.promotions[request.characterLevel]

    console.log({ lightConeStats })
    console.log({ characterStats })

    // Fill in elements
    let element = characterMetadata.element
    let damageElement = elementToDamageMapping[element]

    const teammates = [
      request.teammate0,
      request.teammate1,
      request.teammate2,
    ].filter((x) => !!x.characterId)
    for (let i = 0; i < teammates.length; i++) {
      const teammate = teammates[i]
      let teammateCharacterMetadata = DB.getMetadata().characters[teammate.characterId]
      teammate.damageElement = elementToDamageMapping[teammateCharacterMetadata.element]
    }

    let baseStats = {
      base: {
        ...CharacterStats.getZeroes(),
        ...characterStats,
      },
      traces: {
        ...CharacterStats.getZeroes(),
        ...characterMetadata.traces,
      },
      lightCone: {
        ...CharacterStats.getZeroes(),
        ...lightConeStats,
        ...lightConeSuperimposition,
      },
    }

    const [relics] = this.getFilteredRelics(request)

    console.log('Optimize request', request)
    console.log('Optimize relics', relics)
    console.log('Optimize damage element', damageElement)

    let relicSetSolutions = generateRelicSetSolutions(request)
    let ornamentSetSolutions = generateOrnamentSetSolutions(request)

    const sizes = {
      hSize: relics.Head.length,
      gSize: relics.Hands.length,
      bSize: relics.Body.length,
      fSize: relics.Feet.length,
      pSize: relics.PlanarSphere.length,
      lSize: relics.LinkRope.length,
    }

    let permutations = sizes.hSize * sizes.gSize * sizes.bSize * sizes.fSize * sizes.pSize * sizes.lSize

    OptimizerTabController.setMetadata(sizes, relics)

    console.log(`Optimization permutations: ${permutations}, blocksize: ${Constants.THREAD_BUFFER_LENGTH}`)

    if (permutations == 0) {
      window.store.getState().setOptimizationInProgress(false)
      Message.error('No possible permutations match your filters - please check the Permutations panel for details, and adjust your filter values', 10)
      OptimizerTabController.setRows([])
      OptimizerTabController.resetDataSource()
      return
    }

    if (CANCEL) {
      window.store.getState().setOptimizationInProgress(false)
      return
    }

    window.optimizerGrid.current.api.showLoadingOverlay()

    let results = []
    let searched = 0

    let resultsShown = false

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    function handleTopRow() {
      let relics = Utils.clone(DB.getRelics())
      RelicFilters.calculateWeightScore(request, relics)
      relics = relics.filter((x) => x.equippedBy == request.characterId)
      relics = addMainStatToAugmentedStats(relics)
      relics = RelicFilters.applyMaxedMainStatsFilter(request, relics)
      if (relics.length < 6) return

      relics = RelicFilters.splitRelicsByPart(relics)

      let callback = (result) => {
        let resultArr = new Float64Array(result.buffer)
        console.log(`Top row complete`)

        let rowData = []
        BufferPacker.extractArrayToResults(resultArr, 1, rowData)
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
        damageElement: damageElement,
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
        damageElement: damageElement,
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

        BufferPacker.extractArrayToResults(resultArr, run.runSize, results)

        // console.log(`Thread complete - status: inProgress ${inProgress}, results: ${results.length}`)

        window.store.getState().setPermutationsResults(results.length)
        window.store.getState().setPermutationsSearched(Math.min(permutations, searched))

        if (inProgress == 0 || CANCEL) {
          window.store.getState().setOptimizationInProgress(false)
          OptimizerTabController.setRows(results)

          window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
          console.log('Done', results.length)
          resultsShown = true
          return
        }

        if ((results.length >= MAX_RESULTS) && !CANCEL) {
          CANCEL = true
          Optimizer.cancel(request.optimizationId)
          Message.error('Too many results, stopping at 2,000,000 - please narrow your filters to limit results', 10)
        }
      }

      WorkerPool.execute(input, callback)
    }
  },
}

function addMainStatToAugmentedStats(relics) {
  relics = relics.map((x) => structuredClone(x))

  for (let relic of relics) {
    relic.augmentedStats[relic.augmentedStats.mainStat] = relic.augmentedStats.mainValue
  }
  return relics
}
