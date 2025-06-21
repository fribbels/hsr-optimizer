// src/optimization/utils/substatSpreadUtils.ts

import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { StatRegion } from 'lib/worker/maxima/types/substatOptimizationTypes'
import { createRegionFromBounds } from 'lib/worker/maxima/utils/regionUtils'

/**
 * Calculates the total budget consumed by a SubstatCounts distribution.
 * Fixed decimal stats (like SPD = 4.308) are rounded up (count as 5 against budget).
 */
export function calculateSubstatSum(stats: SubstatCounts, region: StatRegion): number {
  let sum = 0
  for (const [stat, value] of Object.entries(stats)) {
    if (region.fixedStats.includes(stat) && !Number.isInteger(value)) {
      // SPD = 4.308 counts as 5 against budget
      sum += Math.ceil(value)
    } else {
      sum += value
    }
  }
  return sum
}

/**
 * Redistributes budget using round-robin with priority ordering and fallback.
 *
 * @param representative - Current substat distribution to modify
 * @param amount - Amount to redistribute (+1 to add, -1 to remove)
 * @param region - Region bounds for validation
 * @param statPriority - Ordered array of stat names by priority
 * @param excludeStat - Stat to skip during redistribution (usually split dimension)
 * @returns true if redistribution succeeded, false if no capacity available
 */
export function redistributeBudget(
  representative: SubstatCounts,
  amount: number,
  region: StatRegion,
  statPriority: readonly string[],
  excludeStat: string,
): boolean {
  if (amount === 0) return true

  const isAddition = amount > 0
  const adjustmentsNeeded = Math.abs(amount)

  // Create priority-ordered list of variable stats, excluding the split dimension
  const availableStats = statPriority.filter((stat) => region.variableStats.includes(stat) && stat !== excludeStat)

  if (availableStats.length === 0) return false

  // For each adjustment, try all stats until one accepts it
  for (let i = 0; i < adjustmentsNeeded; i++) {
    let adjusted = false

    // Try stats in priority order (round-robin starting position, then try all)
    const startIndex = i % availableStats.length

    for (let j = 0; j < availableStats.length; j++) {
      const statIndex = (startIndex + j) % availableStats.length

      // For addition: use priority order, for removal: use reverse priority order
      const stat = isAddition
        ? availableStats[statIndex]
        : availableStats[availableStats.length - 1 - statIndex]

      const newValue = representative[stat] + (isAddition ? 1 : -1)

      // Check if adjustment is within bounds
      if (newValue >= region.lower[stat] && newValue <= region.upper[stat]) {
        representative[stat] = newValue
        adjusted = true
        break
      }
    }

    // If no stat could accept this adjustment, redistribution failed
    if (!adjusted) {
      return false
    }
  }

  return true
}

/**
 * Generates a representative point for a child region during tree splitting.
 * Creates child region internally based on parent region and split parameters.
 * Uses the constraint-repair strategy: set split dimension, then redistribute budget.
 *
 * @param parentRegion - Parent region bounds before splitting
 * @param splitDimension - The stat being split on
 * @param splitValue - The split threshold value
 * @param targetSum - Required total budget
 * @param statPriority - Priority ordering for redistribution
 * @param side - Which side of the split ('left' or 'right')
 * @returns Best representative found, or null if region is unsplittable
 */
export function generateSplitRepresentative(
  parentRegion: StatRegion,
  splitDimension: string,
  splitValue: number,
  targetSum: number,
  statPriority: readonly string[],
  side: 'left' | 'right',
): SubstatCounts | null {
  const parentLower = parentRegion.lower[splitDimension]
  const parentUpper = parentRegion.upper[splitDimension]

  // FIXED: Allow splitValue to equal bounds (changed <= to <)
  if (splitValue < parentLower || splitValue > parentUpper) {
    return null // Invalid split value
  }

  // Create child region bounds
  const childBounds = {
    lower: { ...parentRegion.lower },
    upper: { ...parentRegion.upper },
  }

  if (side === 'left') {
    childBounds.upper[splitDimension] = splitValue - 1
  } else {
    childBounds.lower[splitDimension] = splitValue
  }

  // ADDED: Validate resulting child bounds are valid
  if (childBounds.lower[splitDimension] > childBounds.upper[splitDimension]) {
    return null // Would create invalid child region
  }

  // Now safe to create child region
  const childRegion = createRegionFromBounds(childBounds, parentRegion.statNames)

  // Handle point regions (all variable stats are fixed)
  const isPointRegion = childRegion.variableStats.every(
    (stat: string) => childRegion.lower[stat] === childRegion.upper[stat],
  )

  if (isPointRegion) {
    const result: SubstatCounts = {}
    for (const stat of childRegion.statNames) {
      result[stat] = childRegion.lower[stat]
    }

    const sum = calculateSubstatSum(result, childRegion)
    return sum === targetSum ? result : null
  }

  // Calculate region midpoint for the split dimension
  const regionMidpoint = (childRegion.lower[splitDimension] + childRegion.upper[splitDimension]) / 2

  // Determine starting value and direction based on side
  let currentValue: number
  let direction: number
  let boundaryValue: number

  if (side === 'left') {
    // Left side: start at splitValue-1, move toward child region midpoint
    currentValue = splitValue - 1
    direction = -1
    boundaryValue = Math.ceil(regionMidpoint)
  } else {
    // Right side: start at splitValue, move toward child region midpoint
    currentValue = splitValue
    direction = 1
    boundaryValue = Math.floor(regionMidpoint)
  }

  let bestRepresentative: SubstatCounts | null = null
  let bestDistance = Infinity

  // Try values moving toward midpoint
  while (
    (side === 'left' && currentValue >= boundaryValue)
    || (side === 'right' && currentValue <= boundaryValue)
  ) {
    // Skip if currentValue is outside child region bounds
    if (currentValue < childRegion.lower[splitDimension] || currentValue > childRegion.upper[splitDimension]) {
      currentValue += direction
      continue
    }

    const representative = tryGenerateRepresentative(
      childRegion,
      splitDimension,
      currentValue,
      targetSum,
      statPriority,
    )

    if (representative) {
      const distanceToMidpoint = Math.abs(currentValue - regionMidpoint)

      if (distanceToMidpoint < bestDistance) {
        bestDistance = distanceToMidpoint
        bestRepresentative = { ...representative }
      }
    }

    currentValue += direction
  }

  return bestRepresentative
}

/**
 * Helper function to attempt generating a representative with a specific split dimension value.
 * Uses redistribution to satisfy sum constraints.
 */
function tryGenerateRepresentative(
  region: StatRegion,
  splitDimension: string,
  splitValue: number,
  targetSum: number,
  statPriority: readonly string[],
): SubstatCounts | null {
  const result: SubstatCounts = {}

  // Initialize all stats to their lower bounds
  for (const stat of region.statNames) {
    result[stat] = region.lower[stat]
  }

  // Set the split dimension to the target value
  result[splitDimension] = splitValue

  // Calculate budget difference
  const currentSum = calculateSubstatSum(result, region)
  const budgetDiff = targetSum - currentSum

  // Redistribute budget if needed
  if (budgetDiff !== 0) {
    const redistributionSuccess = redistributeBudget(
      result,
      budgetDiff,
      region,
      statPriority,
      splitDimension,
    )

    if (!redistributionSuccess) {
      return null
    }
  }

  // Final validation
  const finalSum = calculateSubstatSum(result, region)
  if (finalSum !== targetSum) {
    return null
  }

  // Verify all bounds are satisfied
  for (const stat of region.statNames) {
    if (result[stat] < region.lower[stat] || result[stat] > region.upper[stat]) {
      return null
    }
  }

  return result
}

/**
 * Utility to check if a region has any variable stats that can be split.
 * A region is splittable if it has at least one variable stat with range >= 2.
 */
export function isRegionSplittable(region: StatRegion, minSplitRange: number = 2): boolean {
  return region.variableStats.some((stat) => {
    const range = region.upper[stat] - region.lower[stat]
    return range >= minSplitRange
  })
}

/**
 * Gets splittable dimensions ordered by range size (largest first).
 * Used for choosing split dimensions in order of preference.
 */
export function getSplittableDimensions(region: StatRegion, minSplitRange: number = 2): string[] {
  const candidates: Array<{ stat: string, range: number }> = []

  for (const stat of region.variableStats) {
    const range = region.upper[stat] - region.lower[stat]
    if (range >= minSplitRange) {
      candidates.push({ stat, range })
    }
  }

  // Sort by range (largest first)
  candidates.sort((a, b) => b.range - a.range)

  return candidates.map((c) => c.stat)
}
