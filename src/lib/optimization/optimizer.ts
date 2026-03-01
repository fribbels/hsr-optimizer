import i18next from 'i18next'
import {
  COMPUTE_ENGINE_CPU,
  Constants,
  ElementName,
  ElementToStatKeyDmgBoost,
  Parts,
  Stats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { gpuOptimize } from 'lib/gpu/webgpuOptimizer'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import {
  BufferPacker,
  ElementToBasicKeyDmgBoost,
  OptimizerDisplayData,
} from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'
import {
  generateOrnamentSetSolutions,
  generateRelicSetSolutions,
} from 'lib/optimization/relicSetSolver'
import { SortOption } from 'lib/optimization/sortOptions'
import { RelicFilters } from 'lib/relics/relicFilters'
import { logRegisters } from 'lib/simulations/registerLogger'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import {
  SimulationRelic,
  SimulationRelicByPart,
} from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import {
  activateZeroPermutationsSuggestionsModal,
  activateZeroResultSuggestionsModal,
} from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { useOptimizerTabStore } from 'lib/tabs/tabOptimizer/useOptimizerTabStore'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  WorkerPool,
  WorkerResult,
  WorkerTask,
} from 'lib/worker/workerPool'
import { WorkerType } from 'lib/worker/workerUtils'
import {
  Form,
  OptimizerForm,
} from 'types/form'

// FIXME HIGH

let CANCEL = false

const TESTING = false

export function calculateCurrentlyEquippedRow(request: OptimizerForm) {
  let relics = DB.getRelics()
  relics = relics.filter((x) => x.equippedBy == request.characterId)
  relics = TsUtils.clone(relics)
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
  window.store.getState().setOptimizerSelectedRowData(optimizerDisplayData)

  const character = DB.getCharacterById(request.characterId)
  if (character) {
    window.store.getState().setOptimizerBuild(character.equipped)
  }
}

export const Optimizer = {
  cancel: () => {
    CANCEL = true
    WorkerPool.cancel()
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

    useOptimizerTabStore.getState().setContext(context)

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
          Message.error(t('Error.GPUNotAvailable'), 15)
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
      const runs: { skip: number, runSize: number }[] = []
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

        if (!TESTING) {
          WorkerPool.execute(task, callback)
        } else {
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
    }
  },
}

// TODO: This is a temporary tool to rename computed stats variables to fit the optimizer grid
export function formatOptimizerDisplayData(x: ComputedStatsContainer) {
  const context = useOptimizerTabStore.getState().context
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
      // @ts-ignore
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
