import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { formatOptimizerDisplayData } from 'lib/optimization/optimizer'

export function transformOptimizerDisplayData(x: ComputedStatsArray, key?: string) {
  const optimizerDisplayData = formatOptimizerDisplayData(x)

  if (key) {
    // For optimizer grid syncing with sim table
    optimizerDisplayData.statSim = {
      key: key,
    }

    // Using the key string for the ID for optimizer grid, since the id does not need to be a permutation index here
    // @ts-ignore
    optimizerDisplayData.id = key
  }

  return optimizerDisplayData
}
