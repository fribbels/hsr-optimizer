import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'

export async function getDevice() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter()
  if (adapter == null) {
    return null
  }
  return await adapter.requestDevice()
}

export function generatePipeline(device: GPUDevice, request: Form, params: OptimizerParams) {
  const wgsl = generateWgsl(params, request)
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
