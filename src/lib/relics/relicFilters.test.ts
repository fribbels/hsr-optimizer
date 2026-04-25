import {
  Parts,
  RelicSetFilterOptions,
  Stats,
} from 'lib/constants/constants'
import { RelicFilters } from 'lib/relics/relicFilters'
import { SetsRelicsNames } from 'lib/sets/setConfigRegistry'
import type { Form } from 'types/form'
import type { Relic } from 'types/relic'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Tests getFilteredRelicCounts' countsBySet return value for set filters,
// min-enhance exclusion, and keepCurrentRelics locking.

const relicStoreMock = vi.hoisted(() => ({ relics: [] as Relic[] }))
const characterStoreMock = vi.hoisted(() => ({ characters: [] as unknown[] }))

vi.mock('lib/stores/relic/relicStore', () => ({
  getRelics: () => relicStoreMock.relics,
  getRelicById: vi.fn(),
}))

vi.mock('lib/stores/character/characterStore', () => ({
  getCharacters: () => characterStoreMock.characters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCharacterById: (id: string) => (characterStoreMock.characters.find((c: any) => c.id === id) ?? null),
}))

const SET_A = SetsRelicsNames[0]
const SET_B = SetsRelicsNames[1]

function makeRelic(overrides: Partial<Relic> & { id: string, part: Relic['part'], set: Relic['set'] }): Relic {
  return {
    weightScore: 0,
    enhance: 15,
    equippedBy: undefined,
    grade: 5,
    main: { stat: Stats.HP, value: 0 },
    augmentedStats: {} as Relic['augmentedStats'],
    substats: [],
    previewSubstats: [],
    initialRolls: 0,
    ...overrides,
  }
}

function baseRequest(overrides: Partial<Form> = {}): Form {
  return {
    characterId: '1005',
    rank: 0,
    rankFilter: false,
    enhance: 0,
    grade: 0,
    exclude: [],
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    mainBody: [],
    mainFeet: [],
    mainPlanarSphere: [],
    mainLinkRope: [],
    mainStatUpscaleLevel: 0,
    relicSets: [],
    ornamentSets: [],
    weights: {},
    ...overrides,
  } as Form
}

describe('getFilteredRelicCounts (countsBySet)', () => {
  beforeEach(() => {
    relicStoreMock.relics = []
    characterStoreMock.characters = []
  })

  it('buckets relics by set index per slot', () => {
    relicStoreMock.relics = [
      makeRelic({ id: 'h1', part: Parts.Head, set: SET_A }),
      makeRelic({ id: 'h2', part: Parts.Head, set: SET_A }),
      makeRelic({ id: 'h3', part: Parts.Head, set: SET_B }),
      makeRelic({ id: 'g1', part: Parts.Hands, set: SET_A }),
      makeRelic({ id: 'g2', part: Parts.Hands, set: SET_B }),
    ]

    const { countsBySet } = RelicFilters.getFilteredRelicCounts(baseRequest())

    const setAIdx = SetsRelicsNames.indexOf(SET_A)
    const setBIdx = SetsRelicsNames.indexOf(SET_B)
    expect(countsBySet[Parts.Head][setAIdx]).toBe(2)
    expect(countsBySet[Parts.Head][setBIdx]).toBe(1)
    expect(countsBySet[Parts.Hands][setAIdx]).toBe(1)
    expect(countsBySet[Parts.Hands][setBIdx]).toBe(1)
  })

  it('excludes relics below min enhance', () => {
    // All set-A relics are enhance 3; all set-B relics are enhance 15.
    // Min enhance = 9 eliminates every set-A relic from the counts.
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      relicStoreMock.relics.push(makeRelic({ id: `${part}-a`, part, set: SET_A, enhance: 3 }))
      relicStoreMock.relics.push(makeRelic({ id: `${part}-b`, part, set: SET_B, enhance: 15 }))
    }

    const { counts, countsBySet } = RelicFilters.getFilteredRelicCounts(baseRequest({ enhance: 9 }))

    const setAIdx = SetsRelicsNames.indexOf(SET_A)
    const setBIdx = SetsRelicsNames.indexOf(SET_B)
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      expect(countsBySet[part][setAIdx]).toBe(0)
      expect(countsBySet[part][setBIdx]).toBe(1)
      expect(counts[part]).toBe(1)
    }
  })

  it('combined with relic2PlusAny set-A filter, countsBySet[setA]=0 for every slot', () => {
    // Same data as above plus the 2+Any set-A filter. This is the exact user-reported
    // scenario. relic2PlusAny widens the per-slot allow-list to ALL sets, so counts
    // still shows set-B relics, but the combinatorial valid-permutation count
    // computed from countsBySet must be 0 since no set-A relics remain.
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      relicStoreMock.relics.push(makeRelic({ id: `${part}-a`, part, set: SET_A, enhance: 3 }))
      relicStoreMock.relics.push(makeRelic({ id: `${part}-b`, part, set: SET_B, enhance: 15 }))
    }

    const { countsBySet } = RelicFilters.getFilteredRelicCounts(baseRequest({
      enhance: 9,
      relicSets: [[RelicSetFilterOptions.relic2PlusAny, SET_A]],
    }))

    const setAIdx = SetsRelicsNames.indexOf(SET_A)
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      expect(countsBySet[part][setAIdx]).toBe(0)
    }
  })

  it('with keepCurrentRelics, a locked relic that fails filters yields all-zero countsBySet for that slot', () => {
    // Character equips a head relic with enhance 3. Request sets keepCurrentRelics
    // AND min enhance 9. The locked relic fails the pre-lock enhance filter, so
    // lockedFound stays false and countsBySet[Head] must be all zeros.
    characterStoreMock.characters = [{
      id: '1005',
      equipped: { Head: 'locked-head' },
    }]
    relicStoreMock.relics = [
      makeRelic({ id: 'locked-head', part: Parts.Head, set: SET_A, enhance: 3 }),
      // Other slots have plenty of relics so only the locked-head slot ends up empty.
      makeRelic({ id: 'g', part: Parts.Hands, set: SET_A }),
      makeRelic({ id: 'b', part: Parts.Body, set: SET_A }),
      makeRelic({ id: 'f', part: Parts.Feet, set: SET_A }),
    ]

    const { counts, countsBySet } = RelicFilters.getFilteredRelicCounts(baseRequest({
      enhance: 9,
      keepCurrentRelics: true,
    }))

    expect(counts[Parts.Head]).toBe(0)
    expect(countsBySet[Parts.Head].every((c) => c === 0)).toBe(true)
  })

  it('respects 4Piece set filter: non-matching sets are excluded from countsBySet', () => {
    relicStoreMock.relics = [
      makeRelic({ id: 'h-a', part: Parts.Head, set: SET_A }),
      makeRelic({ id: 'h-b', part: Parts.Head, set: SET_B }),
    ]

    const { countsBySet } = RelicFilters.getFilteredRelicCounts(baseRequest({
      relicSets: [[RelicSetFilterOptions.relic4Piece, SET_A]],
    }))

    const setAIdx = SetsRelicsNames.indexOf(SET_A)
    const setBIdx = SetsRelicsNames.indexOf(SET_B)
    expect(countsBySet[Parts.Head][setAIdx]).toBe(1)
    expect(countsBySet[Parts.Head][setBIdx]).toBe(0)
  })
})
