import { RelicContext } from './stats/relic'
import { Formula } from './step/formula'

export type OptimizationRequest = {
  formula: Formula
  relics: RelicContext
  options?: {
    numberOfBuilds?: number
    workerSize?: number
  }
}
