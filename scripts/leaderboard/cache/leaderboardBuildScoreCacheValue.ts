import type {
  LeaderboardBuildScore,
  LeaderboardBuildScoreCacheValue,
} from '../shared/types'

export function createLeaderboardBuildScoreCacheValue(
  key: string,
  score: LeaderboardBuildScore,
  createdAt: string,
): LeaderboardBuildScoreCacheValue {
  return {
    key,
    createdAt,
    score,
  }
}

export function parseLeaderboardBuildScoreCacheValue(
  valueJson: string,
  expectedKey: string,
): LeaderboardBuildScoreCacheValue | null {
  // unknown is intentional — JSON.parse returns unvalidated data; the type guard below narrows it
  let parsed: unknown
  try {
    parsed = JSON.parse(valueJson)
  } catch {
    return null
  }

  if (!isLeaderboardBuildScoreCacheValue(parsed, expectedKey)) {
    return null
  }

  return parsed
}

function isLeaderboardBuildScoreCacheValue(
  value: unknown,
  expectedKey: string,
): value is LeaderboardBuildScoreCacheValue {
  if (typeof value !== 'object' || value == null) return false

  const cacheValue = value as Partial<LeaderboardBuildScoreCacheValue>
  return cacheValue.key === expectedKey
    && isLeaderboardBuildScore(cacheValue.score)
}

function isLeaderboardBuildScore(value: unknown): value is LeaderboardBuildScore {
  if (typeof value !== 'object' || value == null) return false

  const score = value as Partial<LeaderboardBuildScore>
  const spdBenchmark = score.spdBenchmark
  return isFiniteNumber(score.percent)
    && isFiniteNumber(score.originalSimScore)
    && isFiniteNumber(score.baselineSimScore)
    && isFiniteNumber(score.benchmarkSimScore)
    && isFiniteNumber(score.maximumSimScore)
    && isFiniteNumber(score.originalSpd)
    && (spdBenchmark == null || isFiniteNumber(spdBenchmark))
    && typeof score.simulationFlags === 'object'
    && score.simulationFlags != null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
