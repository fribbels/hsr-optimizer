import { computeOptimalSimulationWorker } from 'lib/worker/computeOptimalSimulationWorker'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { estTbpWorker } from 'lib/worker/estTbpWorker'
import { EstTbpWorkerInput } from 'lib/worker/estTbpWorkerRunner'
import { WorkerType } from 'lib/worker/workerUtils'

self.onmessage = function(e: MessageEvent) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  switch (e.data.workerType) {
    case WorkerType.EST_TBP:
      estTbpWorker(e as MessageEvent<EstTbpWorkerInput>)
      break
    case WorkerType.COMPUTE_OPTIMAL_SIMULATION:
      computeOptimalSimulationWorker(e as MessageEvent<ComputeOptimalSimulationWorkerInput>)
      break
  }
}
