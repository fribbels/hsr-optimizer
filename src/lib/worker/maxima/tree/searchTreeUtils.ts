import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { sumArray } from 'lib/utils/mathUtils'

export function calculateMinMaxMetadata(lower: SubstatCounts, upper: SubstatCounts) {
  const fixedStats: SubstatCounts = {}
  const activeStats: string[] = []
  for (const stat of Object.keys(lower)) {
    if (lower[stat] == upper[stat]) {
      fixedStats[stat] = upper[stat]
    } else {
      activeStats.push(stat)
    }
  }
  const fixedSum = sumArray(Object.values(fixedStats))
  const dimensions = activeStats.length

  return {
    dimensions,
    fixedSum,
    fixedStats,
    activeStats,
  }
}
