import { COMPUTE_ENGINE_GPU_EXPERIMENTAL, ComputeEngine } from 'lib/constants/constants'
import { debugWebgpuOutput } from 'lib/gpu/webgpuDebugger'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { destroyPipeline, generateExecutionPass, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { GpuExecutionContext, RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { renameFields } from 'lib/optimization/optimizer'
import { SortOption } from 'lib/optimization/sortOptions'
import { setSortColumn } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

window.WEBGPU_DEBUG = false

export async function gpuOptimize(props: {
  context: OptimizerContext
  request: Form
  relics: RelicsByPart
  permutations: number
  computeEngine: string
  relicSetSolutions: number[]
  ornamentSetSolutions: number[]
}) {
  const { context, request, relics, permutations, computeEngine, relicSetSolutions, ornamentSetSolutions } = props

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
  window.store.getState().setOptimizerRunningEngine(computeEngine as ComputeEngine)

  const gpuContext = initializeGpuPipeline(
    device,
    relics,
    request,
    context,
    permutations,
    computeEngine,
    relicSetSolutions,
    ornamentSetSolutions,
    window.WEBGPU_DEBUG,
  )

  if (gpuContext.DEBUG) {
    Message.warning('Debug mode is ON', 5)
  }

  console.log('Raw inputs', { context, request, relics, permutations })
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
  const relics: RelicsByPart = gpuContext.relics

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

  const optimizerContext = gpuContext.context
  const resultArray = gpuContext.resultsQueue.toArray().sort((a, b) => b.value - a.value)
  const outputs: OptimizerDisplayData[] = []
  for (let i = 0; i < resultArray.length; i++) {
    const index = resultArray[i].index

    const l = (index % lSize)
    const p = (((index - l) / lSize) % pSize)
    const f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    const { c } = calculateBuild(
      gpuContext.request,
      {
        Head: relics.Head[h],
        Hands: relics.Hands[g],
        Body: relics.Body[b],
        Feet: relics.Feet[f],
        PlanarSphere: relics.PlanarSphere[p],
        LinkRope: relics.LinkRope[l],
      },
      optimizerContext,
      true,
      true,
    )

    c.id = index
    const optimizerDisplayData = renameFields(c)
    outputs.push(optimizerDisplayData)
  }

  // console.log(outputs)

  const sortOption = SortOption[gpuContext.request.resultSort as keyof typeof SortOption]
  const gridSortColumn = gpuContext.request.statDisplay == 'combat' ? sortOption.combatGridColumn : sortOption.basicGridColumn
  setSortColumn(gridSortColumn)
  OptimizerTabController.setRows(outputs)
  window.optimizerGrid.current!.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource() })
}
