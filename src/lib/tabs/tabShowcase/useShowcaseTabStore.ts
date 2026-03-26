import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { computeCharacterOverride } from 'lib/tabs/tabShowcase/showcaseTabStoreActions'
import {
  ShowcaseScreen,
  type ShowcaseTabCharacter,
  type ShowcaseTabSavedSession,
  type ShowcaseTabStore,
} from 'lib/tabs/tabShowcase/showcaseTabTypes'

// Re-export types so external consumers (types/store.ts, characterConverter.ts)
// continue to work without import path changes
export type { ShowcaseTabCharacter, ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/showcaseTabTypes'

export const useShowcaseTabStore = createTabAwareStore<ShowcaseTabStore>((set, get) => ({
  // ── State ──
  screen: ShowcaseScreen.Landing,
  loading: false,
  latestRefreshDate: null,
  availableCharacters: null,
  selectedIndex: 0,
  savedSession: {
    scorerId: null,
    sidebarOpen: true,
  },
  showcasePreferences: {},
  showcaseTeamPreferenceById: {},
  showcaseTemporaryOptionsByCharacter: {},
  portraitColorByCharacterId: {},
  portraitSwatchesByCharacterId: {},

  // ── Compound fetch transitions ──

  startFetch: () => set((s) => ({
    loading: true,
    // Landing → show Loading screen. Already Loaded → stay Loaded (just button spinner)
    screen: s.screen === ShowcaseScreen.Landing ? ShowcaseScreen.Loading : s.screen,
  })),

  setFetchResult: (characters) => set({
    availableCharacters: characters,
    selectedIndex: 0,
    loading: false,
    // Screen NOT changed here — API layer controls reveal timing
    // to allow hidden pre-rendering of ShowcaseLoaded
  }),

  setScreen: (screen) => set({ screen }),

  handleFetchFailure: () => set((s) => ({
    loading: false,
    // Was on Loading screen (first fetch failed) → show Loaded with input form
    // Was on Loaded (re-fetch failed) → stay Loaded, old data preserved
    screen: s.screen === ShowcaseScreen.Loading ? ShowcaseScreen.Loaded : s.screen,
  })),

  setLatestRefreshDate: (latestRefreshDate) => set({ latestRefreshDate }),

  // ── Selection ──

  selectCharacter: (selectedIndex) => set({ selectedIndex }),

  applyCharacterOverride: (form) => {
    const { availableCharacters, selectedIndex } = get()
    if (!availableCharacters || selectedIndex >= availableCharacters.length) return
    set((s) => computeCharacterOverride(s, form))
  },

  // ── Session (persisted) ──

  setScorerId: (scorerId) => set((s) => ({ savedSession: { ...s.savedSession, scorerId } })),
  setSidebarOpen: (sidebarOpen) => set((s) => ({ savedSession: { ...s.savedSession, sidebarOpen } })),
  setSavedSession: (savedSession) => set((s) => ({ savedSession: { ...s.savedSession, ...savedSession } })),

  // ── Per-character preferences ──

  setShowcasePreferences: (showcasePreferences) => set({ showcasePreferences }),

  setShowcaseTeamPreference: (characterId, team) =>
    set((s) => ({
      showcaseTeamPreferenceById: { ...s.showcaseTeamPreferenceById, [characterId]: team },
    })),

  setSpdBenchmark: (characterId, spdBenchmark) =>
    set((s) => ({
      showcaseTemporaryOptionsByCharacter: {
        ...s.showcaseTemporaryOptionsByCharacter,
        [characterId]: {
          ...s.showcaseTemporaryOptionsByCharacter[characterId],
          spdBenchmark,
        },
      },
    })),

  // ── Portrait ──

  setPortraitPalette: (characterId, color, swatches) =>
    set((s) => {
      const prevSwatches = s.portraitSwatchesByCharacterId[characterId]
      const swatchesSame = prevSwatches
        && prevSwatches.length === swatches.length
        && prevSwatches.every((c, i) => c === swatches[i])
      const prevColor = s.portraitColorByCharacterId[characterId]
      const colorSame = color == null || color === prevColor

      if (swatchesSame && colorSame) return s

      return {
        portraitColorByCharacterId: color != null && color !== prevColor
          ? { ...s.portraitColorByCharacterId, [characterId]: color }
          : s.portraitColorByCharacterId,
        portraitSwatchesByCharacterId: swatchesSame
          ? s.portraitSwatchesByCharacterId
          : { ...s.portraitSwatchesByCharacterId, [characterId]: swatches },
      }
    }),
}))

// Imperative getter for non-React code (controllers, services)
export function getSelectedCharacter(): ShowcaseTabCharacter | null {
  const { availableCharacters, selectedIndex } = useShowcaseTabStore.getState()
  return availableCharacters?.[selectedIndex] ?? null
}
