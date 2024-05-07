import { Constants, ElementToDamage, MAX_RESULTS, Stats } from 'lib/constants.ts'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Utils } from 'lib/utils'
import DB from 'lib/db'
import { WorkerPool } from 'lib/workerPool'
import { BufferPacker } from 'lib/bufferPacker'
import { RelicFilters } from 'lib/relicFilters'
import { Message } from 'lib/message'
import { generateOrnamentSetSolutions, generateRelicSetSolutions } from 'lib/optimizer/relicSetSolver'
import { generateParams } from 'lib/optimizer/calculateParams'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { activateZeroPermutationsSuggestionsModal } from 'components/optimizerTab/OptimizerSuggestionsModal'
import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'
import { SortOption } from 'lib/optimizer/sortOptions'
import { setSortColumn } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'

let CANCEL = false

export function calculateCurrentlyEquippedRow(request) {
  let relics = Utils.clone(DB.getRelics())
  RelicFilters.calculateWeightScore(request, relics)
  relics = relics.filter((x) => x.equippedBy == request.characterId)
  relics = RelicFilters.applyMaxedMainStatsFilter(request, relics)
  relics = RelicFilters.splitRelicsByPart(relics)
  RelicFilters.condenseRelicSubstatsForOptimizer(relics)
  Object.keys(relics).map((key) => relics[key] = relics[key][0])

  const c = calculateBuild(request, relics)
  renameFields(c)
  OptimizerTabController.setTopRow(c)
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
    relics = RelicFilters.applyGradeFilter(request, relics)
    relics = RelicFilters.applyRankFilter(request, relics)
    relics = RelicFilters.applyExcludeFilter(request, relics)

    // Pre-split filters
    const preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics)

    relics = RelicFilters.applyMainFilter(request, relics)
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

    const teammates = [
      request.teammate0,
      request.teammate1,
      request.teammate2,
    ].filter((x) => !!x.characterId)
    for (let i = 0; i < teammates.length; i++) {
      const teammate = teammates[i]
      const teammateCharacterMetadata = DB.getMetadata().characters[teammate.characterId]
      teammate.ELEMENTAL_DMG_TYPE = ElementToDamage[teammateCharacterMetadata.element]
    }

    const [relics] = this.getFilteredRelics(request)
    RelicFilters.condenseRelicSubstatsForOptimizer(relics)

    console.log('Optimize request', request)
    console.log('Optimize relics', relics)

    const relicSetSolutions = generateRelicSetSolutions(request)
    const ornamentSetSolutions = generateOrnamentSetSolutions(request)

    const sizes = {
      hSize: relics.Head.length,
      gSize: relics.Hands.length,
      bSize: relics.Body.length,
      fSize: relics.Feet.length,
      pSize: relics.PlanarSphere.length,
      lSize: relics.LinkRope.length,
    }
    const permutations = sizes.hSize * sizes.gSize * sizes.bSize * sizes.fSize * sizes.pSize * sizes.lSize
    OptimizerTabController.setMetadata(sizes, relics)

    console.log(`Optimization permutations: ${permutations}, blocksize: ${Constants.THREAD_BUFFER_LENGTH}`)
    if (permutations == 0) {
      window.store.getState().setOptimizationInProgress(false)
      activateZeroPermutationsSuggestionsModal(request)
      OptimizerTabController.setRows([])
      OptimizerTabController.resetDataSource()
      return
    }

    if (CANCEL) {
      window.store.getState().setOptimizationInProgress(false)
      return
    }

    OptimizerTabController.scrollToGrid()

    window.optimizerGrid.current.api.showLoadingOverlay()

    const params = generateParams(request)

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    calculateCurrentlyEquippedRow(request)

    let searched = 0
    let resultsShown = false
    let results = []
    const sortOption = SortOption[request.resultSort]
    const gridSortColumn = request.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
    const resultLimit = request.resultLimit || 100000
    const queueResults = new FixedSizePriorityQueue(resultLimit, (a, b) => a[gridSortColumn] - b[gridSortColumn])

    // Incrementally increase the optimization run sizes instead of having a fixed size, so it doesnt lag for 2 seconds on Start
    const increment = 20000
    let runSize = 0
    const maxSize = Constants.THREAD_BUFFER_LENGTH

    // Generate runs
    const runs = []
    for (let currentSkip = 0; currentSkip < permutations; currentSkip += runSize) {
      runSize = Math.min(maxSize, runSize + increment)
      runs.push({
        skip: currentSkip,
        runSize: runSize,
      })
    }

    let inProgress = runs.length
    for (const run of runs) {
      const task = {
        input: {
          params: params,
          request: request,
          relics: relics,
          WIDTH: run.runSize,
          skip: run.skip,
          permutations: permutations,
          relicSetSolutions: relicSetSolutions,
          ornamentSetSolutions: ornamentSetSolutions,
        },
        getMinFilter: () => queueResults.size() ? queueResults.top()[gridSortColumn] : 0,
      }

      const callback = (result) => {
        searched += run.runSize
        inProgress -= 1

        if (CANCEL && resultsShown) {
          return
        }

        const resultArr = new Float64Array(result.buffer)
        // console.log(`Optimizer results`, result, resultArr, run)

        BufferPacker.extractArrayToResults(resultArr, run.runSize, results, queueResults)
        // console.log(`Thread complete - status: inProgress ${inProgress}, results: ${results.length}`)

        window.store.getState().setPermutationsResults(queueResults.size())
        window.store.getState().setPermutationsSearched(Math.min(permutations, searched))

        if (inProgress == 0 || CANCEL) {
          window.store.getState().setOptimizationInProgress(false)
          results = queueResults.toArray()
          OptimizerTabController.setRows(results)
          setSortColumn(gridSortColumn)

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

      WorkerPool.execute(task, callback)
    }
  },
}

// TODO: This is a temporary tool to rename computed stats variables to fit the optimizer grid
export function renameFields(c) {
  c.ED = c.ELEMENTAL_DMG
  c.BASIC = c.x.BASIC_DMG
  c.SKILL = c.x.SKILL_DMG
  c.ULT = c.x.ULT_DMG
  c.FUA = c.x.FUA_DMG
  c.DOT = c.x.DOT_DMG
  c.BREAK = c.x.BREAK_DMG
  c.WEIGHT = c.x.WEIGHT
  c.EHP = c.x.EHP
  c.xHP = c.x[Stats.HP]
  c.xATK = c.x[Stats.ATK]
  c.xDEF = c.x[Stats.DEF]
  c.xSPD = c.x[Stats.SPD]
  c.xCR = c.x[Stats.CR]
  c.xCD = c.x[Stats.CD]
  c.xEHR = c.x[Stats.EHR]
  c.xRES = c.x[Stats.RES]
  c.xBE = c.x[Stats.BE]
  c.xERR = c.x[Stats.ERR]
  c.xOHB = c.x[Stats.OHB]
  c.xELEMENTAL_DMG = c.x.ELEMENTAL_DMG
}
