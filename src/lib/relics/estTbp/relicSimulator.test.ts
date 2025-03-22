import { MainStats, Parts, Stats } from 'lib/constants/constants'
import { probabilityOfCorrectSlot, probabilityOfCorrectStat } from 'lib/relics/estTbp/estTbp'
import { Metadata } from 'lib/state/metadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { Relic, RelicSubstatMetadata } from 'types/relic'
import { test } from 'vitest'

Metadata.initialize()

const statQuality = {
  LOW: 0.8,
  MID: 0.9,
  HIGH: 1.0,
}

function quality() {
  const qualityRand = Math.random()
  return qualityRand > 0.666666 ? statQuality.HIGH : (qualityRand > 0.333333 ? statQuality.MID : statQuality.LOW)
}

function generateRelic(part: Parts, main: MainStats) {
  const mainStat = main
  const rolls = Math.random() < 0.20 ? 5 : 4

  // Initialize starting rolls

  const substats: RelicSubstatMetadata[] = []
  const selected: Record<string, boolean> = {}
  for (let i = 0; i < 4; i++) {
    const statRand = Math.random()

    for (let j = substatCumulativeArr.length - 1; j >= 0; j--) {
      if (statRand >= substatCumulativeArr[j].threshold) {
        const stat = substatCumulativeArr[j].stat

        // Retry duplicate stats
        if (selected[stat] || stat == mainStat) {
          i--
          break
        }

        selected[stat] = true
        substats.push({
          stat: stat,
          value: quality(),
        })
        break
      }
    }
  }

  for (let i = 0; i < rolls; i++) {
    const upgradeIndex = Math.floor(Math.random() * 4)
    substats[upgradeIndex].value += quality()
  }

  const relic: Relic = {
    part: part,
    grade: 5,
    enhance: 15,
    main: {
      stat: mainStat,
      value: 0,
    },
    substats: substats,
  } as Relic

  return relic
}

const weights = {
  'ATK': 0.75,
  'ATK%': 0.75,
  'DEF': 0,
  'DEF%': 0,
  'HP': 0,
  'HP%': 0,
  'SPD': 1,
  'CRIT Rate': 1,
  'CRIT DMG': 1,
  'Effect Hit Rate': 0,
  'Effect RES': 0,
  'Break Effect': 0,
}
const substatCumulativeArr = [
  { stat: Stats.HP_P, threshold: 0.00 },
  { stat: Stats.ATK_P, threshold: 0.10 },
  { stat: Stats.DEF_P, threshold: 0.20 },
  { stat: Stats.HP, threshold: 0.30 },
  { stat: Stats.ATK, threshold: 0.40 },
  { stat: Stats.DEF, threshold: 0.50 },
  { stat: Stats.SPD, threshold: 0.60 },
  { stat: Stats.CR, threshold: 0.64 },
  { stat: Stats.CD, threshold: 0.70 },
  { stat: Stats.EHR, threshold: 0.76 },
  { stat: Stats.RES, threshold: 0.84 },
  { stat: Stats.BE, threshold: 0.92 },
] // 1.00

test('Simulated relics', () => {
  const simulationsEnabled = false
  if (!simulationsEnabled) return

  let success = 0
  const results: number[] = []

  const mainStat = Stats.ATK_P
  const part = Parts.LinkRope
  const rollsToBeat = 5.4
  const trials = 10_000_000

  for (let i = 0; i < trials; i++) {
    const relic = generateRelic(part, mainStat)
    const result = TsUtils.precisionRound(sumSubstatWeights(relic, weights))

    results.push(result)
    if (result > rollsToBeat) {
      success++
    }
  }

  const histogram = new Array(80).fill(0)
  for (const result of results) {
    histogram[Math.floor(result * 10)]++
  }

  const tbpPerTrial = 40 / 2.1 // ~2 drops per run
  const setMultiplier = 2 // 2 trials per correct set
  const partMultiplier = 1 / probabilityOfCorrectSlot(part)
  const mainStatMultiplier = 1 / probabilityOfCorrectStat(part, mainStat)

  const tbp = trials * tbpPerTrial * setMultiplier * partMultiplier * mainStatMultiplier
  const avgTbp = tbp / success
  const avgDays = avgTbp / 240

  console.log(`${success} / ${trials} relics beat a score of ${rollsToBeat} - AVG TBP: ${avgTbp} - AVG DAYS: ${avgDays}`)
  for (let i = 0; i < 80; i++) {
    console.log(`$Score: ${i / 10}: ${histogram[i]}`)
  }
})

function sumSubstatWeights(relic: Relic, weights: Record<string, number>) {
  let sum = 0
  for (const substat of relic.substats) {
    sum += substat.value * weights[substat.stat] * flatReduction(substat.stat)
  }
  return sum
}

function flatReduction(stat: string) {
  return stat == Stats.HP || stat == Stats.DEF || stat == Stats.ATK ? 0.4 : 1
}
