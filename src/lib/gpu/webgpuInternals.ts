import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import { generateBaseParamsArray, generateParamsMatrix, mergeRelicsIntoArray, RelicsByPart } from 'lib/gpu/webgpuDataTransform'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'

export async function getDevice() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter()
  if (adapter == null) {
    return null
  }
  return await adapter.requestDevice()
}

export function generatePipeline(device: GPUDevice, wgsl: string) {
  const bindGroupLayouts = generateLayouts(device)
  const shaderModule = device.createShaderModule({
    code: wgsl,
  })

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: bindGroupLayouts,
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })

  console.log(wgsl)

  return computePipeline
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

export type GpuResult = {
  index: number
  value: number
}

export type GpuExecutionContext = {
  // Injected constant settings
  WORKGROUP_SIZE: number
  BLOCK_SIZE: number
  CYCLES_PER_INVOCATION: number
  DEBUG: boolean

  // Cached execution data
  resultLimit: number
  iterations: number
  startTime: number
  relics: RelicsByPart
  queueResults: FixedSizePriorityQueue<GpuResult>
  baseParamsArray: number[]

  // Webgpu internal objects
  computePipeline: GPUComputePipeline
  bindGroup1: GPUBindGroup
  bindGroup2: GPUBindGroup
}

export function initializeGpuExecutionContext(
  device: GPUDevice,
  relics: RelicsByPart,
  request: Form,
  params: OptimizerParams,
  permutations: number,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
): GpuExecutionContext {
  const gpuContext = {
    WORKGROUP_SIZE: 256, // MAX 256
    BLOCK_SIZE: 65536, // MAX 65536
    CYCLES_PER_INVOCATION: 128, // MAX 512
    DEBUG: false,
    relics: relics,
    resultLimit: 100,
  } as GpuExecutionContext

  const wgsl = generateWgsl(params, request, gpuContext)
  gpuContext.computePipeline = generatePipeline(device, wgsl)
  gpuContext.baseParamsArray = generateBaseParamsArray(relics, params)

  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })

  const mergedRelics = mergeRelicsIntoArray(relics)

  const relicsMatrix = createGpuBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrix = createGpuBuffer(device, new Int32Array(relicSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const ornamentSetSolutionsMatrix = createGpuBuffer(device, new Int32Array(ornamentSetSolutions), GPUBufferUsage.STORAGE, true, true)

  gpuContext.bindGroup1 = device.createBindGroup({
    layout: gpuContext.computePipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: relicsMatrix } },
      { binding: 1, resource: { buffer: ornamentSetSolutionsMatrix } },
      { binding: 2, resource: { buffer: relicSetSolutionsMatrix } },
    ],
  })

  gpuContext.bindGroup2 = device.createBindGroup({
    layout: gpuContext.computePipeline.getBindGroupLayout(2),
    entries: [
      { binding: 0, resource: { buffer: resultMatrixBuffer } },
    ],
  })

  console.log('Transformed inputs', { paramsArray: gpuContext.baseParamsArray, mergedRelics, relicSetSolutions })
  console.log('Transformed inputs', { relicsMatrix })

  gpuContext.startTime = new Date().getTime()
  gpuContext.iterations = Math.ceil(permutations / gpuContext.BLOCK_SIZE / gpuContext.CYCLES_PER_INVOCATION)
  gpuContext.queueResults = new FixedSizePriorityQueue(gpuContext.resultLimit, (a, b) => a.value - b.value)

  return gpuContext
}

export function updateIterationParams(gpuContext: GpuExecutionContext, offset: number) {
  const newParamsMatrix = generateParamsMatrix(gpuContext.device, offset, gpuContext.relics, paramsArray)

  const newBindGroup0 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: newParamsMatrix } },
    ],
  })
}
