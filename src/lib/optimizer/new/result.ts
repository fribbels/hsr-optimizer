import { Build, BuildIndex } from './opt/iteration/build'

export type OptimizationResult = {
  builds: Build[]
  time: number
}

export type OptimizationProgress = {
  calculated: number
  total: number
  /**
   * This is useful for debugging, I'm not sure where to hide the flag to turn
   * this on so currently never set.
   */
  index?: {
    first: BuildIndex
    currentIndex: BuildIndex
    last: BuildIndex
  }
}
