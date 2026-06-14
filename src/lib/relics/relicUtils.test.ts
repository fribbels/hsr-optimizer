// @vitest-environment jsdom
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  compareSameTypeSubstat,
  findRelicMatch,
  hashRelic,
  indexRelics,
} from 'lib/relics/relicUtils'
import type {
  Relic,
  RelicSubstatMetadata,
  Stat,
} from 'types/relic'
import {
  describe,
  expect,
  it,
} from 'vitest'

// ---- Factories ----

function makeStat(stat: RelicSubstatMetadata['stat'], value: number, rolls?: RelicSubstatMetadata['rolls']): RelicSubstatMetadata {
  if (!rolls) return { stat, value }
  const addedRolls = Math.max(0, rolls.high + rolls.mid + rolls.low - 1)
  return { stat, value, rolls, addedRolls }
}

function makeRelic(overrides: Partial<Relic> = {}): Relic {
  return {
    id: 'cd85c14c-a662-4413-a149-a379e6d538d3',
    set: Sets.BrokenKeel,
    part: Parts.Head,
    grade: 5,
    enhance: 15,
    main: { stat: Stats.HP, value: 705 },
    substats: [
      makeStat(Stats.ATK, 38.1),
      makeStat(Stats.CR, 6.48),
      makeStat(Stats.CD, 12.96),
      makeStat(Stats.SPD, 5.2),
    ],
    weightScore: 0,
    equippedBy: undefined,
    ageIndex: 0,
    augmentedStats: {} as Relic['augmentedStats'],
    previewSubstats: [],
    initialRolls: 0,
    ...overrides,
  } as Relic
}

// ---- Tests ----

describe('hashRelic', () => {
  it('hashRelic floors flat stat values (ATK, DEF, HP, SPD) before hashing', () => {
    const relicA = makeRelic({ substats: [makeStat(Stats.ATK, 38.9)] })
    const relicB = makeRelic({ substats: [makeStat(Stats.ATK, 38.1)] })
    expect(hashRelic(relicA)).toBe(hashRelic(relicB))
  })

  it('hashRelic rounds percentage stats to 1 decimal place', () => {
    const relicA = makeRelic({ substats: [makeStat(Stats.ATK_P, 5.83)] })
    const relicB = makeRelic({ substats: [makeStat(Stats.ATK_P, 5.89)] })
    // Both truncate to 5.8 at 1 decimal
    expect(hashRelic(relicA)).toBe(hashRelic(relicB))
  })

  it('hashRelic produces identical hashes for relics with equivalent stats after rounding', () => {
    const relicA = makeRelic({
      substats: [
        makeStat(Stats.HP, 100.7),
        makeStat(Stats.CR, 3.24),
      ],
    })
    const relicB = makeRelic({
      substats: [
        makeStat(Stats.HP, 100.3),
        makeStat(Stats.CR, 3.29),
      ],
    })
    expect(hashRelic(relicA)).toBe(hashRelic(relicB))
  })
})

describe('findRelicMatch', () => {
  it('findRelicMatch returns a match when old relic has same part/set/grade/mainstat and compatible substats', () => {
    const oldRelic = makeRelic({
      enhance: 9,
      substats: [
        makeStat(Stats.ATK, 30),
        makeStat(Stats.CR, 3.2),
      ],
    })
    const newRelic = makeRelic({
      enhance: 12,
      substats: [
        makeStat(Stats.ATK, 30),
        makeStat(Stats.CR, 6.4),
        makeStat(Stats.CD, 5.8),
      ],
    })
    const match = findRelicMatch(newRelic, [oldRelic])
    expect(match).toBe(oldRelic)
  })

  it('findRelicMatch returns undefined when no old relic matches', () => {
    const oldRelic = makeRelic({ set: Sets.MusketeerOfWildWheat })
    const newRelic = makeRelic({ set: Sets.BrokenKeel })
    expect(findRelicMatch(newRelic, [oldRelic])).toBeUndefined()
  })

  it('findRelicMatch requires new relic enhance >= old relic enhance', () => {
    const oldRelic = makeRelic({ enhance: 12 })
    const newRelic = makeRelic({ enhance: 9 })
    expect(findRelicMatch(newRelic, [oldRelic])).toBeUndefined()
  })
})

describe('compareSameTypeSubstat', () => {
  it('compareSameTypeSubstat returns 0 for equal values after rounding', () => {
    const old: Stat = { stat: Stats.CR, value: 3.24 }
    const cur: Stat = { stat: Stats.CR, value: 3.29 }
    // Both truncate to 3.2
    expect(compareSameTypeSubstat(old, cur)).toBe(0)
  })

  it('compareSameTypeSubstat returns 1 when new value is greater', () => {
    const old: Stat = { stat: Stats.ATK, value: 30.9 }
    const cur: Stat = { stat: Stats.ATK, value: 31.1 }
    // floor(30.9) = 30, floor(31.1) = 31
    expect(compareSameTypeSubstat(old, cur)).toBe(1)
  })

  it('compareSameTypeSubstat returns -1 when old value is greater', () => {
    const old: Stat = { stat: Stats.SPD, value: 6 }
    const cur: Stat = { stat: Stats.SPD, value: 5 }
    expect(compareSameTypeSubstat(old, cur)).toBe(-1)
  })
})

describe('indexRelics', () => {
  it('indexRelics assigns sequential ageIndex values starting from 0', () => {
    const relics = [
      makeRelic({ ageIndex: undefined }),
      makeRelic({ ageIndex: undefined }),
      makeRelic({ ageIndex: undefined }),
    ]
    indexRelics(relics)
    expect(relics[0].ageIndex).toBe(0)
    expect(relics[1].ageIndex).toBe(1)
    expect(relics[2].ageIndex).toBe(2)
  })

  it('indexRelics assigns ageIndex 0 to first relic without treating it as falsy', () => {
    const relics = [
      makeRelic({ ageIndex: undefined }),
      makeRelic({ ageIndex: undefined }),
    ]
    indexRelics(relics)
    // First relic gets ageIndex 0, second should be 0 + 1 = 1 (not re-assigned)
    expect(relics[0].ageIndex).toBe(0)
    expect(relics[1].ageIndex).toBe(1)

    // Run again — ageIndex 0 must not be treated as falsy/missing
    indexRelics(relics)
    expect(relics[0].ageIndex).toBe(0)
    expect(relics[1].ageIndex).toBe(1)
  })

  it('indexRelics preserves existing non-zero ageIndex values', () => {
    const relics = [
      makeRelic({ ageIndex: 10 }),
      makeRelic({ ageIndex: undefined }),
      makeRelic({ ageIndex: 20 }),
    ]
    indexRelics(relics)
    expect(relics[0].ageIndex).toBe(10)
    expect(relics[1].ageIndex).toBe(11)
    expect(relics[2].ageIndex).toBe(20)
  })
})

describe('hashRelic (additional)', () => {
  it('hashRelic produces different hashes for relics with different enhance values', () => {
    const relicA = makeRelic({ enhance: 9 })
    const relicB = makeRelic({ enhance: 12 })
    expect(hashRelic(relicA)).not.toBe(hashRelic(relicB))
  })
})

describe('findRelicMatch (additional)', () => {
  it('findRelicMatch matches regardless of substat ordering', () => {
    const oldRelic = makeRelic({
      enhance: 9,
      substats: [makeStat(Stats.CR, 3.2), makeStat(Stats.ATK, 30)],
    })
    const newRelic = makeRelic({
      enhance: 12,
      substats: [makeStat(Stats.ATK, 30), makeStat(Stats.CR, 6.4)],
    })
    expect(findRelicMatch(newRelic, [oldRelic])).toBe(oldRelic)
  })
})

describe('findRelicMatch — best-fit selection', () => {
  // Regression for the "showcase re-import duplicates equipped relic" bug: when the
  // save contains both an enh=0 precursor and the enh=15 upgraded twin, greedy
  // first-match would promote the precursor and orphan the real upgrade.
  it('returns the enh=15 exact match over an enh=0 precursor when both are valid', () => {
    const precursor = makeRelic({
      id: 'precursor',
      enhance: 0,
      main: { stat: Stats.ATK, value: 56.448 },
      substats: [
        makeStat(Stats.DEF_P, 4.32, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CR, 2.916, { high: 0, mid: 1, low: 0 }),
        makeStat(Stats.CD, 5.832, { high: 0, mid: 1, low: 0 }),
      ],
    })
    const upgradedSubstats = [
      makeStat(Stats.DEF_P, 9.18, { high: 0, mid: 1, low: 1 }),
      makeStat(Stats.SPD, 7.5, { high: 2, mid: 1, low: 0 }),
      makeStat(Stats.CR, 3.24, { high: 1, mid: 0, low: 0 }),
      makeStat(Stats.CD, 10.368, { high: 0, mid: 0, low: 2 }),
    ]
    const exactMatch = makeRelic({
      id: 'exact',
      enhance: 15,
      main: { stat: Stats.ATK, value: 352.8 },
      substats: upgradedSubstats,
    })
    const incoming = makeRelic({
      id: 'incoming',
      enhance: 15,
      main: { stat: Stats.ATK, value: 352.8 },
      substats: upgradedSubstats,
    })
    expect(findRelicMatch(incoming, [precursor, exactMatch])).toBe(exactMatch)
  })

  it('picks the higher-enhance candidate among multiple valid progressions', () => {
    const lowEnhance = makeRelic({
      id: 'low',
      enhance: 3,
      substats: [
        makeStat(Stats.ATK, 16.935, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CR, 2.916, { high: 0, mid: 1, low: 0 }),
        makeStat(Stats.CD, 5.832, { high: 0, mid: 1, low: 0 }),
        makeStat(Stats.SPD, 2.3, { high: 0, mid: 0, low: 1 }),
      ],
    })
    const highEnhance = makeRelic({
      id: 'high',
      enhance: 12,
      substats: [
        makeStat(Stats.ATK, 33.87, { high: 0, mid: 0, low: 2 }),
        makeStat(Stats.CR, 2.916, { high: 0, mid: 1, low: 0 }),
        makeStat(Stats.CD, 8.2, { high: 0, mid: 1, low: 1 }),
        makeStat(Stats.SPD, 4.9, { high: 0, mid: 1, low: 1 }),
      ],
    })
    const incoming = makeRelic({
      enhance: 15,
      substats: [
        makeStat(Stats.ATK, 33.87, { high: 0, mid: 0, low: 2 }),
        makeStat(Stats.CR, 6.156, { high: 1, mid: 1, low: 0 }),
        makeStat(Stats.CD, 8.2, { high: 0, mid: 1, low: 1 }),
        makeStat(Stats.SPD, 4.9, { high: 0, mid: 1, low: 1 }),
      ],
    })
    expect(findRelicMatch(incoming, [lowEnhance, highEnhance])).toBe(highEnhance)
    expect(findRelicMatch(incoming, [highEnhance, lowEnhance])).toBe(highEnhance)
  })
})

describe('findRelicMatch — roll-quality constraint', () => {
  // A substat's initial-roll quality (low/mid/high) is fixed at drop time. Subsequent
  // enhance tiers only ADD rolls, so new.rolls must be a per-bucket superset of old.
  it('rejects candidate when a same-count substat has different roll quality', () => {
    // CR stays at addedRolls=0 on both sides, but quality flips mid → high: impossible.
    const old = makeRelic({
      enhance: 0,
      substats: [
        makeStat(Stats.ATK, 16.935, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CR, 2.916, { high: 0, mid: 1, low: 0 }),
        makeStat(Stats.CD, 5.832, { high: 0, mid: 1, low: 0 }),
      ],
    })
    const incoming = makeRelic({
      enhance: 15,
      substats: [
        makeStat(Stats.ATK, 16.935, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CR, 3.24, { high: 1, mid: 0, low: 0 }),
        makeStat(Stats.CD, 5.832, { high: 0, mid: 1, low: 0 }),
        makeStat(Stats.SPD, 2.6, { high: 0, mid: 0, low: 1 }),
      ],
    })
    expect(findRelicMatch(incoming, [old])).toBeUndefined()
  })

  it('rejects when old rolls distribution is not a subset of new', () => {
    // Old: 1 high roll. New: 2 low rolls. New would have to drop the initial high.
    const old = makeRelic({
      enhance: 3,
      substats: [makeStat(Stats.CR, 3.24, { high: 1, mid: 0, low: 0 })],
    })
    const incoming = makeRelic({
      enhance: 6,
      substats: [makeStat(Stats.CR, 5.1, { high: 0, mid: 0, low: 2 })],
    })
    expect(findRelicMatch(incoming, [old])).toBeUndefined()
  })

  it('accepts candidate when new rolls distribution extends old in every bucket', () => {
    const old = makeRelic({
      enhance: 3,
      substats: [makeStat(Stats.ATK, 19, { high: 0, mid: 1, low: 0 })],
    })
    const incoming = makeRelic({
      enhance: 6,
      substats: [makeStat(Stats.ATK, 35, { high: 0, mid: 1, low: 1 })],
    })
    expect(findRelicMatch(incoming, [old])).toBe(old)
  })

  it('matches when values are equal but roll decompositions differ (ambiguous grading)', () => {
    // HP% 20.304 with 5 rolls can be decomposed as {h:3,m:1,l:1} or {h:2,m:3,l:0}.
    // Both are valid — stale decompositions from older algorithm versions must not
    // prevent matching on re-import.
    const old = makeRelic({
      enhance: 15,
      substats: [
        makeStat(Stats.HP_P, 20.304, { high: 3, mid: 1, low: 1 }),
        makeStat(Stats.DEF_P, 4.32, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CD, 5.184, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CR, 3.888, { high: 0, mid: 1, low: 0 }),
      ],
    })
    const incoming = makeRelic({
      enhance: 15,
      substats: [
        makeStat(Stats.HP_P, 20.304, { high: 2, mid: 3, low: 0 }),
        makeStat(Stats.DEF_P, 4.32, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CD, 5.184, { high: 0, mid: 0, low: 1 }),
        makeStat(Stats.CR, 3.888, { high: 0, mid: 1, low: 0 }),
      ],
    })
    expect(findRelicMatch(incoming, [old])).toBe(old)
  })

  it('falls back to value-only comparison when rolls metadata is missing on either side', () => {
    // Non-verified importers may omit rolls; matching must still succeed via values.
    const old = makeRelic({
      enhance: 3,
      substats: [makeStat(Stats.ATK, 19)],
    })
    const incoming = makeRelic({
      enhance: 6,
      substats: [makeStat(Stats.ATK, 35)],
    })
    expect(findRelicMatch(incoming, [old])).toBe(old)
  })
})
