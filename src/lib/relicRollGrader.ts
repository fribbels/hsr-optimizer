import { Relic, StatRolls } from 'types/Relic'
import { SubStatValues } from './constants'

// non exported interface, the number are float
interface IncrementOptions {
  high: number
  mid: number
  low: number
}

export const RelicRollGrader = {
  calculateIncrementCounts(currentStat: number, incrementOptions: IncrementOptions): StatRolls | null {
    let closestSum: number = Infinity
    let closestCounts: StatRolls | null = null

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
      relic.substats.map((x) => x.rolls = { high: 0, mid: 0, low: 0 })
      return
    }

    relic.substats.forEach((substat) => {
      const incrementOptions = SubStatValues[substat.stat][relic.grade]

      const incrementCounts = this.calculateIncrementCounts(substat.value, incrementOptions)

      if (incrementCounts) {
        substat.rolls = incrementCounts
      }
    })
  },
  calculateStatSum(rolls: StatRolls): number {
    return rolls
      ? parseFloat(((rolls.high * 100 + rolls.mid * 90 + rolls.low * 80) / (rolls.high + rolls.mid + rolls.low)).toFixed(2))
      : 0
  },
}
