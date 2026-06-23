import type {
  FutureScoringResult,
  PotentialResult,
} from 'lib/relics/scoring/types'

export function computePotentialScores(
  futureScore: FutureScoringResult,
): PotentialResult {
  return {
    currentPct: futureScore.current,
    bestPct: futureScore.best,
    averagePct: futureScore.average,
    worstPct: futureScore.worst,
    rerollAvgPct: futureScore.rerollAvg,
    blockedRerollAvgPct: futureScore.blockerAvg,
    meta: futureScore.meta,
  }
}
