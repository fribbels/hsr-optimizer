import {
  type ElementName,
  type PathName,
} from 'lib/constants/constants'
import { getCharacterById } from 'lib/stores/characterStore'
import { TsUtils } from 'lib/utils/TsUtils'
import type {
  CharacterId,
} from 'types/character'
import { createTabAwareStore } from 'lib/stores/createTabAwareStore'

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

  setFilters: (filters: CharacterTabFilters) => void,
  setNameFilter: (name: CharacterTabFilters['name']) => void,
  setElementFilter: (element: CharacterTabFilters['element']) => void,
  setPathFilter: (path: CharacterTabFilters['path']) => void,
}

type CharacterTabState = CharacterTabValues & CharacterTabActions

export const useCharacterTabStore = createTabAwareStore<CharacterTabState>((set) => ({
  focusCharacter: null,
  filters: TsUtils.clone(defaultFilters),

  setFocusCharacter: (focusCharacter) =>
    set(() => {
      if (!focusCharacter) return { focusCharacter: null }
      const character = getCharacterById(focusCharacter)
      if (!character) return { focusCharacter: null }
      return { focusCharacter }
    }),

  setFilters: (filters) => set({ filters }),
  setNameFilter: (name) => set((s) => ({ filters: { ...s.filters, name } })),
  setElementFilter: (element) => set((s) => ({ filters: { ...s.filters, element } })),
  setPathFilter: (path) => set((s) => ({ filters: { ...s.filters, path } })),
}))
