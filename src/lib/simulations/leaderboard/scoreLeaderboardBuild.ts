import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { SimulationFlags } from 'lib/scoring/simScoringUtils'
import {
  executeOrchestrator,
  prepareOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import type { ComputeOptimalSimulationSearchRunner } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import type {
  ScoringConfig,
  ScoringConfigType,
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'
import type { BasicForm } from 'types/optimizer'

export type LeaderboardBuildScore = {
  percent: number
  originalSimScore: number
  baselineSimScore: number
  benchmarkSimScore: number
  maximumSimScore: number
  originalSpd: number
  spdBenchmark: number | undefined
  simulationFlags: SimulationFlags
}

export async function scoreLeaderboardBuild(input: {
  character: { form: BasicForm }
  configType: ScoringConfigType
  simulationMetadata: SimulationMetadata
  singleRelicByPart: PreviewRelics
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
  searchRunner?: ComputeOptimalSimulationSearchRunner
  scoreOnly?: boolean
}): Promise<LeaderboardBuildScore | null> {
  const config: ScoringConfig = {
    configType: input.configType,
    simulation: input.simulationMetadata,
  }

  const orchestrator = prepareOrchestrator(
    input.character,
    config,
    input.singleRelicByPart,
    input.showcaseTemporaryOptions,
  )

  await executeOrchestrator(orchestrator, {
    searchRunner: input.searchRunner,
    scoreOnly: input.scoreOnly,
  })

  const percent = orchestrator.percent!
  const originalSpd = orchestrator.originalSpd!
  const originalSimScore = orchestrator.originalSimResult!.simScore
  const baselineSimScore = orchestrator.benchmarkBaselineScore!
  const benchmarkSimScore = orchestrator.benchmarkSimScore!
  const perfectionSimScore = orchestrator.perfectionSimScore!

  return {
    percent,
    originalSimScore,
    baselineSimScore,
    benchmarkSimScore,
    maximumSimScore: Math.max(perfectionSimScore, benchmarkSimScore),
    originalSpd,
    spdBenchmark: orchestrator.spdBenchmark,
    simulationFlags: { ...orchestrator.flags },
  }
}
