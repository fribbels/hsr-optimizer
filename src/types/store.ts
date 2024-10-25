import { Character, CharacterId } from './Character'
import { Relic } from './Relic'
import { LightCone } from './LightCone'
import { Form } from 'types/Form'
import { ComboState } from 'lib/optimizer/rotation/comboDrawerController'
import { ColorThemeOverrides } from 'lib/theme'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { ScoringMetadata } from 'lib/characterScorer'

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
  set: unknown[]
  part: unknown[]
  enhance: unknown[]
  mainStats: unknown[]
  subStats: unknown[]
  grade: unknown[]
  verified: unknown[]
  equippedBy: unknown[]
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
  charactersById: { [key: string]: Character }
  comboDrawerOpen: boolean
  combatBuffsDrawerOpen: boolean
  enemyConfigurationsDrawerOpen: boolean
  settingsDrawerOpen: boolean
  permutations: number
  permutationsResults: number
  permutationsSearched: number
  scorerId: string
  scoringMetadataOverrides: Record<string, ScoringMetadata>
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
  optimizerRunningEngine: string
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
  menuSidebarOpen: boolean
  settings: Record<string, any>
  setSettings: (settings: Record<string, any>) => void
  setOptimizationId: (id: string) => void
  setSettingsDrawerOpen: (open: boolean) => void
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
  setOptimizerRunningEngine: (s: string) => void
  setExcludedRelicPotentialCharacters: (ids: CharacterId[]) => void
  optimizerFormCharacterEidolon: number
  optimizerFormSelectedLightCone: null | LightCone
  optimizerFormSelectedLightConeSuperimposition: number
  setPermutationsResults: (n: number) => void
  setPermutationsSearched: (n: number) => void
  setZeroPermutationsModalOpen: (open: boolean) => void
  setScoringModalOpen: (open: boolean) => void
  setZeroResultModalOpen: (open: boolean) => void
  setRelicsById: (relicsById: Record<number, Relic>) => void
  setSavedSessionKey: (key: string, value: string) => void
  setActiveKey: (key: string) => void
  setScoringAlgorithmFocusCharacter: (id: CharacterId) => void
  setConditionalSetEffectsDrawerOpen: (b: boolean) => void
  setComboDrawerOpen: (b: boolean) => void
  setOptimizerTabFocusCharacterSelectModalOpen: (open: boolean) => void
  setStatDisplay: (display: string) => void
  setCharacters: (characters: Character[]) => void
  setCharactersById: (charactersById: Record<string, Character>) => void
  setOptimizerFormSelectedLightConeSuperimposition: (x: any) => void
  setColorTheme: (x: any) => void
  setSavedSession: (x: any) => void
  setOptimizerFormSelectedLightCone: (x: any) => void
  setOptimizerFormCharacterEidolon: (x: any) => void
  setTeammateCount: (x: any) => void
  setSelectedStatSimulations: (x: any) => void
  setStatSimulations: (x: any) => void
  setStatSimulationDisplay: (x: any) => void
  setScoringMetadataOverrides: (x: any) => void
  setScorerId: (x: any) => void
  setCharacterTabFilters: (x: any) => void
  setPermutations: (x: any) => void
  setPermutationDetails: (x: any) => void
  setRelicsTabFocusCharacter: (x: any) => void
  setCharacterTabFocusCharacter: (x: any) => void
  setVersion: (x: any) => void
  setOptimizerMenuState: (x: any) => void

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
}

export type SavedSession = {
  optimizerCharacterId: string | null
  relicScorerSidebarOpen: boolean
  scoringType: string
  combatScoreDetails: string
  computeEngine: string
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

export type CustomPortrait = {
  imageUrl: string
  originalDimensions: {
    width: number
    height: number
  }
  customImageParams: {
    croppedArea: {
      x: number
      y: number
      width: number
      height: number
    }
    croppedAreaPixels: {
      width: number
      height: number
      x: number
      y: number
    }
  }
  cropper: {
    zoom: number
    crop: {
      x: number
      y: number
    }
  }
}
