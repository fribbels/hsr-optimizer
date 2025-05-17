import { Constants } from 'lib/constants/constants'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { BufferPacker } from 'lib/optimization/bufferPacker'
import { PartialByKey } from 'lib/utils/TsUtils'
import OptimizerWorker from 'lib/worker/baseOptimizerWorker.ts?worker&inline'
import { WorkerType } from 'lib/worker/workerUtils'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

// const poolSize = 1
const poolSize = Math.min(10, Math.max(1, (navigator.hardwareConcurrency || 4) - 1))
let initializedWorkers = 0
// console.log('Using pool size ' + poolSize)

type WorkerTaskWrapper = {
  task: PreWorkerTask
  callback: (result: WorkerResult) => void
}

export type WorkerTask = {
  getMinFilter: () => number
  input: WorkerTaskInput
  attempts: number
}

type WorkerTaskInput = {
  WIDTH: number
  context: OptimizerContext
  ornamentSetSolutions: number[]
  permutations: number
  relicSetSolutions: number[]
  relics: RelicsByPart
  request: Form
  skip: number
  buffer: ArrayBuffer
  workerType: WorkerType
}

export type WorkerResult = {
  buffer: ArrayBuffer
}

// make attempts and input.buffer optional fields
export type PreWorkerTask = PartialByKey<Omit<WorkerTask, 'input'>, 'attempts'> & { input: PartialByKey<WorkerTaskInput, 'buffer'> }

// Reuse workers and buffers
const workers: Worker[] = []
const buffers: ArrayBuffer[] = []
let taskQueue: WorkerTaskWrapper[] = []
const taskStatus: Record<string, boolean> = {}

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
    const { task, callback } = taskQueue.shift()!
    WorkerPool.execute(task, callback)
  },

  execute: (preTask: PreWorkerTask, callback: (result: WorkerResult) => void) => {
    // if (taskStatus[id] == undefined) taskStatus[id] = true
    // if (taskStatus[id] == false) return

    // Don't keep looping if a task keeps failing
    if (preTask.attempts == undefined) preTask.attempts = 0
    if (preTask.attempts > 10) return console.log('Too many failures, abandoning task')

    WorkerPool.initializeWorker()

    if (workers.length > 0) {
      const worker = workers.shift()!

      let buffer: ArrayBuffer
      if (buffers.length > 0) {
        buffer = buffers.pop()!
        BufferPacker.cleanFloatBuffer(buffer)
      } else {
        buffer = BufferPacker.createFloatBuffer(Constants.THREAD_BUFFER_LENGTH)
      }

      // preTask is potentially missing input.buffer and attempts, both have been assigned by now -> update the type
      const task: WorkerTask = { ...{ input: { ...preTask.input, buffer }, attempts: preTask.attempts, getMinFilter: preTask.getMinFilter } }

      worker.onmessage = (message: { data: WorkerResult }) => {
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
        taskQueue.push({ task: task, callback })
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
      taskQueue.push({ task: preTask, callback })
    }
  },

  cancel: (id: string) => {
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
