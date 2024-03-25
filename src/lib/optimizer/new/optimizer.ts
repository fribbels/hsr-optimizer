import { __noWorker } from './opt/singleThreaded'
import { OptimizationRequest } from './optimizationRequest'
import { EarlyConditional, LateConditional } from './stats/conditional'
import {
  BodyPiece,
  FeetPiece,
  HandPiece,
  HeadPiece,
  RelicContext,
  RelicSetEffect,
  RopePiece,
  SpherePiece,
} from './stats/relic'
import OptimizationWorker from './opt/worker?worker'
import { WorkerResult, WorkerRunRequest } from './opt/worker'

export async function optimize(
  request: OptimizationRequest,
  useWorker: boolean = false,
): Promise<OptimizationResult> {
  if (useWorker) {
    return {
      builds: await __useWorker(request),
    }
  }
  return __noWorker(request)
}

async function __useWorker(request: OptimizationRequest) {
  const size = numberOfBuilds(request.relics.pieces)
  const numWorkers =
    request.options?.workerSize ?? navigator.hardwareConcurrency
  console.log(`using ${numWorkers} threads`)

  const promises: Promise<Build[]>[] = []
  for (const filter of new FilterIterable(size, numWorkers)) {
    const name = `worker-${JSON.stringify(filter.from)}`
    const worker = new OptimizationWorker({
      name: name,
    })
    const message: WorkerRunRequest = {
      request: JSON.stringify(request),
      filter: filter,
      type: 'optimize',
    }
    promises.push(
      new Promise(function (resolve) {
        worker.onmessage = function (event: MessageEvent<WorkerResult>) {
          resolve(event.data.result)
        }
      }),
    )
    worker.postMessage(message)
  }
  return Promise.all(promises).then((results) =>
    results.reduce((allBuilds, partialBuilds) => {
      allBuilds.push(...partialBuilds)
      allBuilds.sort((a, b) => b.value - a.value)
      allBuilds.length = 10
      return allBuilds
    }, []),
  )
}

class FilterIterable implements Iterable<Filter> {
  constructor(
    private size: bigint[],
    private numWorkers: number,
  ) {}

  [Symbol.iterator](): Iterator<{ from: number[]; to: number[] }, undefined> {
    return new FilterIterator(this.size, this.numWorkers)
  }
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

  next(): IteratorResult<{ from: number[]; to: number[] }, undefined> {
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
      },
    }
  }
}

function calculateFilter(index: bigint, size: bigint[]): number[] {
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
  return retVal
}

function numberOfBuilds(relics: RelicContext['pieces']): bigint[] {
  const retVal: bigint[] = []
  let curr = BigInt(relics.rope.length)
  retVal.push(curr)
  retVal.push((curr = curr * BigInt(relics.sphere.length)))
  retVal.push((curr = curr * BigInt(relics.feet.length)))
  retVal.push((curr = curr * BigInt(relics.body.length)))
  retVal.push((curr = curr * BigInt(relics.hand.length)))
  retVal.push((curr = curr * BigInt(relics.head.length)))
  return retVal
}

export function checkSet4(
  lateEffs: LateConditional[],
  earlyEffs: EarlyConditional[],
  relics: { [K: string]: RelicSetEffect },
  set2: string,
  other1: { set: string },
  other2: { set: string },
) {
  lateEffs.push(...relics[set2].set2.late)
  earlyEffs.push(...relics[set2].set2.early)
  if (set2 === other1.set && other2.set === set2) {
    lateEffs.push(...(relics[set2].set4?.late ?? []))
    earlyEffs.push(...(relics[set2].set4?.early ?? []))
  } else if (other2.set === other1.set) {
    lateEffs.push(...relics[other1.set].set2.late)
    earlyEffs.push(...relics[other1.set].set2.early)
  }
}

export function checkSet22(
  lateEffs: LateConditional[],
  earlyEffs: EarlyConditional[],
  relics: { [K: string]: RelicSetEffect },
  set2: string,
  other1: { set: string },
  other2: { set: string },
) {
  lateEffs.push(...relics[set2].set2.late)
  earlyEffs.push(...relics[set2].set2.early)
  if (other1.set === other2.set) {
    lateEffs.push(...relics[other1.set].set2.late)
    earlyEffs.push(...relics[other1.set].set2.early)
  }
}

export type OptimizationResult = {
  builds: Build[]
}

export type Build = {
  head?: HeadPiece
  hand?: HandPiece
  body?: BodyPiece
  feet?: FeetPiece
  sphere?: SpherePiece
  rope?: RopePiece
  value: number
}
