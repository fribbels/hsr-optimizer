import type { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import type { EstTbpWorkerInput } from 'lib/worker/estTbpWorkerRunner'
import type { OptimizerWorkerInput } from 'lib/worker/optimizerWorker'
import type { BaseWorkerInput } from 'lib/worker/workerPool'
import { WorkerType } from 'lib/worker/workerUtils'

// Signal to the pool that this worker has loaded and is ready to accept tasks.
// Only the lightweight WorkerType enum is statically imported — heavy worker
// implementations are lazy-loaded on first use via dynamic import().
self.postMessage({ type: 'WORKER_READY' })

self.onmessage = function(e: MessageEvent) {
  handleMessage(e).catch((err) => {
    // Throw synchronously so the worker error event fires
    // and the pool can detect the failure and retry/replace
    setTimeout(() => {
      throw err
    })
  })
}

async function handleMessage(e: MessageEvent<BaseWorkerInput>) {
  switch (e.data.workerType) {
    case WorkerType.OPTIMIZER: {
      const { optimizerWorker } = await import('lib/worker/optimizerWorker')
      optimizerWorker(e as MessageEvent<OptimizerWorkerInput>)
      break
    }
    case WorkerType.EST_TBP: {
      const { estTbpWorker } = await import('lib/worker/estTbpWorker')
      estTbpWorker(e as MessageEvent<EstTbpWorkerInput>)
      break
    }
    case WorkerType.COMPUTE_OPTIMAL_SIMULATION: {
      const { computeOptimalSimulationWorker } = await import('lib/worker/computeOptimalSimulationWorker')
      computeOptimalSimulationWorker(e as MessageEvent<ComputeOptimalSimulationWorkerInput>)
      break
    }
    default:
      console.warn(`[baseWorker] Unhandled worker type: ${e.data.workerType}`)
      break
  }
}
