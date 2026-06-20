// @vitest-environment jsdom
import { Blade } from 'lib/conditionals/character/1200/Blade'
import {
  Constants,
  Parts,
  Stats,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import { computeFutureScores } from 'lib/relics/scoring/futureScore'
import { computeOptimalScore } from 'lib/relics/scoring/optimalScore'
import {
  RelicScorer,
  ScoringCache,
} from 'lib/relics/scoring/relicScorer'
import {
  substatPotentialUnits,
} from 'lib/relics/scoring/scoringConstants'
import { prepareScoringMetadata } from 'lib/relics/scoring/scoringMetadata'
import { StatCalculator } from 'lib/relics/statCalculator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  getDefaultScoringMetadata,
  getScoringMetadata,
  useScoringStore,
} from 'lib/stores/scoring/scoringStore'
import type { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

// Correct mainstat with all zero-weight substats should score 0
test('relic-mainstatonly', () => {
  const character = Blade.id
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
    substats: subStats.map((stat) => ({ stat: stat, value: 100 })),
    previewSubstats: [],
    weightScore: 0,
    ageIndex: 0,
    augmentedStats: {} as AugmentedStats,
    initialRolls: 0,
    id: '77bde0f9-38ce-48f6-a936-79141e3f04ce',
    equippedBy: character,
  }

  const score = RelicScorer.scoreRelicPotential(relic, character)
  expect(score.currentPct).toBe(0)
  expect(score.bestPct).toBe(0)
  expect(score.averagePct).toBe(0)
  expect(score.worstPct).toBe(0)
  expect(score.rerollAvgPct).toBe(0)
  expect(score.blockedRerollAvgPct).toBe(0)

  const relicScore = RelicScorer.scoreCurrentRelic(relic, character)
  expect(relicScore.percentScore).toBe(0)
  expect(relicScore.rating).toBe('?')
})

// Best substats at max rolls should predict near-100% potential
test('relic-perfect', () => {
  const character = Blade.id

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
    previewSubstats: [],
    weightScore: 0,
    ageIndex: 0,
    augmentedStats: {} as AugmentedStats,
    initialRolls: 0,
    id: '77bde0f9-38ce-48f6-a936-79141e3f04ce',
    equippedBy: character,
  } as Relic

  const score = RelicScorer.scoreRelicPotential(relic, character)
  expect(score.bestPct).greaterThan(99).lessThanOrEqual(100)
})

test('scoring cache metadata resolver can ignore user overrides', () => {
  const character = Blade.id

  try {
    const stats = {} as Record<SubStats, number>
    for (const s of Constants.SubStats) stats[s] = 0
    useScoringStore.getState().setScoringMetadataOverrides({ [character]: { stats } })

    const relic: Relic = {
      enhance: 15,
      grade: 5,
      part: Parts.Hands,
      set: 'Longevous Disciple',
      main: {
        stat: Stats.ATK,
        value: 100,
      },
      substats: [Stats.HP_P, Stats.CR, Stats.CD, Stats.SPD].map((stat) => ({
        stat,
        value: StatCalculator.getMaxedSubstatValue(stat),
      })),
      previewSubstats: [],
      weightScore: 0,
      ageIndex: 0,
      augmentedStats: {} as AugmentedStats,
      initialRolls: 0,
      id: '3cc6d912-6f7f-4dd7-8d1e-484033f15f5f',
      equippedBy: character,
    }

    const overrideScorer = new ScoringCache()
    const defaultScorer = new ScoringCache({ metadataResolver: getDefaultScoringMetadata })

    const overrideScore = overrideScorer.getCurrentRelicScore(relic, character)
    const defaultScore = defaultScorer.getCurrentRelicScore(relic, character)
    expect(overrideScore.percentScore).toBe(0)
    expect(defaultScore.percentScore).toBeGreaterThan(0)

    const overridePotential = overrideScorer.scoreRelicPotential(relic, character)
    const defaultPotential = defaultScorer.scoreRelicPotential(relic, character)
    expect(overridePotential.bestPct).toBe(0)
    expect(defaultPotential.bestPct).toBeGreaterThan(0)
  } finally {
    useScoringStore.getState().clearCharacterOverrides(character)
  }
})

test('default metadata resolver does not let scorer preparation mutate game metadata stats', () => {
  const character = Blade.id
  const defaults = getGameMetadata().characters[character].scoringMetadata
  const originalStats = { ...defaults.stats }

  const meta = prepareScoringMetadata(character, getDefaultScoringMetadata)
  meta.stats[Stats.HP_P] = 999

  expect(defaults.stats).toEqual(originalStats)
})

// Two max-rolled relics of weight-1.0 substats both score 100%, whichever stat is 6-stacked.
// Pre-fix, the CD-stacked one scored 97.9% because SPD used a larger main-stat-derived scale.
test('relic-spd-equal-roll-potential', () => {
  const character = Blade.id

  try {
    // Weights: exactly HP%/CR/CD/SPD = 1, every other substat 0.
    const stats = {} as Record<SubStats, number>
    for (const s of Constants.SubStats) stats[s] = 0
    for (const s of [Stats.HP_P, Stats.CR, Stats.CD, Stats.SPD]) stats[s] = 1
    useScoringStore.getState().setScoringMetadataOverrides({ [character]: { stats } })

    const meta = prepareScoringMetadata(character)
    const idealScore = computeOptimalScore(Parts.Hands, Stats.ATK, meta)

    // Maxed +15 Hands relic; `stacked` gets 6 high rolls, the others 1 each.
    const potential = (stacked: SubStats) => {
      const relic = {
        enhance: 15,
        grade: 5,
        part: Parts.Hands,
        main: { stat: Stats.ATK },
        substats: [Stats.HP_P, Stats.SPD, Stats.CR, Stats.CD].map((stat) => ({
          stat,
          value: StatCalculator.getMaxedSubstatValue(stat) * (stat === stacked ? 6 : 1),
        })),
        previewSubstats: [],
      } as unknown as Relic
      return computeFutureScores(relic, meta, idealScore, false).current
    }

    expect(potential(Stats.CD)).toBeCloseTo(100, 4)
    expect(potential(Stats.SPD)).toBeCloseTo(100, 4)
  } finally {
    useScoringStore.getState().clearCharacterOverrides(character)
  }
})

test('substat potential helper preserves raw SPD tier ratios', () => {
  expect(substatPotentialUnits(Stats.SPD, SubStatValues[Stats.SPD][5].high)).toBeCloseTo(6.48, 6)
  expect(substatPotentialUnits(Stats.SPD, SubStatValues[Stats.SPD][5].mid)).toBeCloseTo(5.732307692, 6)
  expect(substatPotentialUnits(Stats.SPD, SubStatValues[Stats.SPD][5].low)).toBeCloseTo(4.984615385, 6)

  expect(substatPotentialUnits(Stats.SPD, SubStatValues[Stats.SPD][5].mid)).not.toBeCloseTo(6.48 * 0.9, 6)
  expect(substatPotentialUnits(Stats.SPD, SubStatValues[Stats.SPD][5].low)).not.toBeCloseTo(6.48 * 0.8, 6)
})

test('future worst and blocked reroll potential use actual roll potential for tied weights', () => {
  const character = Blade.id

  try {
    const stats = {} as Record<SubStats, number>
    for (const s of Constants.SubStats) stats[s] = 0
    for (const s of [Stats.SPD, Stats.CD, Stats.HP_P, Stats.ATK_P]) stats[s] = 1
    useScoringStore.getState().setScoringMetadataOverrides({ [character]: { stats } })

    const meta = prepareScoringMetadata(character)
    const idealScore = computeOptimalScore(Parts.Hands, Stats.ATK, meta)
    const score = (substats: SubStats[]) => {
      const relic = {
        enhance: 0,
        grade: 5,
        part: Parts.Hands,
        main: { stat: Stats.ATK },
        substats: substats.map((stat) => ({
          stat,
          value: SubStatValues[stat][5].high,
          addedRolls: 1,
        })),
        previewSubstats: [],
      } as unknown as Relic

      return computeFutureScores(relic, meta, idealScore, false)
    }

    const cdFirst = score([Stats.CD, Stats.SPD, Stats.HP_P, Stats.ATK_P])
    const spdFirst = score([Stats.SPD, Stats.CD, Stats.HP_P, Stats.ATK_P])

    expect(cdFirst.worst).toBeCloseTo(spdFirst.worst, 6)
    expect(cdFirst.blockerAvg).toBeCloseTo(spdFirst.blockerAvg, 6)
  } finally {
    useScoringStore.getState().clearCharacterOverrides(character)
  }
})
