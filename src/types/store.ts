import { Character, CharacterId } from './Character'
import { Relic } from './Relic'
import { LightCone } from './LightCone'
import { Form } from 'types/Form'
import { ComboState } from 'lib/optimizer/rotation/comboDrawerController'
import { ColorThemeOverrides } from 'lib/theme'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'

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
  version: string,
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
  scoringMetadataOverrides: unknown
  statSimulationDisplay: StatSimTypes
  statSimulations: unknown
  selectedStatSimulations: unknown
  optimizationInProgress: boolean
  optimizationId: string | null
  teammateCount: number
  zeroPermutationModalOpen: boolean
  zeroResultModalOpen: boolean
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
  statDisplay: 'combat' | 'base'
  menuSidebarOpen: boolean
  settings: unknown
  setSettings: (settings: unknown) => void
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
  setZeroResultModalOpen: (open: boolean) => void
  setRelicsById: (relicsById: Record<number, Relic>) => void
  setSavedSessionKey: (key: string, value: string) => void
  setActiveKey: (key: string) => void
  setScoringAlgorithmFocusCharacter: (id: CharacterId) => void
  setConditionalSetEffectsDrawerOpen: (b: boolean) => void
  setComboDrawerOpen: (b: boolean) => void
  setOptimizerTabFocusCharacterSelectModalOpen: (open: boolean) => void
  setStatDisplay: (display: 'combat' | 'base') => void
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
    name: string,
    element: string[]
    path: string[]
    rarity: number[]
  }
  excludedRelicPotentialCharacters: unknown[]

  optimizerMenuState: Record<string, boolean>

  savedSession: Record<string, any>
}

