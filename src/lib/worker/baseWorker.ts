import { computeOptimalSimulationWorker } from 'lib/worker/computeOptimalSimulationWorker'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { estTbpWorker } from 'lib/worker/estTbpWorker'
import { EstTbpWorkerInput } from 'lib/worker/estTbpWorkerRunner'
import { optimizerWorker } from 'lib/worker/optimizerWorker'
import { WorkerType } from 'lib/worker/workerUtils'

// Signal to the pool that this worker has loaded and is ready to accept tasks.
// All imports above have resolved by this point — the worker script is fully initialized.
self.postMessage({ type: 'WORKER_READY' })

self.onmessage = function(e: MessageEvent) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  switch (e.data.workerType) {
    case WorkerType.OPTIMIZER:
      optimizerWorker(e)
      break
    case WorkerType.EST_TBP:
      estTbpWorker(e as MessageEvent<EstTbpWorkerInput>)
      break
    case WorkerType.COMPUTE_OPTIMAL_SIMULATION:
      computeOptimalSimulationWorker(e as MessageEvent<ComputeOptimalSimulationWorkerInput>)
      break
    default:
      console.warn(`[baseWorker] Unhandled worker type: ${e.data.workerType}`)
      break
  }
}
