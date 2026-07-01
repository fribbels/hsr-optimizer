import {
  Constants,
  Stats,
  SubStatValues,
} from 'lib/constants/constants'
import type {
  MainStats,
  Parts,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import {
  substatPotentialScale,
  substatPotentialUnits,
} from 'lib/relics/scoring/scoringConstants'
import type { ScorerMetadata } from 'lib/relics/scoring/types'

type FlatMainstatBoost = {
  stat: SubStats,
  contribution: number,
  high: number,
  mid: number,
  low: number,
}

const MAINSTAT_FLAT_BOOST = {
  [Stats.ATK_P]: Stats.ATK,
  [Stats.HP_P]: Stats.HP,
  [Stats.DEF_P]: Stats.DEF,
} as const

type FlatMainstatBoostMainStat = keyof typeof MAINSTAT_FLAT_BOOST

function isFlatMainstatBoostMainStat(mainStat: MainStats): mainStat is FlatMainstatBoostMainStat {
  return mainStat === Stats.ATK_P || mainStat === Stats.HP_P || mainStat === Stats.DEF_P
}

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

function getFlatMainstatBoost(meta: ScorerMetadata, mainStat: MainStats): FlatMainstatBoost | undefined {
  if (!isFlatMainstatBoostMainStat(mainStat)) return undefined

  const stat = MAINSTAT_FLAT_BOOST[mainStat]
  if (!meta.flatMainstatBoost?.[stat]) return undefined

  const weight = meta.stats[mainStat] ?? 0
  if (weight <= 0) return undefined

  return {
    stat,
    contribution: weight * substatPotentialScale(stat),
    high: weight * substatPotentialUnits(stat, SubStatValues[stat][5].high),
    mid: weight * substatPotentialUnits(stat, SubStatValues[stat][5].mid),
    low: weight * substatPotentialUnits(stat, SubStatValues[stat][5].low),
  }
}

export type EffectiveSubstatAccessors = {
  contribution: (stat: SubStats) => number
  high: (stat: SubStats) => number
  mid: (stat: SubStats) => number
  low: (stat: SubStats) => number
}

export function getEffectiveSubstatAccessors(meta: ScorerMetadata, mainStat: MainStats): EffectiveSubstatAccessors {
  const boost = getFlatMainstatBoost(meta, mainStat)
  return {
    contribution: (stat) => boost?.stat === stat ? boost.contribution : meta.contributions[stat],
    high: (stat) => boost?.stat === stat ? boost.high : meta.highRollPotential[stat],
    mid: (stat) => boost?.stat === stat ? boost.mid : meta.midRollPotential[stat],
    low: (stat) => boost?.stat === stat ? boost.low : meta.lowRollPotential[stat],
  }
}

export function hasMainStat(part: Parts): boolean {
  return (
    part === Constants.Parts.Body
    || part === Constants.Parts.Feet
    || part === Constants.Parts.LinkRope
    || part === Constants.Parts.PlanarSphere
  )
}
