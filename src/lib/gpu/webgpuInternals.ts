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
  const DEBUG = debug

  const wgsl = generateWgsl(context, request, relics, {
    WORKGROUP_SIZE,
    BLOCK_SIZE,
    CYCLES_PER_INVOCATION,
    RESULTS_LIMIT,
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
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })
  const resultMatrixBufferB = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })
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

  // Atomic compaction buffers (non-DEBUG only)
  const COMPACT_LIMIT = RESULTS_LIMIT * 4
  const compactResultsBufferSize = COMPACT_LIMIT * 2 * 4 // vec2<u32> per entry = 8 bytes each

  const compactCountBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  })
  const compactCountBufferB = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  })
  const compactResultsBuffer = device.createBuffer({
    size: compactResultsBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })
  const compactResultsBufferB = device.createBuffer({
    size: compactResultsBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })

  // Staging buffers for compact CPU read
  const compactCountReadBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  const compactCountReadBufferB = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  const compactResultsReadBuffer = device.createBuffer({
    size: compactResultsBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  const compactResultsReadBufferB = device.createBuffer({
    size: compactResultsBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  // Bind group 2: results buffer + compact buffers (compact only in non-DEBUG)
  const group2Entries: GPUBindGroupEntry[] = [
    { binding: 0, resource: { buffer: resultMatrixBuffer } },
  ]
  const group2BEntries: GPUBindGroupEntry[] = [
    { binding: 0, resource: { buffer: resultMatrixBufferB } },
  ]
  if (!DEBUG) {
    group2Entries.push(
      { binding: 1, resource: { buffer: compactCountBuffer } },
      { binding: 2, resource: { buffer: compactResultsBuffer } },
    )
    group2BEntries.push(
      { binding: 1, resource: { buffer: compactCountBufferB } },
      { binding: 2, resource: { buffer: compactResultsBufferB } },
    )
  }

  const bindGroup2 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(2),
    entries: group2Entries,
  })

  const bindGroup2B = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(2),
    entries: group2BEntries,
  })

  const gpuReadBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const gpuReadBufferB = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

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
    bindGroup2,
    bindGroup2B,
    paramsMatrixBuffer,
    resultMatrixBuffer,
    resultMatrixBufferB,
    relicsMatrixBuffer,
    relicSetSolutionsMatrixBuffer,
    ornamentSetSolutionsMatrixBuffer,
    precomputedStatsBuffer,

    gpuReadBuffer,
    gpuReadBufferB,
    bindGroupLayouts: [],

    canTimestamp,
    querySet,
    timestampResolveBuffer,
    timestampReadBuffer,

    COMPACT_LIMIT,
    compactResultsBufferSize,
    compactCountBuffer,
    compactCountBufferB,
    compactResultsBuffer,
    compactResultsBufferB,
    compactCountReadBuffer,
    compactCountReadBufferB,
    compactResultsReadBuffer,
    compactResultsReadBufferB,
  }
}

export type ExecutionPassResult = {
  gpuReadBuffer: GPUBuffer
  compactCountReadBuffer: GPUBuffer
  compactResultsReadBuffer: GPUBuffer
}

export function generateExecutionPass(gpuContext: GpuExecutionContext, offset: number, bufferIndex: number = 0): ExecutionPassResult {
  const newParamsMatrix = generateParamsMatrix(gpuContext.device, offset, gpuContext.relics, gpuContext)

  const device = gpuContext.device
  const computePipeline = gpuContext.computePipeline
  const bindGroup0 = gpuContext.bindGroup0
  const bindGroup1 = gpuContext.bindGroup1
  const bindGroup2 = bufferIndex === 0 ? gpuContext.bindGroup2 : gpuContext.bindGroup2B
  const resultMatrixBufferSize = gpuContext.resultMatrixBufferSize
  const resultMatrixBuffer = bufferIndex === 0 ? gpuContext.resultMatrixBuffer : gpuContext.resultMatrixBufferB
  const gpuReadBuffer = bufferIndex === 0 ? gpuContext.gpuReadBuffer : gpuContext.gpuReadBufferB

  // Select compact buffers for this buffer index
  const compactCountBuffer = bufferIndex === 0 ? gpuContext.compactCountBuffer : gpuContext.compactCountBufferB
  const compactResultsBuffer = bufferIndex === 0 ? gpuContext.compactResultsBuffer : gpuContext.compactResultsBufferB
  const compactCountReadBuffer = bufferIndex === 0 ? gpuContext.compactCountReadBuffer : gpuContext.compactCountReadBufferB
  const compactResultsReadBuffer = bufferIndex === 0 ? gpuContext.compactResultsReadBuffer : gpuContext.compactResultsReadBufferB

  device.queue.writeBuffer(gpuContext.paramsMatrixBuffer, 0, newParamsMatrix)

  const commandEncoder = device.createCommandEncoder()

  // Clear the atomic counter to 0 before dispatch (non-DEBUG only)
  if (!gpuContext.DEBUG) {
    commandEncoder.clearBuffer(compactCountBuffer, 0, 4)
  }

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

  if (gpuContext.DEBUG) {
    // DEBUG mode: copy the full results buffer (128MB) for debugging
    commandEncoder.copyBufferToBuffer(
      resultMatrixBuffer,
      0,
      gpuReadBuffer,
      0,
      resultMatrixBufferSize,
    )
  } else {
    // Production mode: copy only the compact count (4 bytes) + compact results (~32KB max)
    commandEncoder.copyBufferToBuffer(compactCountBuffer, 0, compactCountReadBuffer, 0, 4)
    commandEncoder.copyBufferToBuffer(
      compactResultsBuffer, 0,
      compactResultsReadBuffer, 0,
      gpuContext.compactResultsBufferSize,
    )
  }

  device.queue.submit([commandEncoder.finish()])

  return { gpuReadBuffer, compactCountReadBuffer, compactResultsReadBuffer }
}

export function generatePipeline(device: GPUDevice, wgsl: string) {
  const shaderModule = device.createShaderModule({
    code: wgsl,
  })

  // Use 'auto' layout so the pipeline matches the shader's actual bindings
  // (group 2 has 1 binding in DEBUG mode, 3 bindings in production mode)
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
  gpuContext.resultMatrixBuffer.unmap()
  gpuContext.resultMatrixBuffer.destroy()

  gpuContext.resultMatrixBufferB.unmap()
  gpuContext.resultMatrixBufferB.destroy()

  gpuContext.relicsMatrixBuffer.unmap()
  gpuContext.relicsMatrixBuffer.destroy()

  gpuContext.relicSetSolutionsMatrixBuffer.unmap()
  gpuContext.relicSetSolutionsMatrixBuffer.destroy()

  gpuContext.ornamentSetSolutionsMatrixBuffer.unmap()
  gpuContext.ornamentSetSolutionsMatrixBuffer.destroy()

  gpuContext.precomputedStatsBuffer.unmap()
  gpuContext.precomputedStatsBuffer.destroy()

  // Compact buffers
  gpuContext.compactCountBuffer.destroy()
  gpuContext.compactCountBufferB.destroy()
  gpuContext.compactResultsBuffer.destroy()
  gpuContext.compactResultsBufferB.destroy()
  gpuContext.compactCountReadBuffer.destroy()
  gpuContext.compactCountReadBufferB.destroy()
  gpuContext.compactResultsReadBuffer.destroy()
  gpuContext.compactResultsReadBufferB.destroy()
}
