import { v4 as uuidv4 } from 'uuid'
import { Constants } from './constants.ts'
import { RelicRollFixer } from './relicRollFixer'
import { Utils } from './utils'

export const RelicAugmenter = {
  augment: function(relic) {
    // console.log('Augmenting relic', relic)
    let augmentedStats = {}

    // Temporarily skip broken imports
    if (relic.grade && !relic.main) {
      return null
    }

    let mainStat = relic.main.stat
    relic.main.value = RelicRollFixer.fixMainStatvalue(relic)
    let mainMaxValue = relic.main.value

    augmentedStats.mainStat = mainStat
    augmentedStats.mainValue = mainMaxValue

    for (let substat of relic.substats) {
      let stat = substat.stat
      substat.value = Utils.precisionRound(substat.value)
      substat.value = RelicRollFixer.fixSubStatValue(stat, substat.value, relic.grade)
      augmentedStats[stat] = substat.value
    }

    if (relic.enhance > 12 && relic.grade != 5) {
      relic.grade = 5
    }

    if (!relic.id) {
      relic.id = uuidv4()
    }

    relic.augmentedStats = augmentedStats
    fixAugmentedStats([relic])
    return relic
  },
}

function fixAugmentedStats(relics) {
  return relics.map((x) => {
    for (let stat of Object.values(Constants.Stats)) {
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
