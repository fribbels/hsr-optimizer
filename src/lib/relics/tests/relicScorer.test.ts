import { Constants, PartsMainStats } from 'lib/constants/constants'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import DB from 'lib/state/db'

import { Metadata } from 'lib/state/metadata'
import { Relic } from 'types/relic'
import { expect, test } from 'vitest'

Metadata.initialize()

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

  const totalScore = 5.5

  const score = RelicScorer.score(relic, character)
  expect(score.score).toBe('5.5') // the mainstat free roll
  expect(score.mainStatScore).toBe(64.8)

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

  const relicScore = RelicScorer.scoreRelic(relic, character, true)
  // Every stat should be distinct, including theoretical new ones
  expect(
    new Set([
      ...subStats,
      ...relicScore.meta!.bestNewSubstats,
      relic.main.stat,
    ]).size).toBe(subStats.length + relicScore.meta!.bestNewSubstats.length + 1)
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

test('ideal-mainstats-includes-best-mainstats', () => {
  // Test the assumption (that optimal relic scoring relies on) that the best ideal
  // mainstat matches the highest weight possible as a mainstat on that relic

  let didfail = false

  const chars = DB.getMetadata().characters
  for (const [id, char_] of Object.entries(chars)) {
    const char = <{ name: string }>char_
    const scoringMetadata = DB.getScoringMetadata(id)
    for (const part in scoringMetadata.parts) {
      const partstats = scoringMetadata.parts[part]
      const v0 = scoringMetadata.stats[partstats[0]]
      // let v0stat = partstats[0]
      let best = v0
      for (const partstat of partstats) {
        const vs = scoringMetadata.stats[partstat]
        if (vs !== v0) {
          best = Math.max(best, vs)
          // Enable this log to see where ideal mainstats may not have the same weight as each other
          // (a lot of characters have this)
          // console.log(`${char.name} ${part} mismatches on ${v0stat} (${v0}) vs ${partstat} (${vs})`)
        }
      }

      for (const [name, weight] of Object.entries(scoringMetadata.stats)) {
        if (!PartsMainStats[part].includes(name)) {
          continue
        }
        if (weight > best) {
          // The best ideal mainstats is missing a possible mainstat that's higher weighted
          // than everything else
          didfail = true
          console.warn('missing idealest mainstat', char.name, part, name, weight, best)
        } else if (weight === best && !partstats.includes(name)) {
          // Enable this log to see where the best ideal mainstats is missing one of the
          // highest weighted possible mainstats (desirable when biasing towards ERR on ropes)
          // console.log('missing ideal mainstat', char.name, part, name, weight, best)
        }
      }
    }
  }
  expect(didfail).toEqual(false)
})
