import { GpuExecutionContext } from 'lib/gpu/webgpuTypes'
import {
  ComputedStatsObjectExternal,
  InternalKeyToExternal,
  Key,
  KeysType,
} from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { useOptimizerTabStore } from 'lib/tabs/tabOptimizer/useOptimizerTabStore'
import { TsUtils } from 'lib/utils/TsUtils'

export function logIterationTimer(i: number, gpuContext: GpuExecutionContext) {
  const endTime = new Date().getTime()
  const timeTaken = (endTime - gpuContext.startTime) / 1000
  const permsCompleted = i * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const perSec = Math.floor(permsCompleted / timeTaken)
  console.log(`Iteration: ${i}, Time: ${timeTaken}s, Completed: ${permsCompleted}, Per sec: ${perSec.toLocaleString()}`)
}

export function debugWebgpuOutput(gpuContext: GpuExecutionContext, arrayBuffer: ArrayBuffer) {
  const array = new Float32Array(arrayBuffer)
  console.log(array.slice(0, 1000))

  debugPrintWebgpuArray(array)
  debugPinOptimizerWebgpuArray(array)
}

/*
 ED: array[22],
 BASIC: array[69],
 SKILL: array[70],
 ULT: array[71],
 FUA: array[72],
 DOT: array[73],
 BREAK: array[74],
 COMBO: array[75],
 EHP: array[77],
 HEAL: array[102],
 SHIELD: array[105],
 xHP: array[4],
 xATK: array[5],
 xDEF: array[6],
 xSPD: array[7],
 xCR: array[8],
 xCD: array[9],
 xEHR: array[10],
 xRES: array[11],
 xBE: array[12],
 xERR: array[13],
 xOHB: array[14],
 xELEMENTAL_DMG: array[22],
 */

export function debugExportWebgpuResult(array: Float32Array) {
  const x = new ComputedStatsContainer()
  const len = Object.keys(newStatsConfig).length
  const context = useOptimizerTabStore.getState().context!

  x.initializeArrays(context.maxContainerArrayLength, context)
  x.setConfig(context.defaultActions[0].config)
  x.setPrecompute(array.slice(0, len))

  console.log(x)
  return {
    ED: x.getActionValueByIndex(StatKey.DMG_BOOST, SELF_ENTITY_INDEX),
    BASIC: 0,
    SKILL: 0,
    ULT: 0,
    FUA: 0,
    MEMO_SKILL: 0,
    MEMO_TALENT: 0,
    DOT: 0,
    BREAK: 0,
    COMBO: 0,
    EHP: 0,
    HEAL: 0,
    SHIELD: 0,
    xHP: x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX),
    xATK: x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX),
    xDEF: x.getActionValueByIndex(StatKey.DEF, SELF_ENTITY_INDEX),
    xSPD: x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX),
    xCR: x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX),
    xCD: x.getActionValueByIndex(StatKey.CD, SELF_ENTITY_INDEX),
    xEHR: x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX),
    xRES: x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX),
    xBE: x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX),
    xERR: x.getActionValueByIndex(StatKey.ERR, SELF_ENTITY_INDEX),
    xOHB: x.getActionValueByIndex(StatKey.OHB, SELF_ENTITY_INDEX),
    xELEMENTAL_DMG: x.getActionValueByIndex(StatKey.DMG_BOOST, SELF_ENTITY_INDEX),
    // mHP: x.y,
    // mATK: x.y,
    // mDEF: x.y,
    // mSPD: x.y,
    // mCR: x.y,
    // mCD: x.y,
    // mEHR: x.y,
    // mRES: x.y,
    // mBE: x.y,
    // mERR: x.y,
    // mOHB: x.y,
    // mELEMENTAL_DMG: x.y,
    mxHP: 0,
    mxATK: 0,
    mxDEF: 0,
    mxSPD: 0,
    mxCR: 0,
    mxCD: 0,
    mxEHR: 0,
    mxRES: 0,
    mxBE: 0,
    mxERR: 0,
    mxOHB: 0,
    mxELEMENTAL_DMG: 0,
    mxEHP: 0,
  }
}

export function debugPinOptimizerWebgpuArray(array: Float32Array) {
  const currentPinned = window.optimizerGrid.current!.api.getGridOption('pinnedTopRowData') ?? []
  currentPinned[1] = debugExportWebgpuResult(array)

  window.optimizerGrid.current!.api.updateGridOptions({ pinnedTopRowData: currentPinned })
}

export function debugWebgpuComputedStats(array: Float32Array): ComputedStatsObjectExternal {
  const result: Partial<ComputedStatsObjectExternal> = {}

  for (const key in Key) {
    const externalKey = InternalKeyToExternal[key] ?? key
    const numericKey = Key[key as KeysType]
    result[externalKey] = array[numericKey]
  }
  return result as ComputedStatsObjectExternal
}

// export type WebgpuComputedStats = ReturnType<typeof debugWebgpuComputedStats>

export function debugPrintWebgpuArray(array: Float32Array) {
  const computedStats: ComputedStatsObjectExternal = debugWebgpuComputedStats(array)
  for (const [key, value] of Object.entries(computedStats)) {
    computedStats[key as keyof ComputedStatsObjectExternal] = fixed(value)
  }
  console.log(debugWebgpuComputedStats(array))
}

function fixed(n: number) {
  return TsUtils.precisionRound(n, 5)
}
