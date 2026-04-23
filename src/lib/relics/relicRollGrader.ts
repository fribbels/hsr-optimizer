import { SubStatValues } from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { precisionRound } from 'lib/utils/mathUtils'
import type {
  StatRolls,
  UnaugmentedRelic,
} from 'types/relic'

// non exported interface, the number are float
interface IncrementOptions {
  high: number
  mid: number
  low: number
}

function generateDistributions(budget: number, buckets: number): number[][] {
  if (buckets === 1) return [[budget]]
  const dists: number[][] = []
  for (let i = 0; i <= Math.min(5, budget); i++) {
    const subDists = generateDistributions(budget - i, buckets - 1)
    for (const subDist of subDists) {
      dists.push([i, ...subDist])
    }
  }
  return dists
}

function findBestRollSplit(targetValue: number, totalRolls: number, incrementOptions: IncrementOptions): { rolls: StatRolls, error: number } {
  let minError = Infinity
  let bestRolls: StatRolls = { high: 0, mid: 0, low: 0 }

  for (let high = 0; high <= totalRolls; high++) {
    for (let mid = 0; mid <= totalRolls - high; mid++) {
      const low = totalRolls - high - mid
      const val = high * incrementOptions.high + mid * incrementOptions.mid + low * incrementOptions.low
      const error = Math.abs(val - targetValue)
      if (error < minError) {
        minError = error
        bestRolls = { high, mid, low }
      }
    }
  }
  return { rolls: bestRolls, error: minError }
}

export const RelicRollGrader = {
  calculateRelicSubstatRolls(relic: UnaugmentedRelic) {
    // Skip non 5 star relics for simplicity
    if (relic.grade < 5) {
      relic.substats.forEach((x) => {
        x.rolls = { high: 0, mid: 0, low: 0 }
        x.addedRolls = 0
      })
      relic.initialRolls = 0
      return
    }

    if (relic.substats.length === 0) {
      calculateInitialRolls(relic)
      return
    }

    // Verified relics *should* have their rolls correct - validate that the roll counts match the stat value before continuing
    if (relic.verified && !relic.substats.some((substat) => substat.rolls == null)) {
      calculateInitialRolls(relic)
      if (validatedRolls(relic)) {
        return
      }
    }

    const maxAddedRolls = Math.floor(relic.enhance / 3)
    const numSubstats = relic.substats.length
    
    let bestDistError = Infinity
    let bestDistResults: { addedRolls: number, rolls: StatRolls }[] | null = null

    for (let budget = 0; budget <= maxAddedRolls; budget++) {
      const distributions = generateDistributions(budget, numSubstats)
      
      for (const dist of distributions) {
        let distError = 0
        const distResults: { addedRolls: number, rolls: StatRolls }[] = []
        
        for (let i = 0; i < numSubstats; i++) {
          const substat = relic.substats[i]
          const incrementOptions = SubStatValues[substat.stat][relic.grade as 5 | 4 | 3 | 2]
          const addedRolls = dist[i]
          const totalRolls = addedRolls + 1
          
          const bestSplit = findBestRollSplit(substat.value, totalRolls, incrementOptions)
          distError += bestSplit.error
          distResults.push({ addedRolls, rolls: bestSplit.rolls })
        }
        
        if (distError < bestDistError) {
          bestDistError = distError
          bestDistResults = distResults
        }
      }
    }

    if (bestDistResults) {
      for (let i = 0; i < numSubstats; i++) {
        relic.substats[i].addedRolls = bestDistResults[i].addedRolls
        relic.substats[i].rolls = bestDistResults[i].rolls
      }
    }

    calculateInitialRolls(relic)
  },
}

function validatedRolls(relic: UnaugmentedRelic) {
  for (const substat of relic.substats) {
    const stat = substat.stat
    const rolls = substat.rolls!
    const value = rolls.low * StatCalculator.getMaxedSubstatValue(stat, 0.8)
      + rolls.mid * StatCalculator.getMaxedSubstatValue(stat, 0.9)
      + rolls.high * StatCalculator.getMaxedSubstatValue(stat, 1.0)

    if (precisionRound(value, 3) != precisionRound(substat.value, 3)) {
      return false
    }
  }

  return true
}

// assumes accurate addedRolls values
function calculateInitialRolls(relic: UnaugmentedRelic) {
  const totalRolls = relic.substats.reduce((acc, curr) => acc + (curr.addedRolls ?? 0) + 1, 0)
  relic.initialRolls = totalRolls - Math.floor(relic.enhance / 3)
}
