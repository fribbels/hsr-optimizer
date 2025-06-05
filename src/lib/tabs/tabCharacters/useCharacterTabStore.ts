import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import {
  Character,
  CharacterId,
} from 'types/character'
import { create } from 'zustand'

export type CharacterTabFilters = {
  name: string,
  element: ElementName[],
  path: PathName[],
}

export const defaultFilters: CharacterTabFilters = {
  name: '',
  element: [],
  path: [],
}

type CharacterTabValues = {
  focusCharacter: CharacterId | null,
  characters: Character[],
  charactersById: Partial<Record<CharacterId, Character>>,
  filters: CharacterTabFilters,
}

type CharacterTabActions = {
  setFocusCharacter: (focusCharacter: CharacterId | null) => void,
  setCharacters: (characters: Character[]) => void,
  setCharactersById: (charactersById: Partial<Record<CharacterId, Character>>) => void,

  setFilters: (filters: CharacterTabFilters) => void,
  setNameFilter: (name: CharacterTabFilters['name']) => void,
  setElementFilter: (element: CharacterTabFilters['element']) => void,
  setPathFilter: (path: CharacterTabFilters['path']) => void,
}

type CharacterTabState = CharacterTabValues & CharacterTabActions

export const useCharacterTabStore = create<CharacterTabState>()((set) => ({
  focusCharacter: null,
  characters: [],
  charactersById: {},
  filters: defaultFilters,

  setFocusCharacter: (focusCharacter: CharacterId | null) => set({ focusCharacter }),
  setCharacters: (characters: Character[]) => set({ characters }),
  setCharactersById: (charactersById: Partial<Record<CharacterId, Character>>) => set({ charactersById }),

  setFilters: (filters: CharacterTabFilters) => set({ filters }),
  setNameFilter: (name: string) => set((s) => ({ filters: { ...s.filters, name } })),
  setElementFilter: (element: ElementName[]) => set((s) => ({ filters: { ...s.filters, element } })),
  setPathFilter: (path: PathName[]) => set((s) => ({ filters: { ...s.filters, path } })),
}))
