// import { } from "./Common";
import { RelicEnhance, RelicGrade } from 'types/Relic'
import { CharacterId, Eidolon } from 'types/Character'
import { SuperImpositionLevel } from 'types/LightCone'
import { CharacterConditionalMap } from 'types/CharacterConditional'
import { RelicSet } from 'types/RelicSet'
import { ConditionalLightConeMap } from './LightConeConditionals'

type MIN_INT = 0 | number
type MAX_INT = 2147483647 | number

export type Form = {
  characterEidolon: Eidolon
  characterId: CharacterId | undefined
  characterLevel: number
  enemyCount: number
  enemyElementalWeak: number
  enemyLevel: number
  enemyMaxToughness: number
  enemyResistance: number
  enemyWeaknessBroken: boolean
  enhance: RelicEnhance
  grade: RelicGrade
  keepCurrentRelics: boolean
  lightConeConditionals: ConditionalLightConeMap
  lightConeLevel: number
  lightConeSuperimposition: SuperImpositionLevel
  mainBody: any[]
  mainFeet: any[]
  mainHands: any[]
  mainHead: any[]
  mainLinkRope: any[]
  mainPlanarSphere: any[]
  ornamentSets: any[]
  predictMaxedMainStat: boolean
  rankFilter: boolean
  relicSets: RelicSet[]
  statDisplay: string
  PRIMARY_ELEMENTAL_DMG_TYPE: string

  weights: {
    [key: string]: number
  }
  characterConditionals: CharacterConditionalMap

  buffAtk: number
  buffAtkP: number
  buffBe: number
  buffCd: number
  buffCr: number
  buffDefShred: number
  buffDmgBoost: number
  buffResPen: number
  buffSpd: number
  buffSpdP: number

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
  maxWeight: MAX_INT
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
  minWeight: MIN_INT
}
