import { Sets } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { ComputedStatsObject } from 'lib/optimization/config/computedStatsConfig'

export const ASHBLAZING_ATK_STACK = 0.06

// Ability types
export const NONE_TYPE = 0

export enum DamageType {
  BASIC = 1,
  SKILL = 2,
  ULT = 4,
  FUA = 8,
  DOT = 16,
  BREAK = 32,
  SUPER_BREAK = 64,
  MEMO = 128,
  ADDITIONAL = 256,
}

export enum AbilityType {
  BASIC = 1,
  SKILL = 2,
  ULT = 4,
  FUA = 8,
  DOT = 16,
  BREAK = 32,
  MEMO_SKILL = 64,
  MEMO_TALENT = 128,
}

export const BASIC_DMG_TYPE: number = DamageType.BASIC
export const SKILL_DMG_TYPE: number = DamageType.SKILL
export const ULT_DMG_TYPE: number = DamageType.ULT
export const FUA_DMG_TYPE: number = DamageType.FUA
export const DOT_DMG_TYPE: number = DamageType.DOT
export const BREAK_DMG_TYPE: number = DamageType.BREAK
export const SUPER_BREAK_DMG_TYPE: number = DamageType.SUPER_BREAK
export const MEMO_DMG_TYPE: number = DamageType.MEMO
export const ADDITIONAL_DMG_TYPE: number = DamageType.ADDITIONAL

export const BASIC_ABILITY_TYPE: number = AbilityType.BASIC
export const SKILL_ABILITY_TYPE: number = AbilityType.SKILL
export const ULT_ABILITY_TYPE: number = AbilityType.ULT
export const FUA_ABILITY_TYPE: number = AbilityType.FUA
export const DOT_ABILITY_TYPE: number = AbilityType.DOT
export const BREAK_ABILITY_TYPE: number = AbilityType.BREAK
export const MEMO_SKILL_ABILITY_TYPE: number = AbilityType.MEMO_SKILL
export const MEMO_TALENT_ABILITY_TYPE: number = AbilityType.MEMO_TALENT

export const BUFF_PRIORITY_SELF = 0
export const BUFF_PRIORITY_MEMO = 1

export type SetsType = {
  [K in keyof typeof Sets]: number
}

export type BasicStatsObject = {
  ['HP%']: number,
  ['ATK%']: number,
  ['DEF%']: number,
  ['SPD%']: number,
  ['HP']: number,
  ['ATK']: number,
  ['DEF']: number,
  ['SPD']: number,
  ['CRIT Rate']: number,
  ['CRIT DMG']: number,
  ['Effect Hit Rate']: number,
  ['Effect RES']: number,
  ['Break Effect']: number,
  ['Energy Regeneration Rate']: number,
  ['Outgoing Healing Boost']: number,

  ['Physical DMG Boost']: number,
  ['Fire DMG Boost']: number,
  ['Ice DMG Boost']: number,
  ['Lightning DMG Boost']: number,
  ['Wind DMG Boost']: number,
  ['Quantum DMG Boost']: number,
  ['Imaginary DMG Boost']: number,

  'ELEMENTAL_DMG': number, // ?

  'relicSetIndex': number,
  'ornamentSetIndex': number,
  'id': number,

  'sets': SetsType,
  'x': ComputedStatsObject | ComputedStatsObjectExternal,
}
