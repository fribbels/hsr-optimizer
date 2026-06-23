import { pctToRating } from 'lib/relics/scoring/scoreFormatting'
import {
  hasMainStat,
  mainStatWeight,
} from 'lib/relics/scoring/substatScoring'
import type {
  RelicScoringResult,
  ScorerMetadata,
} from 'lib/relics/scoring/types'
import { precisionRound, truncate10ths } from 'lib/utils/mathUtils'
import type { Relic } from 'types/relic'

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

  const percentScore = idealScore === Infinity ? 0 : truncate10ths(precisionRound(rawScore / idealScore * 100))
  const hasCorrectMain = !hasMainStat(relic.part) || mainStatWeight(relic.part, relic.main.stat, meta) > 0
  const aeonEligible = relic.verified === true && meta.aeonEligibleWeights
  const rating = pctToRating(percentScore, relic.grade, relic.part, hasCorrectMain, aeonEligible)

  return {
    percentScore,
    rating,
    part: relic.part,
    meta,
  }
}
