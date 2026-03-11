import type { AgGridReact } from 'ag-grid-react'
import type {
  ComputeEngine,
  CUSTOM_TEAM,
  DEFAULT_TEAM,
} from 'lib/constants/constants'
import type { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import type { ColorThemeOverrides } from 'lib/rendering/theme'
import type { ScoringType } from 'lib/scoring/simScoringUtils'
import type { AppPages } from 'lib/state/db'
import type { ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { WarpRequest } from 'lib/tabs/tabWarp/warpCalculatorController'
import type { RefObject } from 'react'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  ScoringMetadata,
  ShowcasePreferences,
  ShowcaseTemporaryOptions,
} from 'types/metadata'
import type { Relic } from 'types/relic'

export type HsrOptimizerStore = {
  /* global                   */ version: string,
  /* global                   */ colorTheme: ColorThemeOverrides,
  /* optimizerTab             */ optimizerGrid: RefObject<AgGridReact<OptimizerDisplayDataStatSim>> | undefined,
  /* give own store?          */ scoringAlgorithmFocusCharacter?: CharacterId | null,
  /* give own store?          */ statTracesDrawerFocusCharacter?: CharacterId | null,
  /* global                   */ activeKey: AppPages,
  /* global                   */ scoringMetadataOverrides: Partial<Record<CharacterId, ScoringMetadata>>,
  /* characterTab/showcaseTab */ showcasePreferences: Partial<Record<CharacterId, ShowcasePreferences>>,
  /* characterTab/showcaseTab */ showcaseTemporaryOptionsByCharacter: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>,
  /* showcase Tab             */ showcaseTeamPreferenceById: Partial<Record<CharacterId, typeof CUSTOM_TEAM | typeof DEFAULT_TEAM>>,

  /* global                   */ relicsById: Partial<Record<string, Relic>>,
  /* global                   */ relics: Array<Relic>,
  /* global                   */ settings: UserSettings,
  /* global                   */ setSettings: (settings: UserSettings) => void,
  /* global                   */ setRelicsById: (relicsById: Partial<Record<string, Relic>>) => void,
  /* global                   */ setSavedSessionKey: <T extends keyof GlobalSavedSession>(key: T, value: GlobalSavedSession[T]) => void,
  /* global                   */ setActiveKey: (key: AppPages) => void,
  /* give own store?          */ setScoringAlgorithmFocusCharacter: (id: CharacterId | null | undefined) => void,
  /* give own store?          */ setStatTracesDrawerFocusCharacter: (id: CharacterId | null | undefined) => void,
  /* global                   */ setColorTheme: (x: ColorThemeOverrides) => void,
  /* global                   */ setSavedSession: (x: GlobalSavedSession) => void,
  /* global                   */ setScoringMetadataOverrides: (x: Partial<Record<CharacterId, ScoringMetadata>>) => void,
  /* characterTab/showcaseTab */ setShowcaseTeamPreferenceById: (update: [CharacterId, typeof CUSTOM_TEAM | typeof DEFAULT_TEAM]) => void,
  /* characterTab/showcaseTab */ setShowcasePreferences: (x: Partial<Record<CharacterId, ShowcasePreferences>>) => void,
  /* characterTab/showcaseTab */ setShowcaseTemporaryOptionsByCharacter: (x: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>) => void,
  /* global                   */ setVersion: (x: string | undefined) => void,

  /* global                   */ savedSession: GlobalSavedSession,
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
  scoringMetadataOverrides?: Record<string, ScoringMetadata>,
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
