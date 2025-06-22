// src/optimization/utils/substatSpreadUtils.ts

import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { StatRegion } from 'lib/worker/maxima/types/substatOptimizationTypes'
import { createRegionFromBounds } from 'lib/worker/maxima/utils/regionUtils'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

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
 * Exhaustive redistribution that tries all possible ways to redistribute budget
 * until one works or all combinations fail.
 */
function redistributeBudgetExhaustively(
  representative: SubstatCounts,
  amount: number,
  region: StatRegion,
  statPriority: readonly string[],
  excludeStat: string,
  validator: SubstatDistributionValidator,
): boolean {
  if (amount === 0) return true

  const availableStats = statPriority.filter((stat) => region.variableStats.includes(stat) && stat !== excludeStat)

  if (availableStats.length === 0) return false

  // Generate all possible redistribution patterns
  const redistributionPatterns = generateRedistributionPatterns(
    amount,
    availableStats,
    region,
    representative,
  )

  // Try each pattern until one works
  for (const pattern of redistributionPatterns) {
    const testRep = { ...representative }

    // Apply this redistribution pattern
    let validPattern = true
    for (const [stat, adjustment] of Object.entries(pattern)) {
      const newValue = testRep[stat] + adjustment
      if (newValue < region.lower[stat] || newValue > region.upper[stat]) {
        validPattern = false
        break
      }
      testRep[stat] = newValue
    }

    if (validPattern) {
      // Check if this pattern creates a valid game distribution
      if (validator.isValidDistribution(testRep)) {
        // Success! Apply this pattern to the original
        Object.assign(representative, testRep)
        return true
      }
    }
  }

  return false // All patterns failed
}

/**
 * Generates all possible ways to distribute adjustments across available stats.
 * Returns patterns sorted by preference (simpler patterns first).
 */
function generateRedistributionPatterns(
  amount: number,
  availableStats: string[],
  region: StatRegion,
  representative: SubstatCounts,
): Array<Record<string, number>> {
  const patterns: Array<Record<string, number>> = []
  const isAddition = amount > 0
  const adjustmentsNeeded = Math.abs(amount)

  // Generate all combinations of distributing adjustmentsNeeded across availableStats
  function generateCombinations(
    remaining: number,
    statIndex: number,
    currentPattern: Record<string, number>,
  ): void {
    if (remaining === 0) {
      patterns.push({ ...currentPattern })
      return
    }

    if (statIndex >= availableStats.length) {
      return // No more stats to try
    }

    const stat = availableStats[statIndex]
    const currentValue = representative[stat]

    // Calculate max adjustment possible for this stat
    const maxAdjustment = isAddition
      ? Math.min(remaining, region.upper[stat] - currentValue)
      : Math.min(remaining, currentValue - region.lower[stat])

    // Try all possible adjustments for this stat (0 to maxAdjustment)
    for (let adjustment = 0; adjustment <= maxAdjustment; adjustment++) {
      const newPattern = { ...currentPattern }
      if (adjustment > 0) {
        newPattern[stat] = isAddition ? adjustment : -adjustment
      }

      generateCombinations(remaining - adjustment, statIndex + 1, newPattern)
    }
  }

  generateCombinations(adjustmentsNeeded, 0, {})

  // Sort patterns by preference
  patterns.sort((a, b) => {
    const aStatsCount = Object.keys(a).length
    const bStatsCount = Object.keys(b).length

    if (aStatsCount !== bStatsCount) {
      return aStatsCount - bStatsCount // Prefer simpler patterns (fewer stats)
    }

    // Tie-break by priority order (earlier stats in priority list preferred)
    const aFirstStat = Object.keys(a)[0]
    const bFirstStat = Object.keys(b)[0]
    const aIndex = availableStats.indexOf(aFirstStat)
    const bIndex = availableStats.indexOf(bFirstStat)
    return aIndex - bIndex
  })

  return patterns
}
function redistributeBudgetRoundRobin(
  representative: SubstatCounts,
  amount: number,
  region: StatRegion,
  statPriority: readonly string[],
  excludeStat: string,
): boolean {
  if (amount === 0) return true

  const isAddition = amount > 0
  let remaining = Math.abs(amount)

  const availableStats = statPriority.filter((stat) => region.variableStats.includes(stat) && stat !== excludeStat)

  if (availableStats.length === 0) return false

  // TARGETED FIX: Simpler, more robust approach
  while (remaining > 0) {
    let madeProgress = false

    for (const stat of availableStats) {
      if (remaining <= 0) break

      const currentValue = representative[stat]
      const newValue = currentValue + (isAddition ? 1 : -1)

      if (newValue >= region.lower[stat] && newValue <= region.upper[stat]) {
        representative[stat] = newValue
        remaining--
        madeProgress = true
      }
    }

    if (!madeProgress) return false // Can't make any more progress
  }

  return true
}

/**
 * Generates a representative point for a child region during tree splitting.
 * Creates child region internally based on parent region and split parameters.
 * Uses exhaustive redistribution to find valid game distributions.
 *
 * @param parentRegion - Parent region bounds before splitting
 * @param splitDimension - The stat being split on
 * @param splitValue - The split threshold value
 * @param targetSum - Required total budget
 * @param statPriority - Priority ordering for redistribution
 * @param side - Which side of the split ('left' or 'right')
 * @param validator - Game validator for testing distributions
 * @returns Best representative found, or null if region is unsplittable
 */
export function generateSplitRepresentative(
  parentRegion: StatRegion,
  splitDimension: string,
  splitValue: number,
  targetSum: number,
  statPriority: readonly string[],
  side: 'left' | 'right',
  validator: SubstatDistributionValidator,
): SubstatCounts | null {
  const parentLower = parentRegion.lower[splitDimension]
  const parentUpper = parentRegion.upper[splitDimension]

  // Validate split value is within parent bounds
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

  // Validate resulting child bounds are valid
  if (childBounds.lower[splitDimension] > childBounds.upper[splitDimension]) {
    return null // Would create invalid child region
  }

  // Create child region
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
    if (sum === targetSum && validator.isValidDistribution(result)) {
      return result
    }
    return null
  }

  // Calculate region midpoint for the split dimension
  const regionMidpoint = (childRegion.lower[splitDimension] + childRegion.upper[splitDimension]) / 2

  // Determine starting value and search direction based on side
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

    const representative = tryGenerateRepresentativeWithExhaustiveRedistribution(
      childRegion,
      splitDimension,
      currentValue,
      targetSum,
      statPriority,
      validator,
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
 * Enhanced helper function that tries exhaustive redistribution first,
 * then falls back to round-robin if exhaustive is too expensive.
 */
function tryGenerateRepresentativeWithExhaustiveRedistribution(
  region: StatRegion,
  splitDimension: string,
  splitValue: number,
  targetSum: number,
  statPriority: readonly string[],
  validator: SubstatDistributionValidator,
): SubstatCounts | null {
  const result: SubstatCounts = {}

  // Initialize to lower bounds
  for (const stat of region.statNames) {
    result[stat] = region.lower[stat]
  }

  // Set split dimension
  result[splitDimension] = splitValue

  // DIVERSITY FIX: Ensure minimum 5 non-zero stats before proceeding
  const currentNonZero = Object.entries(result).filter(([k, v]) => v > 0).length

  if (currentNonZero < 5) {
    // Get candidate stats that can be set to 1
    const candidates = statPriority.filter((stat) => result[stat] === 0 && region.upper[stat] > 0)

    const needed = 5 - currentNonZero

    // Set first 'needed' candidates to 1
    for (let i = 0; i < Math.min(needed, candidates.length); i++) {
      result[candidates[i]] = 1
    }

    // Check if we achieved diversity
    const newNonZero = Object.entries(result).filter(([k, v]) => v > 0).length
    if (newNonZero < 5) {
      return null // Cannot achieve minimum diversity
    }
  }

  // Continue with existing redistribution logic...
  const currentSum = calculateSubstatSum(result, region)
  const budgetDiff = targetSum - currentSum

  // Redistribute budget if needed
  if (budgetDiff !== 0) {
    const availableStats = statPriority.filter((stat) => region.variableStats.includes(stat) && stat !== splitDimension)

    // Use exhaustive redistribution for small problems, round-robin for large ones
    const maxAdjustment = Math.abs(budgetDiff)
    const useExhaustive = maxAdjustment <= 10 && availableStats.length <= 5

    let redistributionSuccess = false

    if (useExhaustive) {
      // Try exhaustive redistribution first
      redistributionSuccess = redistributeBudgetExhaustively(
        result,
        budgetDiff,
        region,
        statPriority,
        splitDimension,
        validator,
      )
    }

    if (!redistributionSuccess) {
      // Fall back to round-robin redistribution
      redistributionSuccess = redistributeBudgetRoundRobin(
        result,
        budgetDiff,
        region,
        statPriority,
        splitDimension,
      )

      // If round-robin succeeded, validate the result
      if (redistributionSuccess && !validator.isValidDistribution(result)) {
        redistributionSuccess = false
      }
    }

    if (!redistributionSuccess) {
      debugRedistributionFailure(region, splitDimension, splitValue, targetSum, statPriority, validator)
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

// Add this debugging function to understand WHY redistribution fails

function debugRedistributionFailure(
  region: StatRegion,
  splitDimension: string,
  splitValue: number,
  targetSum: number,
  statPriority: readonly string[],
  validator: SubstatDistributionValidator,
): void {
  console.log(`🔍 DEBUGGING REDISTRIBUTION FAILURE:`)
  console.log(`  Region bounds: ${splitDimension} [${region.lower[splitDimension]}, ${region.upper[splitDimension]}]`)

  // Try the basic approach first
  const result: SubstatCounts = {}

  // Initialize to lower bounds
  for (const stat of region.statNames) {
    result[stat] = region.lower[stat]
  }

  // Set split dimension
  result[splitDimension] = splitValue
  console.log(`  After setting ${splitDimension}=${splitValue}:`, JSON.stringify(result))

  // Calculate budget
  const currentSum = calculateSubstatSum(result, region)
  const budgetDiff = targetSum - currentSum
  console.log(`  Current sum: ${currentSum}, Target: ${targetSum}, Need: ${budgetDiff}`)

  // Check if basic distribution is already invalid
  if (!validator.isValidDistribution(result)) {
    console.log(`  ❌ BASIC DISTRIBUTION ALREADY INVALID!`)
    const reason = getValidationFailureReason(result)
    console.log(`  Reason: ${reason}`)
    return
  }

  if (budgetDiff === 0) {
    console.log(`  ✅ Perfect sum, no redistribution needed`)
    return
  }

  // Check available stats for redistribution
  const availableStats = statPriority.filter((stat) => region.variableStats.includes(stat) && stat !== splitDimension)
  console.log(`  Available stats for redistribution: [${availableStats.join(', ')}]`)

  // Check capacity for each stat
  console.log(`  Stat capacities:`)
  for (const stat of availableStats) {
    const current = result[stat]
    const lower = region.lower[stat]
    const upper = region.upper[stat]
    const canAdd = upper - current
    const canRemove = current - lower
    console.log(`    ${stat}: current=${current}, bounds=[${lower},${upper}], can add=${canAdd}, can remove=${canRemove}`)
  }

  // Check if redistribution is mathematically possible
  const totalAddCapacity = availableStats.reduce((sum, stat) => sum + (region.upper[stat] - result[stat]), 0)
  const totalRemoveCapacity = availableStats.reduce((sum, stat) => sum + (result[stat] - region.lower[stat]), 0)

  console.log(`  Total add capacity: ${totalAddCapacity}`)
  console.log(`  Total remove capacity: ${totalRemoveCapacity}`)

  if (budgetDiff > 0 && totalAddCapacity < budgetDiff) {
    console.log(`  ❌ INSUFFICIENT ADD CAPACITY: need ${budgetDiff}, have ${totalAddCapacity}`)
    return
  }

  if (budgetDiff < 0 && totalRemoveCapacity < Math.abs(budgetDiff)) {
    console.log(`  ❌ INSUFFICIENT REMOVE CAPACITY: need ${Math.abs(budgetDiff)}, have ${totalRemoveCapacity}`)
    return
  }

  console.log(`  ✅ Mathematically possible, trying redistribution...`)

  // Try simple redistribution
  const testResult = { ...result }
  const redistributionSuccess = redistributeBudgetRoundRobin(
    testResult,
    budgetDiff,
    region,
    statPriority,
    splitDimension,
  )

  if (!redistributionSuccess) {
    console.log(`  ❌ ROUND-ROBIN REDISTRIBUTION FAILED`)
    return
  }

  console.log(`  After redistribution:`, JSON.stringify(testResult))
  const finalSum = calculateSubstatSum(testResult, region)
  console.log(`  Final sum: ${finalSum}`)

  if (finalSum !== targetSum) {
    console.log(`  ❌ SUM MISMATCH after redistribution`)
    return
  }

  // Check validator
  if (!validator.isValidDistribution(testResult)) {
    console.log(`  ❌ GAME VALIDATOR REJECTED the distribution`)
    const reason = getValidationFailureReason(testResult)
    console.log(`  Validation failure reason: ${reason}`)
    return
  }

  console.log(`  ✅ Should have succeeded - check algorithm logic!`)
}

// Add this to getValidationFailureReason to get better diagnostics
function getValidationFailureReason(representative: SubstatCounts): string {
  try {
    // Check basic sum (this function should get targetSum as parameter, but for debugging)
    const sum = Object.values(representative).reduce((a, b) => a + b, 0)

    // Check non-zero stats count
    const nonZeroStats = Object.entries(representative).filter(([k, v]) => v > 0)
    if (nonZeroStats.length < 5) {
      return `INSUFFICIENT_DIVERSITY: only ${nonZeroStats.length} non-zero stats, need ≥5`
    }

    // Check if any stat has impossible values
    const impossibleStats = nonZeroStats.filter(([stat, value]) => value > 36)
    if (impossibleStats.length > 0) {
      return `IMPOSSIBLE_VALUES: ${impossibleStats.map(([s, v]) => `${s}:${v}`).join(', ')}`
    }

    // Check individual stat limits (based on game rules)
    const problematicStats = nonZeroStats.filter(([stat, value]) => {
      // Each stat can appear on max 5 pieces, 6 rolls per piece = 30 max
      if (value > 30) return true
      return false
    })

    if (problematicStats.length > 0) {
      return `EXCEEDS_PIECE_LIMITS: ${problematicStats.map(([s, v]) => `${s}:${v}`).join(', ')}`
    }

    return 'COMPLEX_GAME_CONSTRAINT_VIOLATION'
  } catch (error) {
    // @ts-ignore
    return `VALIDATION_ERROR: ${error.message}`
  }
}

/**
 * Helper function to attempt generating a representative with a specific split dimension value.
 * Uses round-robin redistribution to satisfy sum constraints.
 * DEPRECATED: Use tryGenerateRepresentativeWithExhaustiveRedistribution instead.
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

  // Redistribute budget if needed using round-robin
  if (budgetDiff !== 0) {
    const redistributionSuccess = redistributeBudgetRoundRobin(
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
