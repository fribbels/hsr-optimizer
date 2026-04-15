import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import type {
  Character,
  CharacterId,
} from 'types/character'

type CharacterStoreState = {
  characters: Character[],
  charactersById: Partial<Record<CharacterId, Character>>,
}

type CharacterStoreActions = {
  setCharacters: (characters: Character[]) => void,
  setCharacter: (character: Character) => void,
  addCharacter: (character: Character) => void,
  removeCharacter: (characterId: CharacterId) => void,
  insertCharacter: (id: CharacterId, index: number) => void,
}

export type CharacterStore = CharacterStoreState & CharacterStoreActions

function buildIndex(characters: Character[]): Partial<Record<CharacterId, Character>> {
  return characters.reduce((acc, cur) => {
    acc[cur.id] = cur
    return acc
  }, {} as Partial<Record<CharacterId, Character>>)
}

export const useCharacterStore = createTabAwareStore<CharacterStore>((set, get) => ({
  characters: [],
  charactersById: {},

  setCharacters: (characters) => {
    set({ characters, charactersById: buildIndex(characters) })
  },

  setCharacter: (character) => {
    set((s) => {
      const characters = s.characters.map((x) => (x.id === character.id ? character : x))
      return { characters, charactersById: buildIndex(characters) }
    })
  },

  addCharacter: (character) => {
    const characters = [...get().characters, character]
    get().setCharacters(characters)
  },

  removeCharacter: (characterId) => {
    const characters = get().characters.filter((x) => x.id !== characterId)
    get().setCharacters(characters)
  },

  insertCharacter: (id, index) => {
    const characters = [...get().characters]
    if (index < 0) {
      index = characters.length
    }
    const currentIndex = characters.findIndex((c) => c.id === id)
    if (currentIndex === -1) return console.warn('No matching character to insert', id, index)
    const removed = characters.splice(currentIndex, 1)
    characters.splice(index, 0, removed[0])
    get().setCharacters(characters)
  },
}))

// Imperative getters for non-React code
export function getCharacters(): Character[] {
  return useCharacterStore.getState().characters
}

export function getCharacterById(id: CharacterId | undefined): Character | undefined {
  if (!id) return undefined
  return useCharacterStore.getState().charactersById[id]
}

// Optimizer rank sync: when characters change, update the optimizer's rank filter
useCharacterStore.subscribe((state, prev) => {
  if (state.characters === prev.characters) return
  const focusId = useOptimizerDisplayStore.getState().focusCharacterId
  if (!focusId) return
  const rank = state.characters.findIndex((c) => c.id === focusId)
  if (rank >= 0) {
    void import('lib/stores/optimizerForm/useOptimizerRequestStore').then(({ useOptimizerRequestStore }) => {
      useOptimizerRequestStore.getState().setRelicFilterField('rank', rank)
    })
  }
})
