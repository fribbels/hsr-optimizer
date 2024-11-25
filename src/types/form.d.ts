import { SetsOrnaments } from 'lib/constants/constants'
import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterId, Eidolon } from 'types/character'

import { ConditionalValueMap } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { RelicEnhance, RelicGrade } from 'types/relic'

export type Teammate = {
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number
  teamOrnamentSet?: string
  teamRelicSet?: string
  characterConditionals?: ConditionalValueMap
  lightConeConditionals?: ConditionalValueMap
} & Form

export type OptimizerForm = Form

export type Form = {
  // Core
  characterEidolon: Eidolon
  characterId: string
  characterLevel: number

  // Light cone
  lightCone: string
  lightConeLevel: number
  lightConeSuperimposition: SuperImpositionLevel

  // Enemy
  enemyCount: number
  enemyElementalWeak: boolean
  enemyLevel: number
  enemyMaxToughness: number
  enemyResistance: number
  enemyEffectResistance: number
  enemyWeaknessBroken: boolean

  // Conditionals
  characterConditionals: ConditionalValueMap
  lightConeConditionals: ConditionalValueMap
  setConditionals: SetConditionals

  // Optimizer filters
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
  ornamentSets: SetsOrnaments[]
  mainStatUpscaleLevel: number
  rankFilter: boolean
  relicSets: ([pieces: string, set: string] | [pieces: string, set1: string, set2: string])[]
  statDisplay: string

  weights: {
    [key: string]: number
  }

  combatBuffs: {
    [key: string]: number
  }

  // Optimizer additional data
  statSim?: {
    key: string
    substatRolls: SimulationRequest
    substatTotals: SimulationRequest
    simulations: Simulation[]
  }
  optimizationId?: string
  sortOption?: string
  resultSort?: string
  resultsLimit?: number
  path?: string // remove?
  resultMinFilter: number

  // Combo
  comboStateJson: string
  comboAbilities: string[]
  comboType: string
  comboDot: number
  comboBreak: number

  teammate0: Teammate
  teammate1: Teammate
  teammate2: Teammate

  // Min / Max
  minAtk: number
  maxAtk: number
  minBasic: number
  maxBasic: number
  minBe: number
  maxBe: number
  minCd: number
  maxCd: number
  minCr: number
  maxCr: number
  minDef: number
  maxDef: number
  minDmg: number
  maxDmg: number
  minDot: number
  maxDot: number
  minBreak: number
  maxBreak: number
  minHeal: number
  maxHeal: number
  minShield: number
  maxShield: number
  minEhp: number
  maxEhp: number
  minEhr: number
  maxEhr: number
  minErr: number
  maxErr: number
  minFua: number
  maxFua: number
  minHp: number
  maxHp: number
  minMcd: number
  maxMcd: number
  minRes: number
  maxRes: number
  minSkill: number
  maxSkill: number
  minSpd: number
  maxSpd: number
  minUlt: number
  maxUlt: number
}

type TeammateProperty = 'teammate0' | 'teammate1' | 'teammate2'
