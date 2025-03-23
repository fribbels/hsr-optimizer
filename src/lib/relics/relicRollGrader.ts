import { SubStatValues } from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { TsUtils } from 'lib/utils/TsUtils'
import { StatRolls, UnaugmentedRelic } from 'types/relic'

// FIXME LOW

// non exported interface, the number are float
interface IncrementOptions {
  high: number
  mid: number
  low: number
}

// TODO: We are currently not using the actual roll values, for we just care about the roll count
// Revisit once we do care about roll values and clean up the overcount logic
export const RelicRollGrader = {
  calculateIncrementCounts(currentStat: number, incrementOptions: IncrementOptions): StatRolls | null {
    let closestSum: number = Infinity
    let closestCounts: StatRolls | null = null

    // TODO: There is a bug in this where it potentially overcounts the number of rolls when ambiguous.
    // Needs the context of how many rolls are possible in the other stats to not overcount.
    // We currently band-aid this by deducting 1 roll from the highest stat if overcounted.
    function search(sum: number, counts: StatRolls, index: number): void {
      if (index === Object.keys(incrementOptions).length) {
        if (Math.abs(sum - currentStat) < Math.abs(closestSum - currentStat)) {
          closestSum = sum
          closestCounts = { ...counts }
        }
        return
      }

      const increment: keyof IncrementOptions = Object.keys(incrementOptions)[index] as keyof IncrementOptions
      for (let i = 0; sum + i * incrementOptions[increment] <= currentStat + 0.01; i++) {
        counts[increment] = i
        search(sum + i * incrementOptions[increment], counts, index + 1)
      }
    }

    search(0, { high: 0, mid: 0, low: 0 }, 0)

    return closestCounts
  },

  calculateRelicSubstatRolls(relic: UnaugmentedRelic) {
    // Skip non 5 star relics for simplicity
    if (relic.grade < 5) {
      relic.substats.map((x) => {
        x.rolls = { high: 0, mid: 0, low: 0 }
        x.addedRolls = 0
      })
      return
    }

    // Verified relics *should* have their rolls correct - validate that the roll counts match the stat value before continuing
    if (relic.verified && !relic.substats.some((substat) => substat.rolls == null)) {
      if (validatedRolls(relic)) {
        return
      }
    }

    let totalAddedRolls = 0
    relic.substats.forEach((substat) => {
      const incrementOptions = SubStatValues[substat.stat][relic.grade as 5 | 4 | 3 | 2]
      const incrementCounts = this.calculateIncrementCounts(substat.value, incrementOptions)

      if (incrementCounts) {
        // substat.rolls = incrementCounts
        // Band-aid for invalid relics, clamp roll values to [0, 5]
        substat.addedRolls = Math.min(5, Math.max(0, incrementCounts.high + incrementCounts.mid + incrementCounts.low - 1))
        substat.rolls = incrementCounts
        totalAddedRolls += substat.addedRolls
      }
    })

    // Band-aid for overcounted rolls
    if (totalAddedRolls > Math.floor(relic.enhance / 3)) {
      const highestRolledSubstat = relic.substats.reduce(
        // @ts-ignore addedRolls potentially undefined per the type
        (max, substat) => max.addedRolls > substat.addedRolls ? max : substat,
      )
      // @ts-ignore addedRolls potentially undefined per the type
      highestRolledSubstat.addedRolls -= 1
    }
  },
}

function validatedRolls(relic: UnaugmentedRelic) {
  for (const substat of relic.substats) {
    const stat = substat.stat
    const rolls = substat.rolls!
    const value = rolls.low * StatCalculator.getMaxedSubstatValue(stat, 0.8)
      + rolls.mid * StatCalculator.getMaxedSubstatValue(stat, 0.9)
      + rolls.high * StatCalculator.getMaxedSubstatValue(stat, 1.0)

    if (TsUtils.precisionRound(value) != TsUtils.precisionRound(substat.value)) {
      return false
    }
  }

  return true
}
