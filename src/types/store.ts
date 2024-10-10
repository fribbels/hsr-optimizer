import { Character, CharacterId } from './Character'
import { Relic } from './Relic'
import { LightCone } from './LightCone'
import { StringToStringMap } from 'types/Common'
import { Form } from 'types/Form'
import { ComboState } from 'lib/optimizer/rotation/comboDrawerController'

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
  colorTheme: unknown

  optimizerGrid: unknown

  optimizerTabFocusCharacter?: CharacterId
  characterTabFocusCharacter?: CharacterId
  scoringAlgorithmFocusCharacter?: CharacterId

  comboState: ComboState
  formValues: Form
  activeKey: unknown
  inventoryWidth: number
  setInventoryWidth: (width: number) => void
  rowLimit: number
  setRowLimit: (rowLimit: number) => void
  characters: Character[]
  charactersById: Record<CharacterId, Character>
  characterTabBlur: boolean
  conditionalSetEffectsDrawerOpen: boolean
  comboDrawerOpen: boolean
  permutations: number
  permutationsResults: number
  permutationsSearched: number
  relicsById: Record<number, Relic>
  scorerId?: number
  scoringMetadataOverrides: unknown
  statDisplay: 'combat' | 'base'
  optimizationInProgress: boolean
  optimizationId?: number
  optimizerStartTime: number
  optimizerEndTime: number
  teammateCount: number
  zeroPermutationModalOpen: boolean
  zeroResultModalOpen: boolean
  menuSidebarOpen: boolean
  relicScorerSidebarOpen: boolean
  enemyConfigurationsDrawerOpen: boolean
  settingsDrawerOpen: boolean
  settings: unknown
  setSettings: (settings: unknown) => void
  setOptimizationId: (id: number) => void
  setSettingsDrawerOpen: (open: boolean) => void
  optimizerTabFocusCharacterSelectModalOpen: boolean
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

  permutationDetails: PermutationDetails

  relicTabFilters: RelicTabFilters
  excludedRelicPotentialCharacters: unknown[]

  optimizerMenuState: Record<string, boolean>

  savedSession: StringToStringMap
}
