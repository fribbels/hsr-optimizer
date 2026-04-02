import type { Relic } from 'types/relic'
import type { RelicScoringResult, ScorerMetadata } from './types'
import { toFixed1 } from './scoringConstants'
import {
  computeMainStatScore,
  mainStatBonus,
  normalizeDisplayScore,
} from './substatScoring'
import { scoreToRating } from './scoreFormatting'

export function scoreCurrentRelic(
  relic: Relic,
  meta: ScorerMetadata,
  idealScore: number,
): RelicScoringResult {
  const bonus = mainStatBonus(relic.part, relic.main.stat, meta)
  const contributions = meta.contributions

  let rawScore = 0
  for (const sub of relic.substats) {
    rawScore += sub.value * contributions[sub.stat]
  }

  const score = normalizeDisplayScore(rawScore, idealScore, bonus)
  const msScore = computeMainStatScore(relic, meta)
  const rating = scoreToRating(score, relic.grade, relic.part, msScore)

  return {
    score: toFixed1(score),
    scoreNumber: score,
    rating,
    mainStatScore: msScore,
    part: relic.part,
    meta,
  }
}
