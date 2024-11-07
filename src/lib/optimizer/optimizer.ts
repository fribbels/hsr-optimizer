import { setSortColumn } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { activateZeroPermutationsSuggestionsModal, activateZeroResultSuggestionsModal } from 'components/optimizerTab/OptimizerSuggestionsModal'
import { BufferPacker, OptimizerDisplayData } from 'lib/bufferPacker'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { COMPUTE_ENGINE_CPU, Constants, ElementToDamage, Stats } from 'lib/constants'
import { SavedSessionKeys } from 'lib/constantsSession'
import DB from 'lib/db'
import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { gpuOptimize } from 'lib/gpu/webgpuOptimizer'
import { Message } from 'lib/message'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { ComputedStatsObjectExternal } from 'lib/optimizer/computedStatsArray'
import { generateContext } from 'lib/optimizer/context/calculateContext'
import { generateOrnamentSetSolutions, generateRelicSetSolutions } from 'lib/optimizer/relicSetSolver'
import { SortOption } from 'lib/optimizer/sortOptions'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicFilters } from 'lib/relicFilters'
import { TsUtils } from 'lib/TsUtils'
import { Utils } from 'lib/utils'
import { WorkerPool } from 'lib/workerPool'
import { Form } from 'types/Form'

let CANCEL = false
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1

export function calculateCurrentlyEquippedRow(request) {
  let relics = Utils.clone(DB.getRelics())
  RelicFilters.calculateWeightScore(request, relics)
  relics = relics.filter((x) => x.equippedBy == request.characterId)
  relics = RelicFilters.applyMainStatsFilter(request, relics)
  relics = RelicFilters.splitRelicsByPart(relics)
  RelicFilters.condenseRelicSubstatsForOptimizer(relics)
  Object.keys(relics).map((key) => relics[key] = relics[key][0])

  const { c } = calculateBuild(request, relics)
  renameFields(c)
  OptimizerTabController.setTopRow(c, true)
}

export const Optimizer = {
  cancel: (id) => {
    CANCEL = true
    WorkerPool.cancel(id)
  },

  getFilteredRelics: (request: Form) => {
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
    relics = RelicFilters.applyMainStatsFilter(request, relics)
    relics = RelicFilters.applySetFilter(request, relics)

    // Post-split filters
    let relicsByPart = RelicFilters.splitRelicsByPart(relics)

    relicsByPart = RelicFilters.applyCurrentFilter(request, relicsByPart)
    relicsByPart = RelicFilters.applyTopFilter(request, relicsByPart)

    return [relicsByPart, preFilteredRelicsByPart]
  },

  optimize: async function (request) {
    CANCEL = false

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
    // console.log('Optimize relics', relics)

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

    window.optimizerGrid.current.api.setGridOption('loading', true)

    const context = generateContext(request)

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    calculateCurrentlyEquippedRow(request)

    let searched = 0
    let resultsShown = false
    let results = []
    const sortOption = SortOption[request.resultSort]
    const gridSortColumn = request.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
    const resultsLimit = request.resultsLimit || 1024
    const queueResults = new FixedSizePriorityQueue(resultsLimit, (a, b) => a[gridSortColumn] - b[gridSortColumn])

    // Incrementally increase the optimization run sizes instead of having a fixed size, so it doesnt lag for 2 seconds on Start
    const increment = 20000
    let runSize = 0
    const maxSize = Constants.THREAD_BUFFER_LENGTH

    const clonedContext = Utils.clone(context) // Cloning this so the webgpu code doesnt insert conditionalRegistry with functions

    let computeEngine = window.store.getState().savedSession[SavedSessionKeys.computeEngine]

    const gpuDevice = await getWebgpuDevice()
    if (gpuDevice == null && computeEngine != COMPUTE_ENGINE_CPU) {
      Message.warning(`GPU acceleration is not available on this browser - only desktop Chrome and Opera are supported. If you are on a supported browser, report a bug to the Discord server`,
        15)
      window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
      computeEngine = COMPUTE_ENGINE_CPU
    }

    if (computeEngine == COMPUTE_ENGINE_CPU) {
      // Generate runs
      const runs: { skip: number; runSize: number }[] = []
      for (let currentSkip = 0; currentSkip < permutations; currentSkip += runSize) {
        runSize = Math.min(maxSize, runSize + increment)
        runs.push({
          skip: currentSkip,
          runSize: runSize,
        })
      }

      let inProgress = runs.length

      window.store.getState().setOptimizerStartTime(Date.now())
      window.store.getState().setOptimizerRunningEngine(COMPUTE_ENGINE_CPU)
      for (const run of runs) {
        const task = {
          input: {
            context: clonedContext,
            request: request,
            relics: relics,
            WIDTH: run.runSize,
            skip: run.skip,
            permutations: permutations,
            relicSetSolutions: relicSetSolutions,
            ornamentSetSolutions: ornamentSetSolutions,
            isFirefox: isFirefox,
          },
          getMinFilter: () => {
            return queueResults.size() && queueResults.size() >= request.resultsLimit ? queueResults.top()[gridSortColumn] : 0
          },
        }

        const callback = (result) => {
          searched += run.runSize
          inProgress -= 1

          if (CANCEL && resultsShown) {
            return
          }

          const resultArr = new Float32Array(result.buffer)
          // console.log(`Optimizer results`, result, resultArr, run)

          BufferPacker.extractArrayToResults(resultArr, run.runSize, results, queueResults)
          // console.log(`Thread complete - status: inProgress ${inProgress}, results: ${results.length}`)

          window.store.getState().setPermutationsResults(queueResults.size())
          window.store.getState().setPermutationsSearched(Math.min(permutations, searched))
          window.store.getState().setOptimizerEndTime(Date.now())

          if (inProgress == 0 || CANCEL) {
            window.store.getState().setOptimizationInProgress(false)
            results = queueResults.toArray()
            for (const result of results) {
              const id = TsUtils.reconstructFloat64FromParts(result.high, result.low)
              result.id = id
            }
            OptimizerTabController.setRows(results)
            setSortColumn(gridSortColumn)

            window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
            console.log('Done', results.length)
            resultsShown = true
            if (!results.length && !inProgress) activateZeroResultSuggestionsModal(request)
            return
          }
        }

        WorkerPool.execute(task, callback)
      }
    } else {
      gpuOptimize({
        context: context,
        request: request,
        relics: relics,
        permutations: permutations,
        computeEngine: computeEngine,
        relicSetSolutions: relicSetSolutions,
        ornamentSetSolutions: ornamentSetSolutions,
      })
    }
  },
}

// TODO: This is a temporary tool to rename computed stats variables to fit the optimizer grid
export function renameFields(c: BasicStatsObject & OptimizerDisplayData) {
  const x = c.x as ComputedStatsObjectExternal

  c.ED = c.ELEMENTAL_DMG
  c.BASIC = x.BASIC_DMG
  c.SKILL = x.SKILL_DMG
  c.ULT = x.ULT_DMG
  c.FUA = x.FUA_DMG
  c.DOT = x.DOT_DMG
  c.BREAK = x.BREAK_DMG
  c.COMBO = x.COMBO_DMG
  c.EHP = x.EHP
  c.HEAL = x.HEAL_VALUE
  c.SHIELD = x.SHIELD_VALUE
  c.xHP = x.HP
  c.xATK = x.ATK
  c.xDEF = x.DEF
  c.xSPD = x.SPD
  c.xCR = x[Stats.CR]
  c.xCD = x[Stats.CD]
  c.xEHR = x[Stats.EHR]
  c.xRES = x[Stats.RES]
  c.xBE = x[Stats.BE]
  c.xERR = x[Stats.ERR]
  c.xOHB = x[Stats.OHB]
  c.xELEMENTAL_DMG = c.x.ELEMENTAL_DMG
}
