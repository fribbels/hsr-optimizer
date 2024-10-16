import { Constants } from './constants.ts'
import { RelicRollFixer } from './relicRollFixer'
import { Utils } from './utils'
import { RelicRollGrader } from 'lib/relicRollGrader'

export const RelicAugmenter = {
  augment: function (relic) {
    // console.log('Augmenting relic', relic)
    const augmentedStats = {}

    // Temporarily skip broken imports
    if (relic.grade && !relic.main) {
      return null
    }

    const mainStat = relic.main.stat
    relic.main.value = RelicRollFixer.fixMainStatvalue(relic)
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

const substatToOrder = {
  [Constants.Stats.HP]: 0,
  [Constants.Stats.ATK]: 1,
  [Constants.Stats.DEF]: 2,
  [Constants.Stats.HP_P]: 3,
  [Constants.Stats.ATK_P]: 4,
  [Constants.Stats.DEF_P]: 5,
  [Constants.Stats.SPD]: 6,
  [Constants.Stats.CR]: 7,
  [Constants.Stats.CD]: 8,
  [Constants.Stats.EHR]: 9,
  [Constants.Stats.RES]: 10,
  [Constants.Stats.BE]: 11,
}

// Relic substats are always sorted in the predefined order above when the user logs out.
function sortSubstats(relic) {
  relic.substats = relic.substats.sort((a, b) => substatToOrder[a.stat] - substatToOrder[b.stat])
}

// Changes the augmented stats percents to decimals
function fixAugmentedStats(relics) {
  return relics.map((x) => {
    for (const stat of Object.values(Constants.Stats)) {
      x.augmentedStats[stat] = x.augmentedStats[stat] || 0
      if (!Utils.isFlat(stat)) {
        if (x.augmentedStats.mainStat == stat) {
          x.augmentedStats.mainValue = x.augmentedStats.mainValue / 100
        }
        x.augmentedStats[stat] = x.augmentedStats[stat] / 100
      }
    }
    return x
  })
}
