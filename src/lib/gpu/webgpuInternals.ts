import { COMPUTE_ENGINE_GPU_EXPERIMENTAL } from 'lib/constants/constants'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import { generateBaseParamsArray, generateParamsMatrix, mergeRelicsIntoArray } from 'lib/gpu/webgpuDataTransform'
import { GpuExecutionContext, GpuResult, RelicsByPart } from 'lib/gpu/webgpuTypes'
import postComputeShader from 'lib/gpu/wgsl/postComputeShader.wgsl?raw'
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

  const wgsl = generateWgsl(context, request, {
    WORKGROUP_SIZE,
    BLOCK_SIZE,
    CYCLES_PER_INVOCATION,
    RESULTS_LIMIT,
    DEBUG,
  })

  if (DEBUG && !silent) {
    console.log(wgsl)
  }

  const computePipeline = generatePipeline(device, wgsl)
  const postComputePipeline = generatePostComputePipeline(device)
  const baseParamsArray = generateBaseParamsArray(relics, context)

  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * BLOCK_SIZE * CYCLES_PER_INVOCATION
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })

  // console.log('Results buffer length: ', BLOCK_SIZE * CYCLES_PER_INVOCATION)

  const mergedRelics = mergeRelicsIntoArray(relics)

  const relicsMatrixBuffer = createGpuBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrixBuffer = createGpuBuffer(device, new Int32Array(relicSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const ornamentSetSolutionsMatrixBuffer = createGpuBuffer(device, new Int32Array(ornamentSetSolutions), GPUBufferUsage.STORAGE, true, true)

  const bindGroup1 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: relicsMatrixBuffer } },
      { binding: 1, resource: { buffer: ornamentSetSolutionsMatrixBuffer } },
      { binding: 2, resource: { buffer: relicSetSolutionsMatrixBuffer } },
    ],
  })

  const bindGroup2 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(2),
    entries: [
      { binding: 0, resource: { buffer: resultMatrixBuffer } },
    ],
  })

  const postComputeBindGroup0 = device.createBindGroup({
    layout: postComputePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: resultMatrixBuffer } },
    ],
  })

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

    resultMatrixBufferSize,
    permutations,
    iterations,
    startTime: 0,
    relics,
    resultsQueue,
    baseParamsArray,
    cancelled: false,
    computeEngine,

    device,
    computePipeline,
    postComputePipeline,
    bindGroup1,
    bindGroup2,
    postComputeBindGroup0,
    resultMatrixBuffer,
    relicsMatrixBuffer,
    relicSetSolutionsMatrixBuffer,
    ornamentSetSolutionsMatrixBuffer,
  }
}

export function generateExecutionPass(gpuContext: GpuExecutionContext, offset: number) {
  const newParamsMatrix = generateParamsMatrix(gpuContext.device, offset, gpuContext.relics, gpuContext.baseParamsArray, gpuContext)

  const device = gpuContext.device
  const computePipeline = gpuContext.computePipeline
  const postComputePipeline = gpuContext.postComputePipeline
  const bindGroup1 = gpuContext.bindGroup1
  const bindGroup2 = gpuContext.bindGroup2
  const postComputeBindGroup0 = gpuContext.postComputeBindGroup0
  const resultMatrixBufferSize = gpuContext.resultMatrixBufferSize
  const resultMatrixBuffer = gpuContext.resultMatrixBuffer

  const newBindGroup0 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: newParamsMatrix } },
    ],
  })

  const commandEncoder = device.createCommandEncoder()
  const passEncoder = commandEncoder.beginComputePass()
  passEncoder.setPipeline(computePipeline)
  passEncoder.setBindGroup(0, newBindGroup0)
  passEncoder.setBindGroup(1, bindGroup1)
  passEncoder.setBindGroup(2, bindGroup2)
  passEncoder.dispatchWorkgroups(gpuContext.WORKGROUP_SIZE)

  if (gpuContext.computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL) {
    passEncoder.setPipeline(postComputePipeline)
    passEncoder.setBindGroup(0, postComputeBindGroup0)
    passEncoder.dispatchWorkgroups(1)
  }

  passEncoder.end()

  const gpuReadBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  commandEncoder.copyBufferToBuffer(
    resultMatrixBuffer,
    0,
    gpuReadBuffer,
    0,
    resultMatrixBufferSize,
  )

  device.queue.submit([commandEncoder.finish()])

  if (!gpuContext.startTime) {
    gpuContext.startTime = new Date().getTime()
  }

  return gpuReadBuffer
}

export function generatePipeline(device: GPUDevice, wgsl: string) {
  const bindGroupLayouts = generateLayouts(device)
  const shaderModule = device.createShaderModule({
    code: wgsl,
  })

  // console.log(wgsl)

  return device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: bindGroupLayouts,
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })
}

export function generatePostComputePipeline(device: GPUDevice) {
  const bindGroupLayouts = [
    device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    }),
  ]
  const shaderModule = device.createShaderModule({
    code: postComputeShader,
  })

  return device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: bindGroupLayouts,
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })
}

function generateLayouts(device: GPUDevice) {
  return [
    device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      ],
    }),
    device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      ],
    }),
    device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    }),
  ]
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

  gpuContext.relicsMatrixBuffer.unmap()
  gpuContext.relicsMatrixBuffer.destroy()

  gpuContext.relicSetSolutionsMatrixBuffer.unmap()
  gpuContext.relicSetSolutionsMatrixBuffer.destroy()

  gpuContext.ornamentSetSolutionsMatrixBuffer.unmap()
  gpuContext.ornamentSetSolutionsMatrixBuffer.destroy()
}
