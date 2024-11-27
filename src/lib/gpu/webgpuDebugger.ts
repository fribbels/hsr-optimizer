import { GpuExecutionContext } from 'lib/gpu/webgpuTypes'
import { ComputedStatsObjectExternal, InternalKeyToExternal, Key, KeysType } from 'lib/optimization/computedStatsArray'
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

export function debugExportWebgpuResult(array: Float32Array) {
  return {
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
