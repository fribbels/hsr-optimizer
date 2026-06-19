import {
  type LeaderboardScoreWorkerRuntimeConfig,
  type LeaderboardVersionFile,
} from 'scripts/leaderboard/shared/types'

export function buildLeaderboardScoreWorkerStateKey(input: {
  versions: LeaderboardVersionFile,
  globalVersion: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
}): string {
  return JSON.stringify(input)
}
