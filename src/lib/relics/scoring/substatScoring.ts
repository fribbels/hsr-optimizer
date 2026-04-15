import {
  Constants,
} from 'lib/constants/constants'
import type {
  MainStats,
  Parts,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import {
  GRADE_CONFIG,
  MIN_ROLL_VALUE,
  PERCENT_TO_SCORE,
  STAT_NORMALIZATION,
} from 'lib/relics/scoring/scoringConstants'
import type { ValidGrade } from 'lib/relics/scoring/scoringConstants'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import type { Relic } from 'types/relic'

export function weightedSubstatScore(
  substats: readonly { stat: SubStats, value: number }[],
  weights: Record<StatsValues, number>,
): number {
  let score = 0
  for (const substat of substats) {
    score += substat.value * (weights[substat.stat] || 0) * STAT_NORMALIZATION[substat.stat]
  }
  return score
}

export function mainStatBonus(part: Parts, mainStat: MainStats, meta: ScorerMetadata): number {
  if (!hasMainStat(part)) return 0
  const multiplier = meta.parts[part].includes(mainStat) ? 1 : (meta.stats[mainStat] ?? 0)
  return MIN_ROLL_VALUE * multiplier
}

function mainStatWeight(part: Parts, mainStat: MainStats, meta: ScorerMetadata): number {
  if (!hasMainStat(part)) return 0
  if (meta.parts[part].includes(mainStat)) return 1
  return meta.stats[mainStat] ?? 0
}

export function normalizeDisplayScore(rawScore: number, idealScore: number, bonus: number): number {
  return rawScore / idealScore * 100 * PERCENT_TO_SCORE + bonus
}

export function computeMainStatScore(relic: Relic, meta: ScorerMetadata): number {
  if (!hasMainStat(relic.part)) return 0
  const gradeConfig = GRADE_CONFIG[relic.grade as ValidGrade]
  const max = gradeConfig ? gradeConfig.maxMainstat : GRADE_CONFIG[5].maxMainstat
  return max * mainStatWeight(relic.part, relic.main.stat, meta)
}

export function hasMainStat(part: Parts): boolean {
  return (
    part === Constants.Parts.Body
    || part === Constants.Parts.Feet
    || part === Constants.Parts.LinkRope
    || part === Constants.Parts.PlanarSphere
  )
}
