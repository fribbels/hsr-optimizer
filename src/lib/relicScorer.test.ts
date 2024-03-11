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
  expect(relicScore.current).toBe(relicScore.worst)
})

test('relic-addonestat', () => {
  // Test that when adding a stat, the relic predictor doesn't add the mainstat or an
  // existing substat

  const character = '1111' // luka
  const scoringStats = DB.getScoringMetadata(character).stats

  // The goal here is to have a character where we can exhaust the optimal substats
  // by putting them in the mainstat and three of the four substat slots
  const possibleSubstats = new Set(Constants.SubStats)
  const numOptimalSubstats = Object.entries(scoringStats)
    .filter((s) => possibleSubstats.has(s[0]))
    .filter((s) => s[1] === 1)
    .length
  expect(numOptimalSubstats).toBe(4)

  const mainStat = Constants.Stats.ATK_P
  const subStats = [
    Constants.Stats.SPD,
    Constants.Stats.EHR,
    Constants.Stats.ATK, // (not really 1 because it gets scaled)
  ]
  expect(scoringStats[mainStat]).toBe(1)
  for (const subStat of subStats) {
    expect(scoringStats[subStat]).toBe(1)
  }

  const relic: Relic = {
    enhance: 0,
    grade: 5,
    part: 'Body',
    set: 'Talia: Kingdom of Banditry',
    main: {
      stat: mainStat,
      value: 100,
    },
    substats: subStats.map((stat) => ({ stat: stat, value: 100 })),
    id: '77bde0f9-38ce-48f6-a936-79141e3f04ce',
    equippedBy: character,
  }

  const relicScore = RelicScorer.scoreRelic(relic, character)
  // Every stat should be distinct
  expect(new Set(relicScore.meta.bestSubstats.concat([relic.main.stat])).size).toBe(5)
})

test('relic-pctscore', () => {
  // Test that percentage weights are sane

  const character = '1202' // tingyun

  const relic: Relic = {
    enhance: 0,
    grade: 5,
    part: 'Body',
    set: 'Prisoner in Deep Confinement',
    main: {
      stat: Constants.Stats.DEF_P,
      value: 8.6,
    },
    substats: [
      { stat: Constants.Stats.HP_P, value: 3.8 },
      { stat: Constants.Stats.ATK_P, value: 4.3 },
      { stat: Constants.Stats.SPD, value: 2 },
      { stat: Constants.Stats.RES, value: 4.3 },
    ],
    id: '77bde0f9-38ce-48f6-a936-79141e3f04ce',
    equippedBy: character,
  }

  const relicScore = RelicScorer.scoreRelicPct(relic, character)
  expect(100).toBeGreaterThanOrEqual(relicScore.bestPct)
  expect(relicScore.bestPct).toBeGreaterThanOrEqual(relicScore.worstPct)
})
