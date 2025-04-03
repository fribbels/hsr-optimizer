import { PartialSimulationWrapper, ScoringParams, SimulationFlags } from 'lib/scoring/simScoringUtils'
import { Simulation, SimulationStats } from 'lib/simulations/statSimulationController'
import ComputeOptimalSimulationWorker from 'lib/worker/baseWorker.ts?worker&inline'
import { DEBUG } from 'lib/worker/computeOptimalSimulationWorker'
import { WorkerType } from 'lib/worker/workerUtils'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export type ComputeOptimalSimulationRunnerInput = {
  partialSimulationWrapper: PartialSimulationWrapper
  inputMinSubstatRollCounts: SimulationStats
  inputMaxSubstatRollCounts: SimulationStats
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
  inputMinSubstatRollCounts: SimulationStats
  inputMaxSubstatRollCounts: SimulationStats
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

export async function runComputeOptimalSimulationWorker(
  input: ComputeOptimalSimulationRunnerInput,
  callback?: (output: ComputeOptimalSimulationRunnerOutput) => void,
) {
  const promise: Promise<ComputeOptimalSimulationWorkerOutput> = handleWork(input)

  const workerOutput = await promise
  const runnerOutput: ComputeOptimalSimulationRunnerOutput = {
    simulation: workerOutput.simulation,
  }

  if (callback) callback(runnerOutput)
  return promise
}

const errorResult = { simulation: null }

function handleWork(runnerInput: ComputeOptimalSimulationRunnerInput): Promise<ComputeOptimalSimulationWorkerOutput> {
  if (!runnerInput) return Promise.resolve(errorResult)

  return new Promise((resolve, reject) => {
    const worker = new ComputeOptimalSimulationWorker()

    const input: ComputeOptimalSimulationWorkerInput = {
      ...runnerInput,
      workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
    }

    worker.onmessage = (e) => {
      const result = e.data as ComputeOptimalSimulationWorkerOutput
      worker.terminate()
      resolve(result)
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      worker.terminate()
      resolve(errorResult)
    }

    worker.postMessage(input)
  })
}

DEBUG()
