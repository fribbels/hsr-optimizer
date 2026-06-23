import type { Relic } from 'types/relic'
import { pctToRating } from './scoreFormatting'
import {
  hasMainStat,
  mainStatWeight,
} from './substatScoring'
import type {
  RelicScoringResult,
  ScorerMetadata,
} from './types'

export function scoreCurrentRelic(
  relic: Relic,
  meta: ScorerMetadata,
  idealScore: number,
): RelicScoringResult {
  const contributions = meta.contributions

  let rawScore = 0
  for (const sub of relic.substats) {
    rawScore += sub.value * contributions[sub.stat]
  }

  const percentScore = idealScore === Infinity ? 0 : rawScore / idealScore * 100
  const hasCorrectMain = !hasMainStat(relic.part) || mainStatWeight(relic.part, relic.main.stat, meta) > 0
  const rating = pctToRating(percentScore, relic.grade, relic.part, hasCorrectMain)

  return {
    percentScore,
    rating,
    part: relic.part,
    meta,
  }
}
