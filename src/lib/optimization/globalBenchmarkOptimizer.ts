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
 * Uses multiple strategies to find the globally optimal substat distribution.
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
   * Find the globally optimal substat distribution using multiple optimization strategies.
   * 
   * Args:
   *   baseSimulation: The base simulation to optimize
   *   minSubstatRollCounts: Minimum allowed rolls per substat
   *   maxSubstatRollCounts: Maximum allowed rolls per substat
   *   targetRolls: Target total number of substat rolls
   * 
   * Returns:
   *   The optimal simulation with best score
   */
  optimizeSubstatDistribution(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    console.log('Starting global benchmark optimization')
    this.evaluationCount = 0

    const strategies = [
      () => this.geneticAlgorithmOptimization(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls),
      () => this.simulatedAnnealingOptimization(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls),
      () => this.multiStartGreedyOptimization(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls),
      () => this.hybridOptimization(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls),
    ]

    let bestResult = baseSimulation
    let bestScore = -Infinity

    // Try each strategy and keep the best result
    for (const strategy of strategies) {
      try {
        const result = strategy()
        const score = this.evaluateSimulation(result)

        if (score > bestScore) {
          bestScore = score
          bestResult = result
        }
      } catch (error) {
        console.warn('Strategy failed:', error)
      }
    }

    console.log(`Optimization complete. Evaluations: ${this.evaluationCount}, Best score: ${bestScore}`)
    return bestResult
  }

  /**
   * Genetic Algorithm optimization for global search.
   * Maintains population diversity to explore different regions of the solution space.
   */
  private geneticAlgorithmOptimization(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const populationSize = 50
    const generations = 30
    const mutationRate = 0.3
    const crossoverRate = 0.7

    // Initialize population with diverse starting points
    let population = this.generateInitialPopulation(
      baseSimulation,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      targetRolls,
      populationSize,
    )

    for (let generation = 0; generation < generations; generation++) {
      // Evaluate fitness
      const fitness = population.map(sim => this.evaluateSimulation(sim))

      // Selection: Tournament selection
      const newPopulation: Simulation[] = []

      for (let i = 0; i < populationSize; i++) {
        if (Math.random() < crossoverRate && newPopulation.length < populationSize - 1) {
          // Crossover
          const parent1 = this.tournamentSelection(population, fitness)
          const parent2 = this.tournamentSelection(population, fitness)
          const offspring = this.crossover(parent1, parent2, targetRolls)
          newPopulation.push(...offspring)
        } else {
          // Direct selection
          newPopulation.push(this.tournamentSelection(population, fitness))
        }
      }

      // Mutation
      population = newPopulation.slice(0, populationSize).map(sim => {
        if (Math.random() < mutationRate) {
          return this.mutate(sim, minSubstatRollCounts, maxSubstatRollCounts, targetRolls)
        }
        return sim
      })

      // Apply local improvement to best candidates
      if (generation % 5 === 0) {
        const sortedIndices = fitness
          .map((score, index) => ({ score, index }))
          .sort((a, b) => b.score - a.score)

        for (let i = 0; i < Math.min(3, population.length); i++) {
          const index = sortedIndices[i].index
          population[index] = this.localImprovement(
            population[index],
            minSubstatRollCounts,
            maxSubstatRollCounts,
            targetRolls,
          )
        }
      }
    }

    // Return best individual
    const finalFitness = population.map(sim => this.evaluateSimulation(sim))
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness))
    return population[bestIndex]
  }

  /**
   * Simulated Annealing for escaping local maxima.
   * Probabilistically accepts worse solutions early to explore the solution space.
   */
  private simulatedAnnealingOptimization(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    let currentSolution = this.cloneSimulation(baseSimulation)
    this.normalizeToTarget(currentSolution, targetRolls)

    let currentScore = this.evaluateSimulation(currentSolution)
    let bestSolution = this.cloneSimulation(currentSolution)
    let bestScore = currentScore

    const initialTemperature = 1000
    const coolingRate = 0.95
    const minTemperature = 1
    let temperature = initialTemperature

    const maxIterations = 500

    for (let iteration = 0; iteration < maxIterations && temperature > minTemperature; iteration++) {
      // Generate neighbor solution
      const neighbor = this.generateNeighbor(
        currentSolution,
        minSubstatRollCounts,
        maxSubstatRollCounts,
        targetRolls,
      )

      const neighborScore = this.evaluateSimulation(neighbor)
      const scoreDelta = neighborScore - currentScore

      // Accept better solutions or probabilistically accept worse ones
      const acceptanceProbability = scoreDelta > 0 ? 1 : Math.exp(scoreDelta / temperature)

      if (Math.random() < acceptanceProbability) {
        currentSolution = neighbor
        currentScore = neighborScore

        if (neighborScore > bestScore) {
          bestSolution = this.cloneSimulation(neighbor)
          bestScore = neighborScore
        }
      }

      temperature *= coolingRate
    }

    return bestSolution
  }

  /**
   * Multi-start greedy optimization to find different local optima.
   * Runs the greedy algorithm from multiple starting points.
   */
  private multiStartGreedyOptimization(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const numStarts = 10
    let bestSolution = baseSimulation
    let bestScore = -Infinity

    for (let start = 0; start < numStarts; start++) {
      // Generate random starting point
      const startingSolution = this.generateRandomValidSolution(
        baseSimulation,
        minSubstatRollCounts,
        maxSubstatRollCounts,
        targetRolls,
      )

      // Apply greedy local search
      const localOptimum = this.greedyLocalSearch(
        startingSolution,
        minSubstatRollCounts,
        maxSubstatRollCounts,
        targetRolls,
      )

      const score = this.evaluateSimulation(localOptimum)
      if (score > bestScore) {
        bestScore = score
        bestSolution = localOptimum
      }
    }

    return bestSolution
  }

  /**
   * Hybrid approach combining multiple techniques.
   * Uses coarse-grained search followed by fine-grained optimization.
   */
  private hybridOptimization(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    // Phase 1: Coarse exploration using pattern-based generation
    const promisingCandidates = this.generatePromsingCandidates(
      baseSimulation,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      targetRolls,
    )

    // Phase 2: Local refinement of each candidate
    let bestSolution = baseSimulation
    let bestScore = -Infinity

    for (const candidate of promisingCandidates) {
      const refinedSolution = this.localImprovement(
        candidate,
        minSubstatRollCounts,
        maxSubstatRollCounts,
        targetRolls,
      )

      const score = this.evaluateSimulation(refinedSolution)
      if (score > bestScore) {
        bestScore = score
        bestSolution = refinedSolution
      }
    }

    return bestSolution
  }

  /**
   * Generate initial population for genetic algorithm with diverse starting points.
   */
  private generateInitialPopulation(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
    populationSize: number,
  ): Simulation[] {
    const population: Simulation[] = []

    // Add some heuristic-based solutions
    population.push(...this.generatePromsingCandidates(
      baseSimulation,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      targetRolls,
    ))

    // Fill remainder with random solutions
    while (population.length < populationSize) {
      population.push(this.generateRandomValidSolution(
        baseSimulation,
        minSubstatRollCounts,
        maxSubstatRollCounts,
        targetRolls,
      ))
    }

    return population.slice(0, populationSize)
  }

  /**
   * Generate promising candidate solutions using heuristics and patterns.
   */
  private generatePromsingCandidates(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation[] {
    const candidates: Simulation[] = []

    // Pattern 1: Balanced distribution
    candidates.push(this.createBalancedDistribution(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls))

    // Pattern 2: Focus on highest weight stats
    candidates.push(this.createFocusedDistribution(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls))

    // Pattern 3: Avoid diminishing returns threshold
    candidates.push(this.createDiminishingReturnsAware(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls))

    // Pattern 4: Conversion-friendly distribution (addresses local maxima issue)
    candidates.push(this.createConversionFriendlyDistribution(baseSimulation, minSubstatRollCounts, maxSubstatRollCounts, targetRolls))

    return candidates.filter(candidate => candidate !== null)
  }

  /**
   * Create distribution that considers stat conversion mechanics.
   * This specifically addresses the local maxima issue mentioned in the problem.
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
   * Create balanced distribution across all relevant stats.
   */
  private createBalancedDistribution(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const solution = this.cloneSimulation(baseSimulation)

    // Start with minimum rolls
    for (const stat of SubStats) {
      solution.request.stats[stat] = minSubstatRollCounts[stat]
    }

    let remainingRolls = targetRolls - this.sumRolls(solution.request.stats)
    const relevantStats = this.metadata.substats

    // Distribute remaining rolls evenly
    while (remainingRolls > 0) {
      let allocated = false
      for (const stat of relevantStats) {
        if (remainingRolls <= 0) break
        if (solution.request.stats[stat] < maxSubstatRollCounts[stat]) {
          solution.request.stats[stat]++
          remainingRolls--
          allocated = true
        }
      }
      if (!allocated) break
    }

    return solution
  }

  /**
   * Create distribution focused on highest weight stats.
   */
  private createFocusedDistribution(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const solution = this.cloneSimulation(baseSimulation)

    // Start with minimum rolls
    for (const stat of SubStats) {
      solution.request.stats[stat] = minSubstatRollCounts[stat]
    }

    let remainingRolls = targetRolls - this.sumRolls(solution.request.stats)

    // Sort stats by importance (you would need to implement stat weight lookup)
    const sortedStats = this.metadata.substats.slice().sort((a, b) => {
      // Prioritize CRIT stats, then ATK%, then others
      const priority = (stat: string) => {
        if (stat === Stats.CR || stat === Stats.CD) return 3
        if (stat === Stats.ATK_P) return 2
        if (stat === Stats.SPD) return 2
        return 1
      }
      return priority(b) - priority(a)
    })

    // Allocate to high priority stats first
    for (const stat of sortedStats) {
      const maxAllocation = Math.min(
        remainingRolls,
        maxSubstatRollCounts[stat] - solution.request.stats[stat]
      )
      solution.request.stats[stat] += maxAllocation
      remainingRolls -= maxAllocation
      if (remainingRolls <= 0) break
    }

    return solution
  }

  /**
   * Create distribution that avoids diminishing returns penalties.
   */
  private createDiminishingReturnsAware(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const solution = this.cloneSimulation(baseSimulation)

    // Start with minimum rolls
    for (const stat of SubStats) {
      solution.request.stats[stat] = minSubstatRollCounts[stat]
    }

    let remainingRolls = targetRolls - this.sumRolls(solution.request.stats)

    // Distribute rolls while staying under diminishing returns thresholds
    while (remainingRolls > 0) {
      let allocated = false

      for (const stat of this.metadata.substats) {
        if (remainingRolls <= 0) break
        if (solution.request.stats[stat] >= maxSubstatRollCounts[stat]) continue

        const threshold = this.getDiminishingReturnsThreshold(stat, solution)
        if (solution.request.stats[stat] < threshold) {
          solution.request.stats[stat]++
          remainingRolls--
          allocated = true
        }
      }

      // If no stat is under threshold, allocate normally
      if (!allocated) {
        for (const stat of this.metadata.substats) {
          if (remainingRolls <= 0) break
          if (solution.request.stats[stat] < maxSubstatRollCounts[stat]) {
            solution.request.stats[stat]++
            remainingRolls--
            allocated = true
            break
          }
        }
      }

      if (!allocated) break
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
   * Tournament selection for genetic algorithm.
   */
  private tournamentSelection(population: Simulation[], fitness: number[]): Simulation {
    const tournamentSize = 3
    let bestIndex = Math.floor(Math.random() * population.length)
    let bestFitness = fitness[bestIndex]

    for (let i = 1; i < tournamentSize; i++) {
      const candidateIndex = Math.floor(Math.random() * population.length)
      if (fitness[candidateIndex] > bestFitness) {
        bestIndex = candidateIndex
        bestFitness = fitness[candidateIndex]
      }
    }

    return this.cloneSimulation(population[bestIndex])
  }

  /**
   * Crossover operation for genetic algorithm.
   */
  private crossover(parent1: Simulation, parent2: Simulation, targetRolls: number): Simulation[] {
    const child1 = this.cloneSimulation(parent1)
    const child2 = this.cloneSimulation(parent2)

    // Uniform crossover with normalization
    for (const stat of this.metadata.substats) {
      if (Math.random() < 0.5) {
        const temp = child1.request.stats[stat]
        child1.request.stats[stat] = child2.request.stats[stat]
        child2.request.stats[stat] = temp
      }
    }

    // Normalize to target
    this.normalizeToTarget(child1, targetRolls)
    this.normalizeToTarget(child2, targetRolls)

    return [child1, child2]
  }

  /**
   * Mutation operation for genetic algorithm.
   */
  private mutate(
    simulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const mutated = this.cloneSimulation(simulation)
    const relevantStats = this.metadata.substats

    // Small random changes
    for (let i = 0; i < 3; i++) {
      const stat1 = relevantStats[Math.floor(Math.random() * relevantStats.length)]
      const stat2 = relevantStats[Math.floor(Math.random() * relevantStats.length)]

      if (stat1 !== stat2 &&
        mutated.request.stats[stat1] > minSubstatRollCounts[stat1] &&
        mutated.request.stats[stat2] < maxSubstatRollCounts[stat2]) {
        mutated.request.stats[stat1]--
        mutated.request.stats[stat2]++
      }
    }

    return mutated
  }

  /**
   * Generate neighbor solution for simulated annealing.
   */
  private generateNeighbor(
    simulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const neighbor = this.cloneSimulation(simulation)
    const relevantStats = this.metadata.substats

    // Make small changes
    const numChanges = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numChanges; i++) {
      const stat1 = relevantStats[Math.floor(Math.random() * relevantStats.length)]
      const stat2 = relevantStats[Math.floor(Math.random() * relevantStats.length)]

      if (stat1 !== stat2 &&
        neighbor.request.stats[stat1] > minSubstatRollCounts[stat1] &&
        neighbor.request.stats[stat2] < maxSubstatRollCounts[stat2]) {
        neighbor.request.stats[stat1]--
        neighbor.request.stats[stat2]++
      }
    }

    return neighbor
  }

  /**
   * Generate random valid solution.
   */
  private generateRandomValidSolution(
    baseSimulation: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    const solution = this.cloneSimulation(baseSimulation)

    // Start with minimum rolls
    for (const stat of SubStats) {
      solution.request.stats[stat] = minSubstatRollCounts[stat]
    }

    let remainingRolls = targetRolls - this.sumRolls(solution.request.stats)

    // Randomly distribute remaining rolls
    while (remainingRolls > 0) {
      const stat = this.metadata.substats[Math.floor(Math.random() * this.metadata.substats.length)]
      if (solution.request.stats[stat] < maxSubstatRollCounts[stat]) {
        solution.request.stats[stat]++
        remainingRolls--
      }
    }

    return solution
  }

  /**
   * Greedy local search from a starting point.
   */
  private greedyLocalSearch(
    startingSolution: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    let currentSolution = this.cloneSimulation(startingSolution)
    let improved = true

    while (improved) {
      improved = false
      let bestNeighbor = currentSolution
      let bestScore = this.evaluateSimulation(currentSolution)

      // Try all possible single-step improvements
      for (const stat1 of this.metadata.substats) {
        for (const stat2 of this.metadata.substats) {
          if (stat1 === stat2) continue
          if (currentSolution.request.stats[stat1] <= minSubstatRollCounts[stat1]) continue
          if (currentSolution.request.stats[stat2] >= maxSubstatRollCounts[stat2]) continue

          // Try moving one roll from stat1 to stat2
          const neighbor = this.cloneSimulation(currentSolution)
          neighbor.request.stats[stat1]--
          neighbor.request.stats[stat2]++

          const score = this.evaluateSimulation(neighbor)
          if (score > bestScore) {
            bestScore = score
            bestNeighbor = neighbor
            improved = true
          }
        }
      }

      currentSolution = bestNeighbor
    }

    return currentSolution
  }

  /**
   * Local improvement using hill climbing.
   */
  private localImprovement(
    solution: Simulation,
    minSubstatRollCounts: StatSimulationTypes,
    maxSubstatRollCounts: StatSimulationTypes,
    targetRolls: number,
  ): Simulation {
    return this.greedyLocalSearch(solution, minSubstatRollCounts, maxSubstatRollCounts, targetRolls)
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
   * Normalize simulation to target roll count.
   */
  private normalizeToTarget(simulation: Simulation, targetRolls: number): void {
    const currentRolls = this.sumRolls(simulation.request.stats)
    const difference = targetRolls - currentRolls

    if (difference === 0) return

    const relevantStats = this.metadata.substats

    if (difference > 0) {
      // Add rolls
      let remaining = difference
      while (remaining > 0) {
        const stat = relevantStats[Math.floor(Math.random() * relevantStats.length)]
        simulation.request.stats[stat]++
        remaining--
      }
    } else {
      // Remove rolls
      let remaining = -difference
      while (remaining > 0) {
        const stat = relevantStats[Math.floor(Math.random() * relevantStats.length)]
        if (simulation.request.stats[stat] > 0) {
          simulation.request.stats[stat]--
          remaining--
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
