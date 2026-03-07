import { ComboType } from 'lib/optimization/rotation/comboStateTransform'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationTypes'
import type { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterId, Eidolon } from 'types/character'
import { ConditionalValueMap } from 'types/conditionals'
import { Form, OrnamentSetFilters, RelicSetFilters } from 'types/form'
import { LightConeId, SuperImpositionLevel } from 'types/lightCone'
import { ScoringMetadata } from 'types/metadata'
import { RelicEnhance, RelicGrade } from 'types/relic'
import { MemoDisplay, StatDisplay } from 'types/store'

// ---- Teammate ----

export type TeammateState = {
  characterId: CharacterId | undefined
  characterEidolon: number
  lightCone: LightConeId | undefined
  lightConeSuperimposition: number
  teamRelicSet: string | undefined
  teamOrnamentSet: string | undefined
  characterConditionals: ConditionalValueMap
  lightConeConditionals: ConditionalValueMap
}

// ---- Stat / Rating filters ----

export type StatFilterState = {
  minAtk: number | undefined
  maxAtk: number | undefined
  minHp: number | undefined
  maxHp: number | undefined
  minDef: number | undefined
  maxDef: number | undefined
  minSpd: number | undefined
  maxSpd: number | undefined
  minCr: number | undefined
  maxCr: number | undefined
  minCd: number | undefined
  maxCd: number | undefined
  minEhr: number | undefined
  maxEhr: number | undefined
  minRes: number | undefined
  maxRes: number | undefined
  minBe: number | undefined
  maxBe: number | undefined
  minErr: number | undefined
  maxErr: number | undefined
}

export type RatingFilterState = {
  minBasic: number | undefined
  maxBasic: number | undefined
  minDot: number | undefined
  maxDot: number | undefined
  minBreak: number | undefined
  maxBreak: number | undefined
  minEhp: number | undefined
  maxEhp: number | undefined
  minFua: number | undefined
  maxFua: number | undefined
  minSkill: number | undefined
  maxSkill: number | undefined
  minMemoSkill: number | undefined
  maxMemoSkill: number | undefined
  minMemoTalent: number | undefined
  maxMemoTalent: number | undefined
  minUlt: number | undefined
  maxUlt: number | undefined
}

// ---- Main stat filter field names ----

export type MainStatPart =
  | 'mainBody'
  | 'mainFeet'
  | 'mainHands'
  | 'mainHead'
  | 'mainLinkRope'
  | 'mainPlanarSphere'

// ---- Enemy config ----

export type EnemyConfigFields = {
  enemyCount: number
  enemyElementalWeak: boolean
  enemyLevel: number
  enemyMaxToughness: number
  enemyResistance: number
  enemyEffectResistance: number
  enemyWeaknessBroken: boolean
}

// ---- Relic filter fields (affect permutation count) ----

export type RelicFilterFields = {
  enhance: RelicEnhance
  grade: RelicGrade
  rank: number
  rankFilter: boolean
  includeEquippedRelics: boolean
  keepCurrentRelics: boolean
  mainStatUpscaleLevel: number
  exclude: CharacterId[]
}

// ---- Complete optimizer form state ----

export type OptimizerFormState = {
  // Character identity
  characterId: CharacterId | undefined
  characterEidolon: Eidolon
  characterLevel: number

  // Light cone
  lightCone: LightConeId | undefined
  lightConeLevel: number
  lightConeSuperimposition: SuperImpositionLevel

  // Teammates (tuple)
  teammates: [TeammateState, TeammateState, TeammateState]

  // Conditionals
  characterConditionals: ConditionalValueMap
  lightConeConditionals: ConditionalValueMap
  setConditionals: SetConditionals

  // Relic filters
  enhance: RelicEnhance
  grade: RelicGrade
  rank: number
  exclude: CharacterId[]
  includeEquippedRelics: boolean
  keepCurrentRelics: boolean
  mainBody: string[]
  mainFeet: string[]
  mainHands: string[]
  mainHead: string[]
  mainLinkRope: string[]
  mainPlanarSphere: string[]
  mainStatUpscaleLevel: number
  rankFilter: boolean
  ornamentSets: OrnamentSetFilters
  relicSets: RelicSetFilters

  // Stat / rating filters
  statFilters: StatFilterState
  ratingFilters: RatingFilterState

  // Enemy config
  enemyCount: number
  enemyElementalWeak: boolean
  enemyLevel: number
  enemyMaxToughness: number
  enemyResistance: number
  enemyEffectResistance: number
  enemyWeaknessBroken: boolean

  // Combo
  comboStateJson: string
  comboTurnAbilities: TurnAbilityName[]
  comboPreprocessor: boolean
  comboType: ComboType
  comboDot: number

  // Scoring / display
  weights: ScoringMetadata['stats']
  statDisplay: StatDisplay
  memoDisplay: MemoDisplay
  resultSort: keyof typeof SortOption | undefined
  resultsLimit: number

  // Combat buffs
  combatBuffs: Record<string, number>

  // Team set contribution
  teamRelicSet: string | undefined
  teamOrnamentSet: string | undefined

  // Optimizer options
  deprioritizeBuffs: boolean

  // Stat sim
  statSim: {
    key: string
    benchmarks: SimulationRequest
    substatRolls: SimulationRequest
    simulations: Simulation[]
  } | undefined
}

// ---- Optimizer request (extends Form) ----

export type OptimizerRequest = Form & {
  resultMinFilter: number
  trace?: boolean
  optimizationId?: string
}
