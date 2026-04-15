// @vitest-environment jsdom
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import type { Relic } from 'types/relic'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import {
  getRelicById,
  getRelics,
  useRelicStore,
} from './relicStore'

// ---- Constants ----

const RELIC_1 = 'cd85c14c-a662-4413-a149-a379e6d538d3'
const RELIC_2 = '0bd7404f-3420-4bf5-9e45-f79343728685'
const RELIC_3 = '77ac4c85-21a7-4526-999a-6e54646dda6d'
const NON_EXISTENT_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff'

// ---- Helpers ----

function state() {
  return useRelicStore.getState()
}

function makeRelic(overrides: Partial<Relic> = {}): Relic {
  return {
    id: RELIC_1,
    set: Sets.BrokenKeel,
    part: Parts.Head,
    grade: 5,
    enhance: 15,
    equippedBy: undefined,
    weightScore: 0,
    ageIndex: 0,
    main: { stat: Stats.HP, value: 705.6 },
    substats: [],
    previewSubstats: [],
    initialRolls: 0,
    augmentedStats: {} as Relic['augmentedStats'],
    ...overrides,
  }
}

// ---- Reset ----

beforeEach(() => {
  useRelicStore.setState(useRelicStore.getInitialState())
})

// ---- Tests ----

describe('useRelicStore', () => {
  describe('initial state', () => {
    it('store initializes with empty relics array and empty relicsById index', () => {
      expect(state().relics).toEqual([])
      expect(state().relicsById).toEqual({})
    })
  })

  describe('relic management', () => {
    it('setRelics populates both relics array and relicsById index', () => {
      const r1 = makeRelic({ id: RELIC_1, ageIndex: 0 })
      const r2 = makeRelic({ id: RELIC_2, ageIndex: 1, part: Parts.Hands })

      state().setRelics([r1, r2])

      expect(state().relics).toHaveLength(2)
      expect(state().relicsById[RELIC_1]).toBeDefined()
      expect(state().relicsById[RELIC_2]).toBeDefined()
    })

    it('setRelics with empty array clears both relics and relicsById', () => {
      state().setRelics([makeRelic()])
      state().setRelics([])

      expect(state().relics).toEqual([])
      expect(state().relicsById).toEqual({})
    })

    it('setRelics assigns ageIndex to relics that lack one', () => {
      const r1 = makeRelic({ id: RELIC_1, ageIndex: undefined as unknown as number })
      const r2 = makeRelic({ id: RELIC_2, ageIndex: undefined as unknown as number })

      state().setRelics([r1, r2])

      expect(state().relics[0].ageIndex).toBe(0)
      expect(state().relics[1].ageIndex).toBe(1)
    })

    it('relicsById contains every relic present in the relics array', () => {
      const relics = [
        makeRelic({ id: RELIC_1, ageIndex: 0 }),
        makeRelic({ id: RELIC_2, ageIndex: 1 }),
        makeRelic({ id: RELIC_3, ageIndex: 2 }),
      ]

      state().setRelics(relics)

      for (const relic of relics) {
        expect(state().relicsById[relic.id]).toBeDefined()
        expect(state().relicsById[relic.id]!.id).toBe(relic.id)
      }
    })
  })

  describe('single relic operations', () => {
    it('upsertRelic adds a new relic to both relics array and relicsById index', () => {
      const relic = makeRelic({ id: RELIC_1 })
      state().upsertRelic(relic)

      expect(state().relics).toHaveLength(1)
      expect(state().relicsById[RELIC_1]).toBeDefined()
    })

    it('upsertRelic updates an existing relic by ID in both structures', () => {
      state().upsertRelic(makeRelic({ id: RELIC_1, enhance: 9 }))
      state().upsertRelic(makeRelic({ id: RELIC_1, enhance: 15 }))

      expect(state().relics).toHaveLength(1)
      expect(state().relicsById[RELIC_1]!.enhance).toBe(15)
    })

    it('upsertRelic assigns ageIndex to relics that lack one', () => {
      state().upsertRelic(makeRelic({ id: RELIC_1, ageIndex: 5 }))
      const newRelic = makeRelic({ id: RELIC_2 })
      delete (newRelic as Record<string, unknown>).ageIndex
      state().upsertRelic(newRelic)

      expect(state().relicsById[RELIC_2]!.ageIndex).toBe(6)
    })

    it('upsertRelic does not mutate the caller\'s relic object', () => {
      state().upsertRelic(makeRelic({ id: RELIC_1, ageIndex: 5 }))

      const callerRelic = makeRelic({ id: RELIC_2 })
      delete (callerRelic as Record<string, unknown>).ageIndex
      const snapshot = { ...callerRelic }

      state().upsertRelic(callerRelic)

      // The store should have assigned an ageIndex
      expect(state().relicsById[RELIC_2]!.ageIndex).toBe(6)
      // But the caller's object must be untouched
      expect(callerRelic).toEqual(snapshot)
    })

    it('deleteRelic removes relic from both array and index', () => {
      state().setRelics([
        makeRelic({ id: RELIC_1, ageIndex: 0 }),
        makeRelic({ id: RELIC_2, ageIndex: 1 }),
      ])

      state().deleteRelic(RELIC_1)

      expect(state().relics).toHaveLength(1)
      expect(state().relicsById[RELIC_1]).toBeUndefined()
      expect(state().relicsById[RELIC_2]).toBeDefined()
    })

    it('deleteRelic with non-existent ID leaves state unchanged', () => {
      state().setRelics([makeRelic({ id: RELIC_1, ageIndex: 0 })])

      state().deleteRelic(NON_EXISTENT_ID)

      expect(state().relics).toHaveLength(1)
      expect(state().relicsById[RELIC_1]).toBeDefined()
    })
  })

  describe('batch operations', () => {
    it('batchUpsertRelics upserts multiple relics in a single state update', () => {
      const r1 = makeRelic({ id: RELIC_1, ageIndex: 0 })
      const r2 = makeRelic({ id: RELIC_2, ageIndex: 1 })

      state().batchUpsertRelics([r1, r2])

      expect(state().relics).toHaveLength(2)
      expect(state().relicsById[RELIC_1]).toBeDefined()
      expect(state().relicsById[RELIC_2]).toBeDefined()
    })

    it('batchUpsertRelics assigns sequential ageIndex to new relics', () => {
      state().setRelics([makeRelic({ id: RELIC_1, ageIndex: 5 })])

      const r2 = makeRelic({ id: RELIC_2 })
      const r3 = makeRelic({ id: RELIC_3 })
      delete (r2 as Record<string, unknown>).ageIndex
      delete (r3 as Record<string, unknown>).ageIndex

      state().batchUpsertRelics([r2, r3])

      expect(state().relicsById[RELIC_2]!.ageIndex).toBe(6)
      expect(state().relicsById[RELIC_3]!.ageIndex).toBe(7)
    })

    it('batchUpsertRelics does not mutate the caller\'s relic objects', () => {
      state().setRelics([makeRelic({ id: RELIC_1, ageIndex: 5 })])

      const r2 = makeRelic({ id: RELIC_2 })
      const r3 = makeRelic({ id: RELIC_3 })
      delete (r2 as Record<string, unknown>).ageIndex
      delete (r3 as Record<string, unknown>).ageIndex
      const snapshot2 = { ...r2 }
      const snapshot3 = { ...r3 }

      state().batchUpsertRelics([r2, r3])

      // The store should have assigned ageIndices
      expect(state().relicsById[RELIC_2]!.ageIndex).toBe(6)
      expect(state().relicsById[RELIC_3]!.ageIndex).toBe(7)
      // But the caller's objects must be untouched
      expect(r2).toEqual(snapshot2)
      expect(r3).toEqual(snapshot3)
    })

    it('batchUpsertRelics keeps relicsById in sync with the relics array', () => {
      const relics = [
        makeRelic({ id: RELIC_1, ageIndex: 0 }),
        makeRelic({ id: RELIC_2, ageIndex: 1 }),
      ]

      state().batchUpsertRelics(relics)

      const byIdKeys = Object.keys(state().relicsById)
      expect(byIdKeys).toHaveLength(state().relics.length)
      for (const relic of state().relics) {
        expect(state().relicsById[relic.id]).toBe(relic)
      }
    })
  })

  describe('imperative getters', () => {
    it('getRelics returns current relics array', () => {
      state().setRelics([makeRelic({ id: RELIC_1, ageIndex: 0 })])
      expect(getRelics()).toHaveLength(1)
    })

    it('getRelicById returns undefined for non-existent ID', () => {
      expect(getRelicById(NON_EXISTENT_ID)).toBeUndefined()
    })

    it('getRelicById returns undefined for undefined input', () => {
      expect(getRelicById(undefined)).toBeUndefined()
    })

    it('getRelicById returns the matching relic for a valid ID', () => {
      state().setRelics([makeRelic({ id: RELIC_1, ageIndex: 0 })])
      expect(getRelicById(RELIC_1)!.id).toBe(RELIC_1)
    })
  })
})
