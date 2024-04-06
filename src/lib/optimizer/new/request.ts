import { OptimizationProgress } from './result'
import { RelicContext } from './stats/relic'
import { Formula } from './step/formula'

export type OptimizationRequest = {
  formula: Formula
  relics: RelicContext
}

export type OptimizationOptions = {
  build?: {
    size: number
  }
  worker?: {
    size: number
  }
  /**
   * Send a progress update (implementation dependant) every
   * ```each``` builds calculated.
   */
  updateProgress?: {
    /**
     * Has to be an integer > 0
     */
    each: number
    callback: UpdateProgressCallback
  }
}

export type UpdateProgressCallback = (progress: OptimizationProgress) => void
