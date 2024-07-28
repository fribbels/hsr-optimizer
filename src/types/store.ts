import { Character, CharacterId } from './Character'
import { Relic } from './Relic'
import { LightCone } from './LightCone'

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
  equipped: unknown[]
}

export type HsrOptimizerStore = {
  colorTheme: unknown

  optimizerGrid: unknown

  optimizerTabFocusCharacter?: CharacterId
  characterTabFocusCharacter?: CharacterId
  scoringAlgorithmFocusCharacter?: CharacterId

  activeKey: unknown
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
  setCombatBuffsDrawerOpen: (open: boolean) => void
  setEnemyConfigurationsDrawerOpen: (open: boolean) => void

  optimizerFormCharacterEidolon: number
  optimizerFormSelectedLightCone: null | LightCone
  optimizerFormSelectedLightConeSuperimposition: number

  permutationDetails: PermutationDetails

  relicTabFilters: RelicTabFilters
  excludedRelicPotentialCharacters: unknown[]

  optimizerMenuState: Record<string, boolean>

  savedSession: unknown
}
