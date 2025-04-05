import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { formatOptimizerDisplayData } from 'lib/optimization/optimizer'

export function transformOptimizerDisplayData(x: ComputedStatsArray, key?: string) {
  const optimizerDisplayData = formatOptimizerDisplayData(x)

  if (key) {
    // For optimizer grid syncing with sim table
    optimizerDisplayData.statSim = {
      key: key,
    }
  }

  return optimizerDisplayData
}
