import {
  type PartialSimulationWrapper,
  type ScoringParams,
  type SimulationFlags,
} from 'lib/scoring/simScoringUtils'
import {
  type Simulation,
  type SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import {
  type BaseWorkerInput,
  type BaseWorkerOutput,
  WorkerCancelledError,
  workerPool,
} from 'lib/worker/workerPool'
import { WorkerType } from 'lib/worker/workerUtils'
import { type Form } from 'types/form'
import {
  type ScoringConfigType,
  type SimulationMetadata,
} from 'types/metadata'
import { type OptimizerContext } from 'types/optimizer'

import { computeOptimalSimulationWorker } from 'lib/worker/computeOptimalSimulationWorker'

export interface ComputeOptimalSimulationWorkerInput extends BaseWorkerInput {
  partialSimulationWrapper: PartialSimulationWrapper
  inputMinSubstatRollCounts: SubstatCounts
  inputMaxSubstatRollCounts: SubstatCounts
  simulationForm: Form
  context: OptimizerContext
  metadata: SimulationMetadata
  scoringParams: ScoringParams
  simulationFlags: SimulationFlags
  workerType: WorkerType
  configType: ScoringConfigType
}

export interface ComputeOptimalSimulationWorkerOutput extends BaseWorkerOutput {
  simulation: Simulation | null
}

export type ComputeOptimalSimulationPhase = 'benchmark' | 'perfection'
export type ComputeOptimalSimulationResultMode = 'full' | 'scoreOnly'

export type ComputeOptimalSimulationSearchRunnerContext = {
  phase: ComputeOptimalSimulationPhase
  configType: ScoringConfigType
  resultMode?: ComputeOptimalSimulationResultMode
}

export type ComputeOptimalSimulationSearchRunner = (
  input: ComputeOptimalSimulationWorkerInput,
  context: ComputeOptimalSimulationSearchRunnerContext,
) => Promise<ComputeOptimalSimulationWorkerOutput>

export function runComputeOptimalSimulationInline(
  input: ComputeOptimalSimulationWorkerInput,
): ComputeOptimalSimulationWorkerOutput {
  const prev = globalThis.SEQUENTIAL_BENCHMARKS
  globalThis.SEQUENTIAL_BENCHMARKS = true
  try {
    return computeOptimalSimulationWorker({ data: input } as MessageEvent<ComputeOptimalSimulationWorkerInput>) as ComputeOptimalSimulationWorkerOutput
  } finally {
    globalThis.SEQUENTIAL_BENCHMARKS = prev
  }
}

export async function defaultComputeOptimalSimulationSearchRunner(
  input: ComputeOptimalSimulationWorkerInput,
): Promise<ComputeOptimalSimulationWorkerOutput> {
  return globalThis.SEQUENTIAL_BENCHMARKS
    ? runComputeOptimalSimulationInline(input)
    : runComputeOptimalSimulationWorker(input)
}

export async function runComputeOptimalSimulationWorker(
  input: ComputeOptimalSimulationWorkerInput,
): Promise<ComputeOptimalSimulationWorkerOutput> {
  const enhancedInput: ComputeOptimalSimulationWorkerInput = {
    ...input,
    workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
  }

  return await workerPool.runTask<ComputeOptimalSimulationWorkerInput, ComputeOptimalSimulationWorkerOutput>(enhancedInput)
}
