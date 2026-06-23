// @vitest-environment jsdom
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  getCharacterById,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import {
  getRelicById,
  useRelicStore,
} from 'lib/stores/relic/relicStore'
import type * as FrontendUtils from 'lib/utils/frontendUtils'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { Relic } from 'types/relic'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  equipRelic,
  switchRelics,
  upsertRelicWithEquipment,
} from './equipmentService'

// ---- Mocks ----

vi.mock('lib/utils/frontendUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof FrontendUtils>()
  return { ...actual, debounceEffect: vi.fn() }
})

vi.mock('lib/stores/gridStore', () => ({
  gridStore: { relicsGridApi: vi.fn(() => null) },
}))

// ---- Constants ----

const CHAR_1 = '1001' as CharacterId
const CHAR_2 = '1002' as CharacterId
const RELIC_1 = 'r1111111-1111-1111-1111-111111111111'
const RELIC_2 = 'r2222222-2222-2222-2222-222222222222'
const NON_EXISTENT_CHAR = '9999' as CharacterId
const NON_EXISTENT_RELIC = 'ffffffff-ffff-ffff-ffff-ffffffffffff'

// ---- Helpers ----

function makeRelic(overrides: Partial<Relic> = {}): Relic {
  return {
    id: RELIC_1,
    set: Sets.MusketeerOfWildWheat,
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

function makeCharacter(id: CharacterId, overrides: Partial<Character> = {}): Character {
  return {
    id,
    equipped: {},
    form: { characterId: id } as Character['form'],
    builds: [],
    ...overrides,
  }
}

// ---- Reset ----

beforeEach(() => {
  useRelicStore.setState(useRelicStore.getInitialState())
  useCharacterStore.setState(useCharacterStore.getInitialState())
  useGlobalStore.setState(useGlobalStore.getInitialState())
})

// ---- Tests ----

describe('equipmentService', () => {
  describe('equipRelic — C3 null guards', () => {
    it('returns early when relic ID does not exist in store', () => {
      useCharacterStore.getState().setCharacters([makeCharacter(CHAR_1)])

      expect(() => equipRelic({ id: NON_EXISTENT_RELIC } as Relic, CHAR_1)).not.toThrow()
      expect(getCharacterById(CHAR_1)!.equipped).toEqual({})
    })

    it('returns early when character does not exist in store', () => {
      const relic = makeRelic({ id: RELIC_1 })
      useRelicStore.getState().setRelics([relic])

      expect(() => equipRelic(relic, NON_EXISTENT_CHAR)).not.toThrow()
      expect(getRelicById(RELIC_1)!.equippedBy).toBeUndefined()
    })

    it('equips a relic to a character (happy path)', () => {
      const relic = makeRelic({ id: RELIC_1 })
      useRelicStore.getState().setRelics([relic])
      useCharacterStore.getState().setCharacters([makeCharacter(CHAR_1)])

      equipRelic(relic, CHAR_1)

      expect(getRelicById(RELIC_1)!.equippedBy).toBe(CHAR_1)
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBe(RELIC_1)
    })
  })

  describe('switchRelics — C3 null guards', () => {
    it('returns early when source character does not exist in store', () => {
      useCharacterStore.getState().setCharacters([makeCharacter(CHAR_2)])

      expect(() => switchRelics(NON_EXISTENT_CHAR, CHAR_2)).not.toThrow()
      expect(getCharacterById(CHAR_2)!.equipped).toEqual({})
    })

    it('returns early when target character does not exist in store', () => {
      useCharacterStore.getState().setCharacters([makeCharacter(CHAR_1)])

      expect(() => switchRelics(CHAR_1, NON_EXISTENT_CHAR)).not.toThrow()
      expect(getCharacterById(CHAR_1)!.equipped).toEqual({})
    })
  })

  describe('switchRelics — swaps all relics between characters', () => {
    it('swaps relics when target has more equipped than source', () => {
      // Source has Head only, Target has Head + Body
      const sourceHead = makeRelic({ id: 'src-head', part: Parts.Head, equippedBy: CHAR_1 })
      const targetHead = makeRelic({ id: 'tgt-head', part: Parts.Head, equippedBy: CHAR_2 })
      const targetBody = makeRelic({ id: 'tgt-body', part: Parts.Body, equippedBy: CHAR_2 })

      useRelicStore.getState().setRelics([sourceHead, targetHead, targetBody])
      useCharacterStore.getState().setCharacters([
        makeCharacter(CHAR_1, { equipped: { [Parts.Head]: 'src-head' } }),
        makeCharacter(CHAR_2, { equipped: { [Parts.Head]: 'tgt-head', [Parts.Body]: 'tgt-body' } }),
      ])

      switchRelics(CHAR_1, CHAR_2)

      // Source should now have target's Head + Body
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBe('tgt-head')
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Body]).toBe('tgt-body')
      // Target should now have source's Head only
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Head]).toBe('src-head')
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Body]).toBeUndefined()
    })

    it('swaps relics when source has more equipped than target', () => {
      // Source has Head + Body, Target has Head only
      const sourceHead = makeRelic({ id: 'src-head', part: Parts.Head, equippedBy: CHAR_1 })
      const sourceBody = makeRelic({ id: 'src-body', part: Parts.Body, equippedBy: CHAR_1 })
      const targetHead = makeRelic({ id: 'tgt-head', part: Parts.Head, equippedBy: CHAR_2 })

      useRelicStore.getState().setRelics([sourceHead, sourceBody, targetHead])
      useCharacterStore.getState().setCharacters([
        makeCharacter(CHAR_1, { equipped: { [Parts.Head]: 'src-head', [Parts.Body]: 'src-body' } }),
        makeCharacter(CHAR_2, { equipped: { [Parts.Head]: 'tgt-head' } }),
      ])

      switchRelics(CHAR_1, CHAR_2)

      // Source should now have target's Head only
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBe('tgt-head')
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Body]).toBeUndefined()
      // Target should now have source's Head + Body
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Head]).toBe('src-head')
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Body]).toBe('src-body')
    })

    it('moves all relics to target when source has zero relics', () => {
      // Source has no relics, Target has Head + Body
      const targetHead = makeRelic({ id: 'tgt-head', part: Parts.Head, equippedBy: CHAR_2 })
      const targetBody = makeRelic({ id: 'tgt-body', part: Parts.Body, equippedBy: CHAR_2 })

      useRelicStore.getState().setRelics([targetHead, targetBody])
      useCharacterStore.getState().setCharacters([
        makeCharacter(CHAR_1, { equipped: {} }),
        makeCharacter(CHAR_2, { equipped: { [Parts.Head]: 'tgt-head', [Parts.Body]: 'tgt-body' } }),
      ])

      switchRelics(CHAR_1, CHAR_2)

      // Source should now have target's relics
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBe('tgt-head')
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Body]).toBe('tgt-body')
      // Target should now be empty
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Head]).toBeUndefined()
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Body]).toBeUndefined()
    })

    it('moves all relics to source when target has zero relics', () => {
      // Source has Head + Body, Target has no relics
      const sourceHead = makeRelic({ id: 'src-head', part: Parts.Head, equippedBy: CHAR_1 })
      const sourceBody = makeRelic({ id: 'src-body', part: Parts.Body, equippedBy: CHAR_1 })

      useRelicStore.getState().setRelics([sourceHead, sourceBody])
      useCharacterStore.getState().setCharacters([
        makeCharacter(CHAR_1, { equipped: { [Parts.Head]: 'src-head', [Parts.Body]: 'src-body' } }),
        makeCharacter(CHAR_2, { equipped: {} }),
      ])

      switchRelics(CHAR_1, CHAR_2)

      // Source should now be empty
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBeUndefined()
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Body]).toBeUndefined()
      // Target should now have source's relics
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Head]).toBe('src-head')
      expect(getCharacterById(CHAR_2)!.equipped[Parts.Body]).toBe('src-body')
    })
  })

  describe('upsertRelicWithEquipment — M3 empty store', () => {
    it('assigns valid ageIndex when relic store is empty', () => {
      const relic = makeRelic({ id: RELIC_1 })
      delete (relic as Record<string, unknown>).ageIndex

      upsertRelicWithEquipment(relic)

      const stored = getRelicById(RELIC_1)!
      expect(stored.ageIndex).toBeGreaterThanOrEqual(0)
    })
  })
})
