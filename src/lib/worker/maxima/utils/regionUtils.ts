// src/optimization/utils/regionUtils.ts

import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { StatRegion } from 'lib/worker/maxima/types/substatOptimizationTypes'

export interface RegionBounds {
  readonly lower: SubstatCounts
  readonly upper: SubstatCounts
}

/**
 * Creates a StatRegion from bounds, classifying stats as fixed or variable.
 * Fixed stats: lower[stat] === upper[stat]
 * Variable stats: lower[stat] < upper[stat]
 */
export function createRegionFromBounds(
  bounds: RegionBounds,
  statNames: string[],
): StatRegion {
  const fixedStats: string[] = []
  const variableStats: string[] = []

  for (const stat of statNames) {
    const lowerValue = bounds.lower[stat]
    const upperValue = bounds.upper[stat]

    // Check if stat exists in bounds
    if (lowerValue === undefined || upperValue === undefined) {
      throw new Error(`Stat '${stat}' missing from bounds`)
    }

    // Validate bounds relationship
    if (lowerValue > upperValue) {
      throw new Error(`Invalid bounds for '${stat}': lower (${lowerValue}) > upper (${upperValue})`)
    }

    // Classify stat type
    if (lowerValue === upperValue) {
      fixedStats.push(stat)
    } else {
      variableStats.push(stat)
    }
  }

  return {
    lower: bounds.lower,
    upper: bounds.upper,
    statNames: statNames,
    variableStats: variableStats,
    fixedStats: fixedStats,
  }
}

/**
 * Calculates the volume of a region (product of all variable stat ranges)
 */
export function calculateRegionVolume(region: StatRegion): number {
  let volume = 1
  for (const stat of region.variableStats) {
    const range = region.upper[stat] - region.lower[stat]
    if (range > 0) {
      volume *= range
    }
  }
  return Math.max(volume, 1)
}

/**
 * Gets the range of a specific stat in a region
 */
export function getStatRange(region: StatRegion, stat: string): number {
  if (!region.statNames.includes(stat)) {
    throw new Error(`Stat '${stat}' not found in region`)
  }
  return region.upper[stat] - region.lower[stat]
}
