import {
  Constants,
  SubStatValues,
} from 'lib/constants/constants'
import type {
  MainStats,
  Parts,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import type { ScorerMetadata } from 'lib/relics/scoring/types'

export function substatMinRolls(stat: SubStats, value: number): number {
  return value / SubStatValues[stat][5].low
}

export function weightedSubstatMinRolls(
  substats: readonly { stat: SubStats, value: number }[],
  weights: Record<StatsValues, number>,
): number {
  let rolls = 0
  for (const substat of substats) {
    rolls += substatMinRolls(substat.stat, substat.value) * (weights[substat.stat] || 0)
  }
  return rolls
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
