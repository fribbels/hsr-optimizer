import { SimulationSets } from 'lib/scoring/dpsScore'
import { ScoringParams, SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { simulateBenchmarkBuild } from 'lib/simulations/new/benchmarks/simulateBenchmarkBuild'
import { simulatePerfectBuild } from 'lib/simulations/new/benchmarks/simulatePerfectBuild'
import { SimulationState } from 'lib/simulations/new/utils/simulationState'
import { Simulation } from 'lib/simulations/statSimulationController'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

/**
 * Result interface for custom benchmark
 */
export interface CustomBenchmarkResult {
  benchmarkSim: Simulation
  benchmarkSimResult: SimulationResult
  perfectSim?: Simulation
  perfectSimResult?: SimulationResult
  metrics: {
    totalTime: number
  }
}

/**
 * Orchestrator for custom benchmark simulations that generate optimal builds
 * based on user-specified parameters
 */
export class CustomBenchmarkOrchestrator {
  private state: SimulationState

  constructor(
    // Required parameters
    context: OptimizerContext,
    form: Form,
    metadata: SimulationMetadata,
    scoringParams: ScoringParams,
    simulationSets: SimulationSets,
    bodyMainStat: string,
    feetMainStat: string,
    planarSphereMainStat: string,
    linkRopeMainStat: string,
    targetSpd: number,
    // Optional parameters
    simulationFlags: SimulationFlags = {},
  ) {
    this.state = createSimulationState(
      context,
      form,
      metadata,
      scoringParams,
      simulationSets,
      {
        customMainStats: {
          bodyMainStat,
          feetMainStat,
          planarSphereMainStat,
          linkRopeMainStat,
        },
        customTargetSpd: targetSpd,
        simulationFlags,
      },
    )

    // Set target speed directly since we're not calculating it
    this.state.results.targetSpd = targetSpd
  }

  public async run(includePerfectBuild: boolean = false): Promise<CustomBenchmarkResult> {
    try {
      // Step 1: Simulate benchmark build directly
      await this.runBenchmarkBuild()

      // Step 2: Optionally simulate perfect build
      if (includePerfectBuild) {
        await this.runPerfectBuild()
      }

      // Return results
      return this.getResults()
    } finally {
      // Record total time
      this.state.metrics.totalTime = performance.now() - this.state.metrics.startTime
    }
  }

  public getState(): SimulationState {
    return this.state
  }

  private async runBenchmarkBuild(): Promise<void> {
    if (this.state.status.benchmarkBuildCompleted) {
      return // Already completed
    }

    const startTime = performance.now()

    // Run the simulation
    const { benchmarkSim, benchmarkSimResult } = await simulateBenchmarkBuild(this.state)

    // Update state
    this.state.results.benchmarkSim = benchmarkSim
    this.state.results.benchmarkSimResult = benchmarkSimResult
    this.state.status.benchmarkBuildCompleted = true
    this.state.metrics.benchmarkBuildTime = performance.now() - startTime
  }

  private async runPerfectBuild(): Promise<void> {
    if (this.state.status.perfectBuildCompleted) {
      return // Already completed
    }

    const startTime = performance.now()

    // Ensure benchmark build is completed
    if (!this.state.status.benchmarkBuildCompleted) {
      await this.runBenchmarkBuild()
    }

    // Run the simulation
    const { perfectSim, perfectSimResult } = await simulatePerfectBuild(this.state)

    // Update state
    this.state.results.perfectSim = perfectSim
    this.state.results.perfectSimResult = perfectSimResult
    this.state.status.perfectBuildCompleted = true
    this.state.metrics.perfectBuildTime = performance.now() - startTime
  }

  private getResults(): CustomBenchmarkResult {
    if (!this.state.status.benchmarkBuildCompleted) {
      throw new Error('Benchmark simulation not completed')
    }

    const result: CustomBenchmarkResult = {
      benchmarkSim: this.state.results.benchmarkSim!,
      benchmarkSimResult: this.state.results.benchmarkSimResult!,
      metrics: {
        totalTime: this.state.metrics.totalTime!,
      },
    }

    // Include perfect build results if available
    if (this.state.status.perfectBuildCompleted) {
      result.perfectSim = this.state.results.perfectSim
      result.perfectSimResult = this.state.results.perfectSimResult
    }

    return result
  }
}
