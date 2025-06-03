import { Parts } from 'lib/constants/constants'
import {
  Character,
  CharacterId,
} from 'types/character'
import { LightCone } from 'types/lightCone'
import { BasicForm } from 'types/optimizer'
import { Relic } from 'types/relic'
import { create } from 'zustand'

// showcase tab characters use a different format for equipped relics and have only a minimal form
export type ShowcaseTabCharacter = Omit<Character, 'equipped' | 'rank' | 'builds' | 'form'> & {
  index: number,
  equipped: Record<Parts, Relic | null | undefined>,
  key: string,
  form: Omit<BasicForm, 'lightCone' | 'characterId'> & { lightCone: LightCone['id'] | null, characterId: CharacterId | null },
}

export type ShowcaseTabSavedSession = {
  scorerId: string | null,
  sidebarOpen: boolean,
}

type ShowcaseTabState = {
  latestRefreshDate: Date | null,
  loading: boolean,
  availableCharacters: ShowcaseTabCharacter[] | null,
  selectedCharacter: ShowcaseTabCharacter | null,
  savedSession: ShowcaseTabSavedSession,

  setLatestRefreshDate: (date: Date | null) => void,
  setLoading: (loading: boolean) => void,
  setAvailableCharacters: (availableCharacters: ShowcaseTabCharacter[]) => void,
  setSelectedCharacter: (selectedCharacter: ShowcaseTabCharacter | null) => void,
  setScorerId: (scorerId: string | null) => void,
  setSidebarOpen: (open: boolean) => void,
  setSavedSession: (session: ShowcaseTabSavedSession) => void,

  onSelectionChanged: (selected: CharacterId) => void,
}

export const useShowcaseTabStore = create<ShowcaseTabState>()((set) => ({
  latestRefreshDate: null,
  loading: false,
  availableCharacters: null,
  selectedCharacter: null,
  savedSession: {
    scorerId: null,
    sidebarOpen: true,
  },

  setLatestRefreshDate: (latestRefreshDate: Date | null) => set({ latestRefreshDate }),
  setLoading: (loading: boolean) => set({ loading }),
  setAvailableCharacters: (availableCharacters: ShowcaseTabCharacter[]) => set({ availableCharacters }),
  setSelectedCharacter: (selectedCharacter: ShowcaseTabCharacter | null) => set({ selectedCharacter }),
  setScorerId: (scorerId: string | null) => set((s) => ({ savedSession: { ...s.savedSession, scorerId } })),
  setSidebarOpen: (sidebarOpen: boolean) => set((s) => ({ savedSession: { ...s.savedSession, sidebarOpen } })),
  setSavedSession: (savedSession: ShowcaseTabSavedSession) => set((s) => ({ savedSession: { ...s.savedSession, ...savedSession } })),

  onSelectionChanged: (selected: CharacterId) =>
    set((s) => {
      console.log('selectionChange', selected)
      return { selectedCharacter: s.availableCharacters?.find((x) => x.id === selected) ?? null }
    }),
}))

// Its this file
