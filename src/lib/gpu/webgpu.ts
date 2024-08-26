import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { getDevice, initializeGpuExecutionContext } from 'lib/gpu/webgpuInternals'
import { RelicsByPart } from 'lib/gpu/webgpuDataTransform'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { renameFields } from 'lib/optimizer/optimizer'
import { debugWebgpuOutput } from 'lib/gpu/webgpuDebugger'

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

  const gpuContext = initializeGpuExecutionContext(
    device,
    relics,
    request,
    params,
    permutations,
    relicSetSolutions,
    ornamentSetSolutions,
  )

  for (let i = 0; i < gpuContext.iterations; i++) {
    const offset = i * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginComputePass()
    passEncoder.setPipeline(computePipeline)
    passEncoder.setBindGroup(0, newBindGroup0)
    passEncoder.setBindGroup(1, bindGroup1)
    passEncoder.setBindGroup(2, bindGroup2)
    passEncoder.dispatchWorkgroups(gpuContext.WORKGROUP_SIZE, 1, 1)
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

    // eslint-disable-next-line
    async function readBuffer() {
      const arrayBuffer = gpuReadBuffer.getMappedRange()
      const array = new Float32Array(arrayBuffer)
      let top = queueResults.top()
      for (let j = 0; j < gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION; j++) {
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

      window.store.getState().setPermutationsResults(queueResults.size())
      window.store.getState().setPermutationsSearched(Math.min(permutations, offset))

      if (gpuContext.DEBUG) {
        debugWebgpuOutput(arrayBuffer, gpuContext.BLOCK_SIZE, i, date1)
      }

      gpuReadBuffer.unmap()
      gpuReadBuffer.destroy()
    }

    // Does the last iteration get read before results are executed?
    void readBuffer()

    // const resultArray = queueResults.toArray().sort((a, b) => b.value - a.value)
    // console.log(resultArray)
    // console.log(array)

    const date2 = new Date()
    console.log(`iteration: ${i}, time: ${(date2 - date1) / 1000}s, perms completed: ${i * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION}, perms per sec: ${Math.floor(i * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION / ((date2 - date1) / 1000)).toLocaleString()}`)
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

  resultMatrixBuffer.unmap()
  resultMatrixBuffer.destroy()

  relicsMatrix.unmap()
  relicsMatrix.destroy()

  relicSetSolutionsMatrix.unmap()
  relicSetSolutionsMatrix.destroy()

  ornamentSetSolutionsMatrix.unmap()
  ornamentSetSolutionsMatrix.destroy()

  console.log(outputs)
  window.store.getState().setPermutationsResults(queueResults.size())
  window.store.getState().setOptimizationInProgress(false)
  OptimizerTabController.setRows(outputs)
  window.store.getState().setPermutationsSearched(Math.min(permutations, permutations))
  window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}
