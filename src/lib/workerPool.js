import { BufferPacker } from './bufferPacker'
import { Constants } from './constants'
import OptimizerWorker from './worker/optimizerWorker?worker&inline'

let poolSize = Math.max(1, (navigator.hardwareConcurrency || 4) - 1)
let initializedWorkers = 0
console.log('Using pool size ' + poolSize)

// Reuse workers and buffers
let workers = []
let buffers = []
let taskQueue = []
let taskStatus = {}

export const WorkerPool = {
  initializeWorker: () => {
    if (initializedWorkers < poolSize) {
      const worker = new OptimizerWorker()
      workers.push(worker)
      initializedWorkers++
      console.log('Initialized workers: ' + initializedWorkers)
    }
  },

  initializeAllWorkers: () => {
    for (let i = 0; i < poolSize; i++) {
      setTimeout(() => {
        WorkerPool.initializeWorker()
      }, 500 * i)
    }
  },

  nextTask: () => {
    if (taskQueue.length == 0) return
    let { task, callback } = taskQueue.shift()
    WorkerPool.execute(task, callback)
  },

  execute: (task, callback, id) => {
    if (taskStatus[id] == undefined) taskStatus[id] = true
    if (taskStatus[id] == false) return

    // Dont keep looping if a task keeps failing
    if (task.attempts == undefined) task.attempts = 0
    if (task.attempts > 10) return console.log('Too many failures, abandoning task')

    WorkerPool.initializeWorker()

    if (workers.length > 0) {
      const worker = workers.shift()

      let buffer
      if (buffers.length > 0) {
        buffer = buffers.pop()
        BufferPacker.cleanFloatBuffer(buffer)
      } else {
        buffer = BufferPacker.createFloatBuffer(Constants.THREAD_BUFFER_LENGTH)
      }

      task.input.buffer = buffer

      worker.onmessage = (message) => {
        // Queue up task before operating on the callback
        workers.push(worker)
        WorkerPool.nextTask()

        if (callback) callback(message.data)
        buffers.push(message.data.buffer)
      }

      // Workers in Vite seem to have a chance to fail to initialize and die silently on Chromium browsers, when too many
      // new workers are created at once. Using some bandaid retry logic while we investigate the root cause
      worker.onerror = (e) => {
        console.warn('Worker error', e)

        initializedWorkers--
        task.attempts++

        // We don't try to reuse this worker - kill it and start a new one and requeue the task
        taskQueue.push({ task, callback })
        worker.terminate()
        setTimeout(() => {
          WorkerPool.initializeWorker()
          WorkerPool.nextTask()
        }, 100)
      }

      // Recalculate the min filter before starting the worker
      task.input.request.resultMinFilter = task.getMinFilter()
      worker.postMessage(task.input, [task.input.buffer])
    } else {
      taskQueue.push({ task, callback })
    }
  },

  cancel: (id) => {
    taskStatus[id] = false
    taskQueue = []
  },

  state: () => {
    console.log({
      poolSize,
      workers,
      taskQueue,
      buffers,
      initializedWorkers,
    })
  },
}
