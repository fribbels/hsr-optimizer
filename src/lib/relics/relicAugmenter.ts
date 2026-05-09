import {
  Constants,
  Stats,
} from 'lib/constants/constants'
import type { StatsValues } from 'lib/constants/constants'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { RelicRollGrader } from 'lib/relics/relicRollGrader'
import { precisionRound } from 'lib/utils/mathUtils'
import { uuid } from 'lib/utils/miscUtils'
import { isFlat } from 'lib/utils/statUtils'
import type {
  Relic,
  UnaugmentedRelic,
} from 'types/relic'

export type AugmentedStats = Record<StatsValues, number> & {
  mainStat: string,
  mainValue: number,
}

export const RelicAugmenter = {
  augment: function(relic: UnaugmentedRelic): Relic | null {
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

    for (const substat of relic.substats) {
      const stat = substat.stat
      substat.value = precisionRound(substat.value)
      substat.value = RelicRollFixer.fixSubStatValue(stat, substat.value, relic.grade)
      augmentedStats[stat] = substat.value
    }

    if (relic.enhance > 12 && relic.grade != 5) {
      relic.grade = 5
    }

    relic.id ??= uuid()

    relic.previewSubstats ??= []

    relic.augmentedStats = augmentedStats
    fixAugmentedStats([relic])
    RelicRollGrader.calculateRelicSubstatRolls(relic)
    return relic as Relic
  },
}

// Changes the augmented stats percents to decimals
function fixAugmentedStats(relics: UnaugmentedRelic[]) {
  relics.forEach((relic) => {
    for (const stat of Object.values(Constants.Stats)) {
      if (!relic.augmentedStats) continue

      relic.augmentedStats[stat] = relic.augmentedStats[stat] || 0
      if (!isFlat(stat)) {
        if (relic.augmentedStats.mainStat == stat) {
          relic.augmentedStats.mainValue = relic.augmentedStats.mainValue / 100
        }
        relic.augmentedStats[stat] = relic.augmentedStats[stat] / 100
      }
    }
  })
}
