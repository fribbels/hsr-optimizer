import { ThemeConfig } from 'antd'
import { ComputeEngine } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { AppPage } from 'lib/state/db'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { WarpRequest } from 'lib/tabs/tabWarp/warpCalculatorController'
import {
  Build,
  Character,
  CharacterId,
  Eidolon,
} from 'types/character'
import { Form } from 'types/form'
import {
  LightCone,
  SuperImpositionLevel,
} from 'types/lightCone'
import {
  ScoringMetadata,
  ShowcasePreferences,
  ShowcaseTemporaryOptions,
} from 'types/metadata'
import { Relic } from 'types/relic'

type PermutationDetails = {
  Head: number,
  Hands: number,
  Body: number,
  Feet: number,
  PlanarSphere: number,
  LinkRope: number,
  HeadTotal: number,
  HandsTotal: number,
  BodyTotal: number,
  FeetTotal: number,
  PlanarSphereTotal: number,
  LinkRopeTotal: number,
}

export type RelicTabFilters = {
  set: (string | number)[],
  part: (string | number)[],
  enhance: (string | number)[],
  mainStats: (string | number)[],
  subStats: (string | number)[],
  grade: (string | number)[],
  verified: (string | number)[],
  equippedBy: (string | number)[],
  initialRolls: (string | number)[],
}
export type HsrOptimizerStore = { // global store separation plan
  /* global                   */ version: string,
  /* global                   */ colorTheme: ColorThemeOverrides,
  /* optimizerTab             */ optimizerGrid: unknown,
  /* optimizerTab             */ optimizerTabFocusCharacter?: CharacterId | null,
  /* give own store?          */ scoringAlgorithmFocusCharacter?: CharacterId | null,
  /* give own store?          */ statTracesDrawerFocusCharacter?: CharacterId | null,
  /* relicsTab                */ relicsTabFocusCharacter?: CharacterId | null,
  /* global                   */ activeKey: AppPage,
  /* optimizerTab             */ permutations: number,
  /* optimizerTab             */ permutationsResults: number,
  /* optimizerTab             */ permutationsSearched: number,
  /* relicsTab?               */ scoringMetadataOverrides: Partial<Record<CharacterId, ScoringMetadata>>,
  /* characterTab/showcaseTab */ showcasePreferences: Partial<Record<CharacterId, ShowcasePreferences>>,
  /* characterTab/showcaseTab */ showcaseTemporaryOptionsByCharacter: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>,
  /* optimizerTab             */ statSimulationDisplay: StatSimTypes,
  /* optimizerTab             */ statSimulations: Simulation[],
  /* optimizerTab             */ selectedStatSimulations: Simulation['key'][],
  /* optimizerTab             */ optimizationInProgress: boolean,
  /* optimizerTab             */ optimizationId: string | null,
  /* optimizerTab             */ teammateCount: number,
  /* showcaseTab              */ relicScorerSidebarOpen: boolean,
  /* optimizerTab             */ optimizerRunningEngine: ComputeEngine,
  /* optimizerTab             */ optimizerStartTime: number | null,
  /* optimizerTab             */ optimizerEndTime: number | null,
  /* optimizerTab             */ optimizerTabFocusCharacterSelectModalOpen: boolean,

  /* optimizerTab             */ comboState: ComboState,
  /* optimizerTab             */ formValues: Form | undefined,
  /* global                   */ relicsById: Partial<Record<string, Relic>>,
  /* global                   */ relics: Array<Relic>,
  /* optimizerTab             */ statDisplay: StatDisplay,
  /* optimizerTab             */ memoDisplay: MemoDisplay,
  /* global                   */ settings: UserSettings,
  /* optimizerTab             */ optimizerBuild: Build | null,
  /* optimizerTab             */ optimizerSelectedRowData: OptimizerDisplayDataStatSim | null,
  /* global                   */ setSettings: (settings: UserSettings) => void,
  /* optimizerTab             */ setOptimizationId: (id: string) => void,
  /* optimizerTab             */ setComboState: (state: ComboState) => void,
  /* optimizerTab             */ setFormValues: (form: Form) => void,
  /* optimizerTab             */ setOptimizerTabFocusCharacter: (CharacterId: CharacterId | null | undefined) => void,
  /* optimizerTab             */ setOptimizationInProgress: (open: boolean) => void,
  /* optimizerTab             */ setOptimizerStartTime: (open: number) => void,
  /* optimizerTab             */ setOptimizerEndTime: (open: number) => void,
  /* relicsTab                */ setRelicTabFilters: (filters: RelicTabFilters) => void,
  /* optimizerTab             */ setOptimizerRunningEngine: (s: ComputeEngine) => void,
  /* relicsTab                */ setExcludedRelicPotentialCharacters: (ids: CharacterId[]) => void,
  /* optimizerTab             */ optimizerFormCharacterEidolon: number,
  /* optimizerTab             */ optimizerFormSelectedLightCone: LightCone['id'] | null | undefined,
  /* optimizerTab             */ optimizerFormSelectedLightConeSuperimposition: number,
  /* optimizerTab             */ setPermutationsResults: (n: number) => void,
  /* optimizerTab             */ setPermutationsSearched: (n: number) => void,
  /* global                   */ setRelicsById: (relicsById: Partial<Record<string, Relic>>) => void,
  /* global                   */ setSavedSessionKey: <T extends keyof GlobalSavedSession>(key: T, value: GlobalSavedSession[T]) => void,
  /* global                   */ setActiveKey: (key: AppPage) => void,
  /* give own store?          */ setScoringAlgorithmFocusCharacter: (id: CharacterId | null | undefined) => void,
  /* give own store?          */ setStatTracesDrawerFocusCharacter: (id: CharacterId | null | undefined) => void,
  /* optimizerTab             */ setOptimizerTabFocusCharacterSelectModalOpen: (open: boolean) => void,
  /* optimizerTab             */ setStatDisplay: (display: StatDisplay) => void,
  /* optimizerTab             */ setMemoDisplay: (display: MemoDisplay) => void,
  /* optimizerTab             */ setOptimizerFormSelectedLightConeSuperimposition: (x: SuperImpositionLevel) => void,
  /* global                   */ setColorTheme: (x: ColorThemeOverrides) => void,
  /* optimizerTab             */ setOptimizerBuild: (x: Build) => void,
  /* optimizerTab             */ setOptimizerSelectedRowData: (x: OptimizerDisplayDataStatSim | null) => void,
  /* global                   */ setSavedSession: (x: GlobalSavedSession) => void,
  /* optimizerTab             */ setOptimizerFormSelectedLightCone: (x: LightCone['id'] | null) => void,
  /* optimizerTab             */ setOptimizerFormCharacterEidolon: (x: Eidolon) => void,
  /* optimizerTab             */ setTeammateCount: (x: number) => void,
  /* optimizerTab             */ setSelectedStatSimulations: (x: Simulation['key'][]) => void,
  /* optimizerTab             */ setStatSimulations: (x: Simulation[]) => void,
  /* optimizerTab             */ setStatSimulationDisplay: (x: StatSimTypes) => void,
  /* relicsTab                */ setScoringMetadataOverrides: (x: Partial<Record<CharacterId, ScoringMetadata>>) => void,
  /* characterTab/showcaseTab */ setShowcasePreferences: (x: Partial<Record<CharacterId, ShowcasePreferences>>) => void,
  /* characterTab/showcaseTab */ setShowcaseTemporaryOptionsByCharacter: (x: Partial<Record<CharacterId, ShowcaseTemporaryOptions>>) => void,
  /* optimizerTab             */ setPermutations: (x: number) => void,
  /* optimizerTab             */ setPermutationDetails: (x: PermutationDetails) => void,
  /* relicsTab                */ setRelicsTabFocusCharacter: (x: CharacterId | null | undefined) => void,
  /* global                   */ setVersion: (x: string) => void,
  /* optimizerTab             */ setOptimizerMenuState: (x: OptimizerMenuState) => void,
  /* global                   */ setGlobalThemeConfig: (x: ThemeConfig) => void,

  /* optimizerTab             */ permutationDetails: PermutationDetails,

  /* relicsTab                */ relicTabFilters: RelicTabFilters,
  /* relicsTab                */ excludedRelicPotentialCharacters: CharacterId[],

  /* optimizerTab             */ optimizerMenuState: OptimizerMenuState,

  /* global                   */ savedSession: GlobalSavedSession,
  /* global                   */ globalThemeConfig: ThemeConfig,
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
  RelicPotentialLoadBehavior: string,
  ExpandedInfoPanelPosition: string,
  ShowLocatorInRelicsModal: string,
}

// The JSON format we save to localstorage / save file
export type HsrOptimizerSaveFormat = {
  relics: Relic[],
  characters: Character[],
  scoringMetadataOverrides: Record<string, ScoringMetadata>,
  showcasePreferences: Record<string, ShowcasePreferences>,
  optimizerMenuState: OptimizerMenuState,
  excludedRelicPotentialCharacters: CharacterId[],
  savedSession: {
    showcaseTab: ShowcaseTabSavedSession,
    global: GlobalSavedSession,
  },
  settings: UserSettings,
  version: string,
  warpRequest: WarpRequest,
  relicLocator: {
    inventoryWidth: number,
    rowLimit: number,
  },
  scannerSettings?: {
    ingest: boolean,
    ingestCharacters: boolean,
    ingestWarpResources: boolean,
    websocketUrl: string,
  },
}

export type StatDisplay = 'combat' | 'base'
export type MemoDisplay = 'memo' | 'summoner'
