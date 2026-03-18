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
import { type SimulationMetadata } from 'types/metadata'
import { type OptimizerContext } from 'types/optimizer'

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
}

export interface ComputeOptimalSimulationWorkerOutput extends BaseWorkerOutput {
  simulation: Simulation | null
}

export async function runComputeOptimalSimulationWorker(
  input: ComputeOptimalSimulationWorkerInput,
): Promise<ComputeOptimalSimulationWorkerOutput> {
  const enhancedInput: ComputeOptimalSimulationWorkerInput = {
    ...input,
    workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
  }

  try {
    return await workerPool.runTask<ComputeOptimalSimulationWorkerInput, ComputeOptimalSimulationWorkerOutput>(enhancedInput)
  } catch (error) {
    // Re-throw cancellation — don't mask it with a fallback value
    if (error instanceof WorkerCancelledError) throw error
    console.error('[WorkerPool] Worker execution error:', error)
    return { simulation: null }
  }
}
