import { BufferPacker } from "./bufferPacker";
import { Constants } from "./constants";
import OptimizerWorker from "./worker/optimizerWorker?worker"

let poolSize = (navigator.hardwareConcurrency || 4) - 1
let initialized = 0
console.log('Using pool size ' + poolSize)
// Reuse workers and buffers
let workers = []
let buffers = []
let taskQueue = []
let taskStatus = {}

export const WorkerPool = {
  initialize: () => {
    if (initialized < poolSize) {
      const worker = new OptimizerWorker();
      workers.push(worker)
      initialized++
    }
  },

  nextTask: () => {
    if (taskQueue.length == 0) return;
    let { task, callback } = taskQueue.shift()
    WorkerPool.execute(task, callback)
  },

  execute: (task, callback, id) => {
    if (taskStatus[id] == undefined) taskStatus[id] = true
    if (taskStatus[id] == false) return

    WorkerPool.initialize()

    if (workers.length > 0) {
      const worker = workers.pop();

      let buffer
      if (buffers.length > 0) {
        buffer = buffers.pop()
        BufferPacker.cleanFloatBuffer(buffer)
      } else {
        buffer = BufferPacker.createFloatBuffer(Constants.THREAD_BUFFER_LENGTH)
      }

      task.buffer = buffer

      worker.onmessage = (message) => {
        // console.log('worker message', message)
        if (callback) callback(message.data)
        workers.push(worker)
        buffers.push(message.data.buffer)
        WorkerPool.nextTask()
      };

      worker.postMessage(task, [task.buffer]);
    } else {
      taskQueue.push({ task, callback });
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
      buffers
    })
  },
}