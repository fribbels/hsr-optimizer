import { deserialize } from '../format/deserializer'
import { Build, checkSet22, checkSet4 } from '../optimizer'
import { EarlyConditional, LateConditional } from '../stats/conditional'
import { matchByElement } from '../stats/matcher'
import { RelicContext } from '../stats/relic'

/**
 * A worker job is to iterate the relics from ```filter.from``` to
 * ```filter.to```, building a n-list of highest builds. Afterward, the main
 * list will reassemble all the n-list from m workers, sorting and creating the
 * final n-list themself.
 */
export type WorkerRunRequest = {
  type: 'optimize'
  request: string
  filter: {
    // a 6-length number array so that this worker know where to start indexing
    // Order: build.build.head, build.build.hand, build.build.body, build.build.feet, build.build.sphere, build.build.rope
    from: number[]
    to: number[]
  }
}

export type WorkerResult = {
  filter: WorkerRunRequest['filter']
  result: Build[]
}

self.onmessage = (event: MessageEvent<WorkerRunRequest>) => {
  const json = JSON.parse(event.data.request)
  const request = deserialize(json)
  /*
   * This is a DRY violation, I copied almost everything from singleThreaded.ts
   * TODO: extract the logic into its own file
   */
  const relics = request.relics.sets
  let numBuild: number
  if (request.options?.numberOfBuilds) {
    numBuild = request.options.numberOfBuilds
  } else numBuild = 10
  const builds: Build[] = new Array(numBuild + 1)

  for (const build of new BuildIterable(
    event.data.filter,
    request.relics.pieces,
  )) {
    const setEffs: LateConditional[] = []
    const earlyEffs: EarlyConditional[] = []
    // check set 2 planar
    if (build.sphere.set === build.rope.set) {
      setEffs.push(...relics[build.rope.set].set2.late)
      earlyEffs.push(...relics[build.rope.set].set2.early)
    }
    if (build.head.set === build.hand.set) {
      checkSet4(
        setEffs,
        earlyEffs,
        relics,
        build.head.set,
        build.body,
        build.feet,
      )
    } else if (build.head.set === build.body.set) {
      checkSet22(
        setEffs,
        earlyEffs,
        relics,
        build.head.set,
        build.hand,
        build.feet,
      )
    } else if (build.head.set === build.feet.set) {
      checkSet22(
        setEffs,
        earlyEffs,
        relics,
        build.head.set,
        build.body,
        build.hand,
      )
    } else if (build.hand.set === build.body.set) {
      setEffs.push(...relics[build.hand.set].set2.late)
      earlyEffs.push(...relics[build.hand.set].set2.early)
    } else if (build.hand.set === build.feet.set) {
      setEffs.push(...relics[build.hand.set].set2.late)
      earlyEffs.push(...relics[build.hand.set].set2.early)
    } else if (build.body.set === build.feet.set) {
      setEffs.push(...relics[build.body.set].set2.late)
      earlyEffs.push(...relics[build.body.set].set2.early)
    }
    if (build.sphere.__dmgBoost) {
      earlyEffs.push(
        new EarlyConditional(matchByElement(build.sphere.__dmgBoost.ele), {
          dmgBoost: build.sphere.__dmgBoost.value,
        }),
      )
    }
    const result = request.formula.calculate(
      [
        build.head,
        build.hand,
        build.body,
        build.feet,
        build.sphere,
        build.rope,
      ],
      earlyEffs,
      setEffs,
    )

    builds.push({
      head: build.head,
      hand: build.hand,
      body: build.body,
      feet: build.feet,
      sphere: build.sphere,
      rope: build.rope,
      value: result,
    })
    builds.sort((b1, b2) => b2.value - b1.value)
    builds.length = 10
  }

  // TODO: send progress?
  const resultMsg: WorkerResult = {
    filter: event.data.filter,
    result: builds,
  }
  postMessage(resultMsg)
}
type BuildCandidate = Required<Omit<Build, 'value'>>

class BuildIterable implements Iterable<BuildCandidate> {
  constructor(
    private filter: WorkerRunRequest['filter'],
    private relics: RelicContext['pieces'],
  ) {}

  [Symbol.iterator](): Iterator<BuildCandidate, undefined, undefined> {
    return new BuildIterator(this.filter, this.relics)
  }
}

class BuildIterator implements Iterator<BuildCandidate, undefined> {
  constructor(
    filter: WorkerRunRequest['filter'],
    private relics: RelicContext['pieces'],
    private done: boolean = false,
    private current: number[] = filter.from,
    private max: number[] = [
      relics.head.length - 1,
      relics.hand.length - 1,
      relics.body.length - 1,
      relics.feet.length - 1,
      relics.sphere.length - 1,
      relics.rope.length - 1,
    ],
    private to: number[] = filter.to,
  ) {}

  next(): IteratorResult<BuildCandidate, undefined> {
    if (this.done) {
      return {
        done: true,
        value: undefined,
      }
    }
    if (!tryIncrement(this.current, this.max, this.to)) {
      this.done = true
      return {
        done: true,
        value: undefined,
      }
    }
    const result: IteratorYieldResult<BuildCandidate> = {
      done: false,
      value: {
        head: this.relics.head[this.current[0]],
        hand: this.relics.hand[this.current[1]],
        body: this.relics.body[this.current[2]],
        feet: this.relics.feet[this.current[3]],
        sphere: this.relics.sphere[this.current[4]],
        rope: this.relics.rope[this.current[5]],
      },
    }
    return result
  }
}

function tryIncrement(current: number[], max: number[], to: number[]): boolean {
  if (!arrLessThan(current, to)) {
    return false
  }
  for (let i = 5; i > 0; i--) {
    if (current[i] < max[i]) {
      current[i]++
      return true
    } else {
      current[i] = 0
    }
  }
  if (current[0] >= to[0]) {
    return false
  }
  current[0]++

  return true
}
// Do not copy this to be used anywhere else
function arrLessThan(left: number[], right: number[]) {
  if (left[0] < right[0]) return true
  else if (left[1] < right[1]) return true
  else if (left[2] < right[2]) return true
  else if (left[3] < right[3]) return true
  else if (left[4] < right[4]) return true
  else if (left[5] < right[5]) return true
  else return false
}
