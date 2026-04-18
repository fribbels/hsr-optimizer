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
