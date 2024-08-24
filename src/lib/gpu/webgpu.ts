import { Constants, OrnamentSetToIndex, RelicSetToIndex, SetsRelicsNames, Stats } from '../constants.ts'
import { Relic } from 'types/Relic'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import { Utils } from 'lib/utils'

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
    const uncondensedStats = {}
    for (const condensedStat of relic.condensedStats) {
      uncondensedStats[condensedStat[0]] = condensedStat[1]
    }
    output[startIndex + j++] = uncondensedStats[Stats.HP_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.ATK_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.DEF_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.SPD_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.HP] || 0
    output[startIndex + j++] = uncondensedStats[Stats.ATK] || 0
    output[startIndex + j++] = uncondensedStats[Stats.DEF] || 0
    output[startIndex + j++] = uncondensedStats[Stats.SPD] || 0
    output[startIndex + j++] = uncondensedStats[Stats.CR] || 0
    output[startIndex + j++] = uncondensedStats[Stats.CD] || 0
    output[startIndex + j++] = uncondensedStats[Stats.EHR] || 0 // 10
    output[startIndex + j++] = uncondensedStats[Stats.RES] || 0
    output[startIndex + j++] = uncondensedStats[Stats.BE] || 0
    output[startIndex + j++] = uncondensedStats[Stats.ERR] || 0
    output[startIndex + j++] = uncondensedStats[Stats.OHB] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Physical_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Fire_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Ice_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Lightning_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Wind_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Quantum_DMG] || 0 // 20
    output[startIndex + j++] = uncondensedStats[Stats.Imaginary_DMG] || 0
    output[startIndex + j++] = relicSetToIndex(relic)
    output[startIndex + j++] = relic.weightScore // 23
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
  // return
  // ======================================== Init ========================================

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.error('Not supported')
    return
  }
  const device = await adapter.requestDevice()

  const wgsl = generateWgsl(params, request)

  console.log(wgsl)
  console.log('Webgpu device', device)
  console.log('Raw inputs', { params, request, relics, permutations, relicSetSolutions, ornamentSetSolutions })

  const shaderModule = device.createShaderModule({
    code: wgsl,
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

  const BLOCK_SIZE = Math.pow(2, 24)
  // const BLOCK_SIZE = Math.pow(2, 8)

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

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

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
  console.log('Transformed inputs', { paramsMatrix, relicsMatrix })

  const date1 = new Date()
  const iterations = Math.ceil(permutations / BLOCK_SIZE)

  const resultLimit = 100
  const queueResults = new FixedSizePriorityQueue(resultLimit, (a, b) => a.value - b.value)

  for (let i = 0; i < iterations; i++) {
    const offset = i * BLOCK_SIZE

    const l = (offset % lSize)
    const p = (((offset - l) / lSize) % pSize)
    const f = (((offset - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((offset - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((offset - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((offset - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    paramsArray[6] = l
    paramsArray[7] = p
    paramsArray[8] = f
    paramsArray[9] = b
    paramsArray[10] = g
    paramsArray[11] = h

    const newParamsMatrix = createBuffer(device, new Float32Array(paramsArray), GPUBufferUsage.STORAGE)

    const newBindGroup0 = device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: newParamsMatrix } },
        { binding: 1, resource: { buffer: relicsMatrix } },
        { binding: 2, resource: { buffer: resultMatrixBuffer } },
      ],
    })

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginComputePass()
    passEncoder.setPipeline(computePipeline)
    passEncoder.setBindGroup(0, newBindGroup0)
    passEncoder.setBindGroup(1, bindGroup1)
    passEncoder.dispatchWorkgroups(16, 16)
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
    let top = queueResults.top()

    for (let j = 0; j < BLOCK_SIZE; j++) {
      const permutationNumber = offset + j
      if (permutationNumber >= permutations) {
        break // ?
      }

      const value = array[j]
      if (value >= 0) {
        if (value <= top && queueResults.size() >= resultLimit) {
          continue
        }
        queueResults.fixedSizePush({
          index: permutationNumber,
          value: array[j],
        })
        top = queueResults.top().value
        // console.log(queueResults.top())
      }
    }

    const resultArray = queueResults.toArray().sort((a, b) => b.value - a.value)
    // console.log(resultArray)
    // console.log(array)

    printAsObject(arrayBuffer, BLOCK_SIZE, i, date1)
    const date2 = new Date()
    console.log(`iteration: ${i}, time: ${(date2 - date1) / 1000}s, perms completed: ${i * BLOCK_SIZE}, perms per sec: ${Math.floor(i * BLOCK_SIZE / ((date2 - date1) / 1000)).toLocaleString()}`)
  }

  // const resultArray = queueResults.toArray().sort((a, b) => b.value - a.value)
  // const outputs = []
  // for (let i = 0; i < resultArray.length; i++) {
  //   const index = resultArray[i].index
  //
  //   const l = (index % lSize)
  //   const p = (((index - l) / lSize) % pSize)
  //   const f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
  //   const b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
  //   const g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
  //   const h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)
  //
  //   const c = calculateBuild(request, {
  //     Head: relics.Head[h],
  //     Hands: relics.Hands[g],
  //     Body: relics.Body[b],
  //     Feet: relics.Feet[f],
  //     PlanarSphere: relics.PlanarSphere[p],
  //     LinkRope: relics.LinkRope[l],
  //   })
  //
  //   c.id = index
  //   renameFields(c)
  //   outputs.push(c)
  // }
  //
  // console.log(outputs)
  // window.store.getState().setPermutationsResults(queueResults.size())
  // window.store.getState().setOptimizationInProgress(false)
  // OptimizerTabController.setRows(outputs)
  // window.store.getState().setPermutationsSearched(Math.min(permutations, permutations))
  // window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}

function printAsObject(arrayBuffer: ArrayBuffer, BLOCK_SIZE: number, i: number, date1: Date) {
  const array = new Float32Array(arrayBuffer)
  console.log(array)

  const date2 = new Date()
  console.log(`iteration: ${i}, time: ${(date2 - date1) / 1000}s, perms completed: ${i * BLOCK_SIZE}, perms per sec: ${Math.floor(i * BLOCK_SIZE / ((date2 - date1) / 1000)).toLocaleString()}`)

  const currentPinned = window.optimizerGrid.current.api.getGridOption('pinnedTopRowData')

  const x = {
    ED: array[22],
    BASIC: array[69],
    SKILL: array[70],
    ULT: array[71],
    FUA: array[72],
    DOT: array[73],
    BREAK: array[74],
    COMBO: array[75],
    WEIGHT: 0,
    EHP: array[77],
    xHP: array[4],
    xATK: array[5],
    xDEF: array[6],
    xSPD: array[7],
    xCR: array[8],
    xCD: array[9],
    xEHR: array[10],
    xRES: array[11],
    xBE: array[12],
    xERR: array[13],
    xOHB: array[14],
    xELEMENTAL_DMG: array[22],
  }
  currentPinned[1] = x
  window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: currentPinned })

  let printed = false
  if (!printed) {
    printed = true

    function fixed(n) {
      return Utils.precisionRound(n, 5) || ''
    }

    console.log('HP_P', fixed(array[0]))
    console.log('ATK_P', fixed(array[1]))
    console.log('DEF_P', fixed(array[2]))
    console.log('SPD_P', fixed(array[3]))
    console.log('HP', fixed(array[4]))
    console.log('ATK', fixed(array[5]))
    console.log('DEF', fixed(array[6]))
    console.log('SPD', fixed(array[7]))
    console.log('CR', fixed(array[8]))
    console.log('CD', fixed(array[9]))
    console.log('EHR', fixed(array[10]))
    console.log('RES', fixed(array[11]))
    console.log('BE', fixed(array[12]))
    console.log('ERR', fixed(array[13]))
    console.log('OHB', fixed(array[14]))

    console.log('Physical_DMG', fixed(array[15]))
    console.log('Fire_DMG', fixed(array[16]))
    console.log('Ice_DMG', fixed(array[17]))
    console.log('Lightning_DMG', fixed(array[18]))
    console.log('Wind_DMG', fixed(array[19]))
    console.log('Quantum_DMG', fixed(array[20]))
    console.log('Imaginary_DMG', fixed(array[21]))
    console.log('ELEMENTAL_DMG', fixed(array[22]))
    console.log('BASIC_SCALING', fixed(array[23]))
    console.log('SKILL_SCALING', fixed(array[24]))
    console.log('ULT_SCALING', fixed(array[25]))
    console.log('FUA_SCALING', fixed(array[26]))
    console.log('DOT_SCALING', fixed(array[27]))
    console.log('BASIC_CR_BOOST', fixed(array[28]))
    console.log('SKILL_CR_BOOST', fixed(array[29]))
    console.log('ULT_CR_BOOST', fixed(array[30]))
    console.log('FUA_CR_BOOST', fixed(array[31]))
    console.log('BASIC_CD_BOOST', fixed(array[32]))
    console.log('SKILL_CD_BOOST', fixed(array[33]))
    console.log('ULT_CD_BOOST', fixed(array[34]))
    console.log('FUA_CD_BOOST', fixed(array[35]))
    console.log('BASIC_BOOST', fixed(array[36]))
    console.log('SKILL_BOOST', fixed(array[37]))
    console.log('ULT_BOOST', fixed(array[38]))
    console.log('FUA_BOOST', fixed(array[39]))
    console.log('DOT_BOOST', fixed(array[40]))
    console.log('VULNERABILITY', fixed(array[41]))
    console.log('BASIC_VULNERABILITY', fixed(array[42]))
    console.log('SKILL_VULNERABILITY', fixed(array[43]))
    console.log('ULT_VULNERABILITY', fixed(array[44]))
    console.log('FUA_VULNERABILITY', fixed(array[45]))
    console.log('DOT_VULNERABILITY', fixed(array[46]))

    console.log('BREAK_VULNERABILITY', fixed(array[47]))
    console.log('DEF_PEN', fixed(array[48]))
    console.log('BASIC_DEF_PEN', fixed(array[49]))
    console.log('SKILL_DEF_PEN', fixed(array[50]))
    console.log('ULT_DEF_PEN', fixed(array[51]))
    console.log('FUA_DEF_PEN', fixed(array[52]))
    console.log('DOT_DEF_PEN', fixed(array[53]))
    console.log('BREAK_DEF_PEN', fixed(array[54]))
    console.log('SUPER_BREAK_DEF_PEN', fixed(array[55]))
    console.log('RES_PEN', fixed(array[56]))
    console.log('PHYSICAL_RES_PEN', fixed(array[57]))
    console.log('FIRE_RES_PEN', fixed(array[58]))
    console.log('ICE_RES_PEN', fixed(array[59]))
    console.log('LIGHTNING_RES_PEN', fixed(array[60]))
    console.log('WIND_RES_PEN', fixed(array[61]))
    console.log('QUANTUM_RES_PEN', fixed(array[62]))
    console.log('IMAGINARY_RES_PEN', fixed(array[63]))
    console.log('BASIC_RES_PEN', fixed(array[64]))
    console.log('SKILL_RES_PEN', fixed(array[65]))
    console.log('ULT_RES_PEN', fixed(array[66]))
    console.log('FUA_RES_PEN', fixed(array[67]))
    console.log('DOT_RES_PEN', fixed(array[68]))
    console.log('BASIC_DMG', fixed(array[69]))
    console.log('SKILL_DMG', fixed(array[70]))
    console.log('ULT_DMG', fixed(array[71]))
    console.log('FUA_DMG', fixed(array[72]))
    console.log('DOT_DMG', fixed(array[73]))
    console.log('BREAK_DMG', fixed(array[74]))
    console.log('COMBO_DMG', fixed(array[75]))
    console.log('DMG_RED_MULTI', fixed(array[76]))
    console.log('EHP', fixed(array[77]))

    console.log('DOT_CHANCE', fixed(array[78]))
    console.log('EFFECT_RES_PEN', fixed(array[79]))
    console.log('DOT_SPLIT', fixed(array[80]))
    console.log('DOT_STACKS', fixed(array[81]))
    console.log('ENEMY_WEAKNESS_BROKEN', fixed(array[82]))
    console.log('SUPER_BREAK_MODIFIER', fixed(array[83]))
    console.log('SUPER_BREAK_HMC_MODIFIER', fixed(array[84]))
    console.log('BASIC_TOUGHNESS_DMG', fixed(array[85]))
    console.log('SKILL_TOUGHNESS_DMG', fixed(array[86]))
    console.log('ULT_TOUGHNESS_DMG', fixed(array[87]))
    console.log('FUA_TOUGHNESS_DMG', fixed(array[88]))
    console.log('BASIC_ORIGINAL_DMG_BOOST', fixed(array[89]))
    console.log('SKILL_ORIGINAL_DMG_BOOST', fixed(array[90]))
    console.log('ULT_ORIGINAL_DMG_BOOST', fixed(array[91]))
    console.log('BASIC_BREAK_DMG_MODIFIER', fixed(array[92]))
    console.log('ULT_CD_OVERRIDE', fixed(array[93]))
    console.log('ULT_BOOSTS_MULTI', fixed(array[94]))
    console.log('RATIO_BASED_HP_BUFF', fixed(array[95]))
    console.log('RATIO_BASED_HP_P_BUFF', fixed(array[96]))
    console.log('RATIO_BASED_ATK_BUFF', fixed(array[97]))
    console.log('RATIO_BASED_ATK_P_BUFF', fixed(array[98]))
    console.log('RATIO_BASED_DEF_BUFF', fixed(array[99]))
    console.log('RATIO_BASED_DEF_P_BUFF', fixed(array[100]))
    console.log('BREAK_EFFICIENCY_BOOST', fixed(array[101]))
    console.log('BASIC_BREAK_EFFICIENCY_BOOST', fixed(array[102]))
    console.log('ULT_BREAK_EFFICIENCY_BOOST', fixed(array[103]))
    console.log('BASIC_DMG_TYPE', fixed(array[104]))
    console.log('SKILL_DMG_TYPE', fixed(array[105]))
    console.log('ULT_DMG_TYPE', fixed(array[106]))
    console.log('FUA_DMG_TYPE', fixed(array[107]))
    console.log('DOT_DMG_TYPE', fixed(array[108]))
    console.log('BREAK_DMG_TYPE', fixed(array[109]))
    console.log('SUPER_BREAK_DMG_TYPE', fixed(array[110]))
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
