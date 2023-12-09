let poolSize = 24
let workers = []
let taskQueue = []

export const Pool = {
  initialize: () => {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(new URL('./myWorker.js', import.meta.url));
      workers.push(worker)
    }
  },

  nextTask: () => {
    if (taskQueue.length == 0) return;
    let { task, callback } = taskQueue.shift()
    Pool.executeTask(task, callback)
  },

  execute: (task, callback) => {
    if (workers.length > 0) {
      const worker = workers.pop();
      worker.onmessage = (message) => {
        if (callback) callback(message.data)
        workers.push(worker)
        Pool.nextTask()
      };

      worker.postMessage(task);
    } else {
      // If no available workers, wait for a worker to become available
      taskQueue.push({ task, callback });
    }
  },

  state: () => {
    console.log({
      poolSize,
      workers,
      taskQueue
    })
  }
}

Pool.initialize()
// for (let i = 0; i < 1000; i++) {
//   Pool.executeTask({index: i}, (data) => {
//     console.log('done', data)
//   })
// }
