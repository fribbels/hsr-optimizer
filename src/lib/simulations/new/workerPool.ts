import ComputeOptimalSimulationWorker from 'lib/worker/baseWorker.ts?worker&inline'
import { WorkerType } from 'lib/worker/workerUtils'

export class WorkerPool {
  private workers: Worker[] = []
  private available: number[] = []
  private queue: Array<{
    input: any
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    const INITIAL_WORKER_COUNT = 1
    const MAX_WORKER_COUNT = Math.min(1, Math.max(INITIAL_WORKER_COUNT, navigator.hardwareConcurrency))

    console.log(`[WorkerPool] Initializing pool with ${INITIAL_WORKER_COUNT} workers`)

    // Create initial once
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

    for (let i = INITIAL_WORKER_COUNT; i < MAX_WORKER_COUNT; i++) {
      setTimeout(() => {
        console.log(`[WorkerPool] Creating additional worker ${i}`)
        try {
          const worker = new ComputeOptimalSimulationWorker()
          this.setupWorker(worker, i)
          this.workers.push(worker)
          this.available.push(i)

          // Log completion when all workers are created
          if (this.workers.length === MAX_WORKER_COUNT) {
            console.log(`[WorkerPool] Pool finalized with ${this.workers.length} workers`)
          }
        } catch (error) {
          console.error(`[WorkerPool] Error creating worker ${i}:`, error)
        }
      }, i * 500) // 100ms delay between each additional worker
    }

    console.log(`[WorkerPool] Pool initialized with ${this.workers.length} workers`)
  }

  runTask(input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.available.length > 0) {
        // Use an available worker
        const workerIndex = this.available.shift()!
        this.runTaskOnWorker(input, resolve, reject, workerIndex)
      } else {
        // Queue the task for later
        this.queue.push({ input, resolve, reject })
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

  getStats(): { workers: number; available: number; queued: number } {
    return {
      workers: this.workers.length,
      available: this.available.length,
      queued: this.queue.length,
    }
  }

  private setupWorker(worker: Worker, index: number): void {
    // Add global error handler
    worker.onerror = (error) => {
      console.error(`[WorkerPool] Worker ${index} error:`, error)
    }

    // Test message to ensure worker is responsive
    worker.postMessage({ type: 'PING' })

    // Setup one-time ping response listener
    const pingHandler = (e: MessageEvent) => {
      if (e.data?.type === 'PONG') {
        console.log(`[WorkerPool] Worker ${index} responded to ping`)
        worker.removeEventListener('message', pingHandler)
      }
    }

    worker.addEventListener('message', pingHandler)
  }

  private runTaskOnWorker(input: any, resolve: (value: any) => void, reject: (reason?: any) => void, workerIndex: number): void {
    const worker = this.workers[workerIndex]

    const messageHandler = (e: MessageEvent) => {
      worker.removeEventListener('message', messageHandler)
      worker.removeEventListener('error', errorHandler)
      resolve(e.data)
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

export const simulationWorkerPool = new WorkerPool()

// Updated runner function to use the pool with debugging
export async function runComputeOptimalSimulationWorker(input: any): Promise<any> {
  // console.log(`[WorkerPool] Task input`, input)

  // Ensure workerType is set properly
  const enhancedInput = {
    ...input,
    workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION, // This matches your WorkerType enum value
  }

  try {
    const startTime = performance.now()
    const result = await simulationWorkerPool.runTask(enhancedInput)
    const endTime = performance.now()

    console.log(`[WorkerPool] Task completed in ${endTime - startTime}ms`)
    return result
  } catch (error) {
    console.error('[WorkerPool] Worker execution error:', error)
    // Return a default error result
    return { simulation: null }
  }
}
