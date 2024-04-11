import { calculateFormula } from '../../calculator'
import { OptimizationRequest } from '../../request'
import { Build, BuildIndex } from './build'
import { BuildIterator } from './iterator'

export type IteratorCallback = (iterated: number, curr: BuildIndex) => void

type IterationOptions = {
  iterated?: IteratorCallback
  numberOfBuilds: number
}

export function iterateBuilds(
  iterator: BuildIterator,
  request: OptimizationRequest,
  { iterated, numberOfBuilds }: IterationOptions,
) {
  const pieces = request.relics.pieces
  const builds = new Array(numberOfBuilds + 1) as Build[]

  for (const buildIdx of { [Symbol.iterator]: () => iterator }) {
    const build = {
      head: pieces.head[buildIdx[0]],
      hand: pieces.hand[buildIdx[1]],
      body: pieces.body[buildIdx[2]],
      feet: pieces.feet[buildIdx[3]],
      sphere: pieces.sphere[buildIdx[4]],
      rope: pieces.rope[buildIdx[5]],
    }

    const result = calculateFormula(build, request.formula, request.relics.sets)

    builds.push({
      ...build,
      value: result,
    })
    builds.sort((b1, b2) => b2.value - b1.value)
    builds.length = numberOfBuilds

    if (iterated) {
      iterated(iterator.iterated, buildIdx)
    }
  }

  return builds
}
