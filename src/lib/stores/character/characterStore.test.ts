// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import type {
  Character,
  CharacterId,
} from 'types/character'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  getCharacterById,
  getCharacters,
  useCharacterStore,
} from './characterStore'

// ---- Constants ----

const UNKNOWN_CHARACTER_ID = '9999' as CharacterId

// ---- Helpers ----

function state() {
  return useCharacterStore.getState()
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id,
    equipped: {},
    form: {} as Character['form'],
    ...overrides,
  }
}

// ---- Reset ----

beforeEach(() => {
  useCharacterStore.setState(useCharacterStore.getInitialState())
})

// ---- Tests ----

describe('useCharacterStore', () => {
  describe('initial state', () => {
    it('store initializes with empty characters array and empty charactersById index', () => {
      expect(state().characters).toEqual([])
      expect(state().charactersById).toEqual({})
    })
  })

  describe('character management', () => {
    it('setCharacters populates both characters array and charactersById index', () => {
      const chars = [
        makeCharacter({ id: Kafka.id }),
        makeCharacter({ id: Jingliu.id }),
      ]

      state().setCharacters(chars)

      expect(state().characters).toHaveLength(2)
      expect(state().charactersById[Kafka.id]).toBeDefined()
      expect(state().charactersById[Jingliu.id]).toBeDefined()
    })

    it('charactersById contains every character present in the characters array', () => {
      const chars = [
        makeCharacter({ id: Kafka.id }),
        makeCharacter({ id: Jingliu.id }),
        makeCharacter({ id: Acheron.id }),
      ]

      state().setCharacters(chars)

      for (const char of chars) {
        expect(state().charactersById[char.id]).toBeDefined()
        expect(state().charactersById[char.id]!.id).toBe(char.id)
      }
    })

    it('setCharacter updates the matching character in both structures', () => {
      state().setCharacters([makeCharacter({ id: Kafka.id, equipped: {} })])

      const updated = makeCharacter({ id: Kafka.id, equipped: { Head: 'relic-1' } as Character['equipped'] })
      state().setCharacter(updated)

      expect(state().charactersById[Kafka.id]!.equipped).toEqual({ Head: 'relic-1' })
      expect(state().characters[0].equipped).toEqual({ Head: 'relic-1' })
    })

    it('setCharacter does not affect other characters in the array', () => {
      state().setCharacters([
        makeCharacter({ id: Kafka.id }),
        makeCharacter({ id: Jingliu.id }),
      ])

      const updated = makeCharacter({ id: Kafka.id, equipped: { Head: 'relic-1' } as Character['equipped'] })
      state().setCharacter(updated)

      expect(state().charactersById[Jingliu.id]!.equipped).toEqual({})
    })
  })

  describe('add and remove', () => {
    it('addCharacter appends to array and adds to charactersById index', () => {
      state().setCharacters([makeCharacter({ id: Kafka.id })])

      state().addCharacter(makeCharacter({ id: Jingliu.id }))

      expect(state().characters).toHaveLength(2)
      expect(state().characters[1].id).toBe(Jingliu.id)
      expect(state().charactersById[Jingliu.id]).toBeDefined()
    })

    it('removeCharacter removes from array and deletes from charactersById index', () => {
      state().setCharacters([
        makeCharacter({ id: Kafka.id }),
        makeCharacter({ id: Jingliu.id }),
      ])

      state().removeCharacter(Kafka.id)

      expect(state().characters).toHaveLength(1)
      expect(state().charactersById[Kafka.id]).toBeUndefined()
      expect(state().charactersById[Jingliu.id]).toBeDefined()
    })

    it('removeCharacter with unknown ID leaves array unchanged', () => {
      state().setCharacters([makeCharacter({ id: Kafka.id })])

      state().removeCharacter(UNKNOWN_CHARACTER_ID)

      expect(state().characters).toHaveLength(1)
    })
  })

  describe('character reordering', () => {
    it('insertCharacter repositions a character to the given array index', () => {
      state().setCharacters([
        makeCharacter({ id: Kafka.id }),
        makeCharacter({ id: Jingliu.id }),
        makeCharacter({ id: Acheron.id }),
      ])

      // Move Acheron from index 2 to index 0
      state().insertCharacter(Acheron.id, 0)

      expect(state().characters[0].id).toBe(Acheron.id)
    })

    it('insertCharacter with negative index moves character to end', () => {
      state().setCharacters([
        makeCharacter({ id: Kafka.id }),
        makeCharacter({ id: Jingliu.id }),
        makeCharacter({ id: Acheron.id }),
      ])

      state().insertCharacter(Kafka.id, -1)

      expect(state().characters[state().characters.length - 1].id).toBe(Kafka.id)
    })

    it('insertCharacter with unknown ID logs warning and leaves array unchanged', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      state().setCharacters([makeCharacter({ id: Kafka.id })])
      state().insertCharacter(UNKNOWN_CHARACTER_ID, 0)

      expect(state().characters).toHaveLength(1)
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('imperative getters', () => {
    it('getCharacters returns current characters array', () => {
      state().setCharacters([makeCharacter({ id: Kafka.id })])
      expect(getCharacters()).toHaveLength(1)
    })

    it('getCharacterById returns the matching character for a valid ID', () => {
      state().setCharacters([makeCharacter({ id: Kafka.id })])
      expect(getCharacterById(Kafka.id)!.id).toBe(Kafka.id)
    })

    it('getCharacterById returns undefined for undefined input', () => {
      expect(getCharacterById(undefined)).toBeUndefined()
    })
  })
})
