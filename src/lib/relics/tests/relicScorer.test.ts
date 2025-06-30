import {
  Constants,
  Parts,
  Stats,
} from 'lib/constants/constants'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { StatCalculator } from 'lib/relics/statCalculator'
import DB from 'lib/state/db'

import { Metadata } from 'lib/state/metadata'
import { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

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
  } as Relic

  const score = RelicScorer.scoreRelicPotential(relic, character)
  expect(score.bestPct).toBe(0)
  expect(score.rerollAvgPct).toBe(0)
  expect(score.worstPct).toBe(0)
  expect(score.rerollAvgPct).toBe(0)

  const relicScore = RelicScorer.scoreCurrentRelic(relic, character)
  expect(relicScore.score).toBe('5.1')
  expect(relicScore.rating).toBe('F')
  expect(relicScore.mainStatScore).toBe(64.8)
})

test('relic-perfect', () => {
  // Test that when adding a stat, the relic predictor doesn't add the mainstat or an
  // existing substat

  const character = '1205' // Blade
  const scoringStats = DB.getScoringMetadata(character).stats

  const relic: Relic = {
    enhance: 12,
    grade: 5,
    part: Parts.PlanarSphere,
    set: 'Longevous Disciple',
    main: {
      stat: Stats.Wind_DMG,
      value: 100,
    },
    substats: [
      { stat: Stats.HP_P, value: StatCalculator.getMaxedSubstatValue(Stats.HP_P) },
      { stat: Stats.CR, value: StatCalculator.getMaxedSubstatValue(Stats.CR) },
      { stat: Stats.CD, value: StatCalculator.getMaxedSubstatValue(Stats.CD) },
      { stat: Stats.SPD, value: StatCalculator.getMaxedSubstatValue(Stats.SPD) * 5 },
    ],
    id: '77bde0f9-38ce-48f6-a936-79141e3f04ce',
    equippedBy: character,
  } as Relic

  const score = RelicScorer.scoreRelicPotential(relic, character)
  expect(score.bestPct).greaterThan(99).lessThanOrEqual(100)
})
