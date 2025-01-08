import { baseComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Sets } from 'lib/constants/constants'
import { GpuExecutionContext } from 'lib/gpu/webgpuTypes'
import { ComputedStatsArray, ComputedStatsArrayCore, ComputedStatsObjectExternal, InternalKeyToExternal, Key, KeysType } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

export function logIterationTimer(i: number, gpuContext: GpuExecutionContext) {
  const endTime = new Date().getTime()
  const timeTaken = (endTime - gpuContext.startTime) / 1000
  const permsCompleted = i * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const perSec = Math.floor(permsCompleted / (timeTaken))
  console.log(`Iteration: ${i}, Time: ${timeTaken}s, Completed: ${permsCompleted}, Per sec: ${perSec.toLocaleString()}`)
}

export function debugWebgpuOutput(gpuContext: GpuExecutionContext, arrayBuffer: ArrayBuffer) {
  const array = new Float32Array(arrayBuffer)
  console.log(array)

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
  const x = new ComputedStatsArrayCore(false) as ComputedStatsArray
  const m = new ComputedStatsArrayCore(false) as ComputedStatsArray
  const len = Object.keys(baseComputedStatsObject).length
  const setsLen = Object.keys(Sets).length
  x.setPrecompute(array.slice(0, len))
  m.setPrecompute(array.slice(len + setsLen, len * 2 + setsLen))

  console.log(x)
  console.log(m)
  return {
    ED: x.$ELEMENTAL_DMG,
    BASIC: x.$BASIC_DMG,
    SKILL: x.$SKILL_DMG,
    ULT: x.$ULT_DMG,
    FUA: x.$FUA_DMG,
    MEMO_SKILL: x.$MEMO_SKILL_DMG,
    DOT: x.$DOT_DMG,
    BREAK: x.$BREAK_DMG,
    COMBO: x.$COMBO_DMG,
    EHP: x.$EHP,
    HEAL: x.$HEAL_VALUE,
    SHIELD: x.$SHIELD_VALUE,
    xHP: x.$HP,
    xATK: x.$ATK,
    xDEF: x.$DEF,
    xSPD: x.$SPD,
    xCR: x.$CR,
    xCD: x.$CD,
    xEHR: x.$EHR,
    xRES: x.$RES,
    xBE: x.$BE,
    xERR: x.$ERR,
    xOHB: x.$OHB,
    xELEMENTAL_DMG: x.$ELEMENTAL_DMG,
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
    mxHP: m.$HP,
    mxATK: m.$ATK,
    mxDEF: m.$DEF,
    mxSPD: m.$SPD,
    mxCR: m.$CR,
    mxCD: m.$CD,
    mxEHR: m.$EHR,
    mxRES: m.$RES,
    mxBE: m.$BE,
    mxERR: m.$ERR,
    mxOHB: m.$OHB,
    mxELEMENTAL_DMG: m.$ELEMENTAL_DMG,
    mxEHP: m.$EHP,
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
    result[externalKey as keyof ComputedStatsObjectExternal] = array[numericKey]
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
