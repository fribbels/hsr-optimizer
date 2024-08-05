import shader from 'lib/gpu/shader.wgsl?raw'
import { Constants, OrnamentSetToIndex, RelicSetToIndex, SetsRelicsNames, Stats } from '../constants.ts'
import { Relic } from 'types/Relic'
import { RelicAugmenter } from 'lib/relicAugmenter'

export const StatsToIndex = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 1,
  [Stats.DEF_P]: 2,
  [Stats.SPD_P]: 3,
  [Stats.HP]: 4,
  [Stats.ATK]: 5,
  [Stats.DEF]: 6,
  [Stats.SPD]: 7,
  [Stats.CR]: 8,
  [Stats.CD]: 9,
  [Stats.EHR]: 10,
  [Stats.RES]: 11,
  [Stats.BE]: 12,
  [Stats.ERR]: 13,
  [Stats.OHB]: 14,
  [Stats.Physical_DMG]: 15,
  [Stats.Fire_DMG]: 16,
  [Stats.Ice_DMG]: 17,
  [Stats.Lightning_DMG]: 18,
  [Stats.Wind_DMG]: 19,
  [Stats.Quantum_DMG]: 20,
  [Stats.Imaginary_DMG]: 21,
}

/*
== Notes ==
We might have to limit filter values to 2 decimals bc float32 of 25.032 comes out to 25.03199..
Faster to export boolean from gpu and reconvert to object?
 */
function relicSetToIndex(relic: Relic) {
  if (SetsRelicsNames.includes(relic.set)) {
    return RelicSetToIndex[relic.set]
  }
  return OrnamentSetToIndex[relic.set]
}

// set weight main aug
const RELIC_ARG_SIZE = 24
function convertRelicsToArray(relics: Relic[]) {
  const output: number[] = []
  for (let i = 0; i < relics.length; i++) {
    const relic = relics[i]
    const startIndex = RELIC_ARG_SIZE * i
    let j = 0
    RelicAugmenter.augment(relic)
    output[startIndex + j++] = relic.augmentedStats[Stats.HP_P]
    output[startIndex + j++] = relic.augmentedStats[Stats.ATK_P]
    output[startIndex + j++] = relic.augmentedStats[Stats.DEF_P]
    output[startIndex + j++] = relic.augmentedStats[Stats.SPD_P]
    output[startIndex + j++] = relic.augmentedStats[Stats.HP]
    output[startIndex + j++] = relic.augmentedStats[Stats.ATK]
    output[startIndex + j++] = relic.augmentedStats[Stats.DEF]
    output[startIndex + j++] = relic.augmentedStats[Stats.SPD]
    output[startIndex + j++] = relic.augmentedStats[Stats.CR]
    output[startIndex + j++] = relic.augmentedStats[Stats.CD]
    output[startIndex + j++] = relic.augmentedStats[Stats.EHR] // 10
    output[startIndex + j++] = relic.augmentedStats[Stats.RES]
    output[startIndex + j++] = relic.augmentedStats[Stats.BE]
    output[startIndex + j++] = relic.augmentedStats[Stats.ERR]
    output[startIndex + j++] = relic.augmentedStats[Stats.OHB]
    output[startIndex + j++] = relic.augmentedStats[Stats.Physical_DMG]
    output[startIndex + j++] = relic.augmentedStats[Stats.Fire_DMG]
    output[startIndex + j++] = relic.augmentedStats[Stats.Ice_DMG]
    output[startIndex + j++] = relic.augmentedStats[Stats.Lightning_DMG]
    output[startIndex + j++] = relic.augmentedStats[Stats.Wind_DMG]
    output[startIndex + j++] = relic.augmentedStats[Stats.Quantum_DMG] // 20
    output[startIndex + j++] = relic.augmentedStats[Stats.Imaginary_DMG]
    output[startIndex + j++] = relicSetToIndex(relic)
    output[startIndex + j++] = relic.weightScore // 23

    output[startIndex + StatsToIndex[relic.augmentedStats.mainStat]] += relic.augmentedStats.mainValue
  }

  return output
}

function createBuffer(device, matrix, usage, mapped = true, int = false) {
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
  const bindGroupLayout0 = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    ],
  })
  const bindGroupLayout1 = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      // { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    ],
  })
  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout0, bindGroupLayout1],
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })

  const BLOCK_SIZE = Math.pow(2, 24) // 1048576 * 4

  // ======================================== Input ========================================

  const paramsArray = [
    relics.LinkRope.length,
    relics.PlanarSphere.length,
    relics.Feet.length,
    relics.Body.length,
    relics.Hands.length,
    relics.Head.length,
    0,
    0,
    0,
    0,
    0,
    0,
    Object.keys(Constants.SetsRelics).length,
    Object.keys(Constants.SetsOrnaments).length, // 13
  ]

  for (const stat of Object.values(Constants.Stats)) {
    paramsArray[14 + StatsToIndex[stat]] = params.character.base[stat]
  }
  for (const stat of Object.values(Constants.Stats)) {
    paramsArray[36 + StatsToIndex[stat]] = params.character.lightCone[stat]
  }
  for (const stat of Object.values(Constants.Stats)) {
    paramsArray[58 + StatsToIndex[stat]] = params.character.traces[stat]
  }

  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * BLOCK_SIZE
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })

  const mergedRelics = convertRelicsToArray([
    ...relics.Head,
    ...relics.Hands,
    ...relics.Body,
    ...relics.Feet,
    ...relics.PlanarSphere,
    ...relics.LinkRope,
  ])

  const relicsMatrix = createBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  // const relicSetSolutionsMatrix = createBuffer(device, new Int32Array(relicSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const ornamentSetSolutionsMatrix = createBuffer(device, new Int32Array(ornamentSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const paramsMatrix = createBuffer(device, new Float32Array(paramsArray), GPUBufferUsage.STORAGE)

  const bindGroup0 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: paramsMatrix } },
      { binding: 1, resource: { buffer: relicsMatrix } },
      { binding: 2, resource: { buffer: resultMatrixBuffer } },
    ],
  })

  const bindGroup1 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: ornamentSetSolutionsMatrix } },
      // { binding: 1, resource: { buffer: relicSetSolutionsMatrix } },
    ],
  })

  console.log('Transformed inputs', { paramsArray, mergedRelics, relicSetSolutions })
  // console.log('Transformed inputs', { paramsMatrix, relicsMatrix, relicSetSolutionsMatrix })

  const date1 = new Date()
  const iterations = 25

  let printed = false
  for (let i = 0; i < iterations; i++) {
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginComputePass()
    passEncoder.setPipeline(computePipeline)
    passEncoder.setBindGroup(0, bindGroup0)
    passEncoder.setBindGroup(1, bindGroup1)
    passEncoder.dispatchWorkgroups(256, 256)
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

    const array = new Float32Array(arrayBuffer)
    console.log(array)

    const date2 = new Date()
    console.log(`iteration: ${i}, time: ${(date2 - date1) / 1000}s, perms completed: ${i * BLOCK_SIZE}, perms per sec: ${Math.floor(i * BLOCK_SIZE / ((date2 - date1) / 1000)).toLocaleString()}`)

    if (!printed) {
      printed = true

      console.log('HP_P', array[0])
      console.log('ATK_P', array[1])
      console.log('DEF_P', array[2])
      console.log('SPD_P', array[3])
      console.log('HP', array[4])
      console.log('ATK', array[5])
      console.log('DEF', array[6])
      console.log('SPD', array[7])
      console.log('CR', array[8])
      console.log('CD', array[9])
      console.log('EHR', array[10])
      console.log('RES', array[11])
      console.log('BE', array[12])
      console.log('ERR', array[13])
      console.log('OHB', array[14])
      console.log('Physical_DMG', array[15])
      console.log('Fire_DMG', array[16])
      console.log('Ice_DMG', array[17])
      console.log('Lightning_DMG', array[18])
      console.log('Wind_DMG', array[19])
      console.log('Quantum_DMG', array[20])
      console.log('Imaginary_DMG', array[21])
      console.log('ELEMENTAL_DMG', array[22])
      console.log('BASIC_SCALING', array[23])
      console.log('SKILL_SCALING', array[24])
      console.log('ULT_SCALING', array[25])
      console.log('FUA_SCALING', array[26])
      console.log('DOT_SCALING', array[27])
      console.log('BASIC_CR_BOOST', array[28])
      console.log('SKILL_CR_BOOST', array[29])
      console.log('ULT_CR_BOOST', array[30])
      console.log('FUA_CR_BOOST', array[31])
      console.log('BASIC_CD_BOOST', array[32])
      console.log('SKILL_CD_BOOST', array[33])
      console.log('ULT_CD_BOOST', array[34])
      console.log('FUA_CD_BOOST', array[35])
      console.log('BASIC_BOOST', array[36])
      console.log('SKILL_BOOST', array[37])
      console.log('ULT_BOOST', array[38])
      console.log('FUA_BOOST', array[39])
      console.log('DOT_BOOST', array[40])
      console.log('DMG_TAKEN_MULTI', array[41])
      console.log('BASIC_VULNERABILITY', array[42])
      console.log('SKILL_VULNERABILITY', array[43])
      console.log('ULT_VULNERABILITY', array[44])
      console.log('FUA_VULNERABILITY', array[45])
      console.log('DOT_VULNERABILITY', array[46])
      console.log('DEF_SHRED', array[47])
      console.log('BASIC_DEF_PEN', array[48])
      console.log('SKILL_DEF_PEN', array[49])
      console.log('ULT_DEF_PEN', array[50])
      console.log('FUA_DEF_PEN', array[51])
      console.log('DOT_DEF_PEN', array[52])
      console.log('RES_PEN', array[53])
      console.log('PHYSICAL_RES_PEN', array[54])
      console.log('FIRE_RES_PEN', array[55])
      console.log('ICE_RES_PEN', array[56])
      console.log('LIGHTNING_RES_PEN', array[57])
      console.log('WIND_RES_PEN', array[58])
      console.log('QUANTUM_RES_PEN', array[59])
      console.log('IMAGINARY_RES_PEN', array[60])
      console.log('BASIC_RES_PEN', array[61])
      console.log('SKILL_RES_PEN', array[62])
      console.log('ULT_RES_PEN', array[63])
      console.log('FUA_RES_PEN', array[64])
      console.log('DOT_RES_PEN', array[65])
      console.log('BASIC_DMG', array[66])
      console.log('SKILL_DMG', array[67])
      console.log('ULT_DMG', array[68])
      console.log('FUA_DMG', array[69])
      console.log('DOT_DMG', array[70])
      console.log('DMG_RED_MULTI', array[71])
      console.log('ORIGINAL_DMG_BOOST', array[72])
      console.log('EHP', array[73])
    }
  }

  // --------------------
  /*
  Results:
  no sets: 35,091,362
  with sets: 32,373,297
  with print: 32,147,103
  without set compare: 34,431,567
  without writing to results: 350,040,966
  no logic: 362,572,447
  16x16x256x256: 354,751,043
  with output: 294,493,685
   */
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
  // --------------------
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
