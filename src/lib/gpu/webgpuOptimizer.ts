import { type ComputeEngine } from 'lib/constants/constants'
import { type WorkgroupEntry } from 'lib/gpu/webgpuDataTransform'
import { debugWebgpuOutput } from 'lib/gpu/webgpuDebugger'
import {
  destroyPipeline,
  type ExecutionPassResult,
  generateExecutionPass,
  initializeGpuPipeline,
  submitGpuDispatch,
} from 'lib/gpu/webgpuInternals'
import {
  type GpuExecutionContext,
  type RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { webgpuCrashNotification } from 'lib/interactions/notifications'
import {
  type BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { type OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { formatOptimizerDisplayData } from 'lib/optimization/optimizer'
import { SortOption } from 'lib/optimization/sortOptions'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { type SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import { setSortColumn } from 'lib/stores/gridStore'
import { gridStore } from 'lib/stores/gridStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { activateZeroResultSuggestionsModal } from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { type Form } from 'types/form'
import { type OptimizerContext } from 'types/optimizer'

globalThis.WEBGPU_DEBUG = false

export async function gpuOptimize(props: {
  device: GPUDevice | null,
  context: OptimizerContext,
  request: Form,
  relics: RelicsByPart,
  permutations: number,
  validPermutations: number,
  computeEngine: string,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
}) {
  const { context, request, relics, permutations, validPermutations, computeEngine, relicSetSolutions, ornamentSetSolutions } = props

  const device = props.device
  if (device == null) {
    console.error('Not supported')
    return
  }

  device.onuncapturederror = (event) => {
    if (useOptimizerDisplayStore.getState().optimizationInProgress) {
      useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
      webgpuCrashNotification()
    }
  }

  useOptimizerDisplayStore.getState().setOptimizerStartTime(Date.now())
  useOptimizerDisplayStore.getState().setOptimizerRunningEngine(computeEngine as ComputeEngine)

  const gpuContext = await initializeGpuPipeline(
    device,
    relics,
    request,
    context,
    permutations,
    computeEngine,
    relicSetSolutions,
    ornamentSetSolutions,
    globalThis.WEBGPU_DEBUG,
  )

  if (gpuContext.DEBUG) {
    Message.warning('Debug mode is ON', 5)
  }

  let permutationsSearched = 0

  if (gpuContext.TUPLE_MODE) {
    permutationsSearched = await runTupleDispatch(gpuContext)
  } else {
    permutationsSearched = await runNaiveDispatch(gpuContext)
  }

  if (useOptimizerDisplayStore.getState().optimizationInProgress) {
    useOptimizerDisplayStore.getState().setPermutationsSearched(validPermutations)
    useOptimizerDisplayStore.getState().setOptimizerProgress(1)
  }
  useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
  useOptimizerDisplayStore.getState().setPermutationsResults(gpuContext.resultsQueue.size())

  setTimeout(() => {
    outputResults(gpuContext)
    destroyPipeline(gpuContext)
  }, 1)
}

async function runNaiveDispatch(gpuContext: GpuExecutionContext): Promise<number> {
  const permStride = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const overflowedOffsets: number[] = []
  const seenIndices = new Set<number>()
  let permutationsSearched = 0

  let currentBufferIndex = 0
  let currentPassResult = generateExecutionPass(gpuContext, 0, currentBufferIndex)

  for (let iteration = 0; iteration < gpuContext.iterations; iteration++) {
    const offset = iteration * permStride
    const maxPermNumber = offset + permStride
    const passResult = currentPassResult

    const hasNext = iteration + 1 < gpuContext.iterations && gpuContext.permutations > maxPermNumber

    const nextBufferIndex = 1 - currentBufferIndex
    let nextPassResult: ExecutionPassResult | undefined
    if (hasNext) {
      nextPassResult = generateExecutionPass(gpuContext, (iteration + 1) * permStride, nextBufferIndex)
    }

    if (gpuContext.DEBUG) {
      await passResult.gpuReadBuffer.mapAsync(GPUMapMode.READ)
      readBufferMapped(offset, passResult.gpuReadBuffer, gpuContext)
      permutationsSearched += permStride
      passResult.gpuReadBuffer.unmap()
    } else {
      await passResult.compactReadBuffer.mapAsync(GPUMapMode.READ)
      const mappedRange = passResult.compactReadBuffer.getMappedRange()
      const rawCount = new Uint32Array(mappedRange, 0, 1)[0]
      const count = Math.min(rawCount, gpuContext.COMPACT_LIMIT)
      const isOverflow = rawCount > gpuContext.COMPACT_LIMIT

      const gpuValidCount = new Uint32Array(mappedRange, 4 + gpuContext.compactResultsBufferSize, 1)[0]

      if (isOverflow) {
        overflowedOffsets.push(offset)
      }
      permutationsSearched += gpuValidCount

      processCompactResults(offset, count, mappedRange, gpuContext, isOverflow ? seenIndices : undefined)
      passResult.compactReadBuffer.unmap()
    }

    if (iteration === 0) {
      useOptimizerDisplayStore.getState().setOptimizerStartTime(Date.now())
    }

    if (hasNext && nextPassResult) {
      currentBufferIndex = nextBufferIndex
      currentPassResult = nextPassResult
    }

    const searchedSnapshot = permutationsSearched
    const progressSnapshot = (iteration + 1) / gpuContext.iterations
    setTimeout(() => {
      useOptimizerDisplayStore.setState({
        optimizerEndTime: Date.now(),
        permutationsResults: gpuContext.resultsQueue.size(),
        permutationsSearched: searchedSnapshot,
        optimizerProgress: progressSnapshot,
      })
    }, 0)

    if (gpuContext.permutations <= maxPermNumber || !useOptimizerDisplayStore.getState().optimizationInProgress) {
      gpuContext.cancelled = true
      break
    }
  }

  await revisitOverflowedDispatches(overflowedOffsets, gpuContext, seenIndices, permutationsSearched)

  return permutationsSearched
}

/** Absolute relic counts per slot, used to convert tuple-relative indices to flat global indices. */
export type RelicPartSizes = {
  lSize: number,
  pSize: number,
  fSize: number,
  bSize: number,
  gSize: number,
}

export function decodeTupleGlobalIndex(
  packedIndex: number,
  batchStart: number,
  assignments: WorkgroupEntry[],
  sizes: RelicPartSizes,
  localBits: number,
): number {
  const wgInBatch = packedIndex >>> localBits
  const localOffset = packedIndex & ((1 << localBits) - 1)
  const assignmentIdx = batchStart + wgInBatch
  const a = assignments[assignmentIdx]
  const totalOffset = a.startOffset + localOffset

  const l = totalOffset % a.lSize
  const c1 = (totalOffset - l) / a.lSize
  const p = c1 % a.pSize
  const c2 = (c1 - p) / a.pSize
  const f = c2 % a.fSize
  const c3 = (c2 - f) / a.fSize
  const b = c3 % a.bSize
  const c4 = (c3 - b) / a.bSize
  const g = c4 % a.gSize
  const h = (c4 - g) / a.gSize

  // D=4: F, B, G, H are tuple-relative, convert to absolute positions
  const absF = a.xf + f
  const absB = a.xb + b
  const absG = a.xg + g
  const absH = a.xh + h

  const { lSize, pSize, fSize, bSize, gSize } = sizes
  return l
    + p * lSize
    + absF * lSize * pSize
    + absB * lSize * pSize * fSize
    + absG * lSize * pSize * fSize * bSize
    + absH * lSize * pSize * fSize * bSize * gSize
}

function submitTupleBatch(gpuContext: GpuExecutionContext, batchStart: number, batchSize: number, bufferIndex: number): void {
  const threshold = gpuContext.resultsQueue.size() >= gpuContext.RESULTS_LIMIT
    ? gpuContext.resultsQueue.topPriority()
    : 0
  const paramsBuf = new ArrayBuffer(16)
  new Float32Array(paramsBuf)[0] = threshold
  new Uint32Array(paramsBuf, 4)[0] = batchStart
  submitGpuDispatch(gpuContext, paramsBuf, batchSize, bufferIndex)
}

function processTupleBatch(
  gpuContext: GpuExecutionContext,
  bufferIndex: number,
  batchStart: number,
  assignments: WorkgroupEntry[],
  sizes: RelicPartSizes,
  localBits: number,
  seenIndices?: Set<number>,
): { rawCount: number, validCount: number } {
  const compactReadBuffer = gpuContext.compactReadBuffers[bufferIndex]
  const mappedRange = compactReadBuffer.getMappedRange()
  const rawCount = new Uint32Array(mappedRange, 0, 1)[0]
  const validCount = new Uint32Array(mappedRange, 4 + gpuContext.compactResultsBufferSize, 1)[0]
  const count = Math.min(rawCount, gpuContext.COMPACT_LIMIT)

  pushCompactResultsToQueue(mappedRange, count, gpuContext, (raw) => decodeTupleGlobalIndex(raw, batchStart, assignments, sizes, localBits), seenIndices)

  compactReadBuffer.unmap()
  return { rawCount, validCount }
}

async function runTupleDispatch(gpuContext: GpuExecutionContext): Promise<number> {
  if (gpuContext.assignments.length === 0) return 0

  const localBits = Math.ceil(Math.log2(gpuContext.WORKGROUP_SIZE * gpuContext.CYCLES_PER_INVOCATION))
  const BATCH_WGS = Math.min(2048, gpuContext.assignments.length)

  // Packed index = (workgroup_in_batch << localBits) | threadLocalOffset — must fit u32
  if (localBits + Math.ceil(Math.log2(BATCH_WGS + 1)) > 32) {
    throw new Error(`Packed index overflow: ${localBits} local bits + ${BATCH_WGS} max workgroups exceeds u32`)
  }
  const totalBatches = Math.ceil(gpuContext.assignments.length / BATCH_WGS)
  const assignments = gpuContext.assignments
  const relics = gpuContext.relics
  const sizes: RelicPartSizes = {
    lSize: relics.LinkRope.length,
    pSize: relics.PlanarSphere.length,
    fSize: relics.Feet.length,
    bSize: relics.Body.length,
    gSize: relics.Hands.length,
  }
  const overflowedBatches: number[] = []
  const seenIndices = new Set<number>()
  let permutationsSearched = 0

  // Double-buffered: submit batch N+1 while reading batch N
  let currentBuf = 0

  // Reset start time before first dispatch to exclude pipeline setup from perms/sec
  useOptimizerDisplayStore.getState().setOptimizerStartTime(Date.now())

  // Submit first batch
  const firstBatchSize = Math.min(BATCH_WGS, gpuContext.assignments.length)
  submitTupleBatch(gpuContext, 0, firstBatchSize, currentBuf)

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * BATCH_WGS
    const readBuf = currentBuf

    // Determine next batch
    const hasNext = batch + 1 < totalBatches
    if (hasNext) {
      const nextBuf = 1 - currentBuf
      const nextBatchStart = (batch + 1) * BATCH_WGS
      const nextBatchSize = Math.min(BATCH_WGS, gpuContext.assignments.length - nextBatchStart)
      submitTupleBatch(gpuContext, nextBatchStart, nextBatchSize, nextBuf)
      currentBuf = nextBuf
    }

    await gpuContext.compactReadBuffers[readBuf].mapAsync(GPUMapMode.READ)

    const { rawCount, validCount } = processTupleBatch(gpuContext, readBuf, batchStart, assignments, sizes, localBits)
    permutationsSearched += validCount
    if (rawCount > gpuContext.COMPACT_LIMIT) {
      overflowedBatches.push(batchStart)
    }

    const searchedSnapshot = permutationsSearched
    const progressSnapshot = (batch + 1) / totalBatches
    setTimeout(() => {
      useOptimizerDisplayStore.setState({
        optimizerEndTime: Date.now(),
        permutationsResults: gpuContext.resultsQueue.size(),
        permutationsSearched: searchedSnapshot,
        optimizerProgress: progressSnapshot,
      })
    }, 0)

    if (!useOptimizerDisplayStore.getState().optimizationInProgress) {
      gpuContext.cancelled = true
      break
    }
  }

  // Revisit overflowed batches with tighter threshold
  if (overflowedBatches.length > 0) {
    for (const batchStart of overflowedBatches) {
      if (!useOptimizerDisplayStore.getState().optimizationInProgress) break

      const batchSize = Math.min(BATCH_WGS, gpuContext.assignments.length - batchStart)
      let rawCount: number
      let retries = 0
      do {
        submitTupleBatch(gpuContext, batchStart, batchSize, 0)
        await gpuContext.compactReadBuffers[0].mapAsync(GPUMapMode.READ)
        const result = processTupleBatch(gpuContext, 0, batchStart, assignments, sizes, localBits, seenIndices)
        rawCount = result.rawCount
      } while (rawCount > gpuContext.COMPACT_LIMIT && retries++ < 100000)
    }
  }

  return permutationsSearched
}

// Reads results from an already-mapped buffer
function readBufferMapped(offset: number, gpuReadBuffer: GPUBuffer, gpuContext: GpuExecutionContext, elementOffset: number = 0) {
  const arrayBuffer = gpuReadBuffer.getMappedRange(elementOffset * 4)
  const array = new Float32Array(arrayBuffer)

  processResults(offset, array, gpuContext, elementOffset)

  if (gpuContext.DEBUG) {
    debugWebgpuOutput(gpuContext, arrayBuffer)
  }
}

function processResults(offset: number, array: Float32Array, gpuContext: GpuExecutionContext, elementOffset: number = 0) {
  const resultsQueue = gpuContext.resultsQueue
  let top = resultsQueue.size() > 0 ? resultsQueue.topPriority() : 0

  let limit = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const maxPermNumber = offset + gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const diff = gpuContext.permutations - maxPermNumber
  if (diff < 0) {
    limit += diff
  }

  const indexOffset = offset + elementOffset
  if (resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
    for (let j = limit - elementOffset - 1; j >= 0; j--) {
      const value = array[j]
      if (value < 0) {
        j += value + 1
        continue
      }
      if (value <= top) continue

      top = resultsQueue.fixedSizePushOvercapped(indexOffset + j, value)
    }
  } else {
    for (let j = limit - elementOffset - 1; j >= 0; j--) {
      const value = array[j]
      if (value < 0) {
        j += value + 1
        continue
      }

      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
        continue
      }

      resultsQueue.fixedSizePush(indexOffset + j, value)
      top = resultsQueue.topPriority()
    }
  }
}

function pushCompactResultsToQueue(
  mappedRange: ArrayBuffer,
  count: number,
  gpuContext: GpuExecutionContext,
  resolveIndex: (rawIndex: number) => number,
  seenIndices?: Set<number>,
): void {
  if (count === 0) return

  const u32View = new Uint32Array(mappedRange, 4)
  const f32View = new Float32Array(mappedRange, 4)
  const resultsQueue = gpuContext.resultsQueue
  let top = resultsQueue.size() > 0 ? resultsQueue.topPriority() : 0

  if (resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
    for (let i = 0; i < count; i++) {
      const value = f32View[i * 2 + 1]
      if (value <= top) continue
      const globalIndex = resolveIndex(u32View[i * 2])
      if (seenIndices?.has(globalIndex)) continue
      top = resultsQueue.fixedSizePushOvercapped(globalIndex, value)
      seenIndices?.add(globalIndex)
    }
  } else {
    for (let i = 0; i < count; i++) {
      const value = f32View[i * 2 + 1]
      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) continue
      const globalIndex = resolveIndex(u32View[i * 2])
      if (seenIndices?.has(globalIndex)) continue
      resultsQueue.fixedSizePush(globalIndex, value)
      top = resultsQueue.topPriority()
      seenIndices?.add(globalIndex)
    }
  }
}

function processCompactResults(offset: number, count: number, mappedRange: ArrayBuffer, gpuContext: GpuExecutionContext, seenIndices?: Set<number>) {
  pushCompactResultsToQueue(mappedRange, count, gpuContext, (raw) => offset + raw, seenIndices)
}

async function revisitOverflowedDispatches(
  overflowedOffsets: number[],
  gpuContext: GpuExecutionContext,
  seenIndices: Set<number>,
  permutationsSearched: number,
) {
  if (overflowedOffsets.length > 0 && useOptimizerDisplayStore.getState().optimizationInProgress) {
    for (const overflowOffset of overflowedOffsets) {
      let rawCount: number
      let retries = 0
      do {
        const passResult = generateExecutionPass(gpuContext, overflowOffset, 0)

        await passResult.compactReadBuffer.mapAsync(GPUMapMode.READ)

        const mappedRange = passResult.compactReadBuffer.getMappedRange()
        rawCount = new Uint32Array(mappedRange, 0, 1)[0]
        const count = Math.min(rawCount, gpuContext.COMPACT_LIMIT)

        processCompactResults(overflowOffset, count, mappedRange, gpuContext, seenIndices)
        passResult.compactReadBuffer.unmap()
      } while (rawCount > gpuContext.COMPACT_LIMIT && retries++ < 100000)

      // Update results count but NOT endTime — the main loop's last endTime is the correct final value
      const searchedSnapshot = permutationsSearched
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          const uiState = useOptimizerDisplayStore.getState()
          uiState.setPermutationsResults(gpuContext.resultsQueue.size())
          uiState.setPermutationsSearched(searchedSnapshot)
          resolve()
        }, 0)
      )
    }
  }
}

function outputResults(gpuContext: GpuExecutionContext) {
  const relics: RelicsByPart = gpuContext.relics

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length

  const optimizerContext = gpuContext.context
  initializeContextConditionals(optimizerContext)

  const resultArray = gpuContext.resultsQueue.toResults().sort((a, b) => b.value - a.value)
  const outputs: OptimizerDisplayData[] = []
  const basicStatsArrayCore = new BasicStatsArrayCore(false) as BasicStatsArray

  for (let i = 0; i < resultArray.length; i++) {
    const index = resultArray[i].index

    const l = index % lSize
    const c1 = (index - l) / lSize
    const p = c1 % pSize
    const c2 = (c1 - p) / pSize
    const f = c2 % fSize
    const c3 = (c2 - f) / fSize
    const b = c3 % bSize
    const c4 = (c3 - b) / bSize
    const g = c4 % gSize
    const h = (c4 - g) / gSize

    const relicsByPart = {
      Head: relics.Head[h],
      Hands: relics.Hands[g],
      Body: relics.Body[b],
      Feet: relics.Feet[f],
      PlanarSphere: relics.PlanarSphere[p],
      LinkRope: relics.LinkRope[l],
    }

    const { x } = simulateBuild(relicsByPart as unknown as SimulationRelicByPart, optimizerContext, basicStatsArrayCore)

    const optimizerDisplayData = formatOptimizerDisplayData(x)
    optimizerDisplayData.id = index
    outputs.push(optimizerDisplayData)
  }

  if (outputs.length === 0) {
    activateZeroResultSuggestionsModal(gpuContext.request)
  }

  const sortOption = SortOption[gpuContext.request.resultSort as keyof typeof SortOption]
  const showMemo = gpuContext.request.memoDisplay === 'memo'
  const gridSortColumn = gpuContext.request.statDisplay === 'combat'
    ? (showMemo ? sortOption.memoCombatGridColumn : sortOption.combatGridColumn)
    : (showMemo ? sortOption.memoBasicGridColumn : sortOption.basicGridColumn)
  setSortColumn(gridSortColumn)
  OptimizerTabController.setRows(outputs)
  gridStore.optimizerGridApi()?.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}
