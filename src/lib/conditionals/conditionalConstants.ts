import { Sets } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { ComputedStatsObject } from 'lib/optimization/config/computedStatsConfig'

export const ASHBLAZING_ATK_STACK = 0.06

// Ability types
export const NONE_TYPE = 0
export const BASIC_DMG_TYPE = 1
export const SKILL_DMG_TYPE = 2
export const ULT_DMG_TYPE = 4
export const FUA_DMG_TYPE = 8
export const DOT_DMG_TYPE = 16
export const BREAK_DMG_TYPE = 32
export const SUPER_BREAK_DMG_TYPE = 64
export const MEMO_DMG_TYPE = 128
export const ADDITIONAL_DMG_TYPE = 256

export const BASIC_ABILITY_TYPE = 1
export const SKILL_ABILITY_TYPE = 2
export const ULT_ABILITY_TYPE = 4
export const FUA_ABILITY_TYPE = 8
export const MEMO_SKILL_ABILITY_TYPE = 16
export const MEMO_TALENT_ABILITY_TYPE = 32

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
