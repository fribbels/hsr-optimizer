import { Stats, type SubStats } from 'lib/constants/constants'
import { countRelicRolls } from 'lib/characterPreview/summary/statScoringSummaryController'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { StatRolls } from 'types/relic'
import { precisionRound } from 'lib/utils/mathUtils'

const DISPLAY_COUNT = 6
const FALLBACK_STATS: SubStats[] = [Stats.SPD, Stats.CR, Stats.CD, Stats.ATK_P, Stats.HP_P, Stats.DEF_P]
const FLAT_STATS = new Set<SubStats>([Stats.ATK, Stats.HP, Stats.DEF])

export type AggregatedStatRolls = {
  stat: SubStats
  high: number
  mid: number
  low: number
  total: number
  effective: number
  weight: number
}

function buildEntry(stat: SubStats, rollMap: Map<SubStats, StatRolls>, weight: number): AggregatedStatRolls {
  const rolls = rollMap.get(stat) ?? { high: 0, mid: 0, low: 0 }
  const total = rolls.high + rolls.mid + rolls.low
  const effective = precisionRound(rolls.high * 1.0 + rolls.mid * 0.9 + rolls.low * 0.8)
  return { stat, ...rolls, total, effective, weight }
}

export function aggregateSubstatRolls(
  relics: PreviewRelics,
  weights: Record<SubStats, number>,
): AggregatedStatRolls[] {
  const rollMap = new Map<SubStats, StatRolls>()

  for (const relic of Object.values(relics)) {
    if (!relic) continue
    countRelicRolls(relic, weights)

    for (const substat of relic.substats.concat(relic.previewSubstats)) {
      const rolls = substat.rolls ?? { high: 0, mid: 0, low: 0 }
      const existing = rollMap.get(substat.stat) ?? { high: 0, mid: 0, low: 0 }
      existing.high += rolls.high
      existing.mid += rolls.mid
      existing.low += rolls.low
      rollMap.set(substat.stat, existing)
    }
  }

  // Pool 1: mandatory — all stats with positive weight
  const selected = new Set<SubStats>()
  const results: AggregatedStatRolls[] = []

  for (const [stat, weight] of Object.entries(weights)) {
    if (weight <= 0) continue
    selected.add(stat as SubStats)
    results.push(buildEntry(stat as SubStats, rollMap, weight))
  }

  // Pool 2: stats with actual rolls not already in Pool 1
  if (results.length < DISPLAY_COUNT) {
    const pool2: AggregatedStatRolls[] = []
    for (const stat of rollMap.keys()) {
      if (selected.has(stat)) continue
      const entry = buildEntry(stat, rollMap, 0)
      if (entry.total > 0) pool2.push(entry)
    }
    pool2.sort((a, b) => b.effective - a.effective)
    for (const entry of pool2) {
      if (results.length >= DISPLAY_COUNT) break
      selected.add(entry.stat)
      results.push(entry)
    }
  }

  // Pool 3: fallback universal stats
  if (results.length < DISPLAY_COUNT) {
    for (const stat of FALLBACK_STATS) {
      if (results.length >= DISPLAY_COUNT) break
      if (selected.has(stat)) continue
      selected.add(stat)
      results.push(buildEntry(stat, rollMap, 0))
    }
  }

  results.sort((a, b) => b.effective - a.effective || (Number(FLAT_STATS.has(a.stat)) - Number(FLAT_STATS.has(b.stat))))
  return results.slice(0, DISPLAY_COUNT)
}
