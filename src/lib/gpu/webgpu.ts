import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { createGpuBuffer, generatePipeline, getDevice } from 'lib/gpu/webgpuInternals'
import { generateBaseParamsArray, generateParamsMatrix, mergeRelicsIntoArray, RelicsByPart } from 'lib/gpu/webgpuDataTransform'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { renameFields } from 'lib/optimizer/optimizer'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'

export type GpuParams = {
  WORKGROUP_SIZE: number
  BLOCK_SIZE: number
  CYCLES_PER_INVOCATION: number
  DEBUG: boolean
}

export async function experiment(props: {
  params: OptimizerParams
  request: Form
  relics: RelicsByPart
  permutations: number
  relicSetSolutions: number[]
  ornamentSetSolutions: number[]
}) {
  const { params, request, relics, permutations, relicSetSolutions, ornamentSetSolutions } = props

  const device = await getDevice()
  if (device == null) {
    console.error('Not supported')
    return
  }

  console.log('Webgpu device', device)
  console.log('Raw inputs', { params, request, relics, permutations, relicSetSolutions, ornamentSetSolutions })

  const resultLimit = 100
  const gpuParams: GpuParams = {
    WORKGROUP_SIZE: 256, // MAX 256
    BLOCK_SIZE: 65536, // MAX 65536
    CYCLES_PER_INVOCATION: 512, // MAX 512
    DEBUG: false,
  }

  const wgsl = generateWgsl(params, request, gpuParams)
  const computePipeline = generatePipeline(device, wgsl)
  const paramsArray: number[] = generateBaseParamsArray(relics, params)

  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * gpuParams.BLOCK_SIZE * gpuParams.CYCLES_PER_INVOCATION
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  })

  const mergedRelics = mergeRelicsIntoArray(relics)

  const relicsMatrix = createGpuBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrix = createGpuBuffer(device, new Int32Array(relicSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const ornamentSetSolutionsMatrix = createGpuBuffer(device, new Int32Array(ornamentSetSolutions), GPUBufferUsage.STORAGE, true, true)
  const paramsMatrix = createGpuBuffer(device, new Float32Array(paramsArray), GPUBufferUsage.STORAGE)

  const bindGroup1 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: relicsMatrix } },
      { binding: 1, resource: { buffer: ornamentSetSolutionsMatrix } },
      { binding: 2, resource: { buffer: relicSetSolutionsMatrix } },
    ],
  })

  const bindGroup2 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(2),
    entries: [
      { binding: 0, resource: { buffer: resultMatrixBuffer } },
    ],
  })

  console.log('Transformed inputs', { paramsArray, mergedRelics, relicSetSolutions })
  console.log('Transformed inputs', { paramsMatrix, relicsMatrix })

  const date1 = new Date()
  const iterations = Math.ceil(permutations / gpuParams.BLOCK_SIZE / gpuParams.CYCLES_PER_INVOCATION)

  const queueResults = new FixedSizePriorityQueue(resultLimit, (a, b) => a.value - b.value)

  for (let i = 0; i < iterations; i++) {
    const offset = i * gpuParams.BLOCK_SIZE * gpuParams.CYCLES_PER_INVOCATION

    const newParamsMatrix = generateParamsMatrix(device, offset, relics, paramsArray)

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
    passEncoder.dispatchWorkgroups(gpuParams.WORKGROUP_SIZE, 1, 1)
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
    for (let j = 0; j < gpuParams.BLOCK_SIZE * gpuParams.CYCLES_PER_INVOCATION; j++) {
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
    gpuReadBuffer.unmap()
    gpuReadBuffer.destroy()

    // const resultArray = queueResults.toArray().sort((a, b) => b.value - a.value)
    // console.log(resultArray)
    // console.log(array)

    const date2 = new Date()
    console.log(`iteration: ${i}, time: ${(date2 - date1) / 1000}s, perms completed: ${i * gpuParams.BLOCK_SIZE * gpuParams.CYCLES_PER_INVOCATION}, perms per sec: ${Math.floor(i * gpuParams.BLOCK_SIZE * gpuParams.CYCLES_PER_INVOCATION / ((date2 - date1) / 1000)).toLocaleString()}`)

    // debugWebgpuOutput(arrayBuffer, BLOCK_SIZE, i, date1)
  }

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  const resultArray = queueResults.toArray().sort((a, b) => b.value - a.value)
  const outputs = []
  for (let i = 0; i < resultArray.length; i++) {
    const index = resultArray[i].index

    const l = (index % lSize)
    const p = (((index - l) / lSize) % pSize)
    const f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    const c = calculateBuild(request, {
      Head: relics.Head[h],
      Hands: relics.Hands[g],
      Body: relics.Body[b],
      Feet: relics.Feet[f],
      PlanarSphere: relics.PlanarSphere[p],
      LinkRope: relics.LinkRope[l],
    })

    c.id = index
    renameFields(c)
    outputs.push(c)
  }

  console.log(outputs)
  window.store.getState().setPermutationsResults(queueResults.size())
  window.store.getState().setOptimizationInProgress(false)
  OptimizerTabController.setRows(outputs)
  window.store.getState().setPermutationsSearched(Math.min(permutations, permutations))
  window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}
