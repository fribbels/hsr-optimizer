import { Metadata } from 'lib/state/metadataInitializer'
import { defaultComputeOptimalSimulationSearchRunner } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { LeaderboardBuildScoreCache } from '../cache/leaderboardBuildScoreCache'
import { createLeaderboardSearchRunner } from '../scoring/searchRunner'
import { scoreProfile } from '../scoring/scorer'
import { createLeaderboardMetrics } from '../shared/metrics'
import { getParentMessagePort } from '../shared/nodeFacade'
import {
  type LeaderboardBuildScoreCache as LeaderboardBuildScoreCacheContract,
  type LeaderboardBuildScoreCacheStats,
  type LeaderboardScoreWorkerRequest,
  type LeaderboardScoreWorkerResponse,
  type LeaderboardScoreWorkerRuntimeConfig,
  type LeaderboardVersionFile,
} from '../shared/types'
import { buildLeaderboardScoreWorkerStateKey } from './profileWorkerContracts'

type WorkerState = {
  key: string
  buildScoreCache: LeaderboardBuildScoreCacheContract
}

const parentPort = getParentMessagePort()

if (!parentPort) {
  throw new Error('leaderboardScoreWorkerThread must be run as a worker thread')
}

Metadata.initialize()
globalThis.SEQUENTIAL_BENCHMARKS = true

let state: WorkerState | null = null

parentPort.on<LeaderboardScoreWorkerRequest>('message', async (request) => {
  const startMs = performance.now()

  try {
    const workerState = getWorkerState(request.versions, request.globalVersion, request.runtimeConfig)
    const beforeBuildScoreCacheStats = workerState.buildScoreCache.stats()
    const metrics = createLeaderboardMetrics()
    const searchRunner = createLeaderboardSearchRunner({
      metrics,
      dispatch: defaultComputeOptimalSimulationSearchRunner,
    })

    const result = await scoreProfile({
      profile: request.profile,
      versions: request.versions,
      globalVersion: request.globalVersion,
      searchRunner,
      metrics,
      buildScoreCache: workerState.buildScoreCache,
    })

    workerState.buildScoreCache.flush()

    const response: LeaderboardScoreWorkerResponse = {
      id: request.id,
      ok: true,
      entries: result.entries,
      failures: result.failures,
      scored: result.scored,
      failed: result.failed,
      scoringRuns: result.scoringRuns,
      buildScoreCacheStats: diffBuildScoreCacheStats(beforeBuildScoreCacheStats, workerState.buildScoreCache.stats()),
      metrics: metrics.snapshot(),
      elapsedMs: performance.now() - startMs,
    }
    parentPort.postMessage(response)
  } catch (error) {
    if (request.id == null) {
      throw error
    }
    const response: LeaderboardScoreWorkerResponse = {
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }
    parentPort.postMessage(response)
  }
})

function getWorkerState(
  versions: LeaderboardVersionFile,
  globalVersion: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
): WorkerState {
  const key = buildLeaderboardScoreWorkerStateKey({ versions, globalVersion, runtimeConfig })
  if (!state || state.key !== key) {
    state?.buildScoreCache.flush()

    const buildScoreCache = new LeaderboardBuildScoreCache({
      dbPath: runtimeConfig.buildScoreCacheDbPath,
      leaderboardVersionsHash: runtimeConfig.leaderboardVersionsHash,
    })

    state = { key, buildScoreCache }
  }

  return state
}

function diffBuildScoreCacheStats(
  before: LeaderboardBuildScoreCacheStats,
  after: LeaderboardBuildScoreCacheStats,
): LeaderboardBuildScoreCacheStats {
  return {
    l1Hits: after.l1Hits - before.l1Hits,
    sqliteHits: after.sqliteHits - before.sqliteHits,
    misses: after.misses - before.misses,
    writes: after.writes - before.writes,
    corruptRowsDeleted: after.corruptRowsDeleted - before.corruptRowsDeleted,
  }
}
