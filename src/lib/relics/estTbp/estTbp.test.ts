import { Parts, Sets, Stats } from 'lib/constants/constants'
import { Metadata } from 'lib/state/metadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { Relic, RelicSubstatMetadata } from 'types/relic'
import { expect, test } from 'vitest'
import {
  binomialCoefficient,
  combinations,
  combinationsWithReplacement,
  factorial,
  permutations,
  probabilityOfCorrectInitialSubs,
  probabilityOfExactUpgradePattern,
  probabilityOfInitialSubstatCount,
  substatGenerator,
  substatGeneratorFromRelic,
} from './estTbp'

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

function generateRelic() {
  const mainStat = Stats.HP
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
    part: Parts.Head,
    grade: 5,
    enhance: 15,
    main: {
      stat: Stats.HP,
      value: 705,
    },
    substats: substats,
  } as Relic

  return relic
}

const simulationsEnabled = false
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
  'Energy Regeneration Rate': 0,
  'Outgoing Healing Boost': 0,
  'Physical DMG Boost': 0,
  'Fire DMG Boost': 0,
  'Ice DMG Boost': 0,
  'Lightning DMG Boost': 0,
  'Wind DMG Boost': 0,
  'Quantum DMG Boost': 1,
  'Imaginary DMG Boost': 0,
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
  if (!simulationsEnabled) return

  let success = 0
  const results: number[] = []
  const rollsToBeat = 7.55
  const trials = 100_000_000

  for (let i = 0; i < trials; i++) {
    const relic = generateRelic()
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
  const partMultiplier = 4 // 4 trials per correct part

  const tbp = trials * tbpPerTrial * setMultiplier * partMultiplier
  const avgTbp = tbp / success
  const avgDays = avgTbp / 240

  console.log(`${success} relics beat a score of ${rollsToBeat} - AVG TBP: ${avgTbp} - AVG DAYS: ${avgDays}`)
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

test('Array generators work correctly', () => {
  expect(collectGenerator(permutations([0, 1, 2])))
    .toStrictEqual([
      [0, 1, 2],
      [1, 0, 2],
      [1, 2, 0],
      [0, 2, 1],
      [2, 0, 1],
      [2, 1, 0],
    ])

  expect(collectGenerator(combinations([0, 1, 2], 0)))
    .toStrictEqual([[]])

  expect(collectGenerator(combinations([0, 1, 2], 2)))
    .toStrictEqual([[0, 1], [0, 2], [1, 2]])

  expect(collectGenerator(combinationsWithReplacement([0, 1, 2], 2)))
    .toStrictEqual([[0, 0], [0, 1], [0, 2], [1, 1], [1, 2], [2, 2]])

  expect(collectGenerator(combinationsWithReplacement([0, 1, 2, 3], 5)).length)
    .toStrictEqual(56)
})

test('factorial works correctly', () => {
  expect(factorial(1)).toBe(1)
  expect(factorial(2)).toBe(2)
  expect(factorial(3)).toBe(6)
  expect(factorial(4)).toBe(24)
})

test('binomial coefficient works correctly', () => {
  expect(binomialCoefficient(4, 2)).toBe(6)
})

test('"0 upgrades" should list all possible initial substat combinations (binomial coefficient)', () => {
  expect(collectGenerator(substatGenerator('HP', 4, 0)))
    .toHaveLength(binomialCoefficient(11, 4))

  expect(collectGenerator(substatGenerator('Physical DMG Boost', 4, 0)))
    .toHaveLength(binomialCoefficient(12, 4))
})

test('Initial substat probability sum of all results should add up to 1', () => {
  let total_p = 0.0
  for (const spread of substatGenerator('HP', 4, 0)) {
    total_p += probabilityOfCorrectInitialSubs('HP', spread)
  }
  expect(total_p).toBeCloseTo(1.0)
})

test('Initial and upgrade probability should add up to 1', () => {
  let count = 0
  let total_p = 0.0
  for (const spread of substatGenerator('HP', 4, 5)) {
    total_p += probabilityOfCorrectInitialSubs('HP', spread) * probabilityOfExactUpgradePattern(spread)
    count += 1
  }
  expect(count).toBe(18480)
  expect(total_p).toBeCloseTo(1.0)
})

test('Generate from relic works correctly', () => {
  const relic: Relic = {
    weightScore: 0.0,
    enhance: 15,
    equippedBy: undefined,
    grade: 5,
    id: 'ababa',
    main: {
      stat: 'HP',
      value: 0.0, // does not matter
    },
    part: Parts.Head,
    set: Sets.MusketeerOfWildWheat, // does not matter
    substats: [],
  }

  expect(collectGenerator(substatGeneratorFromRelic(relic)))
    .toStrictEqual(
      collectGenerator(substatGenerator('HP', 4, 4))
        .concat(collectGenerator(substatGenerator('HP', 4, 5))),
    )
})

test('Overall probability should add up to 1', () => {
  const relic: Relic = {
    weightScore: 0.0,
    enhance: 15,
    equippedBy: undefined,
    grade: 5,
    id: 'ababa',
    main: {
      stat: 'HP',
      value: 0.0, // does not matter
    },
    part: Parts.Head,
    set: Sets.MusketeerOfWildWheat, // does not matter
    substats: [],
  }

  let total_p = 0.0
  for (const spread of substatGeneratorFromRelic(relic)) {
    total_p += probabilityOfInitialSubstatCount(relic.grade, spread)
    * probabilityOfCorrectInitialSubs('HP', spread)
    * probabilityOfExactUpgradePattern(spread)
  }
  expect(total_p).toBeCloseTo(1.0)
})

function collectGenerator<T>(g: Generator<T>): Array<T> {
  const a: Array<T> = []
  for (const x of g) {
    a.push(x)
  }
  return a
}
