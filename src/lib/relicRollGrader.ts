import { Relic, StatRolls } from 'types/Relic'
import { SubStatValues } from './constants'

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

  calculateRelicSubstatRolls(relic: Relic): void {
    // Skip non 5 star relics for simplicity
    if (relic.grade < 5) {
      relic.substats.map((x) => {
        // x.rolls = { high: 0, mid: 0, low: 0 }
        x.addedRolls = 0
      })
      return
    }

    let totalAddedRolls = 0
    relic.substats.forEach((substat) => {
      const incrementOptions = SubStatValues[substat.stat][relic.grade]
      const incrementCounts = this.calculateIncrementCounts(substat.value, incrementOptions)

      if (incrementCounts) {
        // substat.rolls = incrementCounts
        // Band-aid for invalid relics, clamp roll values to [0, 5]
        substat.addedRolls = Math.min(5, Math.max(0, incrementCounts.high + incrementCounts.mid + incrementCounts.low - 1))
        totalAddedRolls += substat.addedRolls
      }
    })

    // Band-aid for overcounted rolls
    if (totalAddedRolls > Math.floor(relic.enhance / 3)) {
      const highestRolledSubstat = relic.substats.reduce(
        (max, substat) => max.addedRolls > substat.addedRolls ? max : substat,
      )
      highestRolledSubstat.addedRolls -= 1
    }
  },

  calculateStatSum(rolls: StatRolls): number {
    return rolls
      ? parseFloat(((rolls.high * 100 + rolls.mid * 90 + rolls.low * 80) / (rolls.high + rolls.mid + rolls.low)).toFixed(2))
      : 0
  },
}
