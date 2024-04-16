import { serialize } from '../format'
import { OptimizationRequest } from '../request'
import { OptimizationResult } from '../result'
import { RelicContext } from '../stats/relic'
import { Build, BuildIndex } from './iteration/build'
import { isProgressEvent, isResultEvent, TypedEvent, WorkerProgress, WorkerRunRequest } from './worker/events'
import OptimizationWorker from './worker/worker?worker'

type UseWorkerOptions = {
  numWorkers: number
  numberOfBuilds: number
  updateProgress?: {
    each: number
    callback: (progress: WorkerProgress) => void
  }
}

export async function useWorker(
  request: OptimizationRequest,
  { numWorkers, numberOfBuilds, updateProgress }: UseWorkerOptions,
): Promise<OptimizationResult> {
  console.log(`using ${numWorkers} threads`)
  const start = performance.now()

  const promises: Promise<Build[]>[] = []

  const iterator = new FilterIterator(buildSizes(request.relics.pieces), numWorkers)
  for (const filter of { [Symbol.iterator]: () => iterator }) {
    const worker = new OptimizationWorker({ name: `worker-${JSON.stringify(filter.from)}` })

    const message: WorkerRunRequest = {
      request: serialize(request),
      requestType: 'OptimizationRequest',
      filter: filter,
      type: 'optimize',
      options: {
        numberOfBuilds,
        sendUpdate: updateProgress?.each,
      },
    }

    promises.push(
      new Promise((resolve, reject) => {
        worker.onmessage = (event: TypedEvent) => {
          if (isProgressEvent(event)) {
            updateProgress?.callback(event.data)
          } else if (isResultEvent(event)) {
            resolve(event.data.result)
          } else {
            reject(`Unknown event: ${JSON.stringify(event)}`)
          }
        }
      }),
    )
    worker.postMessage(message)
  }

  return Promise.all(promises)
    .then((results) => results.reduce(addThenSortThenTrim, []))
    .then((builds) => ({
      builds: builds,
      time: performance.now() - start,
    }))
}

function addThenSortThenTrim(mainArr: Build[], workerResult: Build[]) {
  mainArr.push(...workerResult)
  mainArr.sort((a, b) => b.value - a.value)
  mainArr.length = workerResult.length
  return mainArr
}

type Filter = WorkerRunRequest['filter']
/**
 * It maybe a bit hard to read from here, as the code is less explained. The
 * general idea is this is an iterator to iterate and slice each web workers
 * job.
 */
class FilterIterator implements Iterator<Filter, undefined> {
  constructor(
    private size: bigint[],
    private numWorkers: number,
    private currentIdx: number = 1,
    private currentPosition: bigint = 0n,
    private workerSize = size[5] / BigInt(numWorkers),
    private done: boolean = false,
  ) {
    console.log(`Each worker should calculate ${workerSize} builds`)
  }

  next(): IteratorResult<Filter, undefined> {
    if (this.done) {
      return {
        done: true,
        value: undefined,
      }
    }
    if (this.currentIdx > this.numWorkers) {
      this.done = true
      return {
        done: true,
        value: undefined,
      }
    }
    let incre: bigint
    if (this.currentIdx < this.numWorkers) {
      incre = this.workerSize
    } else {
      incre = this.size[5] - this.currentPosition - 1n
    }
    const from = this.currentPosition
    const to = from + incre
    this.currentPosition = to + 1n
    this.currentIdx++
    return {
      done: false,
      value: {
        from: calculateFilter(from, this.size),
        to: calculateFilter(to, this.size),
        total: Number(incre),
      },
    }
  }
}
function calculateFilter(index: bigint, size: bigint[]): BuildIndex {
  const retVal: number[] = []
  retVal.push(Number(index / size[4]))
  index = index % size[4]
  retVal.push(Number(index / size[3]))
  index = index % size[3]
  retVal.push(Number(index / size[2]))
  index = index % size[2]
  retVal.push(Number(index / size[1]))
  index = index % size[1]
  retVal.push(Number(index / size[0]))
  index = index % size[0]
  retVal.push(Number(index))
  return retVal as BuildIndex
}

function buildSizes(relics: RelicContext['pieces']): bigint[] {
  const retVal: bigint[] = []
  let curr = BigInt(relics.rope.length)
  retVal.push(curr)
  retVal.push(curr = curr * BigInt(relics.sphere.length))
  retVal.push(curr = curr * BigInt(relics.feet.length))
  retVal.push(curr = curr * BigInt(relics.body.length))
  retVal.push(curr = curr * BigInt(relics.hand.length))
  retVal.push(curr = curr * BigInt(relics.head.length))
  return retVal
}
