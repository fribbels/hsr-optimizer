import { expect, test } from '@playwright/test'

test('Experiment', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('chrome://version');

  // Inject WebGPU script into the page
  await page.evaluate(async () => {
    // Check for WebGPU support
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in this browser.');
    }

    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      console.log('WebGPU not supported');
      return;
    }

    const module = device.createShaderModule({
      label: 'doubling compute module',
      code: `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;

      @compute @workgroup_size(1) fn computeSomething(
        @builtin(global_invocation_id) id: vec3<u32>
      ) {
        let i = id.x;
        data[i] = data[i] * 2.0;
      }
    `,
    });

    const pipeline = device.createComputePipeline({
      label: 'doubling compute pipeline',
      layout: 'auto',
      compute: {
        module,
      },
    });

    const input = new Float32Array([1, 3, 5]);

    // create a buffer on the GPU to hold our computation
    // input and output
    const workBuffer = device.createBuffer({
      label: 'work buffer',
      size: input.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    // Copy our input data to that buffer
    device.queue.writeBuffer(workBuffer, 0, input);

    // create a buffer on the GPU to get a copy of the results
    const resultBuffer = device.createBuffer({
      label: 'result buffer',
      size: input.byteLength,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    // Setup a bindGroup to tell the shader which
    // buffer to use for the computation
    const bindGroup = device.createBindGroup({
      label: 'bindGroup for work buffer',
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: workBuffer } },
      ],
    });

    // Encode commands to do the computation
    const encoder = device.createCommandEncoder({
      label: 'doubling encoder',
    });
    const pass = encoder.beginComputePass({
      label: 'doubling compute pass',
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(input.length);
    pass.end();

    // Encode a command to copy the results to a mappable buffer.
    encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

    // Finish encoding and submit the commands
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    // Read the results
    await resultBuffer.mapAsync(GPUMapMode.READ);
    const result = new Float32Array(resultBuffer.getMappedRange().slice());
    resultBuffer.unmap();

    console.log('input', input);
    console.log('result', result);

    // Return the result
    return result[0];
  }).then(result => {
    // Validate the result
    console.log('Result', result)
    expect(result).toBe(2);
  });
});
