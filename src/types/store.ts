import { Character, CharacterId } from './Character'
import { Relic } from './Relic'
import { LightCone } from './LightCone'
import { StringToStringMap } from 'types/Common'

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

  locale?: string

  optimizerTabFocusCharacter?: CharacterId
  characterTabFocusCharacter?: CharacterId
  scoringAlgorithmFocusCharacter?: CharacterId

  activeKey: unknown
  inventoryWidth: number
  setInventoryWidth: (width: number) => void
  rowLimit: number
  setRowLimit: (rowLimit: number) => void
  characters: Character[]
  charactersById: Record<CharacterId, Character>
  characterTabBlur: boolean
  conditionalSetEffectsDrawerOpen: boolean
  permutations: number
  permutationsResults: number
  permutationsSearched: number
  relicsById: Record<number, Relic>
  scorerId?: number
  scoringMetadataOverrides: unknown
  statDisplay: string
  optimizationInProgress: boolean
  optimizationId?: number
  teammateCount: number
  zeroPermutationModalOpen: boolean
  menuSidebarOpen: boolean
  relicScorerSidebarOpen: boolean
  enemyConfigurationsDrawerOpen: boolean
  settingsDrawerOpen: boolean
  settings: unknown
  setSettings: (settings: unknown) => void
  setSettingsDrawerOpen: (open: boolean) => void
  setCombatBuffsDrawerOpen: (open: boolean) => void
  setLocale: (locale: string) => void
  setEnemyConfigurationsDrawerOpen: (open: boolean) => void
  setOptimizerTabFocusCharacter: (CharacterId: CharacterId) => void
  setOptimizationInProgress: (open: boolean) => void
  setOptimizerStartTime: (open: number) => void
  setOptimizerEndTime: (open: number) => void
  setMenuSidebarOpen: (open: boolean) => void
  optimizerFormCharacterEidolon: number
  optimizerFormSelectedLightCone: null | LightCone
  optimizerFormSelectedLightConeSuperimposition: number
  setPermutationsResults: (n: number) => void
  setPermutationsSearched: (n: number) => void
  setRelicsById: (relicsById: Record<number, Relic>) => void
  setSavedSessionKey: (key: string, value: string) => void
  setActiveKey: (key: string) => void
  setConditionalSetEffectsDrawerOpen: (b: boolean) => void

  permutationDetails: PermutationDetails

  relicTabFilters: RelicTabFilters
  excludedRelicPotentialCharacters: unknown[]

  optimizerMenuState: Record<string, boolean>

  savedSession: StringToStringMap
}
