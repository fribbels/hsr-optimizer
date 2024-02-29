import { expect, test } from 'vitest'

import { DataParser } from './dataParser'
import { Constants } from 'lib/constants'
import { RelicScorer } from './relicScorer'
import { Relic } from 'types/Relic'
import DB from './db.js'

DataParser.parse()

test('relic-mainstatonly', () => {
  // Test that calcs for a useful mainstat and useless substats are in alignment

  const character = '1205' // blade
  const scoringStats = DB.getScoringMetadata(character).stats

  const mainStat = Constants.Stats.HP_P
  const subStats = [
    Constants.Stats.DEF_P,
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
    substats: subStats.map((stat) => ({ stat: stat, value: 100 })),
    id: '77bde0f9-38ce-48f6-a936-79141e3f04ce',
    equippedBy: character,
  }

  const totalScore = 70.3

  const score = RelicScorer.score(relic, character)
  expect(score.score).toBe('5.5') // the mainstat free roll
  expect(score.mainStatScore).toBe(64.8)
  expect(score.mainStatScore + parseFloat(score.score)).toBe(totalScore)

  const relicScore = RelicScorer.scoreRelic(relic, character)
  expect(relicScore.current).toBe(totalScore)
  expect(relicScore.current).toBe(relicScore.best)
  expect(relicScore.current).toBe(relicScore.average)
})
