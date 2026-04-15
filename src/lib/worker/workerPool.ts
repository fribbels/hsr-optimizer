import UnifiedWorker from 'lib/worker/baseWorker.ts?worker'
import { type WorkerType } from 'lib/worker/workerUtils'

const MAX_POOL_SIZE = 10
const WORKER_REPLACE_DELAY_MS = 100

// Base interfaces for worker input and output
export interface BaseWorkerInput {
  workerType: WorkerType
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BaseWorkerOutput {}

/** Distinct error class so callers can distinguish cancellation from real worker errors */
export class WorkerCancelledError extends Error {
  constructor() {
    super('Worker task cancelled')
    this.name = 'WorkerCancelledError'
  }
}

interface RunTaskOptions<TIn extends BaseWorkerInput> {
  transferables?: Transferable[]
  /** Called just before postMessage — use to set dynamic fields (e.g. rising min filter).
   *  Receives the input object and should mutate it in place. */
  prepareInput?: (input: TIn) => void
  /** Max retry attempts on worker error. Default 0 (no retry). */
  maxRetries?: number
}

interface QueuedTask<TIn extends BaseWorkerInput, TOut extends BaseWorkerOutput> {
  input: TIn
  resolve: (value: TOut) => void
  reject: (reason?: unknown) => void
  transferables?: Transferable[]
  prepareInput?: (input: TIn) => void
  maxRetries: number
  attempts: number
}

export class WorkerPool {
  private workers: (Worker | null)[] = []
  private available: number[] = []
  private queue: Array<QueuedTask<BaseWorkerInput, BaseWorkerOutput>> = []
  private poolSize: number
  private initialized = false
  /** Tracks in-flight task reject callbacks by worker index, so terminate() can reject them */
  private inFlightRejects = new Map<number, (reason?: unknown) => void>()

  constructor() {
    this.poolSize = typeof navigator !== 'undefined'
      ? Math.min(MAX_POOL_SIZE, Math.max(1, (navigator.hardwareConcurrency || 4) - 1))
      : 1
  }

  /**
   * Lazily spins up workers. Safe to call multiple times — only initializes once.
   * Workers are chained: each worker signals WORKER_READY after its script loads,
   * which triggers creation of the next worker. This avoids Chromium's silent
   * init crashes from creating too many workers simultaneously.
   */
  initialize(): void {
    if (this.initialized) return
    this.initialized = true
    console.log(`[WorkerPool] Initializing pool with ${this.poolSize} workers`)

    this.createWorkerChained(0)
  }

  /**
   * Generic at the method level — callers get type-safe I/O without needing
   * separate pool instances. The pool internally stores BaseWorkerInput/Output.
   */
  runTask<TIn extends BaseWorkerInput, TOut extends BaseWorkerOutput>(
    input: TIn,
    options?: RunTaskOptions<TIn>,
  ): Promise<TOut> {
    // Auto-initialize on first task if not already initialized
    this.initialize()

    const transferables = options?.transferables
    const prepareInput = options?.prepareInput
    const maxRetries = options?.maxRetries ?? 0

    return new Promise<TOut>((resolve, reject) => {
      if (this.available.length > 0) {
        const workerIndex = this.available.shift()!
        this.runTaskOnWorker(
          input as BaseWorkerInput,
          resolve as (value: BaseWorkerOutput) => void,
          reject,
          workerIndex,
          transferables,
          prepareInput as ((input: BaseWorkerInput) => void) | undefined,
          maxRetries,
          0,
        )
      } else {
        this.queue.push({
          input: input as BaseWorkerInput,
          resolve: resolve as (value: BaseWorkerOutput) => void,
          reject,
          transferables,
          prepareInput: prepareInput as ((input: BaseWorkerInput) => void) | undefined,
          maxRetries,
          attempts: 0,
        })
      }
    })
  }

  cancelQueue(): void {
    // Reject all queued tasks with WorkerCancelledError so callers can distinguish
    // cancellation from real errors
    for (const task of this.queue) {
      task.reject(new WorkerCancelledError())
    }
    this.queue = []
  }

  terminate(): void {
    this.cancelQueue()

    // Reject in-flight task promises — workers are about to be terminated,
    // so no message/error event will fire. Without this, promises hang forever.
    for (const [, reject] of this.inFlightRejects) {
      reject(new WorkerCancelledError())
    }
    this.inFlightRejects.clear()

    this.workers.forEach((worker) => worker?.terminate())
    this.workers = []
    this.available = []
    this.initialized = false
  }

  getStats(): { workers: number, available: number, queued: number, inFlight: number } {
    return {
      workers: this.workers.filter(Boolean).length,
      available: this.available.length,
      queued: this.queue.length,
      inFlight: this.inFlightRejects.size,
    }
  }

  getPoolSize(): number {
    return this.poolSize
  }

  /**
   * Creates a worker and waits for its WORKER_READY message before creating the next.
   * The worker is NOT added to `available` until READY fires — this prevents tasks
   * from being dispatched to a worker whose script hasn't finished loading.
   */
  private createWorkerChained(index: number): void {
    if (!this.initialized) return // Guard against post-terminate callbacks

    try {
      const worker = new UnifiedWorker()
      while (this.workers.length <= index) this.workers.push(null)
      this.workers[index] = worker

      // Wait for WORKER_READY before making available and creating next worker
      const readyHandler = (e: MessageEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (e.data?.type !== 'WORKER_READY') return
        worker.removeEventListener('message', readyHandler)

        if (!this.initialized) return // Pool was terminated while waiting

        this.available.push(index)
        console.log(`[WorkerPool] Worker ${index} ready (${this.workers.filter(Boolean).length}/${this.poolSize})`)
        this.drainQueue()

        // Chain: create next worker after this one is confirmed ready
        if (index + 1 < this.poolSize) {
          this.createWorkerChained(index + 1)
        }
      }
      worker.addEventListener('message', readyHandler)
    } catch (error) {
      console.error(`[WorkerPool] Error creating worker ${index}:`, error)
    }
  }

  private replaceWorker(index: number): void {
    const old = this.workers[index]
    if (old) {
      old.terminate()
    }
    // Delay replacement to avoid rapid crash loops under resource pressure.
    setTimeout(() => {
      if (!this.initialized) return // Pool was terminated while waiting

      try {
        const worker = new UnifiedWorker()
        this.workers[index] = worker

        // Wait for WORKER_READY before making available
        const readyHandler = (e: MessageEvent) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (e.data?.type !== 'WORKER_READY') return
          worker.removeEventListener('message', readyHandler)

          if (!this.initialized) return

          this.available.push(index)
          console.log(`[WorkerPool] Worker ${index} replaced`)
          this.drainQueue()
        }
        worker.addEventListener('message', readyHandler)
      } catch (error) {
        console.error(`[WorkerPool] Error replacing worker ${index}:`, error)
      }
    }, WORKER_REPLACE_DELAY_MS)
  }

  private runTaskOnWorker(
    input: BaseWorkerInput,
    resolve: (value: BaseWorkerOutput) => void,
    reject: (reason?: unknown) => void,
    workerIndex: number,
    transferables?: Transferable[],
    prepareInput?: (input: BaseWorkerInput) => void,
    maxRetries: number = 0,
    attempts: number = 0,
  ): void {
    const worker = this.workers[workerIndex]
    if (!worker) {
      reject(new Error(`Worker ${workerIndex} is null`))
      return
    }

    const cleanup = () => {
      worker.removeEventListener('message', messageHandler)
      worker.removeEventListener('error', errorHandler)
      this.inFlightRejects.delete(workerIndex)
    }

    const messageHandler = (e: MessageEvent) => {
      cleanup()
      resolve(e.data as BaseWorkerOutput)
      this.workerDone(workerIndex)
    }

    const errorHandler = (e: ErrorEvent) => {
      cleanup()
      console.error(`[WorkerPool] Worker ${workerIndex} task error (attempt ${attempts + 1}) — replacing worker`)

      if (attempts < maxRetries) {
        // Requeue task for retry on new worker.
        // Clear transferables — original buffers are detached after transfer to the crashed worker.
        // Accepts structured-clone cost on retry (rare, ~1ms per buffer).
        this.queue.push({
          input,
          resolve,
          reject,
          transferables: undefined,
          prepareInput,
          maxRetries,
          attempts: attempts + 1,
        })
      } else {
        reject(e)
      }

      // Replace the dead worker regardless (with delay to avoid rapid crash loops)
      this.replaceWorker(workerIndex)
    }

    worker.addEventListener('message', messageHandler)
    worker.addEventListener('error', errorHandler)

    // Track in-flight reject so terminate() can clean up hanging promises
    this.inFlightRejects.set(workerIndex, reject)

    // Wrap prepareInput + postMessage in try/catch — if prepareInput throws,
    // clean up the dangling event listeners and reject the promise
    try {
      // Call prepareInput just before postMessage — this is where deferred
      // computations like getMinFilter() run at dispatch time, not queue time
      if (prepareInput) {
        prepareInput(input)
      }

      if (transferables?.length) {
        worker.postMessage(input, transferables)
      } else {
        worker.postMessage(input)
      }
    } catch (err) {
      cleanup()
      reject(err)
      this.available.push(workerIndex)
    }
  }

  private workerDone(workerIndex: number): void {
    if (this.queue.length > 0) {
      const task = this.queue.shift()!
      this.runTaskOnWorker(
        task.input,
        task.resolve,
        task.reject,
        workerIndex,
        task.transferables,
        task.prepareInput,
        task.maxRetries,
        task.attempts,
      )
    } else {
      this.available.push(workerIndex)
    }
  }

  private drainQueue(): void {
    while (this.queue.length > 0 && this.available.length > 0) {
      const task = this.queue.shift()!
      const workerIndex = this.available.shift()!
      this.runTaskOnWorker(
        task.input,
        task.resolve,
        task.reject,
        workerIndex,
        task.transferables,
        task.prepareInput,
        task.maxRetries,
        task.attempts,
      )
    }
  }
}

// Shared singleton pool for all worker task types
export const workerPool = new WorkerPool()
