import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import DB from 'lib/state/db'
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
  selectedCharacter: Character | null,
  characters: Character[],
  charactersById: Partial<Record<CharacterId, Character>>,
  characterModalInitialCharacter: Character | null,
  characterModalOpen: boolean,
  filters: CharacterTabFilters,
}

type CharacterTabActions = {
  setFocusCharacter: (focusCharacter: CharacterId | null) => void,
  setCharacters: (characters: Character[]) => void,
  setCharactersById: (charactersById: Partial<Record<CharacterId, Character>>) => void,
  setCharacterModalInitialCharacter: (character: Character | null) => void,
  setCharacterModalOpen: (characterModalOpen: boolean) => void,

  setFilters: (filters: CharacterTabFilters) => void,
  setNameFilter: (name: CharacterTabFilters['name']) => void,
  setElementFilter: (element: CharacterTabFilters['element']) => void,
  setPathFilter: (path: CharacterTabFilters['path']) => void,
}

type CharacterTabState = CharacterTabValues & CharacterTabActions

export const useCharacterTabStore = create<CharacterTabState>()((set) => ({
  focusCharacter: null,
  selectedCharacter: null,
  characters: [],
  charactersById: {},
  characterModalInitialCharacter: null,
  characterModalOpen: false,
  filters: defaultFilters,

  setFocusCharacter: (focusCharacter: CharacterId | null) =>
    set(() => {
      if (!focusCharacter) return { focusCharacter: null, selectedCharacter: null }
      const selectedCharacter = DB.getCharacterById(focusCharacter)
      if (!selectedCharacter) return { focusCharacter: null, selectedCharacter: null }
      return { focusCharacter, selectedCharacter }
    }),
  setCharacters: (characters: Character[]) => set({ characters }),
  setCharactersById: (charactersById: Partial<Record<CharacterId, Character>>) => set({ charactersById }),
  setCharacterModalInitialCharacter: (character: Character | null) => set({ characterModalInitialCharacter: character }),
  setCharacterModalOpen: (characterModalOpen: boolean) => set({ characterModalOpen }),

  setFilters: (filters: CharacterTabFilters) => set({ filters }),
  setNameFilter: (name: string) => set((s) => ({ filters: { ...s.filters, name } })),
  setElementFilter: (element: ElementName[]) => set((s) => ({ filters: { ...s.filters, element } })),
  setPathFilter: (path: PathName[]) => set((s) => ({ filters: { ...s.filters, path } })),
}))
