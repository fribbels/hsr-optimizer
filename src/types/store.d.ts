import { ThemeConfig } from 'antd'
import { ComputeEngine } from 'lib/constants/constants'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { Build, Character, CharacterId } from 'types/character'
import { Form } from 'types/form'
import { ScoringMetadata, ShowcasePreferences } from 'types/metadata'
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
}

export type HsrOptimizerStore = {
  version: string
  colorTheme: ColorThemeOverrides
  optimizerGrid: unknown
  optimizerTabFocusCharacter?: CharacterId
  characterTabFocusCharacter?: CharacterId
  scoringAlgorithmFocusCharacter?: CharacterId
  relicsTabFocusCharacter?: CharacterId
  rowLimit: number
  activeKey: string
  characters: Character[]
  charactersById: {
    [key: string]: Character
  }
  comboDrawerOpen: boolean
  combatBuffsDrawerOpen: boolean
  enemyConfigurationsDrawerOpen: boolean
  settingsDrawerOpen: boolean
  gettingStartedDrawerOpen: boolean
  permutations: number
  permutationsResults: number
  permutationsSearched: number
  scorerId: string
  scoringMetadataOverrides: Record<string, ScoringMetadata>
  showcasePreferences: Record<string, ShowcasePreferences>
  statSimulationDisplay: StatSimTypes
  statSimulations: unknown
  selectedStatSimulations: unknown
  optimizationInProgress: boolean
  optimizationId: string | null
  teammateCount: number
  zeroPermutationModalOpen: boolean
  zeroResultModalOpen: boolean
  scoringModalOpen: boolean
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
  conditionalSetEffectsDrawerOpen: boolean
  relicsById: Record<string, Relic>
  statDisplay: string
  memoDisplay: string
  menuSidebarOpen: boolean
  settings: UserSettings
  optimizerBuild: Build | null
  setSettings: (settings: UserSettings) => void
  setOptimizationId: (id: string) => void
  setSettingsDrawerOpen: (open: boolean) => void
  setGettingStartedDrawerOpen: (open: boolean) => void
  setComboState: (state: ComboState) => void
  setFormValues: (form: Form) => void
  setCombatBuffsDrawerOpen: (open: boolean) => void
  setEnemyConfigurationsDrawerOpen: (open: boolean) => void
  setOptimizerTabFocusCharacter: (CharacterId: CharacterId) => void
  setOptimizationInProgress: (open: boolean) => void
  setOptimizerStartTime: (open: number) => void
  setOptimizerEndTime: (open: number) => void
  setMenuSidebarOpen: (open: boolean) => void
  setRelicTabFilters: (filters: RelicTabFilters) => void
  setOptimizerRunningEngine: (s: ComputeEngine) => void
  setExcludedRelicPotentialCharacters: (ids: CharacterId[]) => void
  optimizerFormCharacterEidolon: number
  optimizerFormSelectedLightCone: string | undefined
  optimizerFormSelectedLightConeSuperimposition: number
  setPermutationsResults: (n: number) => void
  setPermutationsSearched: (n: number) => void
  setZeroPermutationsModalOpen: (open: boolean) => void
  setScoringModalOpen: (open: boolean) => void
  setZeroResultModalOpen: (open: boolean) => void
  setRelicsById: (relicsById: Record<number, Relic>) => void
  setSavedSessionKey: (key: string, value: string | boolean) => void
  setActiveKey: (key: string) => void
  setScoringAlgorithmFocusCharacter: (id: CharacterId) => void
  setConditionalSetEffectsDrawerOpen: (b: boolean) => void
  setComboDrawerOpen: (b: boolean) => void
  setOptimizerTabFocusCharacterSelectModalOpen: (open: boolean) => void
  setStatDisplay: (display: string) => void
  setMemoDisplay: (display: string) => void
  setCharacters: (characters: Character[]) => void
  setCharactersById: (charactersById: Record<string, Character>) => void
  setOptimizerFormSelectedLightConeSuperimposition: (x: any) => void
  setColorTheme: (x: any) => void
  setOptimizerBuild: (x: Build) => void
  setSavedSession: (x: any) => void
  setOptimizerFormSelectedLightCone: (x: any) => void
  setOptimizerFormCharacterEidolon: (x: any) => void
  setTeammateCount: (x: any) => void
  setSelectedStatSimulations: (x: any) => void
  setStatSimulations: (x: any) => void
  setStatSimulationDisplay: (x: any) => void
  setScoringMetadataOverrides: (x: any) => void
  setShowcasePreferences: (x: Record<string, ShowcasePreferences>) => void
  setScorerId: (x: any) => void
  setCharacterTabFilters: (x: any) => void
  setPermutations: (x: any) => void
  setPermutationDetails: (x: any) => void
  setRelicsTabFocusCharacter: (x: any) => void
  setCharacterTabFocusCharacter: (x: any) => void
  setVersion: (x: any) => void
  setOptimizerMenuState: (x: any) => void
  setGlobalThemeConfig: (x: ThemeConfig) => void

  permutationDetails: PermutationDetails

  relicTabFilters: RelicTabFilters
  characterTabFilters: {
    name: string
    element: string[]
    path: string[]
    rarity: number[]
  }
  excludedRelicPotentialCharacters: string[]

  optimizerMenuState: Record<string, boolean>

  savedSession: SavedSession
  globalThemeConfig: ThemeConfig
}

export type SavedSession = {
  optimizerCharacterId: string | null
  relicScorerSidebarOpen: boolean
  scoringType: string
  combatScoreDetails: string
  computeEngine: ComputeEngine
  showcaseStandardMode: boolean
  showcaseDarkMode: boolean
}

export type UserSettings = {
  RelicEquippingBehavior: string
  PermutationsSidebarBehavior: string
  RelicPotentialLoadBehavior: string
}

// The JSON format we save to localstorage / save file
export type HsrOptimizerSaveFormat = {
  relics: Relic[]
  characters: Character[]
  scorerId: string
  scoringMetadataOverrides: Record<string, ScoringMetadata>
  showcasePreferences: Record<string, ShowcasePreferences>
  optimizerMenuState: Record<string, boolean>
  excludedRelicPotentialCharacters: string[]
  savedSession: SavedSession
  settings: UserSettings
  version: string
  relicLocator: {
    inventoryWidth: number
    rowLimit: number
  }
}
