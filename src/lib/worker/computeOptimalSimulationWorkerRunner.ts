import { PartialSimulationWrapper, ScoringParams, SimulationFlags } from 'lib/scoring/simScoringUtils'
import { Simulation, StatSimulationTypes } from 'lib/simulations/new/statSimulationTypes'
import { DEBUG } from 'lib/worker/computeOptimalSimulationWorker'
import { WorkerType } from 'lib/worker/workerUtils'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export type ComputeOptimalSimulationRunnerInput = {
  partialSimulationWrapper: PartialSimulationWrapper
  inputMinSubstatRollCounts: StatSimulationTypes
  inputMaxSubstatRollCounts: StatSimulationTypes
  simulationForm: Form
  context: OptimizerContext
  metadata: SimulationMetadata
  scoringParams: ScoringParams
  simulationFlags: SimulationFlags
}

export type ComputeOptimalSimulationRunnerOutput = {
  simulation: Simulation | null
}

export type ComputeOptimalSimulationWorkerInput = {
  partialSimulationWrapper: PartialSimulationWrapper
  inputMinSubstatRollCounts: StatSimulationTypes
  inputMaxSubstatRollCounts: StatSimulationTypes
  simulationForm: Form
  context: OptimizerContext
  metadata: SimulationMetadata
  scoringParams: ScoringParams
  simulationFlags: SimulationFlags
  workerType: WorkerType
}

export type ComputeOptimalSimulationWorkerOutput = {
  simulation: Simulation | null
}

DEBUG()
