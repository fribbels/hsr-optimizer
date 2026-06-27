import { Constants, type SubStats } from 'lib/constants/constants'
import {
  gradeConversion,
  statConversion,
  type UnconvertedCharacter,
} from 'lib/importer/characterConverter'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { substatPotentialUnits } from 'lib/relics/scoring/scoringConstants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { precisionRound } from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'

export type PreFilterSubstat = {
  stat: SubStats
  value: number
}

export function extractPreFilterSubstats(
  relicList: NonNullable<UnconvertedCharacter['relicList']>,
): PreFilterSubstat[] {
  const metadata = getGameMetadata().relics
  const substats: PreFilterSubstat[] = []

  for (const preRelic of relicList) {
    const tid = String(preRelic.tid)
    const gradeId = tid.substring(0, 1)
    const grade = gradeConversion[gradeId] ?? 5

    for (const sub of preRelic.subAffixList) {
      let subId = sub.affixId
      if (!subId) {
        const match = Object.values(metadata.relicSubAffixes[grade].affixes)
          .find((x) => x.property === sub.type)
        if (!match) continue
        subId = Number(match.affix_id)
      }

      const subData = metadata.relicSubAffixes[grade]?.affixes[subId]
      if (!subData) continue

      const stat = statConversion[subData.property as keyof typeof statConversion] as SubStats
      if (!stat) continue

      const count: number = sub.cnt ?? sub.count
      const step: number = sub.step || 0
      const rawValue = subData.base * count + subData.step * step
      let value = precisionRound(rawValue * (isFlat(stat) ? 1 : 100), 5)
      value = RelicRollFixer.fixSubStatValue(stat, value, grade)

      substats.push({ stat, value })
    }
  }

  return substats
}

export type PreFilterSubstatScore = {
  score: number,
  scoreNoSpd: number,
}

// SPD always contributes at weight=1 regardless of metadata weight
export function computePreFilterSubstatScore(
  substats: PreFilterSubstat[],
  statWeights: Record<string, number>,
): PreFilterSubstatScore {
  let score = 0
  let scoreNoSpd = 0
  for (const sub of substats) {
    const weight = statWeights[sub.stat] || 0
    const units = substatPotentialUnits(sub.stat, sub.value)
    score += units * (sub.stat === Constants.Stats.SPD ? 1 : weight)
    if (sub.stat !== Constants.Stats.SPD) {
      scoreNoSpd += units * weight
    }
  }
  return { score, scoreNoSpd }
}
