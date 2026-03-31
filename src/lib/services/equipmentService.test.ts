// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { getRelicById, useRelicStore } from 'lib/stores/relic/relicStore'
import { equipRelic, switchRelics, upsertRelicWithEquipment } from './equipmentService'
import type { Character, CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

// ---- Mocks ----

vi.mock('lib/utils/frontendUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lib/utils/frontendUtils')>()
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

  describe('upsertRelicWithEquipment — unequip via Nobody', () => {
    it('clears character equipped slot when equippedBy is set to undefined', () => {
      // Setup: character with relic equipped in Head slot
      const relic = makeRelic({ id: RELIC_1, part: Parts.Head, equippedBy: CHAR_1 })
      useRelicStore.getState().setRelics([relic])
      useCharacterStore.getState().setCharacters([
        makeCharacter(CHAR_1, { equipped: { [Parts.Head]: RELIC_1 } }),
      ])

      // Verify setup
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBe(RELIC_1)
      expect(getRelicById(RELIC_1)!.equippedBy).toBe(CHAR_1)

      // Action: upsert the relic with equippedBy = undefined (simulating "assign to Nobody")
      const updatedRelic = { ...relic, equippedBy: undefined }
      upsertRelicWithEquipment(updatedRelic)

      // Assert: character's equipped slot should be cleared
      expect(getCharacterById(CHAR_1)!.equipped[Parts.Head]).toBeUndefined()
      expect(getRelicById(RELIC_1)!.equippedBy).toBeUndefined()
    })

    it('clears character equipped slot when character has 6/6 relics and one is unequipped', () => {
      // Setup: character with all 6 slots filled
      const relics = [
        makeRelic({ id: 'r1', part: Parts.Head, equippedBy: CHAR_1 }),
        makeRelic({ id: 'r2', part: Parts.Hands, equippedBy: CHAR_1 }),
        makeRelic({ id: 'r3', part: Parts.Body, equippedBy: CHAR_1 }),
        makeRelic({ id: 'r4', part: Parts.Feet, equippedBy: CHAR_1 }),
        makeRelic({ id: 'r5', part: Parts.PlanarSphere, equippedBy: CHAR_1 }),
        makeRelic({ id: 'r6', part: Parts.LinkRope, equippedBy: CHAR_1 }),
      ]
      useRelicStore.getState().setRelics(relics)
      useCharacterStore.getState().setCharacters([
        makeCharacter(CHAR_1, {
          equipped: {
            [Parts.Head]: 'r1',
            [Parts.Hands]: 'r2',
            [Parts.Body]: 'r3',
            [Parts.Feet]: 'r4',
            [Parts.PlanarSphere]: 'r5',
            [Parts.LinkRope]: 'r6',
          },
        }),
      ])

      // Verify all 6 equipped
      const before = getCharacterById(CHAR_1)!
      const equippedCount = Object.values(before.equipped).filter(Boolean).length
      expect(equippedCount).toBe(6)

      // Action: unequip the Head relic by setting equippedBy to undefined
      const headRelic = getRelicById('r1')!
      const updatedRelic = { ...headRelic, equippedBy: undefined }
      upsertRelicWithEquipment(updatedRelic)

      // Assert: character should now have 5/6 equipped
      const after = getCharacterById(CHAR_1)!
      expect(after.equipped[Parts.Head]).toBeUndefined()
      expect(after.equipped[Parts.Hands]).toBe('r2')
      expect(after.equipped[Parts.Body]).toBe('r3')
      expect(after.equipped[Parts.Feet]).toBe('r4')
      expect(after.equipped[Parts.PlanarSphere]).toBe('r5')
      expect(after.equipped[Parts.LinkRope]).toBe('r6')

      const afterCount = Object.values(after.equipped).filter(Boolean).length
      expect(afterCount).toBe(5)

      // Assert: relic should no longer be equipped
      expect(getRelicById('r1')!.equippedBy).toBeUndefined()
    })

    it('equipped reference changes so SortableCharacterRow memo detects update', () => {
      // Setup: character with a relic equipped
      const relic = makeRelic({ id: RELIC_1, part: Parts.Head, equippedBy: CHAR_1 })
      useRelicStore.getState().setRelics([relic])
      const originalCharacter = makeCharacter(CHAR_1, { equipped: { [Parts.Head]: RELIC_1 } })
      useCharacterStore.getState().setCharacters([originalCharacter])

      // Capture the equipped reference before
      const equippedBefore = getCharacterById(CHAR_1)!.equipped

      // Action: unequip
      upsertRelicWithEquipment({ ...relic, equippedBy: undefined })

      // Assert: equipped reference must be different (for React memo to detect change)
      const equippedAfter = getCharacterById(CHAR_1)!.equipped
      expect(equippedAfter).not.toBe(equippedBefore)
    })
  })
})
