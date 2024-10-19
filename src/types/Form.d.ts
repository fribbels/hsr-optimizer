// import { } from "./Common";
import { Relic, RelicEnhance, RelicGrade } from 'types/Relic'
import { CharacterId, Eidolon } from 'types/Character'
import { SuperImpositionLevel } from 'types/LightCone'
import { RelicSet } from 'types/RelicSet'
import { LightConeConditionalMap } from 'types/LightConeConditionals'
import { CharacterConditionalMap } from 'types/CharacterConditional'
import { SetsOrnaments } from 'lib/constants'

type MIN_INT = 0
type MAX_INT = 2147483647

export type Teammate = {
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number
  teamOrnamentSet?: string
  teamRelicSet?: string
  characterConditionals?: CharacterConditionalMap
  lightConeConditionals?: LightConeConditionalMap
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
  lightConeConditionals: LightConeConditionalMap
  lightConeLevel: number
  lightConeSuperimposition: SuperImpositionLevel
  mainBody: Relic[]
  mainFeet: Relic[]
  mainHands: Relic[]
  mainHead: Relic[]
  mainLinkRope: Relic[]
  mainPlanarSphere: Relic[]
  ornamentSets: SetsOrnaments[]
  mainStatUpscaleLevel: number
  rankFilter: boolean
  relicSets: RelicSet[]
  statDisplay: string
  PRIMARY_ELEMENTAL_DMG_TYPE: string
  statSim?: any
  resultSort?: string
  resultsLimit?: number
  path?: string

  weights: {
    [key: string]: number
  }
  characterConditionals: CharacterConditionalMap

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

  setConditionals: { [key: string]: any[] }

  teammate0: Teammate
  teammate1: Teammate
  teammate2: Teammate



  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number

  maxAtk: MAX_INT
  maxBasic: MAX_INT
  maxBe: MAX_INT
  maxCd: MAX_INT
  maxCr: MAX_INT
  maxDef: MAX_INT
  maxDmg: MAX_INT
  maxDot: MAX_INT
  maxBreak: MAX_INT
  maxEhp: MAX_INT
  maxEhr: MAX_INT
  maxErr: MAX_INT
  maxFua: MAX_INT
  maxHp: MAX_INT
  maxMcd: MAX_INT
  maxRes: MAX_INT
  maxSkill: MAX_INT
  maxSpd: MAX_INT
  maxUlt: MAX_INT
  minAtk: MIN_INT
  minBasic: MIN_INT
  minBe: MIN_INT
  minCd: MIN_INT
  minCr: MIN_INT
  minDef: MIN_INT
  minDmg: MIN_INT
  minDot: MIN_INT
  minBreak: MIN_INT
  minEhp: MIN_INT
  minEhr: MIN_INT
  minErr: MIN_INT
  minFua: MIN_INT
  minHp: MIN_INT
  minMcd: MIN_INT
  minRes: MIN_INT
  minSkill: MIN_INT
  minSpd: MIN_INT
  minUlt: MIN_INT
}
