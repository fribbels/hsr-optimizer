import type {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
  Parts,
} from 'lib/constants/constants'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type {
  ShowcasePreferences,
  ShowcaseTemporaryOptions,
} from 'types/metadata'
import type { BasicForm } from 'types/optimizer'
import type { Relic } from 'types/relic'

// ── Screen state machine ──

export const ShowcaseScreen = {
  Landing: 'landing',
  Loading: 'loading',
  Loaded: 'loaded',
} as const
export type ShowcaseScreen = (typeof ShowcaseScreen)[keyof typeof ShowcaseScreen]

// ── Domain types (unchanged from previous) ──

// Showcase tab characters use a different format for equipped relics and have only a minimal form
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

// ── State + Actions = Store ──

export type ShowcaseTabState = {
  // Screen state machine
  screen: ShowcaseScreen,

  // API fetch (orthogonal to screen — loading can be true on Loaded screen for re-fetch)
  loading: boolean,
  latestRefreshDate: Date | null,

  // Data
  availableCharacters: ShowcaseTabCharacter[] | null,
  selectedIndex: number,

  // Session (persisted via SaveState)
  savedSession: ShowcaseTabSavedSession,

  // Per-character preferences (showcasePreferences persisted via SaveState)
  showcasePreferences: Partial<Record<CharacterId, ShowcasePreferences>>,
  showcaseTeamPreferenceById: Partial<Record<CharacterId, typeof CUSTOM_TEAM | typeof DEFAULT_TEAM>>,
  showcaseTemporaryOptionsByCharacter: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>,

  // Portrait rendering (runtime only, not persisted)
  portraitColorByCharacterId: Partial<Record<CharacterId, string>>,
  portraitSwatchesByCharacterId: Partial<Record<CharacterId, string[]>>,
}

export type ShowcaseTabActions = {
  // Compound fetch transitions
  startFetch: () => void,
  setFetchResult: (characters: ShowcaseTabCharacter[]) => void,
  handleFetchFailure: () => void,
  setLatestRefreshDate: (date: Date | null) => void,
  setScreen: (screen: ShowcaseScreen) => void,

  // Selection
  selectCharacter: (index: number) => void,
  applyCharacterOverride: (form: ShowcaseTabCharacter['form']) => void,

  // Session (persisted)
  setScorerId: (scorerId: string | null) => void,
  setSidebarOpen: (open: boolean) => void,
  setSavedSession: (session: ShowcaseTabSavedSession) => void,

  // Per-character preferences
  setShowcasePreferences: (prefs: Partial<Record<CharacterId, ShowcasePreferences>>) => void,
  setShowcaseTeamPreference: (id: CharacterId, team: typeof CUSTOM_TEAM | typeof DEFAULT_TEAM) => void,
  setSpdBenchmark: (id: CharacterId, spdBenchmark: number | undefined) => void,

  // Portrait
  setPortraitPalette: (id: CharacterId, color: string | undefined, swatches: string[]) => void,
}

export type ShowcaseTabStore = ShowcaseTabState & ShowcaseTabActions
