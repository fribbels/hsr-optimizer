import { OptimizationProgress } from '../../result'
import { Build, BuildIndex } from '../iteration/build'

/**
 * A worker job is to iterate the relics from ```filter.from``` to
 * ```filter.to```, building a n-list of highest builds. Afterward, the main
 * thread will reassemble all the n-list from m workers, sorting and creating
 * the final n-list themself.
 */
export type WorkerRunRequest = {
  type: 'optimize'
  // Making sure that the payload is OptimizationRequest
  requestType: 'OptimizationRequest'
  request: string
  options: {
    numberOfBuilds: number
    sendUpdate?: number
  }
  filter: {
    // a 6-length number array so that this worker know where to start indexing
    // Order: build.build.head, build.build.hand, build.build.body, build.build.feet, build.build.sphere, build.build.rope
    from: BuildIndex
    to: BuildIndex
    total: number
  }
}

export type TypedEvent = MessageEvent<{ type: string }>

export type WorkerResult = {
  type: 'result'
  filter: WorkerRunRequest['filter']
  result: Build[]
}

export type WorkerProgress = OptimizationProgress & {
  type: 'update'
}

type ResultEvent = MessageEvent<WorkerResult>
type ProgressEvent = MessageEvent<WorkerProgress>

export function isResultEvent(event: TypedEvent): event is ResultEvent {
  return event.data.type === 'result'
}

export function isProgressEvent(event: TypedEvent): event is ProgressEvent {
  return event.data.type === 'update'
}
