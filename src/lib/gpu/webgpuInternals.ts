import { COMPUTE_ENGINE_GPU_EXPERIMENTAL } from 'lib/constants/constants'
import { FixedSizeNumericMinQueue } from 'lib/dataStructures/fixedSizeMinQueue'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import {
  buildWorkgroupAssignments,
  computeTupleParams,
  type FullSizes,
  generateParamsMatrix,
  mergeRelicsIntoArray,
  serializeAssignments,
  type WorkgroupEntry,
} from 'lib/gpu/webgpuDataTransform'
import { uniformCompatible } from 'lib/gpu/webgpuDevice'
import {
  type GpuExecutionContext,
  type RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import {
  bitpackBooleanArray,
  buildPerSlotSetRanges,
  enumerateValidQuadsD4,
} from 'lib/optimization/relicSetSolver'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  type SetsOrnaments,
  type SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { type Form } from 'types/form'
import { type OptimizerContext } from 'types/optimizer'
import { type Relic } from 'types/relic'

export async function initializeGpuPipeline(
  device: GPUDevice,
  relics: RelicsByPart,
  request: Form,
  context: OptimizerContext,
  permutations: number,
  computeEngine: string,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
  debug = false,
  silent = false,
): Promise<GpuExecutionContext> {
  const DEBUG = debug

  // Threads per workgroup
  const WORKGROUP_SIZE = 256

  // Permutations each thread evaluates per dispatch
  const CYCLES_PER_INVOCATION = 256

  // Workgroups dispatched per pass — scaled to ensure enough iterations for UI responsiveness
  const TARGET_ITERATIONS = 4
  const MIN_WORKGROUPS = 64
  const MAX_WORKGROUPS = computeEngine === COMPUTE_ENGINE_GPU_EXPERIMENTAL
    ? Math.min(2048, device.limits.maxComputeWorkgroupsPerDimension)
    : 512
  const neededWorkgroups = 2 ** Math.floor(Math.log2(permutations / WORKGROUP_SIZE / CYCLES_PER_INVOCATION / TARGET_ITERATIONS))
  const NUM_WORKGROUPS = Math.max(MIN_WORKGROUPS, Math.min(MAX_WORKGROUPS, neededWorkgroups))

  // Total threads per dispatch
  const BLOCK_SIZE = WORKGROUP_SIZE * NUM_WORKGROUPS

  // Top-N results to keep
  const RESULTS_LIMIT = request.resultsLimit ?? 1024

  const hasRelicFilter = (request.relicSets?.length ?? 0) > 0
  const TUPLE_MODE = hasRelicFilter && !DEBUG

  // Tuple mode has near-100% pass rate — needs larger compact buffer to avoid overflow revisits
  const COMPACT_OVERFLOW_FACTOR = TUPLE_MODE ? 64 : 4

  // Max compact entries per dispatch before overflow triggers revisit
  const COMPACT_LIMIT = RESULTS_LIMIT * COMPACT_OVERFLOW_FACTOR

  const wgsl = generateWgsl(context, request, relics, {
    WORKGROUP_SIZE,
    BLOCK_SIZE,
    CYCLES_PER_INVOCATION,
    RESULTS_LIMIT,
    COMPACT_LIMIT,
    DEBUG,
    TUPLE_MODE,
  })

  const computePipeline = await generatePipeline(device, wgsl)

  // Params buffer: 16 bytes for tuple mode (threshold + batchOffset + padding), 32 bytes for naive (8 floats)
  const paramsMatrixBufferSize = TUPLE_MODE ? 16 : Float32Array.BYTES_PER_ELEMENT * 8
  const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * BLOCK_SIZE * CYCLES_PER_INVOCATION
  // Only DEBUG mode needs the full results buffer
  const resultBufferSize = DEBUG ? resultMatrixBufferSize : 4
  const resultMatrixBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
  ]
  const paramsMatrixBuffer = device.createBuffer({
    size: paramsMatrixBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  })

  const hasOrnamentFilter = (request.ornamentSets?.length ?? 0) > 0

  // Sorts relics in-place by set — required for contiguous set ranges in tuple dispatch.
  // Mutates the caller's arrays; outputResults reads from the same sorted references.
  if (TUPLE_MODE) {
    const byRelicSet = (a: Relic, b: Relic) => RelicSetToIndex[a.set as SetsRelics] - RelicSetToIndex[b.set as SetsRelics]
    const byOrnamentSet = (a: Relic, b: Relic) => OrnamentSetToIndex[a.set as SetsOrnaments] - OrnamentSetToIndex[b.set as SetsOrnaments]

    relics.Head.sort(byRelicSet)
    relics.Hands.sort(byRelicSet)
    relics.Body.sort(byRelicSet)
    relics.Feet.sort(byRelicSet)
    relics.PlanarSphere.sort(byOrnamentSet)
    relics.LinkRope.sort(byOrnamentSet)
  }

  // Build tuple assignments for set-filtered dispatch
  let assignmentBuffer: GPUBuffer | null = null
  let assignments: WorkgroupEntry[] = []

  if (TUPLE_MODE) {
    const ranges = buildPerSlotSetRanges(relics)
    const quads = enumerateValidQuadsD4(relicSetSolutions, ranges)
    const fullSizes: FullSizes = {
      pSize: relics.PlanarSphere.length,
      lSize: relics.LinkRope.length,
    }
    const wgCapacity = WORKGROUP_SIZE * CYCLES_PER_INVOCATION
    const tupleParams = quads.map((q) => computeTupleParams(q, ranges))
    assignments = buildWorkgroupAssignments(tupleParams, fullSizes, wgCapacity)
    const serialized = serializeAssignments(assignments)

    assignmentBuffer = device.createBuffer({
      mappedAtCreation: true,
      size: serialized.byteLength,
      usage: GPUBufferUsage.STORAGE,
    })
    new Uint32Array(assignmentBuffer.getMappedRange()).set(new Uint32Array(serialized))
    assignmentBuffer.unmap()
  }

  const mergedRelics = mergeRelicsIntoArray(relics)

  const relicsMatrixBuffer = createGpuBuffer(device, new Float32Array(mergedRelics), GPUBufferUsage.STORAGE)
  const relicSetSolutionsMatrixBuffer = hasRelicFilter
    ? createGpuBuffer(device, new Int32Array(bitpackBooleanArray(relicSetSolutions)), GPUBufferUsage.STORAGE, true, true)
    : null
  const ornamentSetSolutionsMatrixBuffer = hasOrnamentFilter
    ? createGpuBuffer(device, new Int32Array(bitpackBooleanArray(ornamentSetSolutions)), GPUBufferUsage.STORAGE, true, true)
    : null
  const precomputedStatsBuffer = createGpuBuffer(device, context.precomputedStatsData!, uniformCompatible() ? GPUBufferUsage.UNIFORM : GPUBufferUsage.STORAGE)

  const bindGroup0Entries: GPUBindGroupEntry[] = [
    { binding: 0, resource: { buffer: paramsMatrixBuffer } },
  ]
  if (TUPLE_MODE && assignmentBuffer) {
    bindGroup0Entries.push({ binding: 1, resource: { buffer: assignmentBuffer } })
  }
  const bindGroup0 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: bindGroup0Entries,
  })

  const bindGroup1 = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(1),
    entries: [
      { binding: 0, resource: { buffer: relicsMatrixBuffer } },
      ...ornamentSetSolutionsMatrixBuffer ? [{ binding: 1, resource: { buffer: ornamentSetSolutionsMatrixBuffer } }] : [],
      ...relicSetSolutionsMatrixBuffer ? [{ binding: 2, resource: { buffer: relicSetSolutionsMatrixBuffer } }] : [],
      { binding: 3, resource: { buffer: precomputedStatsBuffer } },
    ],
  })

  // Atomic compaction buffers
  const COMPACT_ENTRY_BYTES = 8 // CompactEntry: u32 index (4B) + f32 value (4B)
  const compactResultsBufferSize = COMPACT_LIMIT * COMPACT_ENTRY_BYTES

  const compactCountBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
  ]
  const validCountBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
    device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST }),
  ]
  const compactResultsBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    device.createBuffer({ size: compactResultsBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
  ]

  // Merged read buffer: [compactCount(4B) | CompactEntry[](N*8B) | validCount(4B)]
  const compactReadBufferSize = 4 + compactResultsBufferSize + 4
  const compactReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: compactReadBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: compactReadBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]

  const bindGroups2: [GPUBindGroup, GPUBindGroup] = [0, 1].map((i) =>
    device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(2),
      entries: (
        DEBUG
          ? [
            { binding: 0, resource: { buffer: resultMatrixBuffers[i] } },
          ]
          : [
            { binding: 1, resource: { buffer: compactCountBuffers[i] } },
            { binding: 2, resource: { buffer: compactResultsBuffers[i] } },
            { binding: 3, resource: { buffer: validCountBuffers[i] } },
          ]
      ),
    })
  ) as [GPUBindGroup, GPUBindGroup]

  const gpuReadBuffers: [GPUBuffer, GPUBuffer] = [
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
    device.createBuffer({ size: resultBufferSize, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ }),
  ]

  const iterations = Math.ceil(permutations / BLOCK_SIZE / CYCLES_PER_INVOCATION)
  const resultsQueue = new FixedSizeNumericMinQueue(RESULTS_LIMIT)

  return {
    WORKGROUP_SIZE,
    NUM_WORKGROUPS,
    BLOCK_SIZE,
    CYCLES_PER_INVOCATION,
    RESULTS_LIMIT,
    DEBUG,

    request,
    context,

    paramsMatrixBufferSize,
    resultMatrixBufferSize,
    permutations,
    iterations,
    relics,
    resultsQueue,
    cancelled: false,
    computeEngine,

    device,
    computePipeline,
    bindGroup0,
    bindGroup1,
    bindGroups2,
    paramsMatrixBuffer,
    resultMatrixBuffers,
    relicsMatrixBuffer,
    relicSetSolutionsMatrixBuffer,
    ornamentSetSolutionsMatrixBuffer,
    precomputedStatsBuffer,

    gpuReadBuffers,

    TUPLE_MODE,
    assignmentBuffer,
    assignments,

    COMPACT_LIMIT,
    compactResultsBufferSize,
    compactReadBufferSize,
    compactCountBuffers,
    compactResultsBuffers,
    compactReadBuffers,
    validCountBuffers,
  }
}

export type ExecutionPassResult = {
  gpuReadBuffer: GPUBuffer,
  compactReadBuffer: GPUBuffer,
}

export function submitGpuDispatch(gpuContext: GpuExecutionContext, paramsData: ArrayBuffer, workgroupCount: number, bufferIndex: number): void {
  const device = gpuContext.device
  device.queue.writeBuffer(gpuContext.paramsMatrixBuffer, 0, paramsData)

  const compactCountBuffer = gpuContext.compactCountBuffers[bufferIndex]
  const compactResultsBuffer = gpuContext.compactResultsBuffers[bufferIndex]
  const compactReadBuffer = gpuContext.compactReadBuffers[bufferIndex]
  const validCountBuffer = gpuContext.validCountBuffers[bufferIndex]

  const commandEncoder = device.createCommandEncoder()

  if (!gpuContext.DEBUG) {
    commandEncoder.clearBuffer(compactCountBuffer, 0, 4)
    commandEncoder.clearBuffer(validCountBuffer, 0, 4)
  }

  const passEncoder = commandEncoder.beginComputePass()
  passEncoder.setPipeline(gpuContext.computePipeline)
  passEncoder.setBindGroup(0, gpuContext.bindGroup0)
  passEncoder.setBindGroup(1, gpuContext.bindGroup1)
  passEncoder.setBindGroup(2, gpuContext.bindGroups2[bufferIndex])
  passEncoder.dispatchWorkgroups(workgroupCount)
  passEncoder.end()

  if (!gpuContext.DEBUG) {
    commandEncoder.copyBufferToBuffer(compactCountBuffer, 0, compactReadBuffer, 0, 4)
    commandEncoder.copyBufferToBuffer(compactResultsBuffer, 0, compactReadBuffer, 4, gpuContext.compactResultsBufferSize)
    commandEncoder.copyBufferToBuffer(validCountBuffer, 0, compactReadBuffer, 4 + gpuContext.compactResultsBufferSize, 4)
  }

  if (gpuContext.DEBUG) {
    commandEncoder.copyBufferToBuffer(
      gpuContext.resultMatrixBuffers[bufferIndex],
      0,
      gpuContext.gpuReadBuffers[bufferIndex],
      0,
      gpuContext.resultMatrixBufferSize,
    )
  }

  device.queue.submit([commandEncoder.finish()])
}

export function generateExecutionPass(gpuContext: GpuExecutionContext, offset: number, bufferIndex: number = 0): ExecutionPassResult {
  const paramsData = generateParamsMatrix(offset, gpuContext.relics, gpuContext)
  submitGpuDispatch(gpuContext, paramsData, gpuContext.NUM_WORKGROUPS, bufferIndex)
  return {
    gpuReadBuffer: gpuContext.gpuReadBuffers[bufferIndex],
    compactReadBuffer: gpuContext.compactReadBuffers[bufferIndex],
  }
}

async function generatePipeline(device: GPUDevice, wgsl: string) {
  const shaderModule = device.createShaderModule({
    code: wgsl,
  })

  return device.createComputePipelineAsync({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  })
}

function createGpuBuffer(
  device: GPUDevice,
  matrix: Int32Array | Float32Array,
  usage: GPUBufferUsageFlags,
  mapped = true,
  int = false,
) {
  const gpuBuffer = device.createBuffer({
    mappedAtCreation: mapped,
    size: matrix.byteLength,
    usage: usage,
  })

  const arrayBuffer = gpuBuffer.getMappedRange()
  if (int) {
    new Uint32Array(arrayBuffer).set(matrix)
  } else {
    new Float32Array(arrayBuffer).set(matrix)
  }
  gpuBuffer.unmap()

  return gpuBuffer
}

export function destroyPipeline(gpuContext: GpuExecutionContext) {
  gpuContext.resultMatrixBuffers.forEach((b) => b.destroy())
  gpuContext.gpuReadBuffers.forEach((b) => b.destroy())
  gpuContext.paramsMatrixBuffer.destroy()
  gpuContext.relicsMatrixBuffer.destroy()
  gpuContext.precomputedStatsBuffer.destroy()
  gpuContext.relicSetSolutionsMatrixBuffer?.destroy()
  gpuContext.ornamentSetSolutionsMatrixBuffer?.destroy()
  gpuContext.assignmentBuffer?.destroy()

  gpuContext.compactCountBuffers.forEach((b) => b.destroy())
  gpuContext.compactResultsBuffers.forEach((b) => b.destroy())
  gpuContext.compactReadBuffers.forEach((b) => b.destroy())
  gpuContext.validCountBuffers.forEach((b) => b.destroy())
}
