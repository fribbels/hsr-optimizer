import i18next from 'i18next'
import { CUSTOM_TEAM, DEFAULT_TEAM, Parts } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  Character,
  CharacterId,
} from 'types/character'
import { Form } from 'types/form'
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
  onCharacterModalOk: (form: ShowcaseTabCharacter['form']) => void,
  importClicked: (mode: 'relics' | 'singleCharacter' | 'multiCharacter') => void,
}

export const useShowcaseTabStore = create<ShowcaseTabState>()((set, get) => ({
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

  onCharacterModalOk: (form) => {
    const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')
    const { availableCharacters, selectedCharacter } = get()

    if (!form.characterId) {
      return Message.error(t('NoCharacterSelected') /* No selected character */)
    }
    if (availableCharacters?.find((x) => x.id === form.characterId) && selectedCharacter?.id !== form.characterId) {
      return Message.error(t('CharacterAlreadyExists') /* Selected character already exists */)
    }

    const updatedCharacter = TsUtils.clone(selectedCharacter)!
    const updatedCharacters = TsUtils.clone(availableCharacters)!
    updatedCharacter.form = form
    updatedCharacter.id = form.characterId
    Object.values(updatedCharacter.equipped)
      .filter((x) => !!x)
      .forEach((x) => x.equippedBy = form.characterId!)
    updatedCharacters[updatedCharacter.index] = updatedCharacter

    set({ selectedCharacter: updatedCharacter, availableCharacters: updatedCharacters })
    console.log('Modified character', updatedCharacter)
  },

  importClicked: (mode) => {
    const { selectedCharacter, availableCharacters } = get()
    let newCharacters: ShowcaseTabCharacter[] = []

    if (mode === 'singleCharacter' && selectedCharacter?.form) {
      persistenceService.upsertCharacterFromForm(selectedCharacter.form as Form)
      newCharacters = [selectedCharacter]
    } else if (mode === 'multiCharacter' && availableCharacters) {
      availableCharacters.forEach((char) => {
        persistenceService.upsertCharacterFromForm(char.form as Form)
      })
      newCharacters = availableCharacters
    }

    const newRelics = availableCharacters
      ?.flatMap((x) => Object.values(x.equipped))
      .filter((x) => !!x)

    console.log('import clicked! mode:', mode, 'relics:', newRelics)

    persistenceService.mergePartialRelics(newRelics, newCharacters)
    SaveState.delayedSave()
  },
}))
