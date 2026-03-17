import {
  Constants,
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
  ValidGrade,
} from 'lib/relics/scoring/scoringConstants'
import type { ScorerMetadata, SubStat } from 'lib/relics/scoring/types'
import type { Relic, Stat } from 'types/relic'

export function weightedSubstatScore(
  substats: readonly { stat: SubStats; value: number }[],
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

export function mainStatWeight(part: Parts, mainStat: MainStats, meta: ScorerMetadata): number {
  if (!hasMainStat(part)) return 0
  if (meta.parts[part].includes(mainStat)) return 1
  return meta.stats[mainStat] ?? 0
}

export function mainStatDeduction(
  part: Parts,
  mainStat: MainStats,
  meta: ScorerMetadata,
  maxMainstat: number,
): number {
  if (!hasMainStat(part)) return 0
  return (mainStatWeight(part, mainStat, meta) - 1) * maxMainstat
}

export function normalizeDisplayScore(rawScore: number, idealScore: number, bonus: number): number {
  return rawScore / idealScore * 100 * PERCENT_TO_SCORE + bonus
}

export function normalizePotentialScore(
  rawScore: number,
  idealScore: number,
  deduction: number,
  bonus: number,
): number {
  return Math.max(0, (rawScore + deduction) / idealScore * 100 * PERCENT_TO_SCORE + bonus)
}

export function normalizeUnclamped(
  rawScore: number,
  idealScore: number,
  deduction: number,
  bonus: number,
): number {
  return (rawScore + deduction) / idealScore * 100 * PERCENT_TO_SCORE + bonus
}

export function computeMainStatScore(relic: Relic, meta: ScorerMetadata): number {
  if (!hasMainStat(relic.part)) return 0
  const gradeConfig = GRADE_CONFIG[relic.grade as ValidGrade]
  const max = gradeConfig ? gradeConfig.maxMainstat : GRADE_CONFIG[5].maxMainstat
  return max * mainStatWeight(relic.part, relic.main.stat, meta)
}

export function hasMainStat(part: Parts): boolean {
  return (
    part == Constants.Parts.Body
    || part == Constants.Parts.Feet
    || part == Constants.Parts.LinkRope
    || part == Constants.Parts.PlanarSphere
  )
}

export function findHighestWeightIdx(
  substats: SubStat[] | Stat[],
  meta: ScorerMetadata,
): number {
  let index = 0
  let weight = 0
  for (let i = 0; i < substats.length; i++) {
    const newWeight = meta.stats[substats[i].stat]
    if (newWeight > weight || i == 0) {
      weight = newWeight
      index = i
    }
  }
  return index
}

export function findLowestWeightIdx(
  substats: SubStat[],
  meta: ScorerMetadata,
): number {
  let index = 0
  let weight = meta.stats[substats[0].stat]
  for (let i = 1; i < substats.length; i++) {
    const newWeight = meta.stats[substats[i].stat]
    if (newWeight < weight) {
      weight = newWeight
      index = i
    }
  }
  return index
}
