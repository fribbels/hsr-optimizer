import shader from './shader.wgsl?raw'
import { OrnamentSetToIndex, RelicSetToIndex, SetsRelicsNames, Stats, StatsToIndex } from '../constants.ts'

function relicSetToIndex(relic) {
  if (SetsRelicsNames.includes(relic.set)) {
    return RelicSetToIndex[relic.set]
  }
  return OrnamentSetToIndex[relic.set]
}

// set weight main aug
const RELIC_ARG_SIZE = 26
function convertRelicsToArray(relics) {
  const output = []
  for (let i = 0; i < relics.length; i++) {
    const relic = relics[i]
    const startIndex = RELIC_ARG_SIZE * i

    output[startIndex] = relicSetToIndex(relic)
    output[startIndex + 1] = relic.weightScore
    output[startIndex + 2] = relic.augmentedStats[Stats.HP_P]
    output[startIndex + 3] = relic.augmentedStats[Stats.ATK_P]
    output[startIndex + 4] = relic.augmentedStats[Stats.DEF_P]
    output[startIndex + 5] = relic.augmentedStats[Stats.SPD_P]
    output[startIndex + 6] = relic.augmentedStats[Stats.HP]
    output[startIndex + 7] = relic.augmentedStats[Stats.ATK]
    output[startIndex + 8] = relic.augmentedStats[Stats.DEF]
    output[startIndex + 9] = relic.augmentedStats[Stats.SPD]
    output[startIndex + 10] = relic.augmentedStats[Stats.CR]
    output[startIndex + 11] = relic.augmentedStats[Stats.CD]
    output[startIndex + 12] = relic.augmentedStats[Stats.EHR]
    output[startIndex + 13] = relic.augmentedStats[Stats.RES]
    output[startIndex + 14] = relic.augmentedStats[Stats.BE]
    output[startIndex + 15] = relic.augmentedStats[Stats.ERR]
    output[startIndex + 16] = relic.augmentedStats[Stats.OHB]
    output[startIndex + 17] = relic.augmentedStats[Stats.Physical_DMG]
    output[startIndex + 18] = relic.augmentedStats[Stats.Fire_DMG]
    output[startIndex + 19] = relic.augmentedStats[Stats.Ice_DMG]
    output[startIndex + 20] = relic.augmentedStats[Stats.Lightning_DMG]
    output[startIndex + 21] = relic.augmentedStats[Stats.Wind_DMG]
    output[startIndex + 22] = relic.augmentedStats[Stats.Quantum_DMG]
    output[startIndex + 23] = relic.augmentedStats[Stats.Imaginary_DMG]
    output[startIndex + 24] = StatsToIndex[relic.augmentedStats.mainStat]
    output[startIndex + 25] = relic.augmentedStats.mainValue
  }

  return output
}

function createBuffer(device, matrix, usage, mapped = true) {
  const gpuBuffer = device.createBuffer({
    mappedAtCreation: mapped,
    size: matrix.byteLength,
    usage: usage,
  })

  const arrayBuffer = gpuBuffer.getMappedRange()
  new Float32Array(arrayBuffer).set(matrix)
  gpuBuffer.unmap()

  return gpuBuffer
}
export async function experiment({ params, request, relics, permutations, relicSetSolutions, ornamentSetSolutions }) {
  // ======================================== Init ========================================

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.error('Not supported')
    return
  }
  const device = await adapter.requestDevice()

  console.log('Webgpu device', device)
  console.log('Raw inputs', { params, request, relics, permutations, relicSetSolutions, ornamentSetSolutions })

  const shaderModule = device.createShaderModule({
    code: shader,
  })
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    ],
  })
  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })

  const BLOCK_SIZE = Math.pow(2, 20) // 1048576 * 4

  // ======================================== Input ========================================

  const paramsArray = [1, 1, 1, 1]

  const resultMatrixBufferSize = Int32Array.BYTES_PER_ELEMENT * BLOCK_SIZE
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })

  const headRelicsMatrix = createBuffer(device, new Float32Array(convertRelicsToArray(relics.Head)), GPUBufferUsage.STORAGE)
  const handsRelicsMatrix = createBuffer(device, new Float32Array(convertRelicsToArray(relics.Hands)), GPUBufferUsage.STORAGE)
  const bodyRelicsMatrix = createBuffer(device, new Float32Array(convertRelicsToArray(relics.Body)), GPUBufferUsage.STORAGE)
  const feetRelicsMatrix = createBuffer(device, new Float32Array(convertRelicsToArray(relics.Feet)), GPUBufferUsage.STORAGE)
  const planarSphereRelicsMatrix = createBuffer(device, new Float32Array(convertRelicsToArray(relics.PlanarSphere)), GPUBufferUsage.STORAGE)
  const linkRopeRelicsMatrix = createBuffer(device, new Float32Array(convertRelicsToArray(relics.LinkRope)), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrix = createBuffer(device, new Int32Array(relicSetSolutions), GPUBufferUsage.STORAGE)
  const ornamentSetSolutionsMatrix = createBuffer(device, new Int32Array(ornamentSetSolutions), GPUBufferUsage.STORAGE)
  const paramsMatrix = createBuffer(device, new Int32Array(paramsArray), GPUBufferUsage.STORAGE)

  const bindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: headRelicsMatrix } },
      { binding: 1, resource: { buffer: handsRelicsMatrix } },
      { binding: 2, resource: { buffer: bodyRelicsMatrix } },
      { binding: 3, resource: { buffer: feetRelicsMatrix } },
      { binding: 4, resource: { buffer: planarSphereRelicsMatrix } },
      { binding: 5, resource: { buffer: linkRopeRelicsMatrix } },
      // { binding: 6, resource: { buffer: relicSetSolutionsMatrix } },
      // { binding: 7, resource: { buffer: ornamentSetSolutionsMatrix } },
      { binding: 6, resource: { buffer: paramsMatrix } },
      { binding: 7, resource: { buffer: resultMatrixBuffer } },
    ],
  })

  console.log('Transformed inputs', { headRelicsMatrix, handsRelicsMatrix, bodyRelicsMatrix, feetRelicsMatrix, planarSphereRelicsMatrix, linkRopeRelicsMatrix })

  // const loop = (t) => {
  const commandEncoder = device.createCommandEncoder()
  const passEncoder = commandEncoder.beginComputePass()
  passEncoder.setPipeline(computePipeline)
  passEncoder.setBindGroup(0, bindGroup)
  passEncoder.dispatchWorkgroups(2048, 2048)
  passEncoder.end()

  const gpuReadBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  // Encode commands for copying buffer to buffer.
  commandEncoder.copyBufferToBuffer(
    resultMatrixBuffer /* source buffer */,
    0 /* source offset */,
    gpuReadBuffer /* destination buffer */,
    0 /* destination offset */,
    resultMatrixBufferSize, /* size */
  )

  device.queue.submit([commandEncoder.finish()])

  // Read buffer.
  await gpuReadBuffer.mapAsync(GPUMapMode.READ)
  const arrayBuffer = gpuReadBuffer.getMappedRange()
  console.log(new Int32Array(arrayBuffer))

  // await Promise.all([
  //   headRelicsMatrix.mapAsync(GPUMapMode.READ),
  //   handsRelicsMatrix.mapAsync(GPUMapMode.READ),
  //   bodyRelicsMatrix.mapAsync(GPUMapMode.READ),
  //   feetRelicsMatrix.mapAsync(GPUMapMode.READ),
  //   planarSphereRelicsMatrix.mapAsync(GPUMapMode.READ),
  //   linkRopeRelicsMatrix.mapAsync(GPUMapMode.READ),
  //   // relicSetSolutionsMatrix.mapAsync(GPUMapMode.READ),
  //   // ornamentSetSolutionsMatrix.mapAsync(GPUMapMode.READ),
  //   paramsMatrix.mapAsync(GPUMapMode.READ),
  //   resultMatrixBuffer.mapAsync(GPUMapMode.READ),
  // ])

  // }
  //
  // for (let i = 0; i < permutations / BLOCK_SIZE + 1; i++) {
  //   let index = BLOCK_SIZE * i
  // }
  //
  // const firstMatrix = new Float32Array([
  //   2 /* rows */, 4 /* columns */,
  //   1, 2, 3, 4,
  //   5, 6, 7, 8,
  // ])
  //
  // const gpuBufferFirstMatrix = device.createBuffer({
  //   mappedAtCreation: true,
  //   size: firstMatrix.byteLength,
  //   usage: GPUBufferUsage.STORAGE,
  // })
  // const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange()
  // new Float32Array(arrayBufferFirstMatrix).set(firstMatrix)
  // gpuBufferFirstMatrix.unmap()
  //
  // const secondMatrix = new Float32Array([
  //   4 /* rows */, 2 /* columns */,
  //   1, 2,
  //   3, 4,
  //   5, 6,
  //   7, 8,
  // ])
  // const gpuBufferSecondMatrix = device.createBuffer({
  //   mappedAtCreation: true,
  //   size: secondMatrix.byteLength,
  //   usage: GPUBufferUsage.STORAGE,
  // })
  // const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange()
  // new Float32Array(arrayBufferSecondMatrix).set(secondMatrix)
  // gpuBufferSecondMatrix.unmap()
  //
  // const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * BLOCK_SIZE
  // const resultMatrixBuffer = device.createBuffer({
  //   size: resultMatrixBufferSize,
  //   usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  // })
  //
  // // ======================================== Pipeline ========================================
  //
  // const commandEncoder = device.createCommandEncoder()
  // const passEncoder = commandEncoder.beginComputePass()
  // passEncoder.setPipeline(computePipeline)
  // passEncoder.setBindGroup(0, bindGroup)
  // const workgroupCountX = Math.ceil(1)
  // const workgroupCountY = Math.ceil(1)
  // passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY)
  // passEncoder.end()
  //
  // // Get a GPU buffer for reading in an unmapped state.
  // const gpuReadBuffer = device.createBuffer({
  //   size: resultMatrixBufferSize,
  //   usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  // })
  //
  // // Encode commands for copying buffer to buffer.
  // commandEncoder.copyBufferToBuffer(
  //   resultMatrixBuffer /* source buffer */,
  //   0 /* source offset */,
  //   gpuReadBuffer /* destination buffer */,
  //   0 /* destination offset */,
  //   resultMatrixBufferSize, /* size */
  // )
  //
  // // Submit GPU commands.
  // const gpuCommands = commandEncoder.finish()
  // device.queue.submit([gpuCommands])
  //
  // // ======================================== Output ========================================
  //
  // // Read buffer.
  // await gpuReadBuffer.mapAsync(GPUMapMode.READ)
  // const arrayBuffer = gpuReadBuffer.getMappedRange()
  // console.log('Result', new Float32Array(arrayBuffer))
  // End
}
