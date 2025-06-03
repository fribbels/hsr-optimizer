import { Constants } from 'lib/constants/constants'
import { RelicRollGrader } from 'lib/relics/relicRollGrader'
import DB from 'lib/state/db'
import { Metadata } from 'lib/state/metadata'
import { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

test('Test the substat values', () => {
  // Test that calcs for a useful mainstat and useless substats are in alignment

  const character = '1205' // acheron
  const scoringStats = DB.getScoringMetadata(character).stats

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
  const scoringStats = DB.getScoringMetadata(character).stats

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
    substats: [
      { stat: 'Effect Hit Rate', value: 10, rolls: { high: 0, mid: 0, low: 0 } },
    ],
    id: 'dc5ff7ac-f38b-4404-b261-9fdbb1db9173',
    equippedBy: character,
    weightScore: 0,
  }
  RelicRollGrader.calculateRelicSubstatRolls(relic)
  // this is the outcome because it only calculates to the closest value
  expect(relic.substats[0].addedRolls).toEqual(1)
})
