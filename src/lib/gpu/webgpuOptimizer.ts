import { type ComputeEngine } from 'lib/constants/constants'
import { debugWebgpuOutput } from 'lib/gpu/webgpuDebugger'
import {
  destroyPipeline,
  type ExecutionPassResult,
  generateExecutionPass,
  initializeGpuPipeline,
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
import { activateZeroResultSuggestionsModal } from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { gridStore } from 'lib/stores/gridStore'
import { type Form } from 'types/form'
import { type OptimizerContext } from 'types/optimizer'

globalThis.WEBGPU_DEBUG = false

export async function gpuOptimize(props: {
  device: GPUDevice | null,
  context: OptimizerContext,
  request: Form,
  relics: RelicsByPart,
  permutations: number,
  computeEngine: string,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
}) {
  const { context, request, relics, permutations, computeEngine, relicSetSolutions, ornamentSetSolutions } = props

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

  // Double-buffered loop: while CPU reads buffer N, GPU writes buffer N+1.

  const permStride = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION

  // Overflowed dispatches are revisited after the main loop. seenIndices deduplicates partial captures vs revisit results.
  const overflowedOffsets: number[] = []
  const seenIndices = new Set<number>()
  let permutationsSearched = 0

  // Submit the first dispatch (buffer A)
  let currentBufferIndex = 0
  let currentPassResult = generateExecutionPass(gpuContext, 0, currentBufferIndex)

  for (let iteration = 0; iteration < gpuContext.iterations; iteration++) {
    const offset = iteration * permStride
    const maxPermNumber = offset + permStride
    const passResult = currentPassResult

    // Determine if there will be a next iteration
    const hasNext = iteration + 1 < gpuContext.iterations && gpuContext.permutations > maxPermNumber

    // Submit next dispatch BEFORE awaiting current results
    const nextBufferIndex = 1 - currentBufferIndex
    let nextPassResult: ExecutionPassResult | undefined
    if (hasNext) {
      nextPassResult = generateExecutionPass(gpuContext, (iteration + 1) * permStride, nextBufferIndex)
    }

    // Await current dispatch and read results
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

      if (isOverflow) {
        overflowedOffsets.push(offset)
      } else {
        permutationsSearched += permStride
      }

      processCompactResults(offset, count, mappedRange, gpuContext, isOverflow ? seenIndices : undefined)
      passResult.compactReadBuffer.unmap()
    }

    // Reset start time after first dispatch to exclude shader compilation from perms/sec
    if (iteration === 0) {
      useOptimizerDisplayStore.getState().setOptimizerStartTime(Date.now())
    }

    if (hasNext && nextPassResult) {
      currentBufferIndex = nextBufferIndex
      currentPassResult = nextPassResult
    }

    const searchedSnapshot = permutationsSearched
    setTimeout(() => {
      const uiState = useOptimizerDisplayStore.getState()
      uiState.setOptimizerEndTime(Date.now())
      uiState.setPermutationsResults(gpuContext.resultsQueue.size())
      uiState.setPermutationsSearched(Math.min(gpuContext.permutations, searchedSnapshot))
    }, 0)

    if (gpuContext.permutations <= maxPermNumber || !useOptimizerDisplayStore.getState().optimizationInProgress) {
      gpuContext.cancelled = true
      break
    }
  }

  // Revisit overflowed dispatches now that the threshold is established.
  await revisitOverflowedDispatches(overflowedOffsets, gpuContext, seenIndices, permStride, permutationsSearched)

  if (useOptimizerDisplayStore.getState().optimizationInProgress) {
    useOptimizerDisplayStore.getState().setPermutationsSearched(gpuContext.permutations)
  }
  useOptimizerDisplayStore.getState().setOptimizationInProgress(false)
  useOptimizerDisplayStore.getState().setPermutationsResults(gpuContext.resultsQueue.size())

  setTimeout(() => {
    outputResults(gpuContext)
    destroyPipeline(gpuContext)
  }, 1)
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

// Reads compact results from merged mapped buffer: [count(4B) | CompactEntry[](N*8B)]
function processCompactResults(offset: number, count: number, mappedRange: ArrayBuffer, gpuContext: GpuExecutionContext, seenIndices?: Set<number>) {
  if (count === 0) return

  // Results start at byte offset 4 (after the u32 count)
  const i32View = new Int32Array(mappedRange, 4)
  const f32View = new Float32Array(mappedRange, 4)

  const resultsQueue = gpuContext.resultsQueue
  let top = resultsQueue.size() > 0 ? resultsQueue.topPriority() : 0

  // Split to skip size check when queue is full
  if (resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
    for (let i = 0; i < count; i++) {
      const globalIndex = offset + i32View[i * 2]
      if (seenIndices?.has(globalIndex)) continue
      const value = f32View[i * 2 + 1]
      if (value <= top) continue
      top = resultsQueue.fixedSizePushOvercapped(globalIndex, value)
      seenIndices?.add(globalIndex)
    }
  } else {
    for (let i = 0; i < count; i++) {
      const globalIndex = offset + i32View[i * 2]
      if (seenIndices?.has(globalIndex)) continue
      const value = f32View[i * 2 + 1]
      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) continue
      resultsQueue.fixedSizePush(globalIndex, value)
      top = resultsQueue.topPriority()
      seenIndices?.add(globalIndex)
    }
  }
}

async function revisitOverflowedDispatches(
  overflowedOffsets: number[],
  gpuContext: GpuExecutionContext,
  seenIndices: Set<number>,
  permStride: number,
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

      permutationsSearched += permStride
      const searchedSnapshot = permutationsSearched
      await new Promise<void>((resolve) => setTimeout(() => {
        const uiState = useOptimizerDisplayStore.getState()
        uiState.setOptimizerEndTime(Date.now())
        uiState.setPermutationsResults(gpuContext.resultsQueue.size())
        uiState.setPermutationsSearched(Math.min(gpuContext.permutations, searchedSnapshot))
        resolve()
      }, 0))
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
  const hSize = relics.Head.length

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
