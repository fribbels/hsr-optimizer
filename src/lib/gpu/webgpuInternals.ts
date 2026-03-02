import { COMPUTE_ENGINE_GPU_EXPERIMENTAL } from 'lib/constants/constants'
import { isFirefox } from 'lib/utils/TsUtils'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import {
  generateParamsMatrix,
  mergeRelicsIntoArray,
} from 'lib/gpu/webgpuDataTransform'
import {
  GpuExecutionContext,
  GpuResult,
  RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'
import { bitpackBooleanArray } from 'lib/optimization/relicSetSolver'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

export function initializeGpuPipeline(
  device: GPUDevice,
  relics: RelicsByPart,
  request: Form,
  context: OptimizerContext,
  permutations: number,
  computeEngine: string,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
  debug = false,
  silent = false,
): GpuExecutionContext {
  const DEBUG = debug

  // Threads per workgroup
  const WORKGROUP_SIZE = 256

  // Permutations each thread evaluates per dispatch
  const CYCLES_PER_INVOCATION = 256

  // Workgroups dispatched per pass — scaled to ensure enough iterations for UI responsiveness
  const TARGET_ITERATIONS = 4
  const MIN_WORKGROUPS = 64
  const MAX_WORKGROUPS = computeEngine === COMPUTE_ENGINE_GPU_EXPERIMENTAL
    ? Math.min(2048, device.limits.maxComputeWorkgroupsPerDimension)
    : 512
  const neededWorkgroups = 2 ** Math.floor(Math.log2(permutations / WORKGROUP_SIZE / CYCLES_PER_INVOCATION / TARGET_ITERATIONS))
  const NUM_WORKGROUPS = Math.max(MIN_WORKGROUPS, Math.min(MAX_WORKGROUPS, neededWorkgroups))

  // Total threads per dispatch
  const BLOCK_SIZE = WORKGROUP_SIZE * NUM_WORKGROUPS

  // Top-N results to keep
  const RESULTS_LIMIT = request.resultsLimit ?? 1024

  // Compact buffer sizing multiplier over RESULTS_LIMIT
  const COMPACT_OVERFLOW_FACTOR = 4

  // Max compact entries per dispatch before overflow triggers revisit
  const COMPACT_LIMIT = RESULTS_LIMIT * COMPACT_OVERFLOW_FACTOR

  const wgsl = generateWgsl(context, request, relics, {
    WORKGROUP_SIZE,
    BLOCK_SIZE,
    CYCLES_PER_INVOCATION,
    RESULTS_LIMIT,
    COMPACT_LIMIT,
    DEBUG,
  })

  if (window.location.hostname === 'localhost') {
    console.log(wgsl)
  }

  const computePipeline = generatePipeline(device, wgsl)

  const paramsMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * 8
  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * BLOCK_SIZE * CYCLES_PER_INVOCATION
  // Only DEBUG mode needs the full results buffer
  const resultBufferSize = DEBUG ? resultMatrixBufferSize : 4
  const resultMatrixBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
  ]
  const paramsMatrixBuffer = device.createBuffer({
    size: paramsMatrixBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  })

  const hasRelicFilter = (request.relicSets?.length ?? 0) > 0
  const hasOrnamentFilter = (request.ornamentSets?.length ?? 0) > 0

  const mergedRelics = mergeRelicsIntoArray(relics)

  const relicsMatrixBuffer = createGpuBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrixBuffer = hasRelicFilter
    ? createGpuBuffer(device, new Int32Array(bitpackBooleanArray(relicSetSolutions)), GPUBufferUsage.STORAGE, true, true)
    : null
  const ornamentSetSolutionsMatrixBuffer = hasOrnamentFilter
    ? createGpuBuffer(device, new Int32Array(bitpackBooleanArray(ornamentSetSolutions)), GPUBufferUsage.STORAGE, true, true)
    : null
  const precomputedStatsBuffer = createGpuBuffer(device, context.precomputedStatsData!, isFirefox() ? GPUBufferUsage.STORAGE : GPUBufferUsage.UNIFORM)

  const bindGroup0 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: paramsMatrixBuffer } },
    ],
  })

  const bindGroup1 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: relicsMatrixBuffer } },
      ...ornamentSetSolutionsMatrixBuffer ? [{ binding: 1, resource: { buffer: ornamentSetSolutionsMatrixBuffer } }] : [],
      ...relicSetSolutionsMatrixBuffer ? [{ binding: 2, resource: { buffer: relicSetSolutionsMatrixBuffer } }] : [],
      { binding: 3, resource: { buffer: precomputedStatsBuffer } },
    ],
  })

  // Atomic compaction buffers
  const COMPACT_ENTRY_BYTES = 8 // CompactEntry: i32 index (4B) + f32 value (4B)
  const compactResultsBufferSize = COMPACT_LIMIT * COMPACT_ENTRY_BYTES

  const compactCountBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
  ]
  const compactResultsBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
  ]

  // Merged read buffer: [u32 count (4 bytes)][CompactEntry[] (compactResultsBufferSize bytes)]
  const compactReadBufferSize = 4 + compactResultsBufferSize
  const compactReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: compactReadBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: compactReadBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]

  const bindGroups2: [GPUBindGroup, GPUBindGroup] = [0, 1].map((i) =>
    device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(2),
      entries: [
        ...(DEBUG ? [{ binding: 0, resource: { buffer: resultMatrixBuffers[i] } }] : []),
        { binding: 1, resource: { buffer: compactCountBuffers[i] } },
        { binding: 2, resource: { buffer: compactResultsBuffers[i] } },
      ],
    })
  ) as [GPUBindGroup, GPUBindGroup]

  const gpuReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]

  const iterations = Math.ceil(permutations / BLOCK_SIZE / CYCLES_PER_INVOCATION)
  const resultsQueue = new FixedSizePriorityQueue<GpuResult>(RESULTS_LIMIT, (a, b) => a.value - b.value)

  return {
    WORKGROUP_SIZE,
    NUM_WORKGROUPS,
    BLOCK_SIZE,
    CYCLES_PER_INVOCATION,
    RESULTS_LIMIT,
    DEBUG,

    request,
    context,

    paramsMatrixBufferSize,
    resultMatrixBufferSize,
    permutations,
    iterations,
    relics,
    resultsQueue,
    cancelled: false,
    computeEngine,

    device,
    computePipeline,
    bindGroup0,
    bindGroup1,
    bindGroups2,
    paramsMatrixBuffer,
    resultMatrixBuffers,
    relicsMatrixBuffer,
    relicSetSolutionsMatrixBuffer,
    ornamentSetSolutionsMatrixBuffer,
    precomputedStatsBuffer,

    gpuReadBuffers,

    COMPACT_LIMIT,
    compactResultsBufferSize,
    compactReadBufferSize,
    compactCountBuffers,
    compactResultsBuffers,
    compactReadBuffers,
  }
}

export type ExecutionPassResult = {
  gpuReadBuffer: GPUBuffer,
  compactReadBuffer: GPUBuffer,
}

export function generateExecutionPass(gpuContext: GpuExecutionContext, offset: number, bufferIndex: number = 0): ExecutionPassResult {
  const newParamsMatrix = generateParamsMatrix(offset, gpuContext.relics, gpuContext)

  const device = gpuContext.device
  const computePipeline = gpuContext.computePipeline
  const bindGroup0 = gpuContext.bindGroup0
  const bindGroup1 = gpuContext.bindGroup1
  const bindGroup2 = gpuContext.bindGroups2[bufferIndex]
  const resultMatrixBufferSize = gpuContext.resultMatrixBufferSize
  const resultMatrixBuffer = gpuContext.resultMatrixBuffers[bufferIndex]
  const gpuReadBuffer = gpuContext.gpuReadBuffers[bufferIndex]

  const compactCountBuffer = gpuContext.compactCountBuffers[bufferIndex]
  const compactResultsBuffer = gpuContext.compactResultsBuffers[bufferIndex]
  const compactReadBuffer = gpuContext.compactReadBuffers[bufferIndex]

  device.queue.writeBuffer(gpuContext.paramsMatrixBuffer, 0, newParamsMatrix)

  const commandEncoder = device.createCommandEncoder()

  // Clear the atomic counter to 0 before dispatch
  commandEncoder.clearBuffer(compactCountBuffer, 0, 4)

  const passEncoder = commandEncoder.beginComputePass()
  passEncoder.setPipeline(computePipeline)
  passEncoder.setBindGroup(0, bindGroup0)
  passEncoder.setBindGroup(1, bindGroup1)
  passEncoder.setBindGroup(2, bindGroup2)
  passEncoder.dispatchWorkgroups(gpuContext.NUM_WORKGROUPS)
  passEncoder.end()

  // Copy compact count + results into merged read buffer: [count(4B) | results(N*8B)]
  commandEncoder.copyBufferToBuffer(compactCountBuffer, 0, compactReadBuffer, 0, 4)
  commandEncoder.copyBufferToBuffer(compactResultsBuffer, 0, compactReadBuffer, 4, gpuContext.compactResultsBufferSize)

  if (gpuContext.DEBUG) {
    // DEBUG mode: also copy the full results buffer
    commandEncoder.copyBufferToBuffer(resultMatrixBuffer, 0, gpuReadBuffer, 0, resultMatrixBufferSize)
  }

  device.queue.submit([commandEncoder.finish()])

  return { gpuReadBuffer, compactReadBuffer }
}

export function generatePipeline(device: GPUDevice, wgsl: string) {
  const shaderModule = device.createShaderModule({
    code: wgsl,
  })

  return device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })
}

export function createGpuBuffer(
  device: GPUDevice,
  matrix: Int32Array | Float32Array,
  usage: GPUBufferUsageFlags,
  mapped = true,
  int = false,
) {
  const gpuBuffer = device.createBuffer({
    mappedAtCreation: mapped,
    size: matrix.byteLength,
    usage: usage,
  })

  const arrayBuffer = gpuBuffer.getMappedRange()
  if (int) {
    new Uint32Array(arrayBuffer).set(matrix)
  } else {
    new Float32Array(arrayBuffer).set(matrix)
  }
  gpuBuffer.unmap()

  return gpuBuffer
}

export function destroyPipeline(gpuContext: GpuExecutionContext) {
  gpuContext.resultMatrixBuffers.forEach((b) => b.destroy())
  gpuContext.gpuReadBuffers.forEach((b) => b.destroy())
  gpuContext.paramsMatrixBuffer.destroy()
  gpuContext.relicsMatrixBuffer.destroy()
  gpuContext.precomputedStatsBuffer.destroy()
  gpuContext.relicSetSolutionsMatrixBuffer?.destroy()
  gpuContext.ornamentSetSolutionsMatrixBuffer?.destroy()

  gpuContext.compactCountBuffers.forEach((b) => b.destroy())
  gpuContext.compactResultsBuffers.forEach((b) => b.destroy())
  gpuContext.compactReadBuffers.forEach((b) => b.destroy())
}
