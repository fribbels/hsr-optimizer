import { Form } from 'types/Form'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { RelicsByPart } from 'lib/gpu/webgpuDataTransform'
import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'
import { Relic } from 'types/Relic'

export type GpuResult = {
  index: number
  value: number
}

export type GpuConstants = {
  WORKGROUP_SIZE: number
  BLOCK_SIZE: number
  CYCLES_PER_INVOCATION: number
  RESULTS_LIMIT: number
  DEBUG: boolean
}

export type GpuExecutionContext = {
  // GPU constants
  WORKGROUP_SIZE: number
  BLOCK_SIZE: number
  CYCLES_PER_INVOCATION: number
  RESULTS_LIMIT: number
  DEBUG: boolean

  // Inputs
  request: Form
  params: OptimizerParams

  // Cached execution data
  resultMatrixBufferSize: number
  permutations: number
  iterations: number
  startTime: number
  relics: RelicsByPart
  resultsQueue: FixedSizePriorityQueue<GpuResult>
  baseParamsArray: number[]
  cancelled: boolean
  computeEngine: string

  // Webgpu internal objects
  device: GPUDevice
  computePipeline: GPUComputePipeline
  postComputePipeline: GPUComputePipeline
  bindGroup1: GPUBindGroup
  bindGroup2: GPUBindGroup
  postComputeBindGroup0: GPUBindGroup
  resultMatrixBuffer: GPUBuffer
  relicsMatrixBuffer: GPUBuffer
  relicSetSolutionsMatrixBuffer: GPUBuffer
  ornamentSetSolutionsMatrixBuffer: GPUBuffer
}

export type RelicsByPart = {
  LinkRope: Relic[]
  PlanarSphere: Relic[]
  Feet: Relic[]
  Body: Relic[]
  Hands: Relic[]
  Head: Relic[]
}
