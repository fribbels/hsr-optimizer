import { Sets } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { AbilityType, ComputedStatsObject, DamageType } from 'lib/optimization/config/computedStatsConfig'

export const ASHBLAZING_ATK_STACK = 0.06

// Ability types
export const NONE_TYPE = 0
export const BASIC_DMG_TYPE = DamageType.BASIC
export const SKILL_DMG_TYPE = DamageType.SKILL
export const ULT_DMG_TYPE = DamageType.ULT
export const FUA_DMG_TYPE = DamageType.FUA
export const DOT_DMG_TYPE = DamageType.DOT
export const BREAK_DMG_TYPE = DamageType.BREAK
export const SUPER_BREAK_DMG_TYPE = DamageType.SUPER_BREAK
export const MEMO_DMG_TYPE = DamageType.MEMO
export const ADDITIONAL_DMG_TYPE = DamageType.ADDITIONAL

export const BASIC_ABILITY_TYPE = AbilityType.BASIC
export const SKILL_ABILITY_TYPE = AbilityType.SKILL
export const ULT_ABILITY_TYPE = AbilityType.ULT
export const FUA_ABILITY_TYPE = AbilityType.FUA
export const MEMO_SKILL_ABILITY_TYPE = AbilityType.MEMO_SKILL
export const MEMO_TALENT_ABILITY_TYPE = AbilityType.MEMO_TALENT

export const BUFF_PRIORITY_SELF = 0
export const BUFF_PRIORITY_MEMO = 1

export type SetsType = {
  [K in keyof typeof Sets]: number;
}

export type BasicStatsObject = {
  ['HP%']: number
  ['ATK%']: number
  ['DEF%']: number
  ['SPD%']: number
  ['HP']: number
  ['ATK']: number
  ['DEF']: number
  ['SPD']: number
  ['CRIT Rate']: number
  ['CRIT DMG']: number
  ['Effect Hit Rate']: number
  ['Effect RES']: number
  ['Break Effect']: number
  ['Energy Regeneration Rate']: number
  ['Outgoing Healing Boost']: number

  ['Physical DMG Boost']: number
  ['Fire DMG Boost']: number
  ['Ice DMG Boost']: number
  ['Lightning DMG Boost']: number
  ['Wind DMG Boost']: number
  ['Quantum DMG Boost']: number
  ['Imaginary DMG Boost']: number

  ELEMENTAL_DMG: number // ?
  WEIGHT: number // ?

  relicSetIndex: number
  ornamentSetIndex: number
  id: number

  sets: SetsType
  x: ComputedStatsObject | ComputedStatsObjectExternal
}
