// @vitest-environment jsdom
import { Constants } from 'lib/constants/constants'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import { RelicRollGrader } from 'lib/relics/relicRollGrader'
import { Metadata } from 'lib/state/metadataInitializer'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import type { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

test('Test the substat values', () => {
  // Test that calcs for a useful mainstat and useless substats are in alignment

  const character = '1205' // acheron
  const scoringStats = getScoringMetadata(character).stats

  const mainStat = Constants.Stats.HP_P
  const subStats = [
    Constants.Stats.DEF,
    Constants.Stats.EHR,
    Constants.Stats.RES,
    Constants.Stats.BE,
  ]
  expect(scoringStats[mainStat]).toBe(1)
  for (const subStat of subStats) {
    expect(scoringStats[subStat]).toBe(0)
  }

  const relic: Relic = {
    enhance: 15,
    grade: 5,
    part: 'LinkRope',
    set: 'Talia: Kingdom of Banditry',
    main: {
      stat: mainStat,
      value: 100,
    },
    ageIndex: 0,
    initialRolls: 0,
    augmentedStats: {} as AugmentedStats,
    substats: [
      {
        stat: 'HP',
        value: 84.6751,
        rolls: {
          high: 2,
          mid: 0,
          low: 0,
        },
      },
      {
        stat: 'DEF%',
        value: 9.18,
        rolls: {
          high: 0,
          mid: 1,
          low: 1,
        },
      },
      {
        stat: 'SPD',
        value: 6.6,
        rolls: {
          high: 0,
          mid: 2,
          low: 1,
        },
      },
      {
        stat: 'Effect Hit Rate',
        value: 8.64,
        rolls: {
          high: 2,
          mid: 0,
          low: 0,
        },
      },
    ],
    previewSubstats: [],
    weightScore: 0,
    id: 'dc5ff7ac-f38b-4404-b261-9fdbb1db9173',
    equippedBy: character,
  }

  RelicRollGrader.calculateRelicSubstatRolls(relic)

  expect(relic.substats[0].rolls).toEqual({ high: 2, mid: 0, low: 0 })
  expect(relic.substats[1].rolls).toEqual({ high: 0, mid: 1, low: 1 })
  expect(relic.substats[2].rolls).toEqual({ high: 0, mid: 2, low: 1 })
  expect(relic.substats[3].rolls).toEqual({ high: 2, mid: 0, low: 0 })

  expect(relic.substats[0].addedRolls).toEqual(1)
  expect(relic.substats[1].addedRolls).toEqual(1)
  expect(relic.substats[2].addedRolls).toEqual(2)
  expect(relic.substats[3].addedRolls).toEqual(1)
})

test('Test when the value is not an exact addition from constants', () => {
  const character = '1205' // blade
  const scoringStats = getScoringMetadata(character).stats

  const mainStat = Constants.Stats.HP_P
  const subStats = [
    Constants.Stats.DEF,
    Constants.Stats.EHR,
    Constants.Stats.RES,
    Constants.Stats.BE,
  ]
  expect(scoringStats[mainStat]).toBe(1)
  for (const subStat of subStats) {
    expect(scoringStats[subStat]).toBe(0)
  }

  const relic: Relic = {
    enhance: 15,
    grade: 5,
    part: 'LinkRope',
    set: 'Talia: Kingdom of Banditry',
    main: {
      stat: mainStat,
      value: 100,
    },
    ageIndex: 0,
    initialRolls: 0,
    augmentedStats: {} as AugmentedStats,
    substats: [
      { stat: 'Effect Hit Rate', value: 10, rolls: { high: 0, mid: 0, low: 0 } },
    ],
    previewSubstats: [],
    id: 'dc5ff7ac-f38b-4404-b261-9fdbb1db9173',
    equippedBy: character,
    weightScore: 0,
  }
  RelicRollGrader.calculateRelicSubstatRolls(relic)
  expect(relic.substats[0].addedRolls).toEqual(2)
})

test('Regression: overcount bug — joint search respects enhance budget', () => {
  // Each value isolates to addedRolls=2 (sum=8) on a +15 relic whose budget is 5;
  // the old band-aid only shaved 1 off the top, leaving sum=7.
  const relic: Relic = {
    enhance: 15,
    grade: 5,
    part: 'LinkRope',
    set: 'Talia: Kingdom of Banditry',
    main: {
      stat: Constants.Stats.HP_P,
      value: 100,
    },
    ageIndex: 0,
    initialRolls: 0,
    augmentedStats: {} as AugmentedStats,
    substats: [
      { stat: 'ATK%', value: 10.8, rolls: { high: 0, mid: 0, low: 0 } },
      { stat: 'HP%', value: 10.368, rolls: { high: 0, mid: 0, low: 0 } },
      { stat: 'CRIT DMG', value: 15.552, rolls: { high: 0, mid: 0, low: 0 } },
      { stat: 'CRIT Rate', value: 7.776, rolls: { high: 0, mid: 0, low: 0 } },
    ],
    previewSubstats: [],
    weightScore: 0,
    id: 'dc5ff7ac-f38b-4404-b261-9fdbb1db9173',
    equippedBy: '1205',
  }

  RelicRollGrader.calculateRelicSubstatRolls(relic)

  const sumAddedRolls = relic.substats.reduce((acc, s) => acc + (s.addedRolls ?? 0), 0)
  expect(sumAddedRolls).toBeLessThanOrEqual(Math.floor(relic.enhance / 3))
  expect(sumAddedRolls).toEqual(5)

  expect(relic.substats[0].addedRolls).toEqual(1)
  expect(relic.substats[1].addedRolls).toEqual(1)
  expect(relic.substats[2].addedRolls).toEqual(2)
  expect(relic.substats[3].addedRolls).toEqual(1)

  expect(relic.substats[0].rolls).toEqual({ high: 2, mid: 0, low: 0 })
  expect(relic.substats[1].rolls).toEqual({ high: 2, mid: 0, low: 0 })
  expect(relic.substats[2].rolls).toEqual({ high: 0, mid: 0, low: 3 })
  expect(relic.substats[3].rolls).toEqual({ high: 2, mid: 0, low: 0 })

  expect(relic.initialRolls).toEqual(4)
})

test('Tiebreaker: equal-error budgets favor higher addedRolls', () => {
  // 5.616 is equidistant from 1h=4.32 and 2l=6.912 (err 1.296 each);
  // descending should pick the higher-budget fit.
  const relic: Relic = {
    enhance: 15,
    grade: 5,
    part: 'LinkRope',
    set: 'Talia: Kingdom of Banditry',
    main: {
      stat: Constants.Stats.HP_P,
      value: 100,
    },
    ageIndex: 0,
    initialRolls: 0,
    augmentedStats: {} as AugmentedStats,
    substats: [
      { stat: 'HP%', value: 5.616, rolls: { high: 0, mid: 0, low: 0 } },
    ],
    previewSubstats: [],
    weightScore: 0,
    id: 'dc5ff7ac-f38b-4404-b261-9fdbb1db9173',
    equippedBy: '1205',
  }
  RelicRollGrader.calculateRelicSubstatRolls(relic)
  expect(relic.substats[0].addedRolls).toEqual(1)
  expect(relic.substats[0].rolls).toEqual({ high: 0, mid: 0, low: 2 })
})
