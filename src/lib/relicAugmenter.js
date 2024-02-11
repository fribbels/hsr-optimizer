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

    relic.relicsTabWeight = 0
    relic.bestCaseWeight = 0
    relic.averageCaseWeight = 0

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
    calculateRelicRatings(relic)
    return relic
  },
}

// Very meh rating, revisit at some point
function calculateRelicRatings(relic) {
  let cs = relic.augmentedStats[Constants.Stats.ATK_P] * 100 * 1.5
    + relic.augmentedStats[Constants.Stats.CD] * 100
    + relic.augmentedStats[Constants.Stats.CR] * 100 * 2
    + relic.augmentedStats[Constants.Stats.SPD] * 2.6

  let ss = relic.augmentedStats[Constants.Stats.DEF_P] * 100 * 1.2
    + relic.augmentedStats[Constants.Stats.HP_P] * 100 * 1.5
    + relic.augmentedStats[Constants.Stats.RES] * 100 * 1.5
    + relic.augmentedStats[Constants.Stats.SPD] * 2.6

  let ds = relic.augmentedStats[Constants.Stats.ATK_P] * 100 * 1.5
    + relic.augmentedStats[Constants.Stats.EHR] * 100 * 1.5
    + relic.augmentedStats[Constants.Stats.BE] * 100
    + relic.augmentedStats[Constants.Stats.SPD] * 2.6

  relic.cs = cs
  relic.ss = ss
  relic.ds = ds
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
