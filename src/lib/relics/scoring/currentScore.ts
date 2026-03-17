import { Relic } from 'types/relic'
import { CharacterId } from 'types/character'
import { RelicScoringResult, ScorerMetadata } from './types'
import {
  computeMainStatScore,
  mainStatBonus,
  normalizeDisplayScore,
} from './substatScoring'
import { scoreToRating } from './scoreFormatting'

export function scoreCurrentRelic(
  relic: Relic,
  id: CharacterId,
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
    score: score.toFixed(1),
    scoreNumber: score,
    rating,
    mainStatScore: msScore,
    part: relic.part,
    meta,
  }
}
