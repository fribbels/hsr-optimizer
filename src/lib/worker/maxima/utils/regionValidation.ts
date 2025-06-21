import { StatRegion } from 'lib/worker/maxima/types/substatOptimizationTypes'

/**
 * Validates that a StatRegion has consistent internal state
 */
export function validateStatRegion(region: StatRegion): void {
  const allStats = new Set([...region.fixedStats, ...region.variableStats])
  const expectedStats = new Set(region.statNames)

  if (
    allStats.size !== expectedStats.size
    || ![...allStats].every((stat) => expectedStats.has(stat))
  ) {
    throw new Error('StatRegion has inconsistent stat classification')
  }

  // Verify fixed stats are actually fixed
  for (const stat of region.fixedStats) {
    if (region.lower[stat] !== region.upper[stat]) {
      throw new Error(`Fixed stat '${stat}' has different lower/upper bounds`)
    }
  }

  // Verify variable stats are actually variable
  for (const stat of region.variableStats) {
    if (region.lower[stat] >= region.upper[stat]) {
      throw new Error(`Variable stat '${stat}' has invalid range`)
    }
  }
}
