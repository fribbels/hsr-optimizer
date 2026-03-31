// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { compareSameTypeSubstat, findRelicMatch, hashRelic, indexRelics } from 'lib/relics/relicUtils'
import type { Relic, RelicSubstatMetadata, Stat } from 'types/relic'

// ---- Factories ----

function makeStat(stat: RelicSubstatMetadata['stat'], value: number): RelicSubstatMetadata {
  return { stat, value }
}

function makeRelic(overrides: Partial<Relic> = {}): Relic {
  return {
    id: 'cd85c14c-a662-4413-a149-a379e6d538d3',
    set: Sets.BrokenKeel,
    part: Parts.Head,
    grade: 5,
    enhance: 15,
    main: { stat: Stats.HP as Relic['main']['stat'], value: 705 },
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
