import {
  emptyBuildScoreCacheStats,
  emptyMetricsSnapshot,
} from 'leaderboard/shared/metrics'
import type {
  FailureEntry,
  LeaderboardBuildScoreCacheStats,
  LeaderboardMetricsSnapshot,
  LeaderboardScoreWorkerRuntimeConfig,
  LeaderboardVersionFile,
  ParsedProfile,
  PrivateRankedEntry,
} from 'leaderboard/shared/types'
import { LeaderboardScoreWorkerPool } from 'leaderboard/workers/profileWorkerPool'

export type RunScoringStageInput = {
  profiles: ParsedProfile[],
  versions: LeaderboardVersionFile,
  globalVersion: number,
  estimatedRuns: number,
  workerCount: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
  workerScriptUrl: URL,
}

export type RunScoringStageResult = {
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  metrics: LeaderboardMetricsSnapshot,
  elapsedMs: number,
}

type WorkerScoreProfilesResult = Omit<RunScoringStageResult, 'elapsedMs'>

export async function runScoringStage(input: RunScoringStageInput): Promise<RunScoringStageResult> {
  const scoringStartMs = performance.now()
  if (input.profiles.length === 0) {
    return {
      entries: [],
      failures: [],
      buildScoreCacheStats: emptyBuildScoreCacheStats(),
      metrics: emptyMetricsSnapshot(),
      elapsedMs: performance.now() - scoringStartMs,
    }
  }

  const workerPool = new LeaderboardScoreWorkerPool({
    workerScriptUrl: input.workerScriptUrl,
    workerCount: input.workerCount,
    runtimeConfig: input.runtimeConfig,
  })
  console.log(`Leaderboard profile worker_threads enabled: ${input.workerCount} workers`)

  let scoringError: unknown
  let scoringResult: WorkerScoreProfilesResult | null = null
  let scoringElapsedMs = 0
  try {
    scoringResult = await workerPool.scoreProfiles({
      profiles: input.profiles,
      versions: input.versions,
      globalVersion: input.globalVersion,
      estimatedRuns: input.estimatedRuns,
    })
  } catch (error: unknown) {
    scoringError = error
  }
  scoringElapsedMs = performance.now() - scoringStartMs

  const cleanupError = await terminateWorkerPool(workerPool)
  if (scoringError != null) {
    if (cleanupError != null) {
      console.warn('Leaderboard score worker cleanup failed after scoring error:', cleanupError)
    }
    throw scoringError
  }
  if (cleanupError != null) {
    throw cleanupError
  }
  if (scoringResult == null) {
    throw new Error('Leaderboard scoring finished without a result')
  }

  return {
    entries: scoringResult.entries,
    failures: scoringResult.failures,
    buildScoreCacheStats: scoringResult.buildScoreCacheStats,
    metrics: scoringResult.metrics,
    elapsedMs: scoringElapsedMs,
  }
}

async function terminateWorkerPool(workerPool: LeaderboardScoreWorkerPool): Promise<unknown | null> {
  try {
    await workerPool.terminate()
    return null
  } catch (error: unknown) {
    return error
  }
}
