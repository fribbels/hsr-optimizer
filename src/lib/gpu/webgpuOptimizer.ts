import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Form } from 'types/Form'
import { destroyPipeline, generateExecutionPass, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { renameFields } from 'lib/optimizer/optimizer'
import { debugWebgpuOutput } from 'lib/gpu/webgpuDebugger'
import { SortOption } from 'lib/optimizer/sortOptions'
import { setSortColumn } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { Message } from 'lib/message'
import { COMPUTE_ENGINE_GPU_EXPERIMENTAL } from 'lib/constants'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { GpuExecutionContext, RelicsByPart } from 'lib/gpu/webgpuTypes'

export async function gpuOptimize(props: {
  params: OptimizerParams
  request: Form
  relics: RelicsByPart
  permutations: number
  computeEngine: string
  relicSetSolutions: number[]
  ornamentSetSolutions: number[]
}) {
  const { params, request, relics, permutations, computeEngine, relicSetSolutions, ornamentSetSolutions } = props

  const device = await getWebgpuDevice()
  if (device == null) {
    console.error('Not supported')
    return
  }

  device.onuncapturederror = (event) => {
    if (window.store.getState().optimizationInProgress) {
      window.store.getState().setOptimizationInProgress(false)
      Message.error('The GPU acceleration process has crashed - results may be invalid. Please try again or report a bug to the Discord server', 20)
    }
  }

  window.store.getState().setOptimizerStartTime(Date.now())

  const gpuContext = initializeGpuPipeline(
    device,
    relics,
    request,
    params,
    permutations,
    computeEngine,
    relicSetSolutions,
    ornamentSetSolutions,
  )

  if (gpuContext.DEBUG) {
    Message.warning('Debug mode is ON', 5)
  }

  console.log('Raw inputs', { params, request, relics, permutations })
  // console.log('GPU execution context', gpuContext)

  for (let iteration = 0; iteration < gpuContext.iterations; iteration++) {
    const offset = iteration * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
    const maxPermNumber = offset + gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
    const gpuReadBuffer = generateExecutionPass(gpuContext, offset)

    if (computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL) {
      await gpuReadBuffer.mapAsync(GPUMapMode.READ, 0, 4)
      const firstElement = new Float32Array(gpuReadBuffer.getMappedRange(0, 4))[0]
      gpuReadBuffer.unmap()

      if (firstElement == -2304) {
        // Skip
      } else if (firstElement <= -2048) {
        const workgroupsSkipped = -(firstElement + 2048)
        const elementOffset = workgroupsSkipped * 512 * 256

        await readBuffer(offset, gpuReadBuffer, gpuContext, elementOffset)
      } else {
        await readBuffer(offset, gpuReadBuffer, gpuContext)
      }
    } else {
      await readBuffer(offset, gpuReadBuffer, gpuContext)
    }

    window.store.getState().setOptimizerEndTime(Date.now())
    window.store.getState().setPermutationsResults(gpuContext.resultsQueue.size())
    window.store.getState().setPermutationsSearched(Math.min(gpuContext.permutations, maxPermNumber))

    // logIterationTimer(iteration, gpuContext)

    gpuReadBuffer.unmap()
    gpuReadBuffer.destroy()

    if (gpuContext.permutations <= maxPermNumber || !window.store.getState().optimizationInProgress) {
      gpuContext.cancelled = true
      break
    }
  }

  outputResults(gpuContext)
  destroyPipeline(gpuContext)
}

// eslint-disable-next-line
async function readBuffer(offset: number, gpuReadBuffer: GPUBuffer, gpuContext: GpuExecutionContext, elementOffset: number = 0) {
  await gpuReadBuffer.mapAsync(GPUMapMode.READ, elementOffset)

  const arrayBuffer = gpuReadBuffer.getMappedRange(elementOffset * 4)
  const array = new Float32Array(arrayBuffer)

  const resultsQueue = gpuContext.resultsQueue
  let top = resultsQueue.top()?.value ?? 0

  let limit = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION - elementOffset
  const maxPermNumber = offset + gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION - elementOffset
  const diff = gpuContext.permutations - maxPermNumber
  if (diff < 0) {
    limit += diff
  }

  const indexOffset = offset + elementOffset
  if (resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
    for (let j = limit - 1; j >= 0; j--) {
      const value = array[j]
      if (value < 0) {
        j += value + 1
        continue
      }
      if (value <= top) continue

      top = resultsQueue.fixedSizePushOvercapped({
        index: indexOffset + j,
        value: value,
      }).value
    }
  } else {
    for (let j = limit - 1; j >= 0; j--) {
      const value = array[j]
      if (value < 0) {
        j += value + 1
        continue
      }

      if (value <= top && resultsQueue.size() >= gpuContext.RESULTS_LIMIT) {
        continue
      }

      resultsQueue.fixedSizePush({
        index: indexOffset + j,
        value: value,
      })
      top = resultsQueue.top()!.value
    }
  }

  if (gpuContext.DEBUG) {
    debugWebgpuOutput(gpuContext, arrayBuffer)
  }
}

function outputResults(gpuContext: GpuExecutionContext) {
  const relics = gpuContext.relics

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  if (!gpuContext.cancelled) {
    window.store.getState().setPermutationsSearched(gpuContext.permutations)
  }
  window.store.getState().setOptimizationInProgress(false)
  window.store.getState().setPermutationsResults(gpuContext.resultsQueue.size())

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

    const cachedParams = gpuContext.params
    const c = calculateBuild(
      gpuContext.request,
      {
        Head: relics.Head[h],
        Hands: relics.Hands[g],
        Body: relics.Body[b],
        Feet: relics.Feet[f],
        PlanarSphere: relics.PlanarSphere[p],
        LinkRope: relics.LinkRope[l],
      },
      cachedParams,
      true,
    )

    c.id = index
    renameFields(c)
    outputs.push(c)
  }

  // console.log(outputs)

  const sortOption = SortOption[gpuContext.request.resultSort!]
  const gridSortColumn = gpuContext.request.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)
  OptimizerTabController.setRows(outputs)
  window.optimizerGrid.current!.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}
