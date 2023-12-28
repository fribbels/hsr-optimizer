let poolSize = 20
let workers = []
let taskQueue = []

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

  execute: (task, callback) => {
    if (workers.length > 0) {
      const worker = workers.pop();
      worker.onmessage = (message) => {
        console.log('worker message', message)
        if (callback) callback(message.data)
        workers.push(worker)
        WorkerPool.nextTask()
      };

      worker.postMessage(task, [task.buffer]);
    } else {
      taskQueue.push({ task, callback });
    }
  },

  cancel: () => {
    taskQueue = []
  },

  state: () => {
    console.log({
      poolSize,
      workers,
      taskQueue
    })
  }
}

WorkerPool.initialize()
