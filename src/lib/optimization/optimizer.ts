import { COMPUTE_ENGINE_CPU, Constants, Parts, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { gpuOptimize } from 'lib/gpu/webgpuOptimizer'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { BufferPacker, OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'
import { generateOrnamentSetSolutions, generateRelicSetSolutions } from 'lib/optimization/relicSetSolver'
import { SortOption } from 'lib/optimization/sortOptions'
import { RelicFilters } from 'lib/relics/relicFilters'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { SimulationRelic, SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { activateZeroPermutationsSuggestionsModal, activateZeroResultSuggestionsModal } from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { WorkerPool, WorkerResult, WorkerTask } from 'lib/worker/workerPool'
import { WorkerType } from 'lib/worker/workerUtils'
import { Form, OptimizerForm } from 'types/form'

// FIXME HIGH

let CANCEL = false

export function calculateCurrentlyEquippedRow(request: OptimizerForm) {
  let relics = DB.getRelics()
  relics = relics.filter((x) => x.equippedBy == request.characterId)
  relics = TsUtils.clone(relics)
  RelicFilters.calculateWeightScore(request, relics)
  relics = RelicFilters.applyMainStatsFilter(request, relics)
  const relicsByPart = RelicFilters.splitRelicsByPart(relics) as RelicsByPart | SimulationRelicByPart
  RelicFilters.condenseRelicSubstatsForOptimizer(relicsByPart as RelicsByPart)
  Object.keys(relicsByPart).map((key) => (relicsByPart as SimulationRelicByPart)[key as Parts] = (relicsByPart as RelicsByPart)[key as Parts][0] as SimulationRelic)

  const context = generateContext(request)
  const x = simulateBuild(relicsByPart as SimulationRelicByPart, context, null, null)
  const optimizerDisplayData = formatOptimizerDisplayData(x)
  OptimizerTabController.setTopRow(optimizerDisplayData, true)
  window.store.getState().setOptimizerSelectedRowData(optimizerDisplayData)

  const character = DB.getCharacterById(request.characterId)
  if (character) {
    window.store.getState().setOptimizerBuild(character.equipped)
  }
}

export const Optimizer = {
  cancel: (id: string) => {
    CANCEL = true
    WorkerPool.cancel(id)
  },

  getFilteredRelics: (request: Form) => {
    let relics = DB.getRelics()

    relics = RelicFilters.applyEquippedFilter(request, relics)
    relics = RelicFilters.applyEnhanceFilter(request, relics)
    relics = RelicFilters.applyGradeFilter(request, relics)
    relics = RelicFilters.applyRankFilter(request, relics)
    relics = RelicFilters.applyExcludeFilter(request, relics)

    // Pre-split filters
    const preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics)

    relics = RelicFilters.applyMainFilter(request, relics)
    relics = TsUtils.clone(relics) // Past this point we modify relics, clone it first
    relics = RelicFilters.applyMainStatsFilter(request, relics)
    relics = RelicFilters.applySetFilter(request, relics)

    // Post-split filters
    RelicFilters.calculateWeightScore(request, relics)
    let relicsByPart = RelicFilters.splitRelicsByPart(relics)

    relicsByPart = RelicFilters.applyCurrentFilter(request, relicsByPart)
    relicsByPart = RelicFilters.applyTopFilter(request, relicsByPart)

    return [relicsByPart, preFilteredRelicsByPart]
  },

  optimize: async function (request: Form) {
    CANCEL = false

    const [relics] = this.getFilteredRelics(request)
    RelicFilters.condenseRelicSubstatsForOptimizer(relics)

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

    if (sizes.gSize * sizes.bSize * sizes.fSize * sizes.pSize * sizes.lSize > 2147483647) {
      Message.warning(`Too many permutations, please apply stricter filters or set minimum enhance to at least +3.`, 15)
      return
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
    window.optimizerGrid.current!.api.setGridOption('loading', true)

    const context = generateContext(request)

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    setTimeout(() => {
      void calculateCurrentlyEquippedRow(request)
    }, 200)

    let searched = 0
    let resultsShown = false
    let results = []

    const sortOption = SortOption[request.resultSort!]
    const gridSortColumn = (request.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn) as keyof OptimizerDisplayData
    const resultsLimit = request.resultsLimit ?? 1024
    const queueResults = new FixedSizePriorityQueue<OptimizerDisplayData>(
      resultsLimit,
      (a, b) => (a[gridSortColumn] as number) - (b[gridSortColumn] as number),
    )

    // Incrementally increase the optimization run sizes instead of having a fixed size, so it doesn't lag for 2 seconds on Start
    const increment = 20000
    let runSize = 0
    const maxSize = Constants.THREAD_BUFFER_LENGTH

    const clonedContext = Utils.clone(context) // Cloning this so the webgpu code doesnt insert conditionalRegistry with functions

    let computeEngine = window.store.getState().savedSession[SavedSessionKeys.computeEngine]

    if (computeEngine != COMPUTE_ENGINE_CPU) {
      void getWebgpuDevice(true).then((device) => {
        if (device == null) {
          Message.warning(`GPU acceleration is not available on this browser - only desktop Chrome and Opera are supported. If you are on a supported browser, report a bug to the Discord server`,
            15)
          window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
          computeEngine = COMPUTE_ENGINE_CPU
        } else {
          void Utils.sleep(200).then(() => {
            void gpuOptimize({
              device,
              context: context,
              request: request,
              relics: relics,
              permutations: permutations,
              computeEngine: computeEngine,
              relicSetSolutions: relicSetSolutions,
              ornamentSetSolutions: ornamentSetSolutions,
            })
          })
        }
      })
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
        const task: WorkerTask = {
          attempts: 0,
          input: {
            context: clonedContext,
            request: request,
            relics: relics,
            WIDTH: run.runSize,
            skip: run.skip,
            permutations: permutations,
            relicSetSolutions: relicSetSolutions,
            ornamentSetSolutions: ornamentSetSolutions,
            workerType: WorkerType.OPTIMIZER,
          },
          getMinFilter: (): number => {
            return queueResults.size() && queueResults.size() >= request.resultsLimit! ? (queueResults.top()![gridSortColumn] as number) : 0
          },
        }

        const callback = (result: WorkerResult) => {
          searched += run.runSize
          inProgress -= 1

          if (CANCEL && resultsShown) {
            return
          }

          const resultArr = new Float32Array(result.buffer)
          // console.log(`Optimizer results`, result, resultArr, run)

          BufferPacker.extractArrayToResults(resultArr, run.runSize, queueResults, task.input.skip)
          // console.log(`Thread complete - status: inProgress ${inProgress}, results: ${results.length}`)

          window.store.getState().setPermutationsResults(queueResults.size())
          window.store.getState().setPermutationsSearched(Math.min(permutations, searched))
          window.store.getState().setOptimizerEndTime(Date.now())

          if (inProgress == 0 || CANCEL) {
            window.store.getState().setOptimizationInProgress(false)
            results = queueResults.toArray()

            OptimizerTabController.setRows(results)
            setSortColumn(gridSortColumn)

            window.optimizerGrid.current!.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
            console.log('Done', results.length)
            resultsShown = true
            if (!results.length && !inProgress) activateZeroResultSuggestionsModal(request)
            return
          }
        }

        WorkerPool.execute(task, callback)
      }
    }
  },
}

// TODO: This is a temporary tool to rename computed stats variables to fit the optimizer grid
export function formatOptimizerDisplayData(x: ComputedStatsArray) {
  const c = x.c
  const d: Partial<OptimizerDisplayData> = {
    relicSetIndex: c.relicSetIndex,
    ornamentSetIndex: c.ornamentSetIndex,
    id: c.id,
    WEIGHT: c.weight,
    xa: new Float32Array(x.a),
    ca: new Float32Array(c.a),
    tracedX: x,
  }

  d[Stats.HP] = c.HP.get()
  d[Stats.ATK] = c.ATK.get()
  d[Stats.DEF] = c.DEF.get()
  d[Stats.SPD] = c.SPD.get()
  d[Stats.CR] = c.CR.get()
  d[Stats.CD] = c.CD.get()
  d[Stats.EHR] = c.EHR.get()
  d[Stats.RES] = c.RES.get()
  d[Stats.BE] = c.BE.get()
  d[Stats.ERR] = c.ERR.get()
  d[Stats.OHB] = c.OHB.get()

  d.ED = c.ELEMENTAL_DMG.get()
  d.BASIC = x.BASIC_DMG.get()
  d.SKILL = x.SKILL_DMG.get()
  d.ULT = x.ULT_DMG.get()
  d.FUA = x.FUA_DMG.get()
  d.MEMO_SKILL = x.MEMO_SKILL_DMG.get()
  d.MEMO_TALENT = x.MEMO_TALENT_DMG.get()
  d.DOT = x.DOT_DMG.get()
  d.BREAK = x.BREAK_DMG.get()
  d.COMBO = x.COMBO_DMG.get()
  d.EHP = x.EHP.get()
  d.HEAL = x.HEAL_VALUE.get()
  d.SHIELD = x.SHIELD_VALUE.get()
  d.xHP = x.HP.get()
  d.xATK = x.ATK.get()
  d.xDEF = x.DEF.get()
  d.xSPD = x.SPD.get()
  d.xCR = x.CR.get()
  d.xCD = x.CD.get()
  d.xEHR = x.EHR.get()
  d.xRES = x.RES.get()
  d.xBE = x.BE.get()
  d.xERR = x.ERR.get()
  d.xOHB = x.OHB.get()
  d.xELEMENTAL_DMG = x.ELEMENTAL_DMG.get()

  d.mELEMENTAL_DMG = c.ELEMENTAL_DMG.get()
  if (x.a[Key.MEMOSPRITE]) {
    const c = x.m.c
    d.mHP = c.HP.get()
    d.mATK = c.ATK.get()
    d.mDEF = c.DEF.get()
    d.mSPD = c.SPD.get()
    d.mCR = c.CR.get()
    d.mCD = c.CD.get()
    d.mEHR = c.EHR.get()
    d.mRES = c.RES.get()
    d.mBE = c.BE.get()
    d.mERR = c.ERR.get()
    d.mOHB = c.OHB.get()

    const m = x.m
    d.mxHP = m.HP.get()
    d.mxATK = m.ATK.get()
    d.mxDEF = m.DEF.get()
    d.mxSPD = m.SPD.get()
    d.mxCR = m.CR.get()
    d.mxCD = m.CD.get()
    d.mxEHR = m.EHR.get()
    d.mxRES = m.RES.get()
    d.mxBE = m.BE.get()
    d.mxERR = m.ERR.get()
    d.mxOHB = m.OHB.get()
    d.mxELEMENTAL_DMG = m.ELEMENTAL_DMG.get()
    d.mxEHP = m.EHP.get()
  }

  return d as OptimizerDisplayData
}
