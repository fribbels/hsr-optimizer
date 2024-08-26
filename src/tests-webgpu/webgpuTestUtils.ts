import { Page } from '@playwright/test'

async function setupPage(page: Page) {
  page.on('console', (msg) => console.log(msg.text()))
  await page.goto('chrome://gpu')
}

export async function executeWgsl(page: Page, wgsl: string) {
  await setupPage(page)

  // Inject WebGPU script into the page
  const results = await page.evaluate(async (wgsl) => {
    // Check for WebGPU support
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    if (!device) {
      throw new Error('WebGPU is not supported in this browser.')
    }

    const module = device.createShaderModule({
      code: wgsl,
    })

    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module,
      },
    })

    const input = new Float32Array([0, 0, 0])
    console.log('Input:', input)

    // create a buffer on the GPU to hold our computation
    // input and output
    const workBuffer = device.createBuffer({
      size: input.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    })
    // Copy our input data to that buffer
    device.queue.writeBuffer(workBuffer, 0, input)

    // create a buffer on the GPU to get a copy of the results
    const resultBuffer = device.createBuffer({
      size: input.byteLength,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    })

    // Setup a bindGroup to tell the wgsl which
    // buffer to use for the computation
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: workBuffer } },
      ],
    })

    // Encode commands to do the computation
    const encoder = device.createCommandEncoder({})
    const pass = encoder.beginComputePass({})
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.dispatchWorkgroups(input.length)
    pass.end()

    // Encode a command to copy the results to a mappable buffer.
    encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size)

    // Finish encoding and submit the commands
    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])

    // Read the results
    await resultBuffer.mapAsync(GPUMapMode.READ)
    const results = new Float32Array(resultBuffer.getMappedRange().slice())
    resultBuffer.unmap()

    return Array.from(results)
  }, wgsl)

  console.log(wgsl)
  console.log('Results', results)
  return results
}

export async function executeSimpleWgsl(page: Page, setup: string, execute: string) {
  return await executeWgsl(page, `

@group(0) @binding(0) var<storage, read_write> results: array<f32>;

@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    ${execute}
}

${setup}
  `)
}

// export async function executeGpuTest(
//   page: Page,
//   relics: RelicsByPart,
//   request: Form,
//   params: OptimizerParams,
//   permutations: number,
//   relicSetSolutions: number[],
//   ornamentSetSolutions: number[],
// ) {
//   console.log('execute')
// }
