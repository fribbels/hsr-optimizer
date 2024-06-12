export async function runShader() {
  if (!navigator.gpu) {
    throw new Error('WebGPU is not supported on this browser.')
  }

  const adapter = await navigator.gpu.requestAdapter()
  const device = await adapter.requestDevice()

  const shaderCode = `
    [[block]] struct Data {
      result: f32;
    };
    [[group(0), binding(0)]] var<storage, read_write> data: Data;

    [[stage(compute), workgroup_size(1)]]
    fn main() {
      data.result = 1.0 + 1.0;
    }
  `

  const module = device.createShaderModule({
    code: shaderCode,
  })

  const pipeline = device.createComputePipeline({
    compute: {
      module: module,
      entryPoint: 'main',
    },
  })

  const data = new Float32Array([0])
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })

  new Float32Array(buffer.getMappedRange()).set(data)
  buffer.unmap()

  const bindGroupLayout = pipeline.getBindGroupLayout(0)
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: buffer,
        },
      },
    ],
  })

  const commandEncoder = device.createCommandEncoder()
  const passEncoder = commandEncoder.beginComputePass()
  passEncoder.setPipeline(pipeline)
  passEncoder.setBindGroup(0, bindGroup)
  passEncoder.dispatch(1)
  passEncoder.endPass()

  const gpuBuffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  commandEncoder.copyBufferToBuffer(buffer, 0, gpuBuffer, 0, data.byteLength)
  device.queue.submit([commandEncoder.finish()])

  await gpuBuffer.mapAsync(GPUMapMode.READ)
  const arrayBuffer = gpuBuffer.getMappedRange()
  const resultArray = new Float32Array(arrayBuffer)
  gpuBuffer.unmap()

  return Array.from(resultArray)
}
