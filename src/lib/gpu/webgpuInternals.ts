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
  const WORKGROUP_SIZE = 256
  const BLOCK_SIZE = 65536
  const CYCLES_PER_INVOCATION = 512
  const RESULTS_LIMIT = request.resultsLimit ?? 1024
  const COMPACT_OVERFLOW_FACTOR = 4
  const COMPACT_LIMIT = RESULTS_LIMIT * COMPACT_OVERFLOW_FACTOR
  const DEBUG = debug

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
  if (DEBUG && !silent) {
  } else {
    // console.log(wgsl)
  }

  const computePipeline = generatePipeline(device, wgsl)

  const paramsMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * 7
  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * BLOCK_SIZE * CYCLES_PER_INVOCATION
  const resultMatrixBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: resultMatrixBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    device.createBuffer({ size: resultMatrixBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
  ]
  const paramsMatrixBuffer = device.createBuffer({
    size: paramsMatrixBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  })

  // console.log('Results buffer length: ', BLOCK_SIZE * CYCLES_PER_INVOCATION)

  const mergedRelics = mergeRelicsIntoArray(relics)

  const relicsMatrixBuffer = createGpuBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrixBuffer = createGpuBuffer(device, new Int32Array(relicSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const ornamentSetSolutionsMatrixBuffer = createGpuBuffer(device, new Int32Array(ornamentSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const precomputedStatsBuffer = createGpuBuffer(device, context.precomputedStatsData!, GPUBufferUsage.STORAGE)

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
      { binding: 1, resource: { buffer: ornamentSetSolutionsMatrixBuffer } },
      { binding: 2, resource: { buffer: relicSetSolutionsMatrixBuffer } },
      { binding: 3, resource: { buffer: precomputedStatsBuffer } },
    ],
  })

  // Atomic compaction buffers
  const compactResultsBufferSize = COMPACT_LIMIT * 2 * 4 // CompactEntry per entry = 8 bytes each

  const compactCountBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
  ]
  const compactResultsBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
  ]
  const compactCountReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]
  const compactResultsReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]

  const bindGroups2: [GPUBindGroup, GPUBindGroup] = [0, 1].map((i) => device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(2),
    entries: [
      { binding: 0, resource: { buffer: resultMatrixBuffers[i] } },
      { binding: 1, resource: { buffer: compactCountBuffers[i] } },
      { binding: 2, resource: { buffer: compactResultsBuffers[i] } },
    ],
  })) as [GPUBindGroup, GPUBindGroup]

  const gpuReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: resultMatrixBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: resultMatrixBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]

  // Timestamp query resources for GPU profiling (compute vs copy breakdown)
  const canTimestamp = device.features.has('timestamp-query')
  let querySet: GPUQuerySet | undefined
  let timestampResolveBuffer: GPUBuffer | undefined
  let timestampReadBuffer: GPUBuffer | undefined

  if (canTimestamp) {
    querySet = device.createQuerySet({
      type: 'timestamp',
      count: 2,
    })

    timestampResolveBuffer = device.createBuffer({
      size: 2 * 8, // 2 timestamps × 8 bytes (BigUint64)
      usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
    })

    timestampReadBuffer = device.createBuffer({
      size: 2 * 8,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    })
  }

  const iterations = Math.ceil(permutations / BLOCK_SIZE / CYCLES_PER_INVOCATION)
  const resultsQueue = new FixedSizePriorityQueue<GpuResult>(RESULTS_LIMIT, (a, b) => a.value - b.value)

  return {
    WORKGROUP_SIZE,
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
    startTime: 0,
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
    bindGroupLayouts: [],

    canTimestamp,
    querySet,
    timestampResolveBuffer,
    timestampReadBuffer,

    COMPACT_LIMIT,
    compactResultsBufferSize,
    compactCountBuffers,
    compactResultsBuffers,
    compactCountReadBuffers,
    compactResultsReadBuffers,
  }
}

export type ExecutionPassResult = {
  gpuReadBuffer: GPUBuffer,
  compactCountReadBuffer: GPUBuffer,
  compactResultsReadBuffer: GPUBuffer,
}

export function generateExecutionPass(gpuContext: GpuExecutionContext, offset: number, bufferIndex: number = 0): ExecutionPassResult {
  const newParamsMatrix = generateParamsMatrix(gpuContext.device, offset, gpuContext.relics, gpuContext)

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
  const compactCountReadBuffer = gpuContext.compactCountReadBuffers[bufferIndex]
  const compactResultsReadBuffer = gpuContext.compactResultsReadBuffers[bufferIndex]

  device.queue.writeBuffer(gpuContext.paramsMatrixBuffer, 0, newParamsMatrix)

  const commandEncoder = device.createCommandEncoder()

  // Clear the atomic counter to 0 before dispatch
  commandEncoder.clearBuffer(compactCountBuffer, 0, 4)

  // Add timestamp writes to the compute pass if supported
  const computePassDescriptor: GPUComputePassDescriptor = {}
  if (gpuContext.canTimestamp && gpuContext.querySet) {
    computePassDescriptor.timestampWrites = {
      querySet: gpuContext.querySet,
      beginningOfPassWriteIndex: 0,
      endOfPassWriteIndex: 1,
    }
  }

  const passEncoder = commandEncoder.beginComputePass(computePassDescriptor)
  passEncoder.setPipeline(computePipeline)
  passEncoder.setBindGroup(0, bindGroup0)
  passEncoder.setBindGroup(1, bindGroup1)
  passEncoder.setBindGroup(2, bindGroup2)
  passEncoder.dispatchWorkgroups(gpuContext.WORKGROUP_SIZE)
  passEncoder.end()

  // Resolve timestamp queries into the resolve buffer, then copy to CPU-readable buffer
  if (gpuContext.canTimestamp && gpuContext.querySet && gpuContext.timestampResolveBuffer && gpuContext.timestampReadBuffer) {
    commandEncoder.resolveQuerySet(gpuContext.querySet, 0, 2, gpuContext.timestampResolveBuffer, 0)
    commandEncoder.copyBufferToBuffer(gpuContext.timestampResolveBuffer, 0, gpuContext.timestampReadBuffer, 0, 2 * 8)
  }

  // Always copy compact count + compact results
  commandEncoder.copyBufferToBuffer(compactCountBuffer, 0, compactCountReadBuffer, 0, 4)
  commandEncoder.copyBufferToBuffer(compactResultsBuffer, 0, compactResultsReadBuffer, 0, gpuContext.compactResultsBufferSize)

  if (gpuContext.DEBUG) {
    // DEBUG mode: also copy the full results buffer (128MB)
    commandEncoder.copyBufferToBuffer(resultMatrixBuffer, 0, gpuReadBuffer, 0, resultMatrixBufferSize)
  }

  device.queue.submit([commandEncoder.finish()])

  return { gpuReadBuffer, compactCountReadBuffer, compactResultsReadBuffer }
}

export function generatePipeline(device: GPUDevice, wgsl: string) {
  const shaderModule = device.createShaderModule({
    code: wgsl,
  })

  // Use 'auto' layout so the pipeline matches the shader's actual bindings
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
    new Int32Array(arrayBuffer).set(matrix)
  } else {
    new Float32Array(arrayBuffer).set(matrix)
  }
  gpuBuffer.unmap()

  return gpuBuffer
}

export function destroyPipeline(gpuContext: GpuExecutionContext) {
  gpuContext.resultMatrixBuffers.forEach((b) => { b.unmap(); b.destroy() })

  gpuContext.relicsMatrixBuffer.unmap()
  gpuContext.relicsMatrixBuffer.destroy()

  gpuContext.relicSetSolutionsMatrixBuffer.unmap()
  gpuContext.relicSetSolutionsMatrixBuffer.destroy()

  gpuContext.ornamentSetSolutionsMatrixBuffer.unmap()
  gpuContext.ornamentSetSolutionsMatrixBuffer.destroy()

  gpuContext.precomputedStatsBuffer.unmap()
  gpuContext.precomputedStatsBuffer.destroy()

  // Compact buffers
  gpuContext.compactCountBuffers.forEach((b) => b.destroy())
  gpuContext.compactResultsBuffers.forEach((b) => b.destroy())
  gpuContext.compactCountReadBuffers.forEach((b) => b.destroy())
  gpuContext.compactResultsReadBuffers.forEach((b) => b.destroy())
}
