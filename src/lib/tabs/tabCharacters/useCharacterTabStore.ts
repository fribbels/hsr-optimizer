import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { CharacterModalForm } from 'lib/overlays/modals/CharacterModal'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
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

const defaultFilters: CharacterTabFilters = {
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
  setCharacterModalInitialCharacter: (character: Character | null) => void,
  setCharacterModalOpen: (characterModalOpen: boolean) => void,

  setFilters: (filters: CharacterTabFilters) => void,
  setNameFilter: (name: CharacterTabFilters['name']) => void,
  setElementFilter: (element: CharacterTabFilters['element']) => void,
  setPathFilter: (path: CharacterTabFilters['path']) => void,

  setCharacters: (characters: Character[]) => void,

  setCharacter: (character: Character) => void,
}

type CharacterTabState = CharacterTabValues & CharacterTabActions

export const useCharacterTabStore = create<CharacterTabState>()((set) => ({
  focusCharacter: null,
  selectedCharacter: null,
  characters: [],
  charactersById: {},
  characterModalInitialCharacter: null,
  characterModalOpen: false,
  filters: TsUtils.clone(defaultFilters),

  setFocusCharacter: (focusCharacter) =>
    set(() => {
      if (!focusCharacter) return { focusCharacter: null, selectedCharacter: null }
      const selectedCharacter = DB.getCharacterById(focusCharacter)
      if (!selectedCharacter) return { focusCharacter: null, selectedCharacter: null }
      return { focusCharacter, selectedCharacter }
    }),
  setCharacterModalInitialCharacter: (character) => set({ characterModalInitialCharacter: character }),
  setCharacterModalOpen: (characterModalOpen) => set({ characterModalOpen }),

  setFilters: (filters) => set({ filters }),
  setNameFilter: (name) => set((s) => ({ filters: { ...s.filters, name } })),
  setElementFilter: (element) => set((s) => ({ filters: { ...s.filters, element } })),
  setPathFilter: (path) => set((s) => ({ filters: { ...s.filters, path } })),

  setCharacters: (characters) =>
    set((s) => {
      const charactersById = characters.reduce((acc, cur) => {
        acc[cur.id] = cur
        return acc
      }, {} as Partial<Record<CharacterId, Character>>)

      const selectedCharacter = s.focusCharacter ? charactersById[s.focusCharacter] : null

      return {
        characters,
        charactersById,
        selectedCharacter,
        characterModalInitialCharacter: selectedCharacter ?? s.characterModalInitialCharacter,
      }
    }),

  setCharacter: (character) =>
    set((s) => {
      const characters = s.characters.map((x) => {
        if (x.id === character.id) return character
        return x
      })

      const charactersById = characters.reduce((acc, cur) => {
        acc[cur.id] = cur
        return acc
      }, {} as Partial<Record<CharacterId, Character>>)

      const selectedCharacter = s.focusCharacter ? charactersById[s.focusCharacter] : null

      return {
        characters,
        charactersById,
        selectedCharacter,
        characterModalInitialCharacter: selectedCharacter ?? s.characterModalInitialCharacter,
      }
    }),
}))
