import {
  type ElementName,
  type PathName,
} from 'lib/constants/constants'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { clone } from 'lib/utils/objectUtils'
import type {
  CharacterId,
} from 'types/character'

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
  filters: CharacterTabFilters,
}

type CharacterTabActions = {
  setFocusCharacter: (focusCharacter: CharacterId | null) => void,

  setNameFilter: (name: CharacterTabFilters['name']) => void,
  setElementFilter: (element: CharacterTabFilters['element']) => void,
  setPathFilter: (path: CharacterTabFilters['path']) => void,
}

type CharacterTabState = CharacterTabValues & CharacterTabActions

export const useCharacterTabStore = createTabAwareStore<CharacterTabState>((set) => ({
  focusCharacter: null,
  filters: clone(defaultFilters),

  setFocusCharacter: (focusCharacter) =>
    set(() => {
      if (!focusCharacter) return { focusCharacter: null }
      const character = getCharacterById(focusCharacter)
      if (!character) return { focusCharacter: null }
      return { focusCharacter }
    }),

  setNameFilter: (name) => set((s) => ({ filters: { ...s.filters, name } })),
  setElementFilter: (element) => set((s) => ({ filters: { ...s.filters, element } })),
  setPathFilter: (path) => set((s) => ({ filters: { ...s.filters, path } })),
}))
