import { ThemeConfig } from 'antd'
import { ComputeEngine, ElementName, PathName } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { AppPage } from 'lib/state/db'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/UseShowcaseTabStore'
import { WarpRequest, WarpResult } from 'lib/tabs/tabWarp/warpCalculatorController'
import { Build, Character, CharacterId, Eidolon } from 'types/character'
import { Form } from 'types/form'
import { LightCone, SuperImpositionLevel } from 'types/lightCone'
import { ScoringMetadata, ShowcasePreferences, ShowcaseTemporaryOptions } from 'types/metadata'
import { Relic } from 'types/relic'

type PermutationDetails = {
  Head: number
  Hands: number
  Body: number
  Feet: number
  PlanarSphere: number
  LinkRope: number
  HeadTotal: number
  HandsTotal: number
  BodyTotal: number
  FeetTotal: number
  PlanarSphereTotal: number
  LinkRopeTotal: number
}

type RelicTabFilters = {
  set: (string | number)[]
  part: (string | number)[]
  enhance: (string | number)[]
  mainStats: (string | number)[]
  subStats: (string | number)[]
  grade: (string | number)[]
  verified: (string | number)[]
  equippedBy: (string | number)[]
  initialRolls: (string | number)[]
}

export type HsrOptimizerStore = {
  version: string
  colorTheme: ColorThemeOverrides
  optimizerGrid: unknown
  optimizerTabFocusCharacter?: CharacterId | null
  characterTabFocusCharacter?: CharacterId | null
  scoringAlgorithmFocusCharacter?: CharacterId | null
  statTracesDrawerFocusCharacter?: CharacterId | null
  relicsTabFocusCharacter?: CharacterId | null
  rowLimit: number
  activeKey: AppPage
  characters: Character[]
  charactersById: Partial<Record<CharacterId, Character>>
  permutations: number
  permutationsResults: number
  permutationsSearched: number
  scoringMetadataOverrides: Record<string, ScoringMetadata>
  showcasePreferences: Record<string, ShowcasePreferences>
  showcaseTemporaryOptionsByCharacter: Record<string, ShowcaseTemporaryOptions>
  warpRequest: WarpRequest
  warpResult: WarpResult
  statSimulationDisplay: StatSimTypes
  statSimulations: Simulation[]
  selectedStatSimulations: Simulation['key'][]
  optimizationInProgress: boolean
  optimizationId: string | null
  teammateCount: number
  relicScorerSidebarOpen: boolean
  optimizerRunningEngine: ComputeEngine
  optimizerStartTime: number | null
  optimizerEndTime: number | null
  optimizerTabFocusCharacterSelectModalOpen: boolean

  comboState: ComboState
  formValues: Form | undefined
  inventoryWidth: number
  setInventoryWidth: (width: number) => void
  setRowLimit: (rowLimit: number) => void
  relicsById: Record<string, Relic>
  statDisplay: string
  memoDisplay: string
  settings: UserSettings
  optimizerBuild: Build | null
  optimizerSelectedRowData: OptimizerDisplayDataStatSim | null
  optimizerBuffGroups: Record<BUFF_TYPE, Record<string, Buff[]>> | undefined
  setSettings: (settings: UserSettings) => void
  setOptimizationId: (id: string) => void
  setComboState: (state: ComboState) => void
  setFormValues: (form: Form) => void
  setOptimizerTabFocusCharacter: (CharacterId: CharacterId | null | undefined) => void
  setOptimizationInProgress: (open: boolean) => void
  setOptimizerStartTime: (open: number) => void
  setOptimizerEndTime: (open: number) => void
  setRelicTabFilters: (filters: RelicTabFilters) => void
  setOptimizerRunningEngine: (s: ComputeEngine) => void
  setExcludedRelicPotentialCharacters: (ids: CharacterId[]) => void
  optimizerFormCharacterEidolon: number
  optimizerFormSelectedLightCone: LightCone['id'] | null | undefined
  optimizerFormSelectedLightConeSuperimposition: number
  setPermutationsResults: (n: number) => void
  setPermutationsSearched: (n: number) => void
  setRelicsById: (relicsById: Record<number, Relic>) => void
  setSavedSessionKey: <T extends keyof GlobalSavedSession>(key: T, value: GlobalSavedSession[T]) => void
  setActiveKey: (key: AppPage) => void
  setScoringAlgorithmFocusCharacter: (id: CharacterId | null | undefined) => void
  setStatTracesDrawerFocusCharacter: (id: CharacterId | null | undefined) => void
  setOptimizerTabFocusCharacterSelectModalOpen: (open: boolean) => void
  setStatDisplay: (display: string) => void
  setMemoDisplay: (display: string) => void
  setCharacters: (characters: Character[]) => void
  setCharactersById: (charactersById: Partial<Record<CharacterId, Character>>) => void
  setOptimizerFormSelectedLightConeSuperimposition: (x: SuperImpositionLevel) => void
  setColorTheme: (x: ColorThemeOverrides) => void
  setOptimizerBuild: (x: Build) => void
  setOptimizerSelectedRowData: (x: OptimizerDisplayDataStatSim | null) => void
  setOptimizerBuffGroups: (x: Record<BUFF_TYPE, Record<string, Buff[]>>) => void
  setSavedSession: (x: GlobalSavedSession) => void
  setOptimizerFormSelectedLightCone: (x: LightCone['id'] | null) => void
  setOptimizerFormCharacterEidolon: (x: Eidolon) => void
  setTeammateCount: (x: number) => void
  setSelectedStatSimulations: (x: Simulation['key'][]) => void
  setStatSimulations: (x: Simulation[]) => void
  setStatSimulationDisplay: (x: StatSimTypes) => void
  setScoringMetadataOverrides: (x: Record<string, ScoringMetadata>) => void
  setShowcasePreferences: (x: Record<string, ShowcasePreferences>) => void
  setShowcaseTemporaryOptionsByCharacter: (x: Record<string, ShowcaseTemporaryOptions>) => void
  setWarpRequest: (x: WarpRequest) => void
  setWarpResult: (x: WarpResult) => void
  setCharacterTabFilters: (x: CharacterTabFilters) => void
  setPermutations: (x: number) => void
  setPermutationDetails: (x: PermutationDetails) => void
  setRelicsTabFocusCharacter: (x: CharacterId | null | undefined) => void
  setCharacterTabFocusCharacter: (x: CharacterId | null | undefined) => void
  setVersion: (x: string) => void
  setOptimizerMenuState: (x: OptimizerMenuState) => void
  setGlobalThemeConfig: (x: ThemeConfig) => void

  permutationDetails: PermutationDetails

  relicTabFilters: RelicTabFilters
  characterTabFilters: CharacterTabFilters
  excludedRelicPotentialCharacters: CharacterId[]

  optimizerMenuState: OptimizerMenuState

  savedSession: GlobalSavedSession
  globalThemeConfig: ThemeConfig
}

type OptimizerMenuState = Record<string, boolean>

// TODO relocate to CharacterTab.tsx once it gets rewritten in typescript
export type CharacterTabFilters = {
  name: string
  element: ElementName[]
  path: PathName[]
  rarity: number[]
}

export type GlobalSavedSession = {
  optimizerCharacterId: CharacterId | null
  scoringType: ScoringType
  computeEngine: ComputeEngine
  showcaseStandardMode: boolean
  showcaseDarkMode: boolean
  showcaseUID: boolean
  showcasePreciseSpd: boolean
}

export type UserSettings = {
  RelicEquippingBehavior: string
  PermutationsSidebarBehavior: string
  RelicPotentialLoadBehavior: string
  ExpandedInfoPanelPosition: string
}

// The JSON format we save to localstorage / save file
export type HsrOptimizerSaveFormat = {
  relics: Relic[]
  characters: Character[]
  scoringMetadataOverrides: Record<string, ScoringMetadata>
  showcasePreferences: Record<string, ShowcasePreferences>
  optimizerMenuState: OptimizerMenuState
  excludedRelicPotentialCharacters: CharacterId[]
  savedSession: {
    showcaseTab: ShowcaseTabSavedSession
    global: GlobalSavedSession
  }
  settings: UserSettings
  version: string
  warpRequest: WarpRequest
  relicLocator: {
    inventoryWidth: number
    rowLimit: number
  }
}
