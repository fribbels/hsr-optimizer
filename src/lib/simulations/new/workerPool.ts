// Define interface types for tasks and worker pool
interface Task<InputType, OutputType> {
  input: InputType
  resolve: (value: OutputType | PromiseLike<OutputType>) => void
  reject: (reason?: any) => void
}

export class WorkerPool<InputType, OutputType> {
  private workers: Worker[] = []
  private queue: Task<InputType, OutputType>[] = []
  private available: number[] = []

  /**
   * Creates a new worker pool
   * @param size Number of workers to create
   * @param workerScript URL or path to the worker script
   * @param options Optional worker options
   */
  constructor(
    size: number,
    private workerScript: string | URL,
    private options?: WorkerOptions,
  ) {
    // Create workers once
    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerScript, options)
      this.workers.push(worker)
      this.available.push(i)
    }
  }

  /**
   * Gets the current number of available workers
   */
  get availableWorkers(): number {
    return this.available.length
  }

  /**
   * Gets the current size of the task queue
   */
  get queueSize(): number {
    return this.queue.length
  }

  /**
   * Gets the total size of the worker pool
   */
  get poolSize(): number {
    return this.workers.length
  }

  /**
   * Runs a task on an available worker, or queues it if none available
   * @param input The input to pass to the worker
   * @returns Promise that resolves with the worker result
   */
  runTask(input: InputType): Promise<OutputType> {
    return new Promise<OutputType>((resolve, reject) => {
      const task: Task<InputType, OutputType> = { input, resolve, reject }

      if (this.available.length > 0) {
        const workerIndex = this.available.shift()!
        this.runTaskOnWorker(task, workerIndex)
      } else {
        this.queue.push(task)
      }
    })
  }

  /**
   * Terminates all workers in the pool
   */
  terminate(): void {
    this.workers.forEach((worker) => worker.terminate())
    this.workers = []
    this.available = []
    this.queue = []
  }

  /**
   * Runs a specific task on a specific worker
   * @param task The task to run
   * @param workerIndex The index of the worker to use
   */
  private runTaskOnWorker(task: Task<InputType, OutputType>, workerIndex: number): void {
    const worker = this.workers[workerIndex]

    const messageHandler = (e: MessageEvent) => {
      worker.removeEventListener('message', messageHandler)
      task.resolve(e.data as OutputType)

      // Return worker to the available pool
      this.available.push(workerIndex)

      // Check if there are queued tasks
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift()!
        this.runTaskOnWorker(nextTask, workerIndex)
      }
    }

    const errorHandler = (error: ErrorEvent) => {
      worker.removeEventListener('error', errorHandler)
      console.error('Worker error:', error)
      task.reject(error)

      // Return worker to the available pool
      this.available.push(workerIndex)

      // Check if there are queued tasks
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift()!
        this.runTaskOnWorker(nextTask, workerIndex)
      }
    }

    worker.addEventListener('message', messageHandler)
    worker.addEventListener('error', errorHandler)
    worker.postMessage(task.input)
  }
}
