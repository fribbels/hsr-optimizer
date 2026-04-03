import { describe, expect, it } from 'vitest'
import { expandSetFilters, parseDisplayToModalState, buildDisplayFromModalState, DEFAULT_SET_FILTERS } from 'lib/stores/optimizerForm/setFilterConversions'
import { type SetFilters, TwoPieceSlotType } from 'lib/stores/optimizerForm/setFilterTypes'
import { type SetsRelics, type SetsOrnaments, STAT_TAG_TO_SETS } from 'lib/sets/setConfigRegistry'
import { Stats } from 'lib/constants/constants'

const SET_A = 'Musketeer of Wild Wheat' as SetsRelics
const SET_B = 'Knight of Purity Palace' as SetsRelics
const ORN_A = 'Rutilant Arena' as SetsOrnaments
const ORN_B = 'Broken Keel' as SetsOrnaments

describe('expandSetFilters', () => {
  it('empty display produces empty pipeline filters', () => {
    const result = expandSetFilters(DEFAULT_SET_FILTERS)
    expect(result.relicSets).toEqual([])
    expect(result.ornamentSets).toEqual([])
  })

  it('fourPiece produces 4-piece tuples', () => {
    const display: SetFilters = { fourPiece: [SET_A, SET_B], twoPieceCombos: [], ornaments: [] }
    const result = expandSetFilters(display)
    expect(result.relicSets).toEqual([
      ['4 Piece', SET_A],
      ['4 Piece', SET_B],
    ])
  })

  it('2P set + set produces 2+2 tuple', () => {
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Set, value: SET_A }, b: { type: TwoPieceSlotType.Set, value: SET_B } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toEqual([['2 + 2 Piece', SET_A, SET_B]])
  })

  it('2P set + any produces 2+any tuple', () => {
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Set, value: SET_A }, b: { type: TwoPieceSlotType.Any } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toEqual([['2 + Any', SET_A]])
  })

  it('2P stat + any produces 2+any tuples for each resolved set', () => {
    const atkSets = STAT_TAG_TO_SETS[Stats.ATK_P] ?? []
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Stat, value: Stats.ATK_P }, b: { type: TwoPieceSlotType.Any } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toHaveLength(atkSets.length)
    for (const set of atkSets) {
      expect(result.relicSets).toContainEqual(['2 + Any', set])
    }
  })

  it('2P stat + stat produces cartesian product of 2+2 tuples', () => {
    const atkSets = STAT_TAG_TO_SETS[Stats.ATK_P] ?? []
    const hpSets = STAT_TAG_TO_SETS[Stats.HP_P] ?? []
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Stat, value: Stats.ATK_P }, b: { type: TwoPieceSlotType.Stat, value: Stats.HP_P } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toHaveLength(atkSets.length * hpSets.length)
    for (const a of atkSets) {
      for (const b of hpSets) {
        expect(result.relicSets).toContainEqual(['2 + 2 Piece', a, b])
      }
    }
  })

  it('2P same stat + stat excludes same-set pairs to avoid matching 4-piece', () => {
    const atkSets = STAT_TAG_TO_SETS[Stats.ATK_P] ?? []
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Stat, value: Stats.ATK_P }, b: { type: TwoPieceSlotType.Stat, value: Stats.ATK_P } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    // Should not contain any pair where both sets are the same
    for (const entry of result.relicSets) {
      if (entry.length === 3) {
        expect(entry[1]).not.toBe(entry[2])
      }
    }
    // Should have (n * n - n) entries: full cartesian minus the diagonal
    expect(result.relicSets).toHaveLength(atkSets.length * atkSets.length - atkSets.length)
  })

  it('2P set + stat produces 2+2 tuples for set crossed with stat-resolved sets', () => {
    const beSets = STAT_TAG_TO_SETS[Stats.BE] ?? []
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Set, value: SET_A }, b: { type: TwoPieceSlotType.Stat, value: Stats.BE } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toHaveLength(beSets.length)
    for (const b of beSets) {
      expect(result.relicSets).toContainEqual(['2 + 2 Piece', SET_A, b])
    }
  })

  it('2P any + any produces 2+2 any tuple', () => {
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Any }, b: { type: TwoPieceSlotType.Any } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toEqual([['2 + 2 Any']])
  })

  it('2P any + set produces 2+any tuple (reversed slot order)', () => {
    const display: SetFilters = {
      fourPiece: [],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Any }, b: { type: TwoPieceSlotType.Set, value: SET_A } }],
      ornaments: [],
    }
    const result = expandSetFilters(display)
    expect(result.relicSets).toEqual([['2 + Any', SET_A]])
  })

  it('ornaments pass through unchanged', () => {
    const display: SetFilters = { fourPiece: [], twoPieceCombos: [], ornaments: [ORN_A, ORN_B] }
    const result = expandSetFilters(display)
    expect(result.ornamentSets).toEqual([ORN_A, ORN_B])
  })
})

describe('parseDisplayToModalState / buildDisplayFromModalState round-trip', () => {
  it('round-trips correctly', () => {
    const display: SetFilters = {
      fourPiece: [SET_A],
      twoPieceCombos: [{ a: { type: TwoPieceSlotType.Set, value: SET_B }, b: { type: TwoPieceSlotType.Any } }],
      ornaments: [ORN_A],
    }
    const modalState = parseDisplayToModalState(display)
    const rebuilt = buildDisplayFromModalState(modalState)
    expect(rebuilt.fourPiece).toEqual(display.fourPiece)
    expect(rebuilt.twoPieceCombos).toEqual(display.twoPieceCombos)
    expect(rebuilt.ornaments).toEqual(display.ornaments)
  })
})
