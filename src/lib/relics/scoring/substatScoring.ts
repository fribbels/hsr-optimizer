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
  substatPotentialValue,
} from 'lib/relics/scoring/scoringConstants'
import type { ScorerMetadata } from 'lib/relics/scoring/types'

export function weightedSubstatScore(
  substats: readonly { stat: SubStats, value: number }[],
  weights: Record<StatsValues, number>,
): number {
  let score = 0
  for (const substat of substats) {
    score += substatPotentialValue(substat.stat, substat.value) * (weights[substat.stat] || 0)
  }
  return score
}

export function mainStatWeight(part: Parts, mainStat: MainStats, meta: ScorerMetadata): number {
  if (!hasMainStat(part)) return 0
  if (meta.parts[part].includes(mainStat)) return 1
  return meta.stats[mainStat] ?? 0
}

export function hasMainStat(part: Parts): boolean {
  return (
    part === Constants.Parts.Body
    || part === Constants.Parts.Feet
    || part === Constants.Parts.LinkRope
    || part === Constants.Parts.PlanarSphere
  )
}
