let poolSize = 20
let workers = []
let buffers = []
let taskQueue = []
let taskStatus = {}

export const WorkerPool = {
  initialize: () => {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(new URL('./worker/optimizerWorker.js', import.meta.url));
      workers.push(worker)
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

    if (workers.length > 0) {
      const worker = workers.pop();

      let buffer
      if (buffers.length > 0) {
        buffer = buffers.pop()
        BufferPacker.cleanFloatBuffer(buffer)
      } else {
        buffer = BufferPacker.createFloatBuffer(50000)
      }

      task.buffer = buffer

      worker.onmessage = (message) => {
        console.log('worker message', message)
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
  }
}

WorkerPool.initialize()
