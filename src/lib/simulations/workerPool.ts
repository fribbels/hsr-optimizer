import ComputeOptimalSimulationWorker from 'lib/worker/baseWorker.ts?worker&inline'
import {
  ComputeOptimalSimulationWorkerInput,
  ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { WorkerType } from 'lib/worker/workerUtils'

// Base interfaces for worker input and output
export interface BaseWorkerInput {
  workerType: WorkerType
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BaseWorkerOutput {}

interface QueuedTask<TInput extends BaseWorkerInput, TOutput extends BaseWorkerOutput> {
  input: TInput
  resolve: (value: TOutput) => void
  reject: (reason?: ErrorEvent) => void
}

export class WorkerPool<TInput extends BaseWorkerInput, TOutput extends BaseWorkerOutput> {
  private workers: Worker[] = []
  private available: number[] = []
  private queue: Array<QueuedTask<TInput, TOutput>> = []

  constructor() {
    if (typeof process !== 'undefined') return

    const INITIAL_WORKER_COUNT = 1
    const MAX_WORKER_COUNT = Math.min(10, Math.max(INITIAL_WORKER_COUNT, navigator.hardwareConcurrency))
    // const MAX_WORKER_COUNT = Math.max(INITIAL_WORKER_COUNT, navigator.hardwareConcurrency)

    console.log(`[WorkerPool] Initializing pool with ${INITIAL_WORKER_COUNT} workers`)

    // Create initial workers
    for (let i = 0; i < INITIAL_WORKER_COUNT; i++) {
      console.log(`[WorkerPool] Creating initial worker ${i}`)
      try {
        const worker = new ComputeOptimalSimulationWorker()
        this.setupWorker(worker, i)
        this.workers.push(worker)
        this.available.push(i)
      } catch (error) {
        console.error(`[WorkerPool] Error creating worker ${i}:`, error)
      }
    }

    // Additional delayed workers
    for (let i = INITIAL_WORKER_COUNT; i < MAX_WORKER_COUNT; i++) {
      setTimeout(() => {
        console.log(`[WorkerPool] Creating additional worker ${i}`)
        try {
          const worker = new ComputeOptimalSimulationWorker()
          this.setupWorker(worker, i)
          this.workers.push(worker)
          this.available.push(i)

          if (this.workers.length === MAX_WORKER_COUNT) {
            console.log(`[WorkerPool] Pool finalized with ${this.workers.length} workers`)
          }
        } catch (error) {
          console.error(`[WorkerPool] Error creating worker ${i}:`, error)
        }
      }, i * 1000) // delay between each additional worker
    }

    console.log(`[WorkerPool] Pool initialized with ${this.workers.length} workers`)
  }

  runTask(input: TInput): Promise<TOutput> {
    const startTime = performance.now()

    return new Promise<TOutput>((resolve, reject) => {
      const timedResolve = (value: TOutput) => {
        const endTime = performance.now()
        // console.log(`[WorkerPool] Task completed in ${endTime - startTime}ms`)
        resolve(value)
      }

      if (this.available.length > 0) {
        // Use an available worker
        const workerIndex = this.available.shift()!
        this.runTaskOnWorker(input, timedResolve, reject, workerIndex)
      } else {
        this.queue.push({ input, resolve: timedResolve, reject })
      }
    })
  }

  terminate(): void {
    this.workers.forEach((worker, index) => {
      console.log(`[WorkerPool] Terminating worker ${index}`)
      worker.terminate()
    })
    this.workers = []
    this.available = []
    this.queue = []
  }

  getStats(): { workers: number, available: number, queued: number } {
    return {
      workers: this.workers.length,
      available: this.available.length,
      queued: this.queue.length,
    }
  }

  private setupWorker(worker: Worker, index: number): void {
    worker.onerror = (error) => {
      console.error(`[WorkerPool] Worker ${index} error:`, error)
    }

    // Test message to ensure worker is responsive
    worker.postMessage({ type: 'PING' })

    // Setup one-time ping response listener
    const pingHandler = (e: MessageEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.data?.type === 'PONG') {
        console.log(`[WorkerPool] Worker ${index} responded to ping`)
        worker.removeEventListener('message', pingHandler)
      }
    }

    worker.addEventListener('message', pingHandler)
  }

  private runTaskOnWorker(
    input: TInput,
    resolve: (value: TOutput) => void,
    reject: (errorEvent?: ErrorEvent) => void,
    workerIndex: number,
  ): void {
    const worker = this.workers[workerIndex]

    const messageHandler = (e: MessageEvent) => {
      worker.removeEventListener('message', messageHandler)
      worker.removeEventListener('error', errorHandler)
      resolve(e.data as TOutput)
      this.workerDone(workerIndex)
    }

    const errorHandler = (e: ErrorEvent) => {
      console.error(`[WorkerPool] Worker ${workerIndex} task error:`, e)
      worker.removeEventListener('message', messageHandler)
      worker.removeEventListener('error', errorHandler)
      reject(e)
      this.workerDone(workerIndex)
    }

    worker.addEventListener('message', messageHandler)
    worker.addEventListener('error', errorHandler)

    worker.postMessage(input)
  }

  private workerDone(workerIndex: number): void {
    // Check if there are queued tasks
    if (this.queue.length > 0) {
      const task = this.queue.shift()!
      this.runTaskOnWorker(task.input, task.resolve, task.reject, workerIndex)
    } else {
      // Return worker to the available pool
      this.available.push(workerIndex)
    }
  }
}

export const baseWorkerPool = new WorkerPool<BaseWorkerInput, BaseWorkerOutput>()

export async function runComputeOptimalSimulationWorker(
  input: ComputeOptimalSimulationWorkerInput,
): Promise<ComputeOptimalSimulationWorkerOutput> {
  const enhancedInput: ComputeOptimalSimulationWorkerInput = {
    ...input,
    workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
  }

  try {
    return baseWorkerPool.runTask(enhancedInput) as Promise<ComputeOptimalSimulationWorkerOutput>
  } catch (error) {
    console.error('[WorkerPool] Worker execution error:', error)
    return { simulation: null }
  }
}
