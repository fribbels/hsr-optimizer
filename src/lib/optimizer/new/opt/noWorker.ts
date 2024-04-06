import { OptimizationRequest, UpdateProgressCallback } from '../request'
import { OptimizationResult } from '../result'
import { iterateBuilds } from './iteration'
import { BuildIndex } from './iteration/build'

import { IteratorCallback } from './iteration'
import { BuildIterator } from './iteration/iterator'

type NoWorkerOptions = {
  numberOfBuilds: number
  updateProgress?: {
    each: number
    callback: UpdateProgressCallback
  }
}

/**
 * Just do the damage calculation etc without WebWorkers
 */
export function noWorker(
  request: OptimizationRequest,
  { numberOfBuilds, updateProgress }: NoWorkerOptions,
): OptimizationResult {
  const pieces = request.relics.pieces

  const limit: BuildIndex = [
    pieces.head.length - 1,
    pieces.hand.length - 1,
    pieces.body.length - 1,
    pieces.feet.length - 1,
    pieces.sphere.length - 1,
    pieces.rope.length - 1,
  ]
  const total = pieces.head.length
    * pieces.hand.length
    * pieces.body.length
    * pieces.feet.length
    * pieces.sphere.length
    * pieces.rope.length

  const timeStart = performance.now()
  const iterationStart: BuildIndex = [0, 0, 0, 0, 0, 0]

  let iterated!: IteratorCallback
  if (updateProgress) {
    iterated = (calculated) => {
      if (calculated % updateProgress.each === 0) updateProgress.callback({ calculated, total })
    }
  }

  const builds = iterateBuilds(
    new BuildIterator(iterationStart, limit, limit),
    request,
    { iterated, numberOfBuilds },
  )

  return {
    builds: builds,
    time: performance.now() - timeStart,
  }
}
