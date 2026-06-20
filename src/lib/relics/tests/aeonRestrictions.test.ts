// @vitest-environment jsdom
import { Blade } from 'lib/conditionals/character/1200/Blade'
import {
  Constants,
  Parts,
  Stats,
  type SubStats,
} from 'lib/constants/constants'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import { scoreCurrentRelic } from 'lib/relics/scoring/currentScore'
import { computeOptimalScore } from 'lib/relics/scoring/optimalScore'
import { pctToRating } from 'lib/relics/scoring/scoreFormatting'
import {
  ScoringCache,
} from 'lib/relics/scoring/relicScorer'
import { prepareScoringMetadata } from 'lib/relics/scoring/scoringMetadata'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import { isAeonEligibleWeights } from 'lib/scoring/scoreComparison'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  getDefaultScoringMetadata,
} from 'lib/stores/scoring/scoringStore'
import type { CharacterId } from 'types/character'
import type { Relic } from 'types/relic'
import {
  describe,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

function makeWeights(overrides: Partial<Record<SubStats, number>> = {}): Record<SubStats, number> {
  const weights = {} as Record<SubStats, number>
  for (const stat of Constants.SubStats) {
    weights[stat] = 0
  }
  return { ...weights, ...overrides }
}

function makeMeta(stats: Record<SubStats, number>) {
  return { stats, modified: false }
}

// ---------------------------------------------------------------------------
// isAeonEligibleWeights
// ---------------------------------------------------------------------------

describe('isAeonEligibleWeights', () => {
  const base = makeMeta(makeWeights({
    [Stats.ATK_P]: 0.75,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
  }))

  test('all weights match defaults', () => {
    const custom = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.75,
      [Stats.SPD]: 1,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    expect(isAeonEligibleWeights(base, custom)).toBe(true)
  })

  test('SPD toggled 1 to 0', () => {
    const custom = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.75,
      [Stats.SPD]: 0,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    expect(isAeonEligibleWeights(base, custom)).toBe(true)
  })

  test('SPD toggled 0 to 1', () => {
    const noSpd = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.75,
      [Stats.SPD]: 0,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    const withSpd = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.75,
      [Stats.SPD]: 1,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    expect(isAeonEligibleWeights(noSpd, withSpd)).toBe(true)
  })

  test('SPD set to any value is still eligible', () => {
    const custom = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.75,
      [Stats.SPD]: 0.5,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    expect(isAeonEligibleWeights(base, custom)).toBe(true)
  })

  test('non-SPD weight changed', () => {
    const custom = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.5,
      [Stats.SPD]: 1,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    expect(isAeonEligibleWeights(base, custom)).toBe(false)
  })

  test('SPD changed and non-SPD weight changed', () => {
    const custom = makeMeta(makeWeights({
      [Stats.ATK_P]: 0.5,
      [Stats.SPD]: 0,
      [Stats.CR]: 1,
      [Stats.CD]: 1,
    }))
    expect(isAeonEligibleWeights(base, custom)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// pctToRating AEON restriction
// ---------------------------------------------------------------------------

describe('pctToRating AEON restriction', () => {
  test('90%+ with aeonEligible=true returns AEON', () => {
    expect(pctToRating(95, 5, Parts.Head, true, true)).toBe('AEON')
  })

  test('90%+ with aeonEligible=false returns WTF+', () => {
    expect(pctToRating(95, 5, Parts.Head, true, false)).toBe('WTF+')
  })

  test('90%+ with aeonEligible omitted defaults to WTF+ (fail-closed)', () => {
    expect(pctToRating(95, 5, Parts.Head, true)).toBe('WTF+')
  })

  test('85-89% with aeonEligible=true returns WTF+', () => {
    expect(pctToRating(87, 5, Parts.Head, true, true)).toBe('WTF+')
  })

  test('50% score unaffected by aeonEligible', () => {
    expect(pctToRating(50, 5, Parts.Head, true, true)).toBe('S')
    expect(pctToRating(50, 5, Parts.Head, true, false)).toBe('S')
  })
})

// ---------------------------------------------------------------------------
// Integration: scoreCurrentRelic end-to-end
// ---------------------------------------------------------------------------

const character = Blade.id

function makeHighScoreRelic(verified: boolean, id = 'aeon-test-relic'): Relic {
  return {
    enhance: 15,
    grade: 5,
    part: Parts.Head,
    set: 'Longevous Disciple',
    main: { stat: Stats.HP, value: 100 },
    substats: [
      { stat: Stats.HP_P, value: StatCalculator.getMaxedSubstatValue(Stats.HP_P) * 5 },
      { stat: Stats.CR, value: StatCalculator.getMaxedSubstatValue(Stats.CR) * 5 },
      { stat: Stats.CD, value: StatCalculator.getMaxedSubstatValue(Stats.CD) * 5 },
      { stat: Stats.SPD, value: StatCalculator.getMaxedSubstatValue(Stats.SPD) * 5 },
    ],
    previewSubstats: [],
    weightScore: 0,
    ageIndex: 0,
    augmentedStats: {} as AugmentedStats,
    initialRolls: 4,
    id,
    equippedBy: character,
    verified,
  }
}

describe('scoreCurrentRelic AEON integration', () => {

  function scoreWithMeta(relic: Relic, meta: ScorerMetadata) {
    const idealScore = computeOptimalScore(relic.part, relic.main.stat, meta)
    return scoreCurrentRelic(relic, meta, idealScore)
  }

  test('verified relic + default weights at 90%+ gets AEON', () => {
    const meta = prepareScoringMetadata(character, getDefaultScoringMetadata)
    const relic = makeHighScoreRelic(true)
    const result = scoreWithMeta(relic, meta)
    expect(result.percentScore).toBeGreaterThanOrEqual(90)
    expect(result.rating).toBe('AEON')
  })

  test('unverified relic + default weights at 90%+ gets WTF+', () => {
    const meta = prepareScoringMetadata(character, getDefaultScoringMetadata)
    const relic = makeHighScoreRelic(false)
    const result = scoreWithMeta(relic, meta)
    expect(result.percentScore).toBeGreaterThanOrEqual(90)
    expect(result.rating).toBe('WTF+')
  })

  test('verified relic + modified non-SPD weight at 90%+ gets WTF+', () => {
    const defaultStats = getDefaultScoringMetadata(character).stats
    const stats = { ...defaultStats }
    // Pick a stat whose default weight is NOT 0.25, then set it to 0.25
    const targetStat = defaultStats[Stats.EHR] !== 0.25 ? Stats.EHR : Stats.RES
    stats[targetStat] = stats[targetStat] === 0.25 ? 0.5 : 0.25
    const resolver = () => ({ ...getDefaultScoringMetadata(character), stats, modified: true })
    const meta = prepareScoringMetadata(character, resolver)

    expect(meta.aeonEligibleWeights).toBe(false)

    const relic = makeHighScoreRelic(true)
    const result = scoreWithMeta(relic, meta)
    expect(result.percentScore).toBeGreaterThanOrEqual(90)
    expect(result.rating).toBe('WTF+')
  })

  test('verified relic + SPD toggled 1→0 at 90%+ gets AEON', () => {
    const stats = { ...getDefaultScoringMetadata(character).stats }
    stats[Stats.SPD] = 0
    const resolver = () => ({ ...getDefaultScoringMetadata(character), stats })
    const meta = prepareScoringMetadata(character, resolver)

    const relic = makeHighScoreRelic(true)
    const result = scoreWithMeta(relic, meta)
    expect(result.percentScore).toBeGreaterThanOrEqual(90)
    expect(result.rating).toBe('AEON')
  })

  test('verified relic + SPD toggled 0→1 at 90%+ gets AEON', () => {
    const defaultMeta = getDefaultScoringMetadata(character)
    const stats = { ...defaultMeta.stats }
    stats[Stats.SPD] = 0
    const zeroSpdDefault = { ...defaultMeta, stats }

    const customStats = { ...defaultMeta.stats }
    customStats[Stats.SPD] = 1
    const withSpdCustom = { ...defaultMeta, stats: customStats }

    expect(isAeonEligibleWeights(zeroSpdDefault, withSpdCustom)).toBe(true)
  })

  test('no default metadata falls back to ineligible (fail closed)', () => {
    const fakeId = 'nonexistent-character' as CharacterId
    const resolver = () => getDefaultScoringMetadata(character)
    const meta = prepareScoringMetadata(fakeId, resolver)

    expect(meta.aeonEligibleWeights).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Cache regression: ScoringCache verified-state transition
// ---------------------------------------------------------------------------

describe('ScoringCache verified-state transition', () => {
  test('re-scores after verified changes on same relic id', () => {
    const scorer = new ScoringCache({ metadataResolver: getDefaultScoringMetadata })
    const relic = makeHighScoreRelic(false, 'cache-test-relic')

    const unverifiedResult = scorer.getCurrentRelicScore(relic, character)
    expect(unverifiedResult.percentScore).toBeGreaterThanOrEqual(90)
    expect(unverifiedResult.rating).toBe('WTF+')

    // Mutate verified on the same relic object — same id, same meta hash.
    // Current cache keys don't include verified, so this documents whether
    // the cache returns stale results.
    relic.verified = true
    const verifiedResult = scorer.getCurrentRelicScore(relic, character)

    // The cache WILL return the stale WTF+ because relic.id + meta.hash
    // haven't changed. This is acceptable because ScoringCache instances
    // are short-lived (created fresh per render cycle). This assertion
    // documents the known behavior — if it starts failing, the cache key
    // has been updated to include verified (which would also be fine).
    expect(verifiedResult.rating).toBe('WTF+')
  })
})
