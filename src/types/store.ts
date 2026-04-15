import type { AppPages } from 'lib/constants/appPages'
import type {
  ComputeEngine,
} from 'lib/constants/constants'
import type { ScoringType } from 'lib/scoring/simScoringUtils'
import type { CharacterGridDensity } from 'lib/tabs/tabCharacters/characterGridPresets'
import type { ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { WarpRequest } from 'lib/tabs/tabWarp/warpCalculatorController'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  ScoringMetadataOverride,
  ShowcasePreferences,
} from 'types/metadata'
import type { Relic } from 'types/relic'

export type HsrOptimizerStore = {
  version: string,
  scoringAlgorithmFocusCharacter?: CharacterId | null,
  statTracesDrawerFocusCharacter?: CharacterId | null,
  activeKey: AppPages,
  settings: UserSettings,
  setSettings: (settings: UserSettings) => void,
  setSavedSessionKey: <T extends keyof GlobalSavedSession>(key: T, value: GlobalSavedSession[T]) => void,
  setActiveKey: (key: AppPages) => void,
  setScoringAlgorithmFocusCharacter: (id: CharacterId | null | undefined) => void,
  setStatTracesDrawerFocusCharacter: (id: CharacterId | null | undefined) => void,
  setSavedSession: (x: GlobalSavedSession) => void,
  setVersion: (x: string | undefined) => void,
  savedSession: GlobalSavedSession,
}

type OptimizerMenuState = Record<string, boolean>

export type GlobalSavedSession = {
  optimizerCharacterId: CharacterId | null,
  scoringType: ScoringType,
  computeEngine: ComputeEngine,
  showcaseStandardMode: boolean,
  showcaseDarkMode: boolean,
  showcaseUID: boolean,
  showcasePreciseSpd: boolean,
  sidebarCollapsed: boolean,
  characterGridDensity: CharacterGridDensity,
}

export type UserSettings = {
  RelicEquippingBehavior: string,
  PermutationsSidebarBehavior: string,
  ExpandedInfoPanelPosition: string,
  ShowLocatorInRelicsModal: string,
  ShowComboDmgWarning: string,
}

// The JSON format we save to localstorage / save file
export type HsrOptimizerSaveFormat = {
  relics: Relic[],
  characters: Character[],
  scoringMetadataOverrides?: Record<string, ScoringMetadataOverride>,
  showcasePreferences?: Record<string, ShowcasePreferences>,
  optimizerMenuState?: OptimizerMenuState,
  excludedRelicPotentialCharacters?: CharacterId[],
  savedSession?: {
    showcaseTab: ShowcaseTabSavedSession,
    global: GlobalSavedSession,
  },
  settings?: UserSettings,
  version?: string,
  warpRequest?: WarpRequest,
  relicLocator?: {
    inventoryWidth: number,
    rowLimit: number,
  },
  scannerSettings?: {
    ingest: boolean,
    ingestCharacters: boolean,
    ingestWarpResources: boolean,
    websocketUrl: string,
    customUrl: boolean,
  },
}

export type StatDisplay = 'combat' | 'base'
export type MemoDisplay = 'memo' | 'summoner'
