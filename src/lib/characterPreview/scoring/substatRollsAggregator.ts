import { type SubStats } from 'lib/constants/constants'
import { countRelicRolls } from 'lib/characterPreview/summary/statScoringSummaryController'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'

export type AggregatedStatRolls = {
  stat: SubStats
  high: number
  mid: number
  low: number
  total: number
  effective: number
  weight: number
}

export function aggregateSubstatRolls(
  relics: PreviewRelics,
  weights: Record<SubStats, number>,
): AggregatedStatRolls[] {
  const rollMap = new Map<SubStats, { high: number; mid: number; low: number }>()

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

  const results: AggregatedStatRolls[] = []
  for (const [stat, weight] of Object.entries(weights)) {
    if (weight <= 0) continue
    const rolls = rollMap.get(stat as SubStats) ?? { high: 0, mid: 0, low: 0 }
    const total = rolls.high + rolls.mid + rolls.low
    const effective = rolls.high * 1.0 + rolls.mid * 0.9 + rolls.low * 0.8
    results.push({ stat: stat as SubStats, ...rolls, total, effective, weight })
  }

  results.sort((a, b) => b.weight - a.weight || b.effective - a.effective)
  return results
}
