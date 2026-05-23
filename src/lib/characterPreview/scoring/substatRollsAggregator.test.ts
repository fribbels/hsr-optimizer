import { Stats } from 'lib/constants/constants'
import type { SubStats } from 'lib/constants/constants'
import { Metadata } from 'lib/state/metadataInitializer'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { aggregateSubstatRolls } from './substatRollsAggregator'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import type { MainStats, Parts, Sets } from 'lib/constants/constants'
import type { Relic } from 'types/relic'
import { expect, test } from 'vitest'

Metadata.initialize()

function mockRelic(part: string, substats: Relic['substats']): Relic {
  return {
    enhance: 15,
    equippedBy: undefined,
    grade: 5,
    id: `test-${part}`,
    main: { stat: Stats.HP_P as MainStats, value: 43.2 },
    part: part as Parts,
    set: '101' as Sets,
    substats,
    previewSubstats: [],
    initialRolls: 4,
    augmentedStats: {} as AugmentedStats,
    weightScore: 0,
  }
}

function emptyRelics(overrides?: Partial<PreviewRelics>): PreviewRelics {
  return {
    Head: null,
    Hands: null,
    Body: null,
    Feet: null,
    PlanarSphere: null,
    LinkRope: null,
    ...overrides,
  } as PreviewRelics
}

const ZERO_WEIGHTS: Record<SubStats, number> = Object.fromEntries(
  [Stats.HP, Stats.ATK, Stats.DEF, Stats.HP_P, Stats.ATK_P, Stats.DEF_P,
    Stats.SPD, Stats.CR, Stats.CD, Stats.EHR, Stats.RES, Stats.BE,
  ].map((s) => [s, 0]),
) as Record<SubStats, number>

function weights(overrides: Partial<Record<SubStats, number>>): Record<SubStats, number> {
  return { ...ZERO_WEIGHTS, ...overrides } as Record<SubStats, number>
}

test('aggregates rolls across multiple relics with effective value', () => {
  const relics = emptyRelics({
    Head: mockRelic('Head', [
      { stat: Stats.CR as SubStats, value: 9.72, rolls: { high: 2, mid: 1, low: 0 }, addedRolls: 2 },
      { stat: Stats.CD as SubStats, value: 17.49, rolls: { high: 1, mid: 1, low: 1 }, addedRolls: 2 },
    ]),
    Hands: mockRelic('Hands', [
      { stat: Stats.CR as SubStats, value: 5.83, rolls: { high: 1, mid: 0, low: 1 }, addedRolls: 1 },
      { stat: Stats.ATK_P as SubStats, value: 7.77, rolls: { high: 0, mid: 2, low: 0 }, addedRolls: 1 },
    ]),
  })

  const w = weights({ [Stats.CR]: 1, [Stats.CD]: 1, [Stats.ATK_P]: 0.75 } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(relics, w)

  expect(result).toHaveLength(3)

  const cr = result.find((r) => r.stat === Stats.CR)!
  expect(cr.high).toBe(3)
  expect(cr.mid).toBe(1)
  expect(cr.low).toBe(1)
  expect(cr.total).toBe(5)
  expect(cr.effective).toBeCloseTo(4.7)

  const cd = result.find((r) => r.stat === Stats.CD)!
  expect(cd.high).toBe(1)
  expect(cd.mid).toBe(1)
  expect(cd.low).toBe(1)
  expect(cd.total).toBe(3)
  expect(cd.effective).toBeCloseTo(2.7)

  const atk = result.find((r) => r.stat === Stats.ATK_P)!
  expect(atk.high).toBe(0)
  expect(atk.mid).toBe(2)
  expect(atk.low).toBe(0)
  expect(atk.total).toBe(2)
  expect(atk.effective).toBeCloseTo(1.8)
})

test('includes weighted stats with zero rolls', () => {
  const result = aggregateSubstatRolls(
    emptyRelics(),
    weights({ [Stats.CR]: 1, [Stats.CD]: 0.5 } as Partial<Record<SubStats, number>>),
  )
  expect(result).toHaveLength(2)
  expect(result.every((r) => r.total === 0 && r.effective === 0)).toBe(true)
})

test('excludes stats with zero weight', () => {
  const relics = emptyRelics({
    Head: mockRelic('Head', [
      { stat: Stats.CR as SubStats, value: 6.48, rolls: { high: 2, mid: 0, low: 0 }, addedRolls: 1 },
      { stat: Stats.EHR as SubStats, value: 8.64, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
    ]),
  })

  const w = weights({ [Stats.CR]: 1 } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(relics, w)

  expect(result).toHaveLength(1)
  expect(result[0].stat).toBe(Stats.CR)
})

test('handles partial relic sets', () => {
  const relics = emptyRelics({
    Body: mockRelic('Body', [
      { stat: Stats.SPD as SubStats, value: 4.9, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
    ]),
  })

  const w = weights({ [Stats.SPD]: 1 } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(relics, w)

  expect(result).toHaveLength(1)
  expect(result[0].stat).toBe(Stats.SPD)
  expect(result[0].total).toBe(2)
  expect(result[0].effective).toBeCloseTo(1.9)
})
