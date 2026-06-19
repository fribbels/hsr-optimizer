import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { aggregateSubstatRolls } from 'lib/characterPreview/scoring/substatRollsAggregator'
import { Stats } from 'lib/constants/constants'
import type { SubStats } from 'lib/constants/constants'
import type {
  MainStats,
  Parts,
  Sets,
} from 'lib/constants/constants'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import { Metadata } from 'lib/state/metadataInitializer'
import type { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

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
  [Stats.HP, Stats.ATK, Stats.DEF, Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.SPD, Stats.CR, Stats.CD, Stats.EHR, Stats.RES, Stats.BE].map((s) => [s, 0]),
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

  expect(result).toHaveLength(6)

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

  // Pool 3 fallback fills remaining 3 slots with zero-roll entries
  const fillEntries = result.filter((r) => r.weight === 0)
  expect(fillEntries).toHaveLength(3)
  expect(fillEntries.every((r) => r.total === 0)).toBe(true)
})

test('fills to 6 entries with fallback stats when few weighted stats', () => {
  const result = aggregateSubstatRolls(
    emptyRelics(),
    weights({ [Stats.CR]: 1, [Stats.CD]: 0.5 } as Partial<Record<SubStats, number>>),
  )
  expect(result).toHaveLength(6)

  const weighted = result.filter((r) => r.weight > 0)
  expect(weighted).toHaveLength(2)
  expect(weighted.every((r) => r.total === 0 && r.effective === 0)).toBe(true)

  const fallback = result.filter((r) => r.weight === 0)
  expect(fallback).toHaveLength(4)
  expect(fallback.every((r) => r.total === 0)).toBe(true)
})

test('includes unweighted stats with rolls via Pool 2', () => {
  const relics = emptyRelics({
    Head: mockRelic('Head', [
      { stat: Stats.CR as SubStats, value: 6.48, rolls: { high: 2, mid: 0, low: 0 }, addedRolls: 1 },
      { stat: Stats.EHR as SubStats, value: 8.64, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
    ]),
  })

  const w = weights({ [Stats.CR]: 1 } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(relics, w)

  expect(result).toHaveLength(6)
  expect(result[0].stat).toBe(Stats.CR)

  // EHR has rolls but zero weight — picked up by Pool 2
  const ehr = result.find((r) => r.stat === Stats.EHR)!
  expect(ehr.total).toBe(2)
  expect(ehr.weight).toBe(0)
})

test('handles partial relic sets', () => {
  const relics = emptyRelics({
    Body: mockRelic('Body', [
      { stat: Stats.SPD as SubStats, value: 4.9, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
    ]),
  })

  const w = weights({ [Stats.SPD]: 1 } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(relics, w)

  expect(result).toHaveLength(6)
  expect(result[0].stat).toBe(Stats.SPD)
  expect(result[0].total).toBe(2)
  expect(result[0].effective).toBeCloseTo(1.9)
})

test('caps result at 6 entries when many weighted stats exist', () => {
  const w = weights({
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.ATK_P]: 1,
    [Stats.HP_P]: 1,
    [Stats.DEF_P]: 1,
    [Stats.SPD]: 1,
    [Stats.EHR]: 1,
    [Stats.BE]: 1,
  } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(emptyRelics(), w)
  expect(result).toHaveLength(6)
})

test('flat stats sort last on effective tie', () => {
  const relics = emptyRelics({
    Head: mockRelic('Head', [
      { stat: Stats.ATK as SubStats, value: 20, rolls: { high: 1, mid: 0, low: 0 }, addedRolls: 0 },
      { stat: Stats.CR as SubStats, value: 3.24, rolls: { high: 1, mid: 0, low: 0 }, addedRolls: 0 },
    ]),
  })

  const w = weights({ [Stats.ATK]: 0.4, [Stats.CR]: 1 } as Partial<Record<SubStats, number>>)
  const result = aggregateSubstatRolls(relics, w)

  const crIdx = result.findIndex((r) => r.stat === Stats.CR)
  const atkIdx = result.findIndex((r) => r.stat === Stats.ATK)
  expect(crIdx).toBeLessThan(atkIdx)
})
