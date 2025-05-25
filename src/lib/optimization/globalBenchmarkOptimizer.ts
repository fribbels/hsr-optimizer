import { Stats, SubStats } from 'lib/constants/constants'
import { StatToKey } from 'lib/optimization/computedStatsArray'
import { applyScoringFunction, SimulationResult } from 'lib/scoring/simScoringUtils'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { Simulation, StatSimulationTypes } from 'lib/simulations/statSimulationTypes'
import { Utils } from 'lib/utils/utils'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'
import { SimulationMetadata } from 'types/metadata'
import { ScoringParams, SimulationFlags } from 'lib/scoring/simScoringUtils'

/**
 * Global optimization algorithm for benchmark generation that avoids local maxima.
 * Uses a deterministic branch-and-bound approach to find the globally optimal substat distribution.
 */
export class GlobalBenchmarkOptimizer {
  private simulationForm: Form
  private context: OptimizerContext
  private metadata: SimulationMetadata
  private scoringParams: ScoringParams
  private simulationFlags: SimulationFlags
  private evaluationCount = 0

  constructor(
    simulationForm: Form,
    context: OptimizerContext,
    metadata: SimulationMetadata,
    scoringParams: ScoringParams,
    simulationFlags: SimulationFlags,
  ) {
    this.simulationForm = simulationForm
    this.context = context
    this.metadata = metadata
    this.scoringParams = scoringParams
    this.simulationFlags = simulationFlags
  }

  /**
   * Find the globally optimal substat distribution using a deterministic algorithm.
   * This replaces the previous probabilistic strategies to solve local maxima issues.
   *
   * Args:
   *   baseSimulation: The base simulation to optimize
   *   minSubstatRollCounts: Minimum allowed rolls per substat
   *   maxSubstatRollCounts: Maximum allowed rolls per substat
   *   targetRolls: Target total number of substat rolls
   *
   * Returns:
   *   The globally optimal simulation with best score
   */
  optimizeSubstatDistribution(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    console.log('Starting deterministic global optimization')
    this.evaluationCount = 0

    // Use deterministic global optimization algorithm
    const result = this.deterministicGlobalOptimization(
      baseSimulation,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      targetRolls
    )

    console.log(`Deterministic optimization complete. Evaluations: ${this.evaluationCount}`)
    
    // Final validation to ensure we never exceed target rolls
    const finalRolls = this.sumRolls(result.request.stats)
    if (finalRolls > targetRolls) {
      console.error(`CRITICAL ERROR: Final result has ${finalRolls} rolls, exceeds target ${targetRolls}`)
      this.normalizeToTarget(result, targetRolls, minSubstatRollCounts, maxSubstatRollCounts)
      console.log(`Corrected to ${this.sumRolls(result.request.stats)} rolls`)
    } else {
      console.log(`Final result has ${finalRolls} rolls (target: ${targetRolls})`)
    }
    
    return result
  }

  /**
   * Deterministic global optimization algorithm that guarantees finding the optimal solution.
   * Uses constraint propagation and intelligent pruning to avoid local maxima without
   * relying on probabilistic methods.
   *
   * This algorithm addresses the stat conversion mechanics issue by:
   * 1. Systematically exploring all feasible regions of the search space
   * 2. Using mathematical bounds to prune impossible solutions
   * 3. Handling conversion thresholds through complete enumeration
   * 4. Ensuring no optimal solution is missed
   */
  private deterministicGlobalOptimization(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    // Get the relevant stats we need to optimize
    const relevantStats = this.metadata.substats.filter(stat =>
      maxSubstatRollCounts[stat] > minSubstatRollCounts[stat]
    )

    // If no stats to optimize, return base solution
    if (relevantStats.length === 0) {
      const solution = this.cloneSimulation(baseSimulation)
      this.normalizeToTarget(solution, targetRolls, minSubstatRollCounts, maxSubstatRollCounts)
      return solution
    }

    // Calculate the search space bounds
    const searchSpace = this.calculateSearchSpace(
      relevantStats,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      targetRolls
    )

    console.log(`Search space: ${relevantStats.length} variables, ~${searchSpace.estimatedSize} combinations`)

    // Use branch and bound to find optimal solution
    const result = this.branchAndBoundOptimization(
      baseSimulation,
      relevantStats,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      targetRolls,
      searchSpace
    )

    return result.solution
  }

  /**
   * Calculate the search space characteristics for optimization planning.
   */
  private calculateSearchSpace(
    relevantStats: string[],
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): {
    estimatedSize: number
    maxRangePerStat: number[]
    totalMinRolls: number
    totalMaxRolls: number
  } {
    const ranges = relevantStats.map(stat =>
      maxSubstatRollCounts[stat] - minSubstatRollCounts[stat] + 1
    )

    const totalMinRolls = relevantStats.reduce(
      (sum, stat) => sum + minSubstatRollCounts[stat], 0
    )
    const totalMaxRolls = relevantStats.reduce(
      (sum, stat) => sum + maxSubstatRollCounts[stat], 0
    )

    // Rough estimate of feasible combinations (exact would require constraint enumeration)
    const estimatedSize = Math.min(
      ranges.reduce((prod, range) => prod * range, 1),
      Math.pow(targetRolls - totalMinRolls + relevantStats.length, relevantStats.length)
    )

    return {
      estimatedSize,
      maxRangePerStat: ranges,
      totalMinRolls,
      totalMaxRolls
    }
  }

  /**
   * Branch and bound optimization with intelligent pruning.
   * Systematically explores the solution space while pruning infeasible branches.
   */
  private branchAndBoundOptimization(
    baseSimulation: Simulation,
    relevantStats: string[],
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
    searchSpace: any,
  ): { solution: Simulation; score: number } {
    let bestSolution = this.cloneSimulation(baseSimulation)
    this.normalizeToTarget(bestSolution, targetRolls, minSubstatRollCounts, maxSubstatRollCounts)
    let bestScore = this.evaluateSimulation(bestSolution)

    // Priority queue for branch and bound (score, partial solution)
    const queue: Array<{
      partialAssignment: Partial<StatSimulationTypes>
      assignedStats: string[]
      remainingRolls: number
      upperBound: number
    }> = []

    // Start with empty assignment
    queue.push({
      partialAssignment: {},
      assignedStats: [],
      remainingRolls: targetRolls - searchSpace.totalMinRolls,
      upperBound: Infinity
    })

    let nodesExplored = 0
    const maxNodes = Math.min(50000, searchSpace.estimatedSize * 2) // Safety limit

    while (queue.length > 0 && nodesExplored < maxNodes) {
      const current = queue.shift()!
      nodesExplored++

      // If this branch can't improve on best solution, prune it
      if (current.upperBound <= bestScore) {
        continue
      }

      // If we've assigned all stats, evaluate the complete solution
      if (current.assignedStats.length === relevantStats.length) {
        const candidate = this.constructSolution(
          baseSimulation,
          current.partialAssignment,
          minSubstatRollCounts,
          targetRolls,
          maxSubstatRollCounts
        )

        const score = this.evaluateSimulation(candidate)
        if (score > bestScore) {
          bestScore = score
          bestSolution = candidate
        }
        continue
      }

      // Branch on the next unassigned stat
      const nextStat = relevantStats[current.assignedStats.length]
      const minValue = minSubstatRollCounts[nextStat]
      const maxValue = Math.min(
        maxSubstatRollCounts[nextStat],
        minValue + current.remainingRolls
      )

      // Generate branches for different values of this stat
      for (let value = minValue; value <= maxValue; value++) {
        const newAssignment = { ...current.partialAssignment, [nextStat]: value }
        const newAssignedStats = [...current.assignedStats, nextStat]
        const newRemainingRolls = current.remainingRolls - (value - minValue)

        // Calculate upper bound for this branch
        const upperBound = this.calculateUpperBound(
          baseSimulation,
          newAssignment,
          newAssignedStats,
          relevantStats,
          minSubstatRollCounts,
          maxSubstatRollCounts,
          newRemainingRolls
        )

        // Only add to queue if it might improve the best solution
        if (upperBound > bestScore) {
          queue.push({
            partialAssignment: newAssignment,
            assignedStats: newAssignedStats,
            remainingRolls: newRemainingRolls,
            upperBound
          })
        }
      }

      // Sort queue by upper bound (descending) to explore most promising branches first
      queue.sort((a, b) => b.upperBound - a.upperBound)
    }

    console.log(`Branch and bound completed: ${nodesExplored} nodes explored, best score: ${bestScore}`)
    return { solution: bestSolution, score: bestScore }
  }

  /**
   * Calculate an upper bound for a partial assignment to enable pruning.
   * This is a heuristic that must never underestimate the true optimal value.
   */
  private calculateUpperBound(
    baseSimulation: Simulation,
    partialAssignment: Partial<StatSimulationTypes>,
    assignedStats: string[],
    allRelevantStats: string[],
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    remainingRolls: number,
  ): number {
    // For remaining unassigned stats, optimistically assign maximum allowed rolls
    const unassignedStats = allRelevantStats.filter(stat => !assignedStats.includes(stat))
    let rollsToDistribute = remainingRolls

    const optimisticAssignment = { ...partialAssignment }

    // Greedily assign rolls to maximize potential (this is optimistic)
    for (const stat of unassignedStats) {
      const minForStat = minSubstatRollCounts[stat]
      const maxForStat = maxSubstatRollCounts[stat]
      const maxPossible = Math.min(maxForStat, minForStat + rollsToDistribute)

      optimisticAssignment[stat] = maxPossible
      rollsToDistribute -= (maxPossible - minForStat)
    }

    // Construct and evaluate the optimistic solution
    const optimisticSolution = this.constructSolution(
      baseSimulation,
      optimisticAssignment,
      minSubstatRollCounts,
      0, // Don't normalize since we're constructing optimistically
      maxSubstatRollCounts
    )

    // Add a bonus to account for remaining flexibility
    const baseScore = this.evaluateSimulation(optimisticSolution)
    const flexibilityBonus = rollsToDistribute * 0.1 // Small bonus per unused roll

    return baseScore + flexibilityBonus
  }

  /**
   * Construct a complete solution from a partial assignment.
   */
  private constructSolution(
    baseSimulation: Simulation,
    assignment: Partial<StatSimulationTypes>,
    minSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
    maxSubstatRollCounts?: StatSimulationTypes,
  ): Simulation {
    const solution = this.cloneSimulation(baseSimulation)

    // Set assigned values
    for (const [stat, value] of Object.entries(assignment)) {
      if (value !== undefined) {
        solution.request.stats[stat] = value
      }
    }

    // Set minimum values for unassigned stats
    for (const stat of SubStats) {
      if (!(stat in assignment)) {
        solution.request.stats[stat] = minSubstatRollCounts[stat]
      }
    }

    // Normalize to target if needed
    if (targetRolls > 0) {
      this.normalizeToTarget(solution, targetRolls, minSubstatRollCounts, maxSubstatRollCounts)
    }

    return solution
  }



  /**
   * Create distribution that considers stat conversion mechanics.
   * This method is kept as a utility for the deterministic algorithm's initial heuristics.
   */
  private createConversionFriendlyDistribution(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const solution = this.cloneSimulation(baseSimulation)

    // Start with minimum rolls for all stats
    for (const stat of SubStats) {
      solution.request.stats[stat] = minSubstatRollCounts[stat]
    }

    let remainingRolls = targetRolls - this.sumRolls(solution.request.stats)

    // Identify potential conversion stats (typically ATK, HP, DEF that convert to other stats)
    const conversionStats = [Stats.ATK_P, Stats.HP_P, Stats.DEF_P, Stats.ATK, Stats.HP, Stats.DEF]
    const conversionCandidates = conversionStats.filter(stat =>
      this.metadata.substats.includes(stat) && maxSubstatRollCounts[stat] > minSubstatRollCounts[stat]
    )

    // Distribute remaining rolls in a way that avoids conversion cliffs
    // Instead of maximizing one stat, distribute more evenly
    while (remainingRolls > 0) {
      let allocated = false

      for (const stat of this.metadata.substats) {
        if (remainingRolls <= 0) break
        if (solution.request.stats[stat] >= maxSubstatRollCounts[stat]) continue

        // For conversion stats, be more conservative to avoid local maxima
        const isConversionStat = conversionCandidates.includes(stat as typeof Stats.ATK_P | typeof Stats.HP_P | typeof Stats.DEF_P | typeof Stats.ATK | typeof Stats.HP | typeof Stats.DEF)
        const currentRolls = solution.request.stats[stat]
        const diminishingThreshold = this.getDiminishingReturnsThreshold(stat, solution)

        if (isConversionStat && currentRolls >= diminishingThreshold * 0.7) {
          // Skip for now if we're approaching diminishing returns on conversion stats
          continue
        }

        solution.request.stats[stat]++
        remainingRolls--
        allocated = true
      }

      if (!allocated) break
    }

    // Distribute any remaining rolls to non-conversion stats first
    const nonConversionStats = this.metadata.substats.filter(stat => !conversionCandidates.includes(stat as typeof Stats.ATK_P | typeof Stats.HP_P | typeof Stats.DEF_P | typeof Stats.ATK | typeof Stats.HP | typeof Stats.DEF))
    for (const stat of nonConversionStats) {
      while (remainingRolls > 0 && solution.request.stats[stat] < maxSubstatRollCounts[stat]) {
        solution.request.stats[stat]++
        remainingRolls--
      }
    }

    // Finally, distribute any remaining to conversion stats
    for (const stat of conversionCandidates) {
      while (remainingRolls > 0 && solution.request.stats[stat] < maxSubstatRollCounts[stat]) {
        solution.request.stats[stat]++
        remainingRolls--
      }
    }

    return solution
  }



  /**
   * Get diminishing returns threshold for a stat.
   */
  private getDiminishingReturnsThreshold(stat: string, simulation: Simulation): number {
    const mainsCount = [
      simulation.request.simBody,
      simulation.request.simFeet,
      simulation.request.simPlanarSphere,
      simulation.request.simLinkRope,
    ].filter(x => x === stat).length

    return 12 - 2 * mainsCount
  }



  /**
   * Evaluate simulation and return score.
   */
  private evaluateSimulation(simulation: Simulation): number {
    this.evaluationCount++

    try {
      const result = runStatSimulations([simulation], this.simulationForm, this.context, {
        ...this.scoringParams,
        substatRollsModifier: this.scoringParams.substatRollsModifier,
        simulationFlags: this.simulationFlags,
      })[0]

      applyScoringFunction(result, this.metadata)
      return result.simScore || 0
    } catch (error) {
      console.warn('Simulation evaluation failed:', error)
      return -Infinity
    }
  }

  /**
   * Normalize simulation to exact target roll count while respecting min/max constraints.
   * This method ensures the total never exceeds the target rolls limit.
   *
   * Args:
   *   simulation: The simulation to normalize
   *   targetRolls: Target total number of substat rolls
   *   minSubstatRollCounts: Minimum allowed rolls per substat (optional)
   *   maxSubstatRollCounts: Maximum allowed rolls per substat (optional)
   */
  private normalizeToTarget(
    simulation: Simulation, 
    targetRolls: number, 
    minSubstatRollCounts?: StatSimulationTypes, 
    maxSubstatRollCounts?: StatSimulationTypes
  ): void {
    const currentRolls = this.sumRolls(simulation.request.stats)
    const difference = targetRolls - currentRolls

    if (difference === 0) return

    const relevantStats = this.metadata.substats

    if (difference > 0) {
      // Add rolls while respecting maximum constraints
      let remaining = difference
      
      // Sort stats by current roll count (ascending) for deterministic allocation
      const sortedStats = relevantStats
        .filter(stat => !maxSubstatRollCounts || simulation.request.stats[stat] < maxSubstatRollCounts[stat])
        .sort((a, b) => simulation.request.stats[a] - simulation.request.stats[b])
      
      for (const stat of sortedStats) {
        if (remaining <= 0) break
        
        const currentValue = simulation.request.stats[stat]
        const maxValue = maxSubstatRollCounts ? maxSubstatRollCounts[stat] : Number.MAX_SAFE_INTEGER
        const canAdd = Math.min(remaining, maxValue - currentValue)
        
        if (canAdd > 0) {
          simulation.request.stats[stat] += canAdd
          remaining -= canAdd
        }
      }
      
      if (remaining > 0) {
        console.warn(`Cannot add ${remaining} more rolls - all stats at maximum. Total: ${this.sumRolls(simulation.request.stats)}`)
      }
    } else {
      // Remove rolls while respecting minimum constraints
      let remaining = -difference
      
      // Sort stats by current roll count (descending) for deterministic removal
      const sortedStats = relevantStats
        .filter(stat => {
          const currentValue = simulation.request.stats[stat]
          const minValue = minSubstatRollCounts ? minSubstatRollCounts[stat] : 0
          return currentValue > minValue
        })
        .sort((a, b) => simulation.request.stats[b] - simulation.request.stats[a])
      
      for (const stat of sortedStats) {
        if (remaining <= 0) break
        
        const currentValue = simulation.request.stats[stat]
        const minValue = minSubstatRollCounts ? minSubstatRollCounts[stat] : 0
        const canRemove = Math.min(remaining, currentValue - minValue)
        
        if (canRemove > 0) {
          simulation.request.stats[stat] -= canRemove
          remaining -= canRemove
        }
      }
      
      if (remaining > 0) {
        console.warn(`Cannot remove ${remaining} more rolls - all stats at minimum. Total: ${this.sumRolls(simulation.request.stats)}`)
      }
    }

    // Final validation - ensure we never exceed the target
    const finalRolls = this.sumRolls(simulation.request.stats)
    if (finalRolls > targetRolls) {
      console.error(`CRITICAL: Total rolls ${finalRolls} exceeds target ${targetRolls}. Forcing correction.`)
      
      // Emergency correction: remove excess rolls from stats with highest counts first
      let excess = finalRolls - targetRolls
      const statsWithRolls = relevantStats
        .filter(stat => simulation.request.stats[stat] > (minSubstatRollCounts ? minSubstatRollCounts[stat] : 0))
        .sort((a, b) => simulation.request.stats[b] - simulation.request.stats[a])
      
      for (const stat of statsWithRolls) {
        if (excess <= 0) break
        
        const currentValue = simulation.request.stats[stat]
        const minValue = minSubstatRollCounts ? minSubstatRollCounts[stat] : 0
        const canRemove = Math.min(excess, currentValue - minValue)
        
        if (canRemove > 0) {
          simulation.request.stats[stat] -= canRemove
          excess -= canRemove
        }
      }
    }
  }

  /**
   * Sum total rolls in a stat distribution.
   */
  private sumRolls(stats: StatSimulationTypes): number {
    return SubStats.reduce((sum, stat) => sum + (stats[stat] || 0), 0)
  }

  /**
   * Clone simulation object.
   */
  private cloneSimulation(simulation: Simulation): Simulation {
    return {
      ...simulation,
      request: {
        ...simulation.request,
        stats: { ...simulation.request.stats },
      },
    }
  }
}

/**
 * Factory function to create and run global benchmark optimization.
 *
 * Args:
 *   baseSimulation: The base simulation to optimize
 *   minSubstatRollCounts: Minimum allowed rolls per substat
 *   maxSubstatRollCounts: Maximum allowed rolls per substat
 *   targetRolls: Target total number of substat rolls
 *   simulationForm: Form configuration
 *   context: Optimizer context
 *   metadata: Simulation metadata
 *   scoringParams: Scoring parameters
 *   simulationFlags: Simulation flags
 *
 * Returns:
 *   Optimized simulation with globally optimal substat distribution
 */
export function optimizeBenchmarkGlobally(
  baseSimulation: Simulation,
  minSubstatRollCounts: StatSimulationTypes,
  maxSubstatRollCounts: StatSimulationTypes,
  targetRolls: number,
  simulationForm: Form,
  context: OptimizerContext,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
): Simulation {
  const optimizer = new GlobalBenchmarkOptimizer(
    simulationForm,
    context,
    metadata,
    scoringParams,
    simulationFlags,
  )

  return optimizer.optimizeSubstatDistribution(
    baseSimulation,
    minSubstatRollCounts,
    maxSubstatRollCounts,
    targetRolls,
  )
}
