import i18next from 'i18next'
import {
  COMPUTE_ENGINE_CPU,
  Constants,
  type ElementName,
  ElementToStatKeyDmgBoost,
  type Parts,
  Stats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { gpuOptimize } from 'lib/gpu/webgpuOptimizer'
import { type RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import {
  BufferPacker,
  ElementToBasicKeyDmgBoost,
  type OptimizerDisplayData,
} from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { FixedSizeMinQueue } from 'lib/dataStructures/fixedSizeMinQueue'
import {
  bitpackBooleanArray,
  generateOrnamentSetSolutions,
  generateRelicSetSolutions,
} from 'lib/optimization/relicSetSolver'
import { SortOption } from 'lib/optimization/sortOptions'
import { RelicFilters } from 'lib/relics/relicFilters'
import { logRegisters } from 'lib/simulations/registerLogger'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import {
  type SimulationRelic,
  type SimulationRelicByPart,
} from 'lib/simulations/statSimulationTypes'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { getRelics } from 'lib/stores/relic/relicStore'
import { setSortColumn } from 'lib/stores/gridStore'
import {
  activateZeroPermutationsSuggestionsModal,
  activateZeroResultSuggestionsModal,
} from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { gridStore } from 'lib/stores/gridStore'
import { clone } from 'lib/utils/objectUtils'
import { WorkerCancelledError, workerPool } from 'lib/worker/workerPool'
import { WorkerType } from 'lib/worker/workerUtils'
import {
  type Form,
  type OptimizerForm,
} from 'types/form'
import { sleep } from 'lib/utils/frontendUtils'

// Module-level cancellation flag shared across optimization runs.
// RACE CONDITION NOTE: If a second optimize() call is triggered before the first finishes,
// CANCEL is reset to false by the new run while the old run's workers are still in-flight.
// The old workers will continue running until they complete or the pool is cancelled.
// The cancel() call sets CANCEL=true and cancels the WorkerPool, which should stop both runs.
// A per-run cancellation token would be more robust but is not yet implemented.
let CANCEL = false

type OptimizerWorkerResult = {
  buffer: ArrayBuffer
}

// Buffer pool managed by the optimizer
const optimizerBuffers: ArrayBuffer[] = []

function acquireBuffer(): ArrayBuffer {
  if (optimizerBuffers.length > 0) {
    const buffer = optimizerBuffers.pop()!
    BufferPacker.cleanFloatBuffer(buffer)
    return buffer
  }
  return BufferPacker.createFloatBuffer(Constants.THREAD_BUFFER_LENGTH)
}

function releaseBuffer(buffer: ArrayBuffer): void {
  optimizerBuffers.push(buffer)
}

/** Release buffer allocated by prepareInput on retry (prevents leak when buffer was cloned, not transferred) */
function releaseRetryBuffer(taskInput: { buffer: ArrayBuffer }, resultBuffer: ArrayBuffer): void {
  if (taskInput.buffer.byteLength > 0 && taskInput.buffer !== resultBuffer) {
    releaseBuffer(taskInput.buffer)
  }
}

export function calculateCurrentlyEquippedRow(request: OptimizerForm) {
  let relics = getRelics()
  relics = relics.filter((x) => x.equippedBy == request.characterId)
  relics = clone(relics)
  RelicFilters.calculateWeightScore(request, relics)
  relics = RelicFilters.applyMainStatsFilter(request, relics)
  const relicsByPart = RelicFilters.splitRelicsByPart(relics) as RelicsByPart | SimulationRelicByPart
  RelicFilters.condenseRelicSubstatsForOptimizer(relicsByPart as RelicsByPart)
  Object.keys(relicsByPart).map((key) =>
    (relicsByPart as SimulationRelicByPart)[key as Parts] = (relicsByPart as RelicsByPart)[key as Parts][0] as SimulationRelic
  )

  const context = generateContext(request)
  const { x } = simulateBuild(relicsByPart as SimulationRelicByPart, context, null)

  if (request.keepCurrentRelics) {
    logRegisters(x, context, 'Simulate Build')
  }

  const optimizerDisplayData = formatOptimizerDisplayData(x)
  OptimizerTabController.setTopRow(optimizerDisplayData, true)
  useOptimizerDisplayStore.getState().setOptimizerSelectedRowData(optimizerDisplayData)

  const character = getCharacterById(request.characterId)
  if (character) {
    useOptimizerDisplayStore.getState().setOptimizerBuild(character.equipped)
  }
}

export const Optimizer = {
  cancel: () => {
    CANCEL = true
    workerPool.cancelQueue()
  },

  getFilteredRelicCounts: (request: Form) => RelicFilters.getFilteredRelicCounts(request),

  getFilteredRelics: (request: Form) => {
    let relics = getRelics()

    relics = RelicFilters.applyEquippedFilter(request, relics)
    relics = RelicFilters.applyEnhanceFilter(request, relics)
    relics = RelicFilters.applyGradeFilter(request, relics)
    relics = RelicFilters.applyRankFilter(request, relics)
    relics = RelicFilters.applyExcludeFilter(request, relics)

    // Pre-split filters
    const preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics)

    relics = RelicFilters.applyMainFilter(request, relics)
    relics = clone(relics) // Past this point we modify relics, clone it first
    RelicFilters.mergePreviewSubstats(request, relics)
    relics = RelicFilters.applyMainStatsFilter(request, relics)
    relics = RelicFilters.applySetFilter(request, relics)

    // Post-split filters
    RelicFilters.calculateWeightScore(request, relics)
    let relicsByPart = RelicFilters.splitRelicsByPart(relics)

    relicsByPart = RelicFilters.applyCurrentFilter(request, relicsByPart)
    relicsByPart = RelicFilters.applyTopFilter(request, relicsByPart)

    return [relicsByPart, preFilteredRelicsByPart]
  },

  optimize: async function(request: Form) {
    const t = i18next.getFixedT(null, 'optimizerTab', 'ValidationMessages')

    // Cancel any in-progress optimization before starting a new one
    if (useOptimizerDisplayStore.getState().optimizationInProgress) {
      workerPool.cancelQueue()
    }
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

    const permutations = sizes.hSize * sizes.gSize * sizes.bSize * sizes.fSize * sizes.pSize * sizes.lSize
    OptimizerTabController.setMetadata(sizes, relics)

    console.log(`Optimization permutations: ${permutations}, blocksize: ${Constants.THREAD_BUFFER_LENGTH}`)
    if (permutations == 0) {
      useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
      activateZeroPermutationsSuggestionsModal(request)
      OptimizerTabController.setRows([])
      OptimizerTabController.resetDataSource()
      return
    }

    if (CANCEL) {
      useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
      return
    }

    OptimizerTabController.scrollToGrid()
    gridStore.optimizerGridApi()?.setGridOption('loading', true)

    const context = generateContext(request)

    useOptimizerDisplayStore.getState().setContext(context)

    // Create a special optimization request for the top row, ignoring filters and with a custom callback
    setTimeout(() => {
      void calculateCurrentlyEquippedRow(request)
    }, 200)

    let searched = 0
    let resultsShown = false
    let results = []

    const sortOption = SortOption[request.resultSort!]
    const showMemo = request.memoDisplay === 'memo'
    const gridSortColumn = (request.statDisplay == 'combat'
      ? (showMemo ? sortOption.memoCombatGridColumn : sortOption.combatGridColumn)
      : (showMemo ? sortOption.memoBasicGridColumn : sortOption.basicGridColumn)
    ) as keyof OptimizerDisplayData
    const resultsLimit = request.resultsLimit ?? 1024
    const queueResults = new FixedSizeMinQueue<OptimizerDisplayData>(resultsLimit)

    // Incrementally increase the optimization run sizes instead of having a fixed size, so it doesn't lag for 2 seconds on Start
    const increment = 20000
    let runSize = 0
    const maxSize = Constants.THREAD_BUFFER_LENGTH

    const clonedContext = clone(context) // Cloning this so the webgpu code doesnt insert conditionalRegistry with functions

    const computeEngine = useGlobalStore.getState().savedSession[SavedSessionKeys.computeEngine]

    if (computeEngine != COMPUTE_ENGINE_CPU) {
      void getWebgpuDevice(true).then((device) => {
        if (device == null) {
          Message.error(t('Error.GPUNotAvailable'), 15)
          // GPU path won't run and CPU path already skipped — stop optimization
          useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
        } else {
          void sleep(200).then(() => {
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
      }).catch(() => {
        // Safety net: if getWebgpuDevice rejects, ensure optimization doesn't stay stuck
        useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
      })
    }

    if (computeEngine == COMPUTE_ENGINE_CPU) {
      // Generate runs
      const runs: { skip: number, runSize: number }[] = []
      for (let currentSkip = 0; currentSkip < permutations; currentSkip += runSize) {
        runSize = Math.min(maxSize, runSize + increment)
        runs.push({
          skip: currentSkip,
          runSize: runSize,
        })
      }

      let inProgress = 0
      let nextRunIndex = 0

      useOptimizerDisplayStore.getState().setOptimizerStartTime(Date.now())
      useOptimizerDisplayStore.getState().setOptimizerRunningEngine(COMPUTE_ENGINE_CPU)

      function dispatchNextRun() {
        if (CANCEL || nextRunIndex >= runs.length) return
        const run = runs[nextRunIndex++]
        inProgress++

        const buffer = acquireBuffer()
        const taskInput = {
          context: clonedContext,
          request: request,
          relics: relics,
          WIDTH: run.runSize,
          skip: run.skip,
          permutations: permutations,
          relicSetSolutions: bitpackBooleanArray(relicSetSolutions),
          ornamentSetSolutions: bitpackBooleanArray(ornamentSetSolutions),
          workerType: WorkerType.OPTIMIZER,
          buffer,
        }

        workerPool.runTask<typeof taskInput, OptimizerWorkerResult>(taskInput, {
          transferables: [buffer],
          maxRetries: 10,
          prepareInput: (input) => {
            // Re-acquire buffer if the previous one was lost in a worker crash
            // (transferred buffers become detached/zero-length when the worker dies)
            if (input.buffer.byteLength === 0) {
              input.buffer = acquireBuffer()
            }
            // Rising min-filter floor: computed at dispatch time, not creation time.
            // As results accumulate from completed workers, later-dispatched tasks
            // get tighter thresholds and skip more permutations.
            input.request.resultMinFilter = queueResults.size() && queueResults.size() >= request.resultsLimit!
              ? queueResults.topPriority()
              : 0
          },
        }).then((result) => {
          searched += run.runSize
          inProgress--

          if (CANCEL && resultsShown) {
            releaseBuffer(result.buffer)
            releaseRetryBuffer(taskInput, result.buffer)
            return
          }

          const resultArr = new Float32Array(result.buffer)
          BufferPacker.extractArrayToResults(resultArr, run.runSize, queueResults, taskInput.skip, gridSortColumn)

          useOptimizerDisplayStore.setState({
            permutationsResults: queueResults.size(),
            permutationsSearched: Math.min(permutations, searched),
            optimizerEndTime: Date.now(),
          })

          // Release buffers after extraction is complete
          releaseBuffer(result.buffer)
          releaseRetryBuffer(taskInput, result.buffer)

          if ((inProgress === 0 && nextRunIndex >= runs.length) || CANCEL) {
            useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
            results = queueResults.toArray()

            OptimizerTabController.setRows(results)
            setSortColumn(gridSortColumn)

            gridStore.optimizerGridApi()?.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
            console.log('Done', results.length)
            resultsShown = true
            if (!results.length && !inProgress) activateZeroResultSuggestionsModal(request)
            return
          }

          dispatchNextRun()
        }).catch((error) => {
          // Guard against cancellation — cancelQueue() and terminate() reject with
          // WorkerCancelledError. Don't decrement inProgress or create buffers for these.
          if (error instanceof WorkerCancelledError || CANCEL) return
          console.warn('Optimizer worker error:', error)
          inProgress--
          // Buffer is lost when worker dies — create replacement for the pool
          releaseBuffer(BufferPacker.createFloatBuffer(Constants.THREAD_BUFFER_LENGTH))

          if (inProgress === 0 && nextRunIndex >= runs.length) {
            useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
            results = queueResults.toArray()
            OptimizerTabController.setRows(results)
            setSortColumn(gridSortColumn)
            gridStore.optimizerGridApi()?.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
            resultsShown = true
            if (!results.length) activateZeroResultSuggestionsModal(request)
            return
          }

          dispatchNextRun()
        })
      }

      // Seed pool with initial tasks — one per available worker
      const initialBatch = Math.min(runs.length, workerPool.getPoolSize())
      for (let i = 0; i < initialBatch; i++) {
        dispatchNextRun()
      }
    }
  },
}

// TODO: This is a temporary tool to rename computed stats variables to fit the optimizer grid
export function formatOptimizerDisplayData(x: ComputedStatsContainer) {
  const context = useOptimizerDisplayStore.getState().context
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
  const a = x.a

  // Use direct array access for robustness (c may be deserialized plain object)
  d.HP = c.a[BasicKey.HP]
  d.ATK = c.a[BasicKey.ATK]
  d.DEF = c.a[BasicKey.DEF]
  d.SPD = c.a[BasicKey.SPD]
  d.CR = c.a[BasicKey.CR]
  d.CD = c.a[BasicKey.CD]
  d.EHR = c.a[BasicKey.EHR]
  d.RES = c.a[BasicKey.RES]
  d.BE = c.a[BasicKey.BE]
  d.ERR = c.a[BasicKey.ERR]
  d.OHB = c.a[BasicKey.OHB]

  // TODO
  // d.BASIC = a[StatKey.BASIC_DMG]
  // d.SKILL = a[StatKey.SKILL_DMG]
  // d.ULT = a[StatKey.ULT_DMG]
  // d.FUA = a[StatKey.FUA_DMG]
  // d.MEMO_SKILL = a[StatKey.MEMO_SKILL_DMG]
  // d.MEMO_TALENT = a[StatKey.MEMO_TALENT_DMG]
  // d.DOT = a[StatKey.DOT_DMG]
  // d.BREAK = a[StatKey.BREAK_DMG]
  d.COMBO = x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)
  d.EHP = a[StatKey.EHP]

  d.xHP = a[StatKey.HP]
  d.xATK = a[StatKey.ATK]
  d.xDEF = a[StatKey.DEF]
  d.xSPD = a[StatKey.SPD]
  d.xCR = a[StatKey.CR] + a[StatKey.CR_BOOST]
  d.xCD = a[StatKey.CD] + a[StatKey.CD_BOOST]
  d.xEHR = a[StatKey.EHR]
  d.xRES = a[StatKey.RES]
  d.xBE = a[StatKey.BE]
  d.xERR = a[StatKey.ERR]
  d.xOHB = a[StatKey.OHB]
  d.xELEMENTAL_DMG = a[StatKey.DMG_BOOST]

  if (context) {
    const basicElementalBoostKey = ElementToBasicKeyDmgBoost[context.element]
    d.ELEMENTAL_DMG = c.a[basicElementalBoostKey]
    d.mELEMENTAL_DMG = c.a[basicElementalBoostKey]

    switch (context.elementalDamageType) {
      case Stats.Physical_DMG:
        d.xELEMENTAL_DMG += a[StatKey.PHYSICAL_DMG_BOOST]
        break
      case Stats.Fire_DMG:
        d.xELEMENTAL_DMG += a[StatKey.FIRE_DMG_BOOST]
        break
      case Stats.Ice_DMG:
        d.xELEMENTAL_DMG += a[StatKey.ICE_DMG_BOOST]
        break
      case Stats.Lightning_DMG:
        d.xELEMENTAL_DMG += a[StatKey.LIGHTNING_DMG_BOOST]
        break
      case Stats.Wind_DMG:
        d.xELEMENTAL_DMG += a[StatKey.WIND_DMG_BOOST]
        break
      case Stats.Quantum_DMG:
        d.xELEMENTAL_DMG += a[StatKey.QUANTUM_DMG_BOOST]
        break
      case Stats.Imaginary_DMG:
        d.xELEMENTAL_DMG += a[StatKey.IMAGINARY_DMG_BOOST]
        break
    }

    for (const action of context.defaultActions) {
      // @ts-expect-error - action.actionName is a dynamic key that matches OptimizerDisplayData fields (BASIC, SKILL, ULT, etc.)
      d[action.actionName] = x.getActionRegisterValue(action.registerIndex)
    }
  }

  // Memosprite stats
  let memoEntityIndex = -1
  for (let i = 1; i < x.config.entitiesLength; i++) {
    if (x.config.entitiesArray[i].memosprite) {
      memoEntityIndex = i
      break
    }
  }

  if (memoEntityIndex >= 0 && context) {
    const memoEntityConfig = x.config.entitiesArray[memoEntityIndex]
    const memoEntity = memoEntityConfig.name
    const ca = c.a

    // Memosprite basic stats (scaled from summoner's basic stats)
    d.mHP = (memoEntityConfig.memoBaseHpScaling ?? 0) * ca[BasicKey.HP] + (memoEntityConfig.memoBaseHpFlat ?? 0)
    d.mATK = (memoEntityConfig.memoBaseAtkScaling ?? 0) * ca[BasicKey.ATK] + (memoEntityConfig.memoBaseAtkFlat ?? 0)
    d.mDEF = (memoEntityConfig.memoBaseDefScaling ?? 0) * ca[BasicKey.DEF] + (memoEntityConfig.memoBaseDefFlat ?? 0)
    d.mSPD = (memoEntityConfig.memoBaseSpdScaling ?? 0) * ca[BasicKey.SPD] + (memoEntityConfig.memoBaseSpdFlat ?? 0)
    d.mCR = ca[BasicKey.CR]
    d.mCD = ca[BasicKey.CD]
    d.mEHR = ca[BasicKey.EHR]
    d.mRES = ca[BasicKey.RES]
    d.mBE = ca[BasicKey.BE]
    d.mERR = ca[BasicKey.ERR]
    d.mOHB = ca[BasicKey.OHB]

    // Memosprite combat stats
    d.mxHP = x.getActionValue(StatKey.HP, memoEntity)
    d.mxATK = x.getActionValue(StatKey.ATK, memoEntity)
    d.mxDEF = x.getActionValue(StatKey.DEF, memoEntity)
    d.mxSPD = x.getActionValue(StatKey.SPD, memoEntity)
    d.mxCR = x.getActionValue(StatKey.CR, memoEntity) + x.getActionValue(StatKey.CR_BOOST, memoEntity)
    d.mxCD = x.getActionValue(StatKey.CD, memoEntity) + x.getActionValue(StatKey.CD_BOOST, memoEntity)
    d.mxEHR = x.getActionValue(StatKey.EHR, memoEntity)
    d.mxRES = x.getActionValue(StatKey.RES, memoEntity)
    d.mxBE = x.getActionValue(StatKey.BE, memoEntity)
    d.mxERR = x.getActionValue(StatKey.ERR, memoEntity)
    d.mxOHB = x.getActionValue(StatKey.OHB, memoEntity)
    d.mxELEMENTAL_DMG = x.getActionValue(StatKey.DMG_BOOST, memoEntity)
      + x.getActionValue(ElementToStatKeyDmgBoost[context.element as ElementName], memoEntity)
    d.mxEHP = x.getActionValue(StatKey.EHP, memoEntity)
  }

  return d as OptimizerDisplayData
}
