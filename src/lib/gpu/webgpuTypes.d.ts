import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

export type GpuResult = {
  index: number,
  value: number,
}

export type GpuConstants = {
  WORKGROUP_SIZE: number,
  BLOCK_SIZE: number,
  CYCLES_PER_INVOCATION: number,
  RESULTS_LIMIT: number,
  COMPACT_LIMIT: number,
  DEBUG: boolean,
}

export type GpuExecutionContext = {
  // GPU constants
  WORKGROUP_SIZE: number,
  BLOCK_SIZE: number,
  CYCLES_PER_INVOCATION: number,
  RESULTS_LIMIT: number,
  DEBUG: boolean,

  // Inputs
  request: Form,
  context: OptimizerContext,

  // Cached execution data
  paramsMatrixBufferSize: number,
  resultMatrixBufferSize: number,
  permutations: number,
  iterations: number,
  startTime: number,
  relics: RelicsByPart,
  resultsQueue: FixedSizePriorityQueue<GpuResult>,
  cancelled: boolean,
  computeEngine: string,

  // Webgpu internal objects
  device: GPUDevice,
  computePipeline: GPUComputePipeline,
  bindGroup0: GPUBindGroup,
  bindGroup1: GPUBindGroup,
  bindGroups2: [GPUBindGroup, GPUBindGroup],
  paramsMatrixBuffer: GPUBuffer,
  resultMatrixBuffers: [GPUBuffer, GPUBuffer],
  relicsMatrixBuffer: GPUBuffer,
  relicSetSolutionsMatrixBuffer: GPUBuffer,
  ornamentSetSolutionsMatrixBuffer: GPUBuffer,
  precomputedStatsBuffer: GPUBuffer,

  gpuReadBuffers: [GPUBuffer, GPUBuffer],
  bindGroupLayouts: GPUBindGroupLayout[],

  // Timestamp profiling (optional — only present when timestamp-query is supported)
  canTimestamp: boolean,
  querySet?: GPUQuerySet,
  timestampResolveBuffer?: GPUBuffer,
  timestampReadBuffer?: GPUBuffer,

  // Atomic compaction buffers
  COMPACT_LIMIT: number,
  compactResultsBufferSize: number,
  compactCountBuffers: [GPUBuffer, GPUBuffer],
  compactResultsBuffers: [GPUBuffer, GPUBuffer],
  compactCountReadBuffers: [GPUBuffer, GPUBuffer],
  compactResultsReadBuffers: [GPUBuffer, GPUBuffer],
}

export type RelicsByPart = {
  LinkRope: Relic[],
  PlanarSphere: Relic[],
  Feet: Relic[],
  Body: Relic[],
  Hands: Relic[],
  Head: Relic[],
}

export type SingleRelicByPart = {
  LinkRope: Relic,
  PlanarSphere: Relic,
  Feet: Relic,
  Body: Relic,
  Hands: Relic,
  Head: Relic,
}
