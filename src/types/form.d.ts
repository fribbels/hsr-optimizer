// import { } from "./Common";
import { SetsOrnaments } from 'lib/constants/constants'
import { Simulation } from 'lib/simulations/statSimulationController'
import { CharacterId, Eidolon } from 'types/character'

import { ConditionalValueMap } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { RelicEnhance, RelicGrade } from 'types/relic'

type MIN_INT = 0
type MAX_INT = 2147483647

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

export type Form = {
  characterEidolon: Eidolon
  characterId: string
  characterLevel: number
  enemyCount: number
  enemyElementalWeak: boolean
  enemyLevel: number
  enemyMaxToughness: number
  enemyResistance: number
  enemyEffectResistance: number
  enemyWeaknessBroken: boolean
  enhance: RelicEnhance
  grade: RelicGrade
  rank: number
  exclude: CharacterId[]
  includeEquippedRelics: boolean
  keepCurrentRelics: boolean
  lightCone: string
  lightConeConditionals: ConditionalValueMap
  lightConeLevel: number
  lightConeSuperimposition: SuperImpositionLevel
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
  PRIMARY_ELEMENTAL_DMG_TYPE: string
  statSim?: {
    key: string
    simulations: Simulation[]
  }
  optimizationId?: string
  sortOption?: string
  resultSort?: string
  resultsLimit?: number
  path?: string
  resultMinFilter: number

  weights: {
    [key: string]: number
  }
  characterConditionals: ConditionalValueMap

  combatBuffs: {
    [key: string]: number
  }
  combo: {
    [key: string]: number
  }
  comboStateJson: string
  comboAbilities: string[]
  comboType: string
  comboDot: number
  comboBreak: number

  setConditionals: {
    [key: string]: any[]
  }

  teammate0: Teammate
  teammate1: Teammate
  teammate2: Teammate

  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number

  maxAtk: number
  maxBasic: number
  maxBe: number
  maxCd: number
  maxCr: number
  maxDef: number
  maxDmg: number
  maxDot: number
  maxBreak: number
  maxHeal: number
  maxShield: number
  maxEhp: number
  maxEhr: number
  maxErr: number
  maxFua: number
  maxHp: number
  maxMcd: number
  maxRes: number
  maxSkill: number
  maxSpd: number
  maxUlt: number
  minAtk: number
  minBasic: number
  minBe: number
  minCd: number
  minCr: number
  minDef: number
  minDmg: number
  minDot: number
  minBreak: number
  minHeal: number
  minShield: number
  minEhp: number
  minEhr: number
  minErr: number
  minFua: number
  minHp: number
  minMcd: number
  minRes: number
  minSkill: number
  minSpd: number
  minUlt: number
}

type TeammateProperty = 'teammate0' | 'teammate1' | 'teammate2'
