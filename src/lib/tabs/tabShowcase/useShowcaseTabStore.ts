import { CUSTOM_TEAM, DEFAULT_TEAM, Parts } from 'lib/constants/constants'
import {
  Character,
  CharacterId,
} from 'types/character'
import { LightConeId } from 'types/lightCone'
import { ShowcasePreferences, ShowcaseTemporaryOptions } from 'types/metadata'
import { BasicForm } from 'types/optimizer'
import { Relic } from 'types/relic'
import { create } from 'zustand'

// showcase tab characters use a different format for equipped relics and have only a minimal form
export type ShowcaseTabCharacter = Omit<Character, 'equipped' | 'rank' | 'builds' | 'form'> & {
  index: number,
  equipped: Record<Parts, Relic | null | undefined>,
  key: string,
  form: Omit<BasicForm, 'lightCone' | 'characterId'> & {
    lightCone: LightConeId | null,
    characterId: CharacterId | null,
  },
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
  showcasePreferences: Partial<Record<CharacterId, ShowcasePreferences>>,
  showcaseTeamPreferenceById: Partial<Record<CharacterId, typeof CUSTOM_TEAM | typeof DEFAULT_TEAM>>,
  showcaseTemporaryOptionsByCharacter: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>,

  setLatestRefreshDate: (date: Date | null) => void,
  setLoading: (loading: boolean) => void,
  setAvailableCharacters: (availableCharacters: ShowcaseTabCharacter[]) => void,
  setSelectedCharacter: (selectedCharacter: ShowcaseTabCharacter | null) => void,
  setScorerId: (scorerId: string | null) => void,
  setSidebarOpen: (open: boolean) => void,
  setSavedSession: (session: ShowcaseTabSavedSession) => void,
  setShowcasePreferences: (x: Partial<Record<CharacterId, ShowcasePreferences>>) => void,
  setShowcaseTeamPreferenceById: (characterId: CharacterId, team: typeof CUSTOM_TEAM | typeof DEFAULT_TEAM) => void,
  setShowcaseTemporaryOptionsByCharacter: (x: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>) => void,

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
  showcasePreferences: {},
  showcaseTeamPreferenceById: {},
  showcaseTemporaryOptionsByCharacter: {},

  setLatestRefreshDate: (latestRefreshDate: Date | null) => set({ latestRefreshDate }),
  setLoading: (loading: boolean) => set({ loading }),
  setAvailableCharacters: (availableCharacters: ShowcaseTabCharacter[]) => set({ availableCharacters }),
  setSelectedCharacter: (selectedCharacter: ShowcaseTabCharacter | null) => set({ selectedCharacter }),
  setScorerId: (scorerId: string | null) => set((s) => ({ savedSession: { ...s.savedSession, scorerId } })),
  setSidebarOpen: (sidebarOpen: boolean) => set((s) => ({ savedSession: { ...s.savedSession, sidebarOpen } })),
  setSavedSession: (savedSession: ShowcaseTabSavedSession) => set((s) => ({ savedSession: { ...s.savedSession, ...savedSession } })),
  setShowcasePreferences: (showcasePreferences) => set({ showcasePreferences }),
  setShowcaseTeamPreferenceById: (characterId, team) =>
    set((state) => ({
      showcaseTeamPreferenceById: { ...state.showcaseTeamPreferenceById, [characterId]: team },
    })),
  setShowcaseTemporaryOptionsByCharacter: (showcaseTemporaryOptionsByCharacter) => set({ showcaseTemporaryOptionsByCharacter }),

  onSelectionChanged: (selected: CharacterId) =>
    set((s) => {
      console.log('selectionChange', selected)
      return { selectedCharacter: s.availableCharacters?.find((x) => x.id === selected) ?? null }
    }),
}))
