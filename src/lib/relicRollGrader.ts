import { StatRolls } from 'types/Relic'

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

  // gradeRelicSubstats(relic: Relic) {
  //   for (const substat of relic.substats) {
  //     const incrementOptions = SubStats
  //     const currentStat = substat.value
  //     const incrementCounts = this.calculateIncrementCounts(currentStat, incrementOptions)
  //     substat.rolls = incrementCounts
  //   }
  // },

}
