import {
  Parts,
  Sets,
} from 'lib/constants/constants'
import {
  binomialCoefficient,
  combinations,
  combinationsWithReplacement,
  factorial,
  permutations,
  probabilityOfCorrectInitialSubs,
  substatGenerator,
  substatGeneratorFromRelic,
} from 'lib/relics/estTbp/estTbp'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

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
    ageIndex: 0,
    initialRolls: 0,
    augmentedStats: {} as AugmentedStats,
  }

  expect(collectGenerator(substatGeneratorFromRelic(relic)))
    .toStrictEqual(
      collectGenerator(substatGenerator('HP', 4, 4))
        .concat(collectGenerator(substatGenerator('HP', 4, 5))),
    )
})

function collectGenerator<T>(g: Generator<T>): Array<T> {
  const a: Array<T> = []
  for (const x of g) {
    a.push(x)
  }
  return a
}
