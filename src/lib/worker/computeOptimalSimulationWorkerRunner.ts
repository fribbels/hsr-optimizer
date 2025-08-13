import {
  PartialSimulationWrapper,
  ScoringParams,
  SimulationFlags,
} from 'lib/scoring/simScoringUtils'
import {
  Simulation,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import {
  BaseWorkerInput,
  BaseWorkerOutput,
} from 'lib/simulations/workerPool'
import { DEBUG } from 'lib/worker/computeOptimalSimulationWorker'
import { WorkerType } from 'lib/worker/workerUtils'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

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

DEBUG()
