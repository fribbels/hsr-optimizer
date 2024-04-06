import { deserialize } from '../../format'
import { OptimizationRequest } from '../../request'
import { iterateBuilds } from '../iteration'
import { IteratorCallback } from '../iteration'
import { BuildIterator } from '../iteration/iterator'
import { WorkerProgress, WorkerResult, WorkerRunRequest } from './events'

self.onmessage = (event: MessageEvent<WorkerRunRequest>) => {
  const request = deserialize<OptimizationRequest>(event.data.request)
  const pieces = request.relics.pieces
  const { numberOfBuilds, sendUpdate } = event.data.options

  let iterated!: IteratorCallback
  if (sendUpdate) {
    iterated = (it) => {
      if (it % sendUpdate === 0) sendProgress(it, event.data.filter.total)
    }
  }
  const builds = iterateBuilds(
    new BuildIterator(event.data.filter.from, event.data.filter.to, [
      pieces.head.length,
      pieces.hand.length,
      pieces.body.length,
      pieces.feet.length,
      pieces.sphere.length,
      pieces.rope.length,
    ]),
    request,
    { numberOfBuilds, iterated },
  )

  // TODO: send progress?
  const resultMsg: WorkerResult = {
    type: 'result',
    filter: event.data.filter,
    result: builds,
  }
  postMessage(resultMsg)
}

function sendProgress(iterated: number, total: number) {
  const msg: WorkerProgress = {
    type: 'update',
    calculated: iterated,
    total,
  }
  postMessage(msg)
}
