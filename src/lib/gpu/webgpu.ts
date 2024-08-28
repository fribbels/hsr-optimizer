import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { destroyPipeline, generateExecutionPass, getDevice, GpuExecutionContext, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { RelicsByPart } from 'lib/gpu/webgpuDataTransform'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { renameFields } from 'lib/optimizer/optimizer'
import { debugWebgpuOutput, logIterationTimer } from 'lib/gpu/webgpuDebugger'
import { SortOption } from 'lib/optimizer/sortOptions'
import { setSortColumn } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { Message } from 'lib/message'

export async function gpuOptimize(props: {
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

  device.onuncapturederror = (event) => {
    if (window.store.getState().optimizationInProgress == true) {
      window.store.getState().setOptimizationInProgress(false)
      Message.error('The GPU acceleration process has crashed - results may be invalid. Please report a bug to the Discord server', 15)
    }
  }

  window.store.getState().setOptimizerStartTime(new Date())

  const gpuContext = initializeGpuPipeline(
    device,
    relics,
    request,
    params,
    permutations,
    relicSetSolutions,
    ornamentSetSolutions,
  )

  if (gpuContext.DEBUG) {
    Message.warning('Debug mode is ON', 5)
  }

  console.log('Raw inputs', { params, request, relics, permutations, relicSetSolutions, ornamentSetSolutions })
  // console.log('GPU execution context', gpuContext)

  for (let iteration = 0; iteration < gpuContext.iterations; iteration++) {
    const offset = iteration * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
    const gpuReadBuffer = generateExecutionPass(gpuContext, offset)
    await gpuReadBuffer.mapAsync(GPUMapMode.READ)

    void readBuffer(offset, gpuReadBuffer, gpuContext)

    logIterationTimer(iteration, gpuContext)

    if (window.store.getState().optimizationInProgress == false) {
      gpuContext.cancelled = true
      break
    }
  }

  outputResults(gpuContext)
  destroyPipeline(gpuContext)
}

// Does the last iteration get read before results are executed?
// eslint-disable-next-line
async function readBuffer(offset: number, gpuReadBuffer: GPUBuffer, gpuContext: GpuExecutionContext) {
  const arrayBuffer = gpuReadBuffer.getMappedRange()
  const resultsQueue = gpuContext.resultsQueue
  const array = new Float32Array(arrayBuffer)
  let top = resultsQueue.top()?.value ?? 0

  for (let j = 0; j < gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION; j++) {
    const permutationNumber = offset + j
    if (permutationNumber >= gpuContext.permutations) {
      break // ?
    }

    const value = array[j]
    if (value >= 0) {
      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
        continue
      }
      resultsQueue.fixedSizePush({
        index: permutationNumber,
        value: array[j],
      })
      top = resultsQueue.top()!.value
    }
  }

  window.store.getState().setPermutationsResults(resultsQueue.size())
  window.store.getState().setPermutationsSearched(Math.min(gpuContext.permutations, offset))

  if (gpuContext.DEBUG) {
    debugWebgpuOutput(gpuContext, arrayBuffer)
  }

  gpuReadBuffer.unmap()
  gpuReadBuffer.destroy()
}

function outputResults(gpuContext: GpuExecutionContext) {
  const relics = gpuContext.relics

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  const resultArray = gpuContext.resultsQueue.toArray().sort((a, b) => b.value - a.value)
  const outputs: any[] = []
  for (let i = 0; i < resultArray.length; i++) {
    const index = resultArray[i].index

    const l = (index % lSize)
    const p = (((index - l) / lSize) % pSize)
    const f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    const c = calculateBuild(gpuContext.request, {
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

  const sortOption = SortOption[gpuContext.request.resultSort]
  const gridSortColumn = gpuContext.request.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)
  OptimizerTabController.setRows(outputs)
  window.optimizerGrid.current!.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })

  window.store.getState().setPermutationsResults(gpuContext.resultsQueue.size())
  window.store.getState().setOptimizationInProgress(false)
  window.store.getState().setOptimizerStartTime(null)

  if (!gpuContext.cancelled) {
    window.store.getState().setPermutationsSearched(gpuContext.permutations)
  }
}
