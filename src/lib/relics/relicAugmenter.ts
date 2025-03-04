import { Constants, Stats } from 'lib/constants/constants'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { RelicRollGrader } from 'lib/relics/relicRollGrader'
import { Utils } from 'lib/utils/utils'
import { UnaugmentedRelic } from 'types/relic'

export type AugmentedStats = {
  [key: string]: number
} & {
  mainStat: string
  mainValue: number
}

export const RelicAugmenter = {
  augment: function (relic: UnaugmentedRelic) {
    // console.log('Augmenting relic', relic)
    const augmentedStats: AugmentedStats = {} as AugmentedStats

    // Temporarily skip broken imports
    if (relic.grade && !relic.main) {
      return null
    }

    const mainStat = relic.main.stat
    relic.main.value = RelicRollFixer.fixMainStatValue(relic)
    const mainMaxValue = relic.main.value

    augmentedStats.mainStat = mainStat
    augmentedStats.mainValue = mainMaxValue

    sortSubstats(relic)

    for (const substat of relic.substats) {
      const stat = substat.stat
      substat.value = Utils.precisionRound(substat.value)
      substat.value = RelicRollFixer.fixSubStatValue(stat, substat.value, relic.grade)
      augmentedStats[stat] = substat.value
    }

    if (relic.enhance > 12 && relic.grade != 5) {
      relic.grade = 5
    }

    if (!relic.id) {
      relic.id = Utils.randomId()
    }

    relic.augmentedStats = augmentedStats
    fixAugmentedStats([relic])
    RelicRollGrader.calculateRelicSubstatRolls(relic)
    return relic
  },
}

const substatToOrder: Record<string, number> = {
  [Stats.HP]: 0,
  [Stats.ATK]: 1,
  [Stats.DEF]: 2,
  [Stats.HP_P]: 3,
  [Stats.ATK_P]: 4,
  [Stats.DEF_P]: 5,
  [Stats.SPD]: 6,
  [Stats.CR]: 7,
  [Stats.CD]: 8,
  [Stats.EHR]: 9,
  [Stats.RES]: 10,
  [Stats.BE]: 11,
}

// Relic substats are always sorted in the predefined order above when the user logs out.
function sortSubstats(relic: UnaugmentedRelic) {
  relic.substats = relic.substats.sort((a, b) => substatToOrder[a.stat] - substatToOrder[b.stat])
}

// Changes the augmented stats percents to decimals
function fixAugmentedStats(relics: UnaugmentedRelic[]) {
  return relics.map((relic) => {
    for (const stat of Object.values(Constants.Stats)) {
      if (!relic.augmentedStats) continue

      relic.augmentedStats[stat] = relic.augmentedStats[stat] || 0
      if (!Utils.isFlat(stat)) {
        if (relic.augmentedStats.mainStat == stat) {
          relic.augmentedStats.mainValue = relic.augmentedStats.mainValue / 100
        }
        relic.augmentedStats[stat] = relic.augmentedStats[stat] / 100
      }
    }
    return relic
  })
}
