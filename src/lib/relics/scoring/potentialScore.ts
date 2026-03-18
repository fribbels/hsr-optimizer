import { PERCENT_TO_SCORE } from './scoringConstants'
import { mainStatBonus } from './substatScoring'
import type { FutureScoringResult, PotentialResult, ScorerMetadata } from './types'
import type { Relic } from 'types/relic'

function toPct(score: number, bonus: number, multiplier: number): number {
  return Math.max(0, score - bonus) / PERCENT_TO_SCORE * multiplier
}

export function computePotentialScores(
  relic: Relic,
  meta: ScorerMetadata,
  futureScore: FutureScoringResult,
): PotentialResult {
  const bonus = mainStatBonus(relic.part, relic.main.stat, meta)
  const multiplier = 1 // Disabled until better sets metadata

  return {
    currentPct: toPct(futureScore.current, bonus, multiplier),
    bestPct: toPct(futureScore.best, bonus, multiplier),
    averagePct: toPct(futureScore.average, bonus, multiplier),
    worstPct: toPct(futureScore.worst, bonus, multiplier),
    rerollAvgPct: toPct(futureScore.rerollAvg, bonus, multiplier),
    blockedRerollAvgPct: toPct(futureScore.blockerAvg, bonus, multiplier),
    meta: futureScore.meta,
  }
}
