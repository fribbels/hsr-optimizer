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
  bindGroup2: GPUBindGroup,
  paramsMatrixBuffer: GPUBuffer,
  resultMatrixBuffer: GPUBuffer,
  relicsMatrixBuffer: GPUBuffer,
  relicSetSolutionsMatrixBuffer: GPUBuffer,
  ornamentSetSolutionsMatrixBuffer: GPUBuffer,
  precomputedStatsBuffer: GPUBuffer,

  gpuReadBuffer: GPUBuffer,
  bindGroupLayouts: GPUBindGroupLayout[],

  // Double-buffering: second buffer set for GPU/CPU overlap
  resultMatrixBufferB: GPUBuffer,
  gpuReadBufferB: GPUBuffer,
  bindGroup2B: GPUBindGroup,

  // Timestamp profiling (optional — only present when timestamp-query is supported)
  canTimestamp: boolean,
  querySet?: GPUQuerySet,
  timestampResolveBuffer?: GPUBuffer,
  timestampReadBuffer?: GPUBuffer,

  // Atomic compaction buffers (non-DEBUG only)
  COMPACT_LIMIT: number,
  compactResultsBufferSize: number,
  compactCountBuffer: GPUBuffer,
  compactCountBufferB: GPUBuffer,
  compactResultsBuffer: GPUBuffer,
  compactResultsBufferB: GPUBuffer,
  compactCountReadBuffer: GPUBuffer,
  compactCountReadBufferB: GPUBuffer,
  compactResultsReadBuffer: GPUBuffer,
  compactResultsReadBufferB: GPUBuffer,
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
