import type { ComboType } from 'lib/optimization/rotation/comboType'
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
//
// This is the "optimizer build config" — everything that gets SAVED per
// character build and/or sent to the optimization worker as part of the
// request. If a new field should persist when the user saves a build,
// it belongs here. For transient/runtime state (progress, selected rows,
// modal open/close), use useOptimizerDisplayStore instead.

export type OptimizerRequestState = {
  // ── Character & Light Cone ──
  characterId: CharacterId | undefined
  characterEidolon: Eidolon
  characterLevel: number
  lightCone: LightConeId | undefined
  lightConeLevel: number
  lightConeSuperimposition: SuperImpositionLevel

  // ── Team ──
  teammates: [TeammateState, TeammateState, TeammateState]
  teamRelicSet: string | undefined
  teamOrnamentSet: string | undefined

  // ── Conditionals ──
  characterConditionals: ConditionalValueMap
  lightConeConditionals: ConditionalValueMap
  setConditionals: SetConditionals

  // ── Relic Filters (affect which relics enter permutations) ──
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

  // ── Result Filters (affect which builds pass post-optimization) ──
  statFilters: StatFilterState
  ratingFilters: RatingFilterState

  // ── Enemy Config ──
  enemyCount: number
  enemyElementalWeak: boolean
  enemyLevel: number
  enemyMaxToughness: number
  enemyResistance: number
  enemyEffectResistance: number
  enemyWeaknessBroken: boolean

  // ── Rotation Config (defines the damage simulation) ──
  comboType: ComboType
  comboStateJson: string
  comboTurnAbilities: TurnAbilityName[]
  comboPreprocessor: boolean
  comboDot: number

  // ── Optimization Settings (affect optimizer behavior) ──
  resultSort: keyof typeof SortOption | undefined
  resultsLimit: number
  deprioritizeBuffs: boolean
  weights: ScoringMetadata['stats']

  // ── Combat Buffs ──
  combatBuffs: Record<string, number>

  // ── Display Preferences (saved per build but only affect UI rendering) ──
  statDisplay: StatDisplay
  memoDisplay: MemoDisplay

  // ── Stat Simulation Config ──
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
