import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { getCharacterById } from 'lib/stores/characterStore'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  Character,
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
  characterModalInitialCharacter: Character | null,
  characterModalOpen: boolean,
  saveBuildModalOpen: boolean,
  buildsModalOpen: boolean,
  filters: CharacterTabFilters,
}

type CharacterTabActions = {
  setFocusCharacter: (focusCharacter: CharacterId | null) => void,
  setCharacterModalInitialCharacter: (character: Character | null) => void,
  setCharacterModalOpen: (characterModalOpen: boolean) => void,
  setSaveBuildModalOpen: (saveBuildModalOpen: boolean) => void,
  setBuildsModalOpen: (buildsModalOpen: boolean) => void,

  setFilters: (filters: CharacterTabFilters) => void,
  setNameFilter: (name: CharacterTabFilters['name']) => void,
  setElementFilter: (element: CharacterTabFilters['element']) => void,
  setPathFilter: (path: CharacterTabFilters['path']) => void,
}

type CharacterTabState = CharacterTabValues & CharacterTabActions

export const useCharacterTabStore = createTabAwareStore<CharacterTabState>((set) => ({
  focusCharacter: null,
  characterModalInitialCharacter: null,
  characterModalOpen: false,
  saveBuildModalOpen: false,
  buildsModalOpen: false,
  filters: TsUtils.clone(defaultFilters),

  setFocusCharacter: (focusCharacter) =>
    set(() => {
      if (!focusCharacter) return { focusCharacter: null }
      const character = getCharacterById(focusCharacter)
      if (!character) return { focusCharacter: null }
      return { focusCharacter }
    }),
  setCharacterModalInitialCharacter: (character) => set({ characterModalInitialCharacter: character }),
  setCharacterModalOpen: (characterModalOpen) => set({ characterModalOpen }),
  setSaveBuildModalOpen: (saveBuildModalOpen) => set({ saveBuildModalOpen }),
  setBuildsModalOpen: (buildsModalOpen) => set({ buildsModalOpen }),

  setFilters: (filters) => set({ filters }),
  setNameFilter: (name) => set((s) => ({ filters: { ...s.filters, name } })),
  setElementFilter: (element) => set((s) => ({ filters: { ...s.filters, element } })),
  setPathFilter: (path) => set((s) => ({ filters: { ...s.filters, path } })),
}))
