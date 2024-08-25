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
