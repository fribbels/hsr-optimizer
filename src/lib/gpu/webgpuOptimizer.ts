import { ComputeEngine } from 'lib/constants/constants'
import { debugWebgpuOutput } from 'lib/gpu/webgpuDebugger'
import {
  destroyPipeline,
  ExecutionPassResult,
  generateExecutionPass,
  initializeGpuPipeline,
} from 'lib/gpu/webgpuInternals'
import {
  GpuExecutionContext,
  RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { webgpuCrashNotification } from 'lib/interactions/notifications'
import {
  BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { formatOptimizerDisplayData } from 'lib/optimization/optimizer'
import { SortOption } from 'lib/optimization/sortOptions'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { activateZeroResultSuggestionsModal } from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

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
    if (window.store.getState().optimizationInProgress) {
      window.store.getState().setOptimizationInProgress(false)
      webgpuCrashNotification()
    }
  }

  window.store.getState().setOptimizerStartTime(Date.now())
  window.store.getState().setOptimizerRunningEngine(computeEngine as ComputeEngine)

  const gpuContext = initializeGpuPipeline(
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

  // console.log('Raw inputs', { context, request, relics, permutations })
  // console.log('GPU execution context', gpuContext)

  if (!gpuContext.startTime) {
    gpuContext.startTime = performance.now()
  }

  // Double-buffered loop: while CPU reads buffer N, GPU writes buffer N+1.

  const permStride = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION

  // Profiling accumulators
  let totalMapAsync = 0
  let totalDispatch = 0
  let totalCpuRead = 0
  let totalUnmap = 0
  let totalIterationTime = 0
  let totalGpuCompute = 0
  let minGpuCompute = Infinity
  let maxGpuCompute = 0
  let timestampReadCount = 0
  let profiledIterations = 0
  let totalCompactCount = 0
  let maxCompactCount = 0
  let queueSaturatedIteration = -1
  // Overflowed dispatches are revisited after the main loop. seenIndices deduplicates partial captures vs revisit results.
  const overflowedOffsets: number[] = []
  const seenIndices = new Set<number>()
  let permutationsSearched = 0

  // Submit the first dispatch (buffer A)
  let currentBufferIndex = 0
  let t0 = performance.now()
  let currentPassResult = generateExecutionPass(gpuContext, 0, currentBufferIndex)
  const firstDispatchTime = performance.now() - t0

  for (let iteration = 0; iteration < gpuContext.iterations; iteration++) {
    const iterStart = performance.now()
    const offset = iteration * permStride
    const maxPermNumber = offset + permStride
    const passResult = currentPassResult
    const bufferIdx = currentBufferIndex

    // Determine if there will be a next iteration
    const hasNext = iteration + 1 < gpuContext.iterations && gpuContext.permutations > maxPermNumber

    // Submit next dispatch BEFORE awaiting current results (pipelining)
    const nextBufferIndex = 1 - bufferIdx
    let nextPassResult: ExecutionPassResult | undefined
    t0 = performance.now()
    if (hasNext) {
      nextPassResult = generateExecutionPass(gpuContext, (iteration + 1) * permStride, nextBufferIndex)
    }
    const dispatchTime = performance.now() - t0

    // Await current dispatch and read results (DEBUG vs compact path)
    t0 = performance.now()
    let mapTime: number
    let cpuReadTime: number

    if (gpuContext.DEBUG) {
      await passResult.gpuReadBuffer.mapAsync(GPUMapMode.READ)
      mapTime = performance.now() - t0

      t0 = performance.now()
      readBufferMapped(offset, passResult.gpuReadBuffer, gpuContext)
      cpuReadTime = performance.now() - t0
      permutationsSearched += permStride

      t0 = performance.now()
      passResult.gpuReadBuffer.unmap()
    } else {
      await passResult.compactReadBuffer.mapAsync(GPUMapMode.READ)
      mapTime = performance.now() - t0

      // Read GPU timestamp only on the last iteration (no pipelined dispatch ahead to stall on)
      if (!hasNext && gpuContext.canTimestamp && gpuContext.timestampReadBuffers) {
        try {
          const tsBuffer = gpuContext.timestampReadBuffers[bufferIdx]
          await tsBuffer.mapAsync(GPUMapMode.READ)
          const timestamps = new BigUint64Array(tsBuffer.getMappedRange())
          const computeMs = Number(timestamps[1] - timestamps[0]) / 1_000_000
          totalGpuCompute += computeMs
          minGpuCompute = Math.min(minGpuCompute, computeMs)
          maxGpuCompute = Math.max(maxGpuCompute, computeMs)
          timestampReadCount++
          tsBuffer.unmap()
        } catch {
          // Non-fatal
        }
      }

      t0 = performance.now()
      const mappedRange = passResult.compactReadBuffer.getMappedRange()
      const rawCount = new Uint32Array(mappedRange, 0, 1)[0]
      const count = Math.min(rawCount, gpuContext.COMPACT_LIMIT)
      const isOverflow = rawCount >= gpuContext.COMPACT_LIMIT

      totalCompactCount += rawCount
      maxCompactCount = Math.max(maxCompactCount, rawCount)

      if (isOverflow) {
        overflowedOffsets.push(offset)
      } else {
        permutationsSearched += permStride
      }

      processCompactResults(offset, count, mappedRange, gpuContext, isOverflow ? seenIndices : undefined)

      if (queueSaturatedIteration === -1 && gpuContext.resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
        queueSaturatedIteration = iteration
      }
      cpuReadTime = performance.now() - t0

      t0 = performance.now()
      passResult.compactReadBuffer.unmap()
    }

    totalMapAsync += mapTime
    totalDispatch += dispatchTime
    totalCpuRead += cpuReadTime
    totalUnmap += performance.now() - t0

    if (hasNext && nextPassResult) {
      currentBufferIndex = nextBufferIndex
      currentPassResult = nextPassResult
    }

    profiledIterations++
    totalIterationTime += performance.now() - iterStart

    const searchedSnapshot = permutationsSearched
    setTimeout(() => {
      const state = window.store.getState()
      state.setOptimizerEndTime(Date.now())
      state.setPermutationsResults(gpuContext.resultsQueue.size())
      state.setPermutationsSearched(Math.min(gpuContext.permutations, searchedSnapshot))
    }, 0)

    if (gpuContext.permutations <= maxPermNumber || !window.store.getState().optimizationInProgress) {
      gpuContext.cancelled = true
      break
    }
  }

  // Revisit overflowed dispatches now that the threshold is established.
  const { revisitTime, totalRevisitPasses } = await revisitOverflowedDispatches(
    overflowedOffsets, gpuContext, seenIndices,
  )
  permutationsSearched += overflowedOffsets.length * permStride

  logProfilingResults({
    profiledIterations, permStride, totalIterationTime,
    totalMapAsync, totalDispatch, totalCpuRead, totalUnmap,
    totalGpuCompute, minGpuCompute, maxGpuCompute, timestampReadCount,
    totalCompactCount, maxCompactCount, queueSaturatedIteration,
    firstDispatchTime, overflowedOffsets, totalRevisitPasses, revisitTime,
    gpuContext,
  })

  if (window.store.getState().optimizationInProgress) {
    window.store.getState().setPermutationsSearched(gpuContext.permutations)
  }
  window.store.getState().setOptimizationInProgress(false)
  window.store.getState().setPermutationsResults(gpuContext.resultsQueue.size())

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
  let top = resultsQueue.top()?.value ?? 0

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

      top = resultsQueue.fixedSizePushOvercapped({
        index: indexOffset + j,
        value: value,
      }).value
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

      resultsQueue.fixedSizePush({
        index: indexOffset + j,
        value: value,
      })
      top = resultsQueue.top()!.value
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
  let top = resultsQueue.top()?.value ?? 0

  if (resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
    for (let i = 0; i < count; i++) {
      const globalIndex = offset + i32View[i * 2]
      if (seenIndices?.has(globalIndex)) continue
      const value = f32View[i * 2 + 1]
      if (value <= top) continue
      top = resultsQueue.fixedSizePushOvercapped({
        index: globalIndex,
        value: value,
      }).value
      seenIndices?.add(globalIndex)
    }
  } else {
    for (let i = 0; i < count; i++) {
      const globalIndex = offset + i32View[i * 2]
      if (seenIndices?.has(globalIndex)) continue
      const value = f32View[i * 2 + 1]
      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) continue
      resultsQueue.fixedSizePush({
        index: globalIndex,
        value: value,
      })
      top = resultsQueue.top()!.value
      seenIndices?.add(globalIndex)
    }
  }
}

async function revisitOverflowedDispatches(
  overflowedOffsets: number[],
  gpuContext: GpuExecutionContext,
  seenIndices: Set<number>,
) {
  let totalRevisitPasses = 0
  let revisitTime = 0

  if (overflowedOffsets.length > 0 && window.store.getState().optimizationInProgress) {
    const revisitStart = performance.now()
    for (const overflowOffset of overflowedOffsets) {
      let passes = 0
      let rawCount: number
      do {
        const passResult = generateExecutionPass(gpuContext, overflowOffset, 0)

        await passResult.compactReadBuffer.mapAsync(GPUMapMode.READ)

        const mappedRange = passResult.compactReadBuffer.getMappedRange()
        rawCount = new Uint32Array(mappedRange, 0, 1)[0]
        const count = Math.min(rawCount, gpuContext.COMPACT_LIMIT)

        processCompactResults(overflowOffset, count, mappedRange, gpuContext, seenIndices)
        passResult.compactReadBuffer.unmap()
        passes++
      } while (rawCount >= gpuContext.COMPACT_LIMIT)

      totalRevisitPasses += passes
    }
    revisitTime = performance.now() - revisitStart
  }

  return { revisitTime, totalRevisitPasses }
}

function logProfilingResults(p: {
  profiledIterations: number,
  permStride: number,
  totalIterationTime: number,
  totalMapAsync: number,
  totalDispatch: number,
  totalCpuRead: number,
  totalUnmap: number,
  totalGpuCompute: number,
  minGpuCompute: number,
  maxGpuCompute: number,
  timestampReadCount: number,
  totalCompactCount: number,
  maxCompactCount: number,
  queueSaturatedIteration: number,
  firstDispatchTime: number,
  overflowedOffsets: number[],
  totalRevisitPasses: number,
  revisitTime: number,
  gpuContext: GpuExecutionContext,
}) {
  if (p.profiledIterations <= 0) return

  const pct = (v: number) => (100 * v / p.totalIterationTime).toFixed(1)
  const permsPerSec = Math.floor(p.profiledIterations * p.permStride / (p.totalIterationTime / 1000))

  let log = `[GPU Profiling] ${p.profiledIterations} iterations, ${p.totalIterationTime.toFixed(1)}ms total, ${permsPerSec.toLocaleString()} perms/sec\n`
    + `  mapAsync (GPU compute+copy wait): ${p.totalMapAsync.toFixed(1)}ms total, ${(p.totalMapAsync / p.profiledIterations).toFixed(2)}ms avg (${pct(p.totalMapAsync)}%)\n`

  if (p.timestampReadCount >= p.profiledIterations) {
    const gpuCopyDerived = p.totalMapAsync - p.totalGpuCompute
    log += `    -> GPU compute (timestamp):     ${p.totalGpuCompute.toFixed(1)}ms total, ${(p.totalGpuCompute / p.timestampReadCount).toFixed(2)}ms avg, ${p.minGpuCompute.toFixed(2)}ms min, ${p.maxGpuCompute.toFixed(2)}ms max (${pct(p.totalGpuCompute)}%)\n`
    log += `    -> buffer copy (derived):       ${gpuCopyDerived.toFixed(1)}ms total, ${(gpuCopyDerived / p.timestampReadCount).toFixed(2)}ms avg (${pct(gpuCopyDerived)}%)\n`
  } else if (p.timestampReadCount > 0) {
    const avgGpuCompute = p.totalGpuCompute / p.timestampReadCount
    const estimatedTotalCompute = avgGpuCompute * p.profiledIterations
    const estimatedCopy = p.totalMapAsync - estimatedTotalCompute
    log += `    -> GPU compute (${p.timestampReadCount} sample${p.timestampReadCount > 1 ? 's' : ''}): ${avgGpuCompute.toFixed(2)}ms avg, ~${estimatedTotalCompute.toFixed(0)}ms est. total (${pct(estimatedTotalCompute)}%)\n`
    log += `    -> buffer copy (est.):          ~${estimatedCopy.toFixed(0)}ms est. total (${pct(estimatedCopy)}%)\n`
  } else {
    log += `    -> (timestamp-query not available — cannot split compute vs copy)\n`
  }

  const avgCompactCount = (p.totalCompactCount / p.profiledIterations).toFixed(1)
  const saturationStr = p.queueSaturatedIteration >= 0 ? `iteration ${p.queueSaturatedIteration}` : 'never'
  const finalThreshold = (p.gpuContext.resultsQueue.top()?.value ?? 0).toFixed(3)

  log +=
    `  dispatch (submit next):           ${p.totalDispatch.toFixed(1)}ms total, ${(p.totalDispatch / p.profiledIterations).toFixed(2)}ms avg (${pct(p.totalDispatch)}%)\n`
    + `  cpuRead (process results):        ${p.totalCpuRead.toFixed(1)}ms total, ${(p.totalCpuRead / p.profiledIterations).toFixed(2)}ms avg (${pct(p.totalCpuRead)}%)\n`
    + `  unmap:                            ${p.totalUnmap.toFixed(1)}ms total, ${(p.totalUnmap / p.profiledIterations).toFixed(2)}ms avg (${pct(p.totalUnmap)}%)\n`
    + `  first dispatch:                   ${p.firstDispatchTime.toFixed(2)}ms\n`
    + `  overhead:                         ${(p.totalIterationTime - p.totalMapAsync - p.totalDispatch - p.totalCpuRead - p.totalUnmap).toFixed(1)}ms\n`
    + `  compact fill:                     ${avgCompactCount} avg, ${p.maxCompactCount} max / ${p.gpuContext.COMPACT_LIMIT} limit\n`
    + `  compact overflows:                ${p.overflowedOffsets.length}\n`
    + `  queue saturated:                  ${saturationStr}\n`
    + `  threshold final:                  ${finalThreshold}\n`
    + `  revisit:                          ${p.overflowedOffsets.length} offsets, ${p.totalRevisitPasses} passes, ${p.revisitTime.toFixed(1)}ms`

  console.log(log)
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

  const resultArray = gpuContext.resultsQueue.toArray().sort((a, b) => b.value - a.value)
  const outputs: OptimizerDisplayData[] = []
  const basicStatsArrayCore = new BasicStatsArrayCore(false) as BasicStatsArray

  for (let i = 0; i < resultArray.length; i++) {
    const index = resultArray[i].index

    const l = index % lSize
    const p = ((index - l) / lSize) % pSize
    const f = ((index - p * lSize - l) / (lSize * pSize)) % fSize
    const b = ((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize
    const g = ((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize
    const h =
      ((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize))
      % hSize

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

  // console.log(outputs)

  if (outputs.length == 0) {
    activateZeroResultSuggestionsModal(gpuContext.request)
  }

  const sortOption = SortOption[gpuContext.request.resultSort as keyof typeof SortOption]
  const showMemo = gpuContext.request.memoDisplay === 'memo'
  const gridSortColumn = gpuContext.request.statDisplay == 'combat'
    ? (showMemo ? sortOption.memoCombatGridColumn : sortOption.combatGridColumn)
    : (showMemo ? sortOption.memoBasicGridColumn : sortOption.basicGridColumn)
  setSortColumn(gridSortColumn)
  OptimizerTabController.setRows(outputs)
  window.optimizerGrid.current!.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}
