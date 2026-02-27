import {
  ComputeEngine,
} from 'lib/constants/constants'
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

  // Double-buffered loop: overlap GPU dispatch N+1 with CPU read of dispatch N.
  // Buffer sets alternate via bufferIndex (0 and 1).
  // Flow: submit dispatch → wait for GPU → submit NEXT dispatch → CPU read current → unmap

  const permStride = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION

  // Profiling accumulators
  let totalMapAsync = 0
  let totalDispatch = 0
  let totalCpuRead = 0
  let totalUnmap = 0
  let totalIterationTime = 0
  let totalGpuCompute = 0
  let timestampReadCount = 0
  let profiledIterations = 0

  // Submit the first dispatch (buffer A)
  let currentBufferIndex = 0
  let currentOffset = 0
  let t0 = performance.now()
  let currentPassResult = generateExecutionPass(gpuContext, currentOffset, currentBufferIndex)
  const firstDispatchTime = performance.now() - t0

  for (let iteration = 0; iteration < gpuContext.iterations; iteration++) {
    const iterStart = performance.now()
    const offset = iteration * permStride
    const maxPermNumber = offset + permStride
    const passResult = currentPassResult
    const bufferIdx = currentBufferIndex

    // Determine if there will be a next iteration
    const hasNext = iteration + 1 < gpuContext.iterations
      && gpuContext.permutations > maxPermNumber

    if (gpuContext.DEBUG) {
      // DEBUG path: full 128MB buffer read (unchanged from original)
      t0 = performance.now()
      await passResult.gpuReadBuffer.mapAsync(GPUMapMode.READ)
      const mapTime = performance.now() - t0

      const nextBufferIndex = 1 - bufferIdx
      let nextPassResult: ExecutionPassResult | undefined
      t0 = performance.now()
      if (hasNext) {
        nextPassResult = generateExecutionPass(gpuContext, (iteration + 1) * permStride, nextBufferIndex)
      }
      const dispatchTime = performance.now() - t0

      t0 = performance.now()
      readBufferMapped(offset, passResult.gpuReadBuffer, gpuContext)
      const cpuReadTime = performance.now() - t0

      totalMapAsync += mapTime
      totalDispatch += dispatchTime
      totalCpuRead += cpuReadTime

      t0 = performance.now()
      passResult.gpuReadBuffer.unmap()
      totalUnmap += performance.now() - t0

      if (hasNext && nextPassResult) {
        currentBufferIndex = nextBufferIndex
        currentPassResult = nextPassResult
      }
    } else {
      // Production path: atomic compaction — map tiny compact buffers instead of 128MB
      t0 = performance.now()
      await Promise.all([
        passResult.compactCountReadBuffer.mapAsync(GPUMapMode.READ),
        passResult.compactResultsReadBuffer.mapAsync(GPUMapMode.READ),
      ])
      const mapTime = performance.now() - t0

      // Read GPU timestamp to measure compute time
      if (gpuContext.canTimestamp && gpuContext.timestampReadBuffer) {
        try {
          await gpuContext.timestampReadBuffer.mapAsync(GPUMapMode.READ)
          const timestamps = new BigUint64Array(gpuContext.timestampReadBuffer.getMappedRange())
          const computeNs = Number(timestamps[1] - timestamps[0])
          totalGpuCompute += computeNs / 1_000_000
          timestampReadCount++
          gpuContext.timestampReadBuffer.unmap()
        } catch {
          // Non-fatal
        }
      }

      // GPU is done. Submit next dispatch on the OTHER buffer while CPU reads.
      const nextBufferIndex = 1 - bufferIdx
      let nextPassResult: ExecutionPassResult | undefined
      t0 = performance.now()
      if (hasNext) {
        nextPassResult = generateExecutionPass(gpuContext, (iteration + 1) * permStride, nextBufferIndex)
      }
      const dispatchTime = performance.now() - t0

      // CPU reads compact results (typically 0-4096 entries instead of 33.5M floats)
      t0 = performance.now()
      processCompactResults(offset, passResult, gpuContext)
      const cpuReadTime = performance.now() - t0

      totalMapAsync += mapTime
      totalDispatch += dispatchTime
      totalCpuRead += cpuReadTime

      t0 = performance.now()
      passResult.compactCountReadBuffer.unmap()
      passResult.compactResultsReadBuffer.unmap()
      totalUnmap += performance.now() - t0

      if (hasNext && nextPassResult) {
        currentBufferIndex = nextBufferIndex
        currentPassResult = nextPassResult
      }
    }

    profiledIterations++
    totalIterationTime += performance.now() - iterStart

    setTimeout(() => {
      const state = window.store.getState()
      state.setOptimizerEndTime(Date.now())
      state.setPermutationsResults(gpuContext.resultsQueue.size())
      state.setPermutationsSearched(Math.min(gpuContext.permutations, maxPermNumber))
    }, 0)

    if (gpuContext.permutations <= maxPermNumber || !window.store.getState().optimizationInProgress) {
      gpuContext.cancelled = true
      break
    }
  }

  // Log profiling summary
  if (profiledIterations > 0) {
    const permsPerSec = Math.floor(profiledIterations * permStride / (totalIterationTime / 1000))
    const gpuCopyDerived = timestampReadCount > 0 ? totalMapAsync - totalGpuCompute : undefined

    let log = `[GPU Profiling] ${profiledIterations} iterations, ${(totalIterationTime).toFixed(1)}ms total, ${permsPerSec.toLocaleString()} perms/sec\n`
      + `  mapAsync (GPU compute+copy wait): ${totalMapAsync.toFixed(1)}ms total, ${(totalMapAsync / profiledIterations).toFixed(2)}ms avg (${(100 * totalMapAsync / totalIterationTime).toFixed(1)}%)\n`

    if (timestampReadCount > 0) {
      log += `    -> GPU compute (timestamp):     ${totalGpuCompute.toFixed(1)}ms total, ${(totalGpuCompute / timestampReadCount).toFixed(2)}ms avg (${(100 * totalGpuCompute / totalIterationTime).toFixed(1)}%)\n`
      log += `    -> buffer copy (derived):       ${gpuCopyDerived!.toFixed(1)}ms total, ${(gpuCopyDerived! / timestampReadCount).toFixed(2)}ms avg (${(100 * gpuCopyDerived! / totalIterationTime).toFixed(1)}%)\n`
    } else {
      log += `    -> (timestamp-query not available — cannot split compute vs copy)\n`
    }

    log += `  dispatch (submit next):           ${totalDispatch.toFixed(1)}ms total, ${(totalDispatch / profiledIterations).toFixed(2)}ms avg (${(100 * totalDispatch / totalIterationTime).toFixed(1)}%)\n`
      + `  cpuRead (process results):        ${totalCpuRead.toFixed(1)}ms total, ${(totalCpuRead / profiledIterations).toFixed(2)}ms avg (${(100 * totalCpuRead / totalIterationTime).toFixed(1)}%)\n`
      + `  unmap:                            ${totalUnmap.toFixed(1)}ms total, ${(totalUnmap / profiledIterations).toFixed(2)}ms avg (${(100 * totalUnmap / totalIterationTime).toFixed(1)}%)\n`
      + `  first dispatch:                   ${firstDispatchTime.toFixed(2)}ms\n`
      + `  overhead:                         ${(totalIterationTime - totalMapAsync - totalDispatch - totalCpuRead - totalUnmap).toFixed(1)}ms`

    console.log(log)
  }

  // Profiling tools
  // const totalTime = 0
  // const start = performance.now()
  // const end = performance.now()
  // const elapsedTime = end - start
  // totalTime += elapsedTime
  // console.log(`Iteration: ${elapsedTime.toFixed(4)} ms`)
  // const averageTime = totalTime / gpuContext.iterations
  // console.log(`Total Time: ${totalTime.toFixed(4)} ms`)
  // console.log(`Average Time per Iteration: ${averageTime.toFixed(4)} ms`)

  if (!gpuContext.cancelled) {
    window.store.getState().setPermutationsSearched(gpuContext.permutations)
  }
  window.store.getState().setOptimizationInProgress(false)
  window.store.getState().setPermutationsResults(gpuContext.resultsQueue.size())

  setTimeout(() => {
    outputResults(gpuContext)
    destroyPipeline(gpuContext)
  }, 1)
}

// Reads results from an already-mapped buffer (used in standard double-buffered path)
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

// Reads compact results from atomic compaction buffers (production path)
// offset = dispatch permutation offset (iteration * permStride), added to local index to get global permutation index
function processCompactResults(offset: number, passResult: ExecutionPassResult, gpuContext: GpuExecutionContext) {
  const countArray = new Uint32Array(passResult.compactCountReadBuffer.getMappedRange())
  const count = Math.min(countArray[0], gpuContext.COMPACT_LIMIT)

  if (count === 0) return

  const mappedRange = passResult.compactResultsReadBuffer.getMappedRange()
  const u32View = new Uint32Array(mappedRange)
  const f32View = new Float32Array(mappedRange)
  // Each entry is vec2<u32>: [localIndex_as_u32, bitcast<u32>(value_f32)]
  // Reading f32View[i*2+1] reinterprets the u32 bits back as f32
  // Global permutation index = offset + localIndex

  const resultsQueue = gpuContext.resultsQueue
  let top = resultsQueue.top()?.value ?? 0

  if (resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
    for (let i = 0; i < count; i++) {
      const value = f32View[i * 2 + 1]
      if (value <= top) continue
      top = resultsQueue.fixedSizePushOvercapped({
        index: offset + u32View[i * 2],
        value: value,
      }).value
    }
  } else {
    for (let i = 0; i < count; i++) {
      const value = f32View[i * 2 + 1]
      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) continue
      resultsQueue.fixedSizePush({
        index: offset + u32View[i * 2],
        value: value,
      })
      top = resultsQueue.top()!.value
    }
  }
}

// eslint-disable-next-line
async function readBuffer(offset: number, gpuReadBuffer: GPUBuffer, gpuContext: GpuExecutionContext, elementOffset: number = 0) {
  await gpuReadBuffer.mapAsync(GPUMapMode.READ, elementOffset)

  const arrayBuffer = gpuReadBuffer.getMappedRange(elementOffset * 4)
  const array = new Float32Array(arrayBuffer)

  processResults(offset, array, gpuContext, elementOffset)

  if (gpuContext.DEBUG) {
    debugWebgpuOutput(gpuContext, arrayBuffer)
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
