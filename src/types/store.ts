import type { ShowcasePreset } from 'lib/characterPreview/debugVisualConfigStore'
import type { AppPages } from 'lib/constants/appPages'
import type {
  ComputeEngine,
} from 'lib/constants/constants'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import type { AhaForm } from 'lib/stores/ahaTuningStore'
import type { ActionNodeOverride, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import type { AVVisualizerTabSavedSession } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import type { CharacterGridDensity } from 'lib/tabs/tabCharacters/characterGridPresets'
import type { ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { WarpRequest } from 'lib/tabs/tabWarp/warpCalculatorTypes'
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
  completedMigrations: Record<string, number>,
  scoringAlgorithmFocusCharacter?: CharacterId | null,
  statTracesDrawerFocusCharacter?: CharacterId | null,
  activeKey: AppPages,
  settings: UserSettings,
  setCompletedMigrations: (x: Record<string, number>) => void,
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
  showcasePreset: ShowcasePreset,
  showcaseUID: boolean,
  showcaseL2D: boolean,
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
  NewCharacterDefaultRank: string,
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
    // `slots` has existed since this field was introduced. Everything else has gone through two shape
    // changes since: `interventions`/`rowCount`/`mocFirstRow` were added after `slots` (older saves may be
    // missing them), then that whole flat shape was wrapped into `waves`/`currentWaveIndex` when Wave
    // support was added (older saves still have the flat fields directly, no `waves` array at all) —
    // persistenceService.ts migrates either older shape into the current one when loading.
    avVisualizerTab?: Pick<AVVisualizerTabSavedSession, 'slots'> & (
      Partial<Omit<AVVisualizerTabSavedSession, 'slots'>>
      | {
        interventions?: Intervention[]
        actionOverrides?: ActionNodeOverride[]
        ultInsertions?: UltInsertion[]
        rowCount?: number
        mocFirstRow?: boolean
      }
    ),
  },
  settings?: UserSettings,
  version?: string,
  warpRequest?: WarpRequest,
  relicLocator?: {
    inventoryWidth: number,
    rowLimit: number,
  },
  ahaSpeedTuner?: AhaForm,
  scannerSettings?: {
    ingest: boolean,
    ingestCharacters: boolean,
    ingestOnlyExistingCharacters?: boolean,
    ingestWarpResources: boolean,
    websocketUrl: string,
    customUrl: boolean,
  },
  completedMigrations?: Record<string, number>,
  seenFeatures?: string[],
}

export type StatDisplay = 'combat' | 'base'
export type MemoDisplay = 'memo' | 'summoner'
