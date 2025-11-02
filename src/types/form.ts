import {
  SetsOrnaments,
  SetsRelics,
} from 'lib/constants/constants'
import { ComboType } from 'lib/optimization/rotation/comboStateTransform'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import {
  CharacterId,
  Eidolon,
} from 'types/character'

import { ConditionalValueMap } from 'types/conditionals'
import {
  LightCone,
  SuperImpositionLevel,
} from 'types/lightCone'
import { ScoringMetadata } from 'types/metadata'
import {
  RelicEnhance,
  RelicGrade,
} from 'types/relic'
import {
  MemoDisplay,
  StatDisplay,
} from 'types/store'

export type Teammate = {
  characterId: CharacterId,
  characterEidolon: number,
  lightCone: LightCone['id'],
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
  characterConditionals?: ConditionalValueMap,
  lightConeConditionals?: ConditionalValueMap,
} & Form

export type OptimizerForm = Form

export type Form = {
  // Core
  characterEidolon: Eidolon,
  characterId: CharacterId,
  characterLevel: number,

  // Light cone
  lightCone: LightCone['id'],
  lightConeLevel: number,
  lightConeSuperimposition: SuperImpositionLevel,

  // Enemy
  enemyCount: number,
  enemyElementalWeak: boolean,
  enemyLevel: number,
  enemyMaxToughness: number,
  enemyResistance: number,
  enemyEffectResistance: number,
  enemyWeaknessBroken: boolean,

  // Conditionals
  characterConditionals: ConditionalValueMap,
  lightConeConditionals: ConditionalValueMap,
  setConditionals: SetConditionals,

  // Optimizer filters
  enhance: RelicEnhance,
  grade: RelicGrade,
  rank: number,
  exclude: CharacterId[],
  includeEquippedRelics: boolean,
  keepCurrentRelics: boolean,
  mainBody: string[],
  mainFeet: string[],
  mainHands: string[],
  mainHead: string[],
  mainLinkRope: string[],
  mainPlanarSphere: string[],
  ornamentSets: SetsOrnaments[],
  mainStatUpscaleLevel: number,
  rankFilter: boolean,
  relicSets: ([pieces: string, set: SetsRelics] | [pieces: string, set1: SetsRelics, set2: SetsRelics])[],
  statDisplay: StatDisplay,
  memoDisplay: MemoDisplay,

  weights: ScoringMetadata['stats'],

  combatBuffs: {
    [key: string]: number,
  },

  // Optimizer additional data
  statSim?: {
    key: string,
    benchmarks: SimulationRequest,
    substatRolls: SimulationRequest,
    simulations: Simulation[],
  },
  optimizationId?: string,
  sortOption?: string,
  resultSort?: keyof typeof SortOption,
  resultsLimit?: number,
  deprioritizeBuffs?: boolean,
  resultMinFilter: number,
  trace?: boolean,
  teamRelicSet?: string,
  teamOrnamentSet?: string,

  // Combo
  comboStateJson: string,
  comboTurnAbilities: TurnAbilityName[],
  comboPreprocessor: boolean,
  comboType: ComboType,
  comboDot: number,

  teammate0: Teammate,
  teammate1: Teammate,
  teammate2: Teammate,

  // Min / Max
  minAtk: number,
  maxAtk: number,
  minBasic: number,
  maxBasic: number,
  minBe: number,
  maxBe: number,
  minCd: number,
  maxCd: number,
  minCr: number,
  maxCr: number,
  minDef: number,
  maxDef: number,
  minDmg: number,
  maxDmg: number,
  minDot: number,
  maxDot: number,
  minBreak: number,
  maxBreak: number,
  minHeal: number,
  maxHeal: number,
  minShield: number,
  maxShield: number,
  minEhp: number,
  maxEhp: number,
  minEhr: number,
  maxEhr: number,
  minErr: number,
  maxErr: number,
  minFua: number,
  maxFua: number,
  minHp: number,
  maxHp: number,
  minMcd: number,
  maxMcd: number,
  minRes: number,
  maxRes: number,
  minSkill: number,
  maxSkill: number,
  minMemoSkill: number,
  maxMemoSkill: number,
  minMemoTalent: number,
  maxMemoTalent: number,
  minSpd: number,
  maxSpd: number,
  minUlt: number,
  maxUlt: number,
}

export type TeammateProperty = 'teammate0' | 'teammate1' | 'teammate2'
