import { Sets } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'

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

export const BUFF_PRIORITY_SELF = 0
export const BUFF_PRIORITY_MEMO = 1

export const baseComputedStatsObject = {
  HP_P: 0,
  ATK_P: 0,
  DEF_P: 0,
  SPD_P: 0,
  HP: 0,
  ATK: 0,
  DEF: 0,
  SPD: 0.0001,
  CR: 0,
  CD: 0,
  EHR: 0,
  RES: 0,
  BE: 0,
  ERR: 0,
  OHB: 0,

  PHYSICAL_DMG_BOOST: 0,
  FIRE_DMG_BOOST: 0,
  ICE_DMG_BOOST: 0,
  LIGHTNING_DMG_BOOST: 0,
  WIND_DMG_BOOST: 0,
  QUANTUM_DMG_BOOST: 0,
  IMAGINARY_DMG_BOOST: 0,

  ELEMENTAL_DMG: 0,

  BASIC_SCALING: 0,
  SKILL_SCALING: 0,
  ULT_SCALING: 0,
  FUA_SCALING: 0,
  DOT_SCALING: 0,

  BASIC_CR_BOOST: 0,
  SKILL_CR_BOOST: 0,
  ULT_CR_BOOST: 0,
  FUA_CR_BOOST: 0,

  BASIC_CD_BOOST: 0,
  SKILL_CD_BOOST: 0,
  ULT_CD_BOOST: 0,
  FUA_CD_BOOST: 0,

  BASIC_BOOST: 0,
  SKILL_BOOST: 0,
  ULT_BOOST: 0,
  FUA_BOOST: 0,
  DOT_BOOST: 0,
  BREAK_BOOST: 0,
  ADDITIONAL_BOOST: 0,

  VULNERABILITY: 0,
  BASIC_VULNERABILITY: 0,
  SKILL_VULNERABILITY: 0,
  ULT_VULNERABILITY: 0,
  FUA_VULNERABILITY: 0,
  DOT_VULNERABILITY: 0,
  BREAK_VULNERABILITY: 0,

  DEF_PEN: 0,
  BASIC_DEF_PEN: 0,
  SKILL_DEF_PEN: 0,
  ULT_DEF_PEN: 0,
  FUA_DEF_PEN: 0,
  DOT_DEF_PEN: 0,
  BREAK_DEF_PEN: 0,
  SUPER_BREAK_DEF_PEN: 0,

  RES_PEN: 0,
  PHYSICAL_RES_PEN: 0,
  FIRE_RES_PEN: 0,
  ICE_RES_PEN: 0,
  LIGHTNING_RES_PEN: 0,
  WIND_RES_PEN: 0,
  QUANTUM_RES_PEN: 0,
  IMAGINARY_RES_PEN: 0,

  // These should technically be split by element but they are rare enough to ignore imo (e.g. DHIL basic attack)
  BASIC_RES_PEN: 0,
  SKILL_RES_PEN: 0,
  ULT_RES_PEN: 0,
  FUA_RES_PEN: 0,
  DOT_RES_PEN: 0,

  BASIC_DMG: 0,
  SKILL_DMG: 0,
  ULT_DMG: 0,
  FUA_DMG: 0,
  DOT_DMG: 0,
  BREAK_DMG: 0,
  COMBO_DMG: 0,

  DMG_RED_MULTI: 1, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi)
  EHP: 0,

  DOT_CHANCE: 0,
  EFFECT_RES_PEN: 0,

  // Black swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_SPLIT: 0,
  DOT_STACKS: 0,

  SUMMONS: 0,

  ENEMY_WEAKNESS_BROKEN: 0,

  SUPER_BREAK_MODIFIER: 0,
  BASIC_SUPER_BREAK_MODIFIER: 0,
  SUPER_BREAK_HMC_MODIFIER: 0,
  BASIC_TOUGHNESS_DMG: 0,
  SKILL_TOUGHNESS_DMG: 0,
  ULT_TOUGHNESS_DMG: 0,
  FUA_TOUGHNESS_DMG: 0,

  // RMC
  TRUE_DMG_MODIFIER: 0,

  // e.g. Acheron multiplier
  BASIC_ORIGINAL_DMG_BOOST: 0,
  SKILL_ORIGINAL_DMG_BOOST: 0,
  ULT_ORIGINAL_DMG_BOOST: 0,

  // Boothill
  BASIC_BREAK_DMG_MODIFIER: 0,

  // Robin
  ULT_ADDITIONAL_DMG_CR_OVERRIDE: 0,
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: 0,

  SKILL_OHB: 0,
  ULT_OHB: 0,
  HEAL_TYPE: 0,
  HEAL_FLAT: 0,
  HEAL_SCALING: 0,
  HEAL_VALUE: 0,
  SHIELD_FLAT: 0,
  SHIELD_SCALING: 0,
  SHIELD_VALUE: 0,

  BASIC_ADDITIONAL_DMG_SCALING: 0,
  SKILL_ADDITIONAL_DMG_SCALING: 0,
  ULT_ADDITIONAL_DMG_SCALING: 0,
  FUA_ADDITIONAL_DMG_SCALING: 0,

  BASIC_ADDITIONAL_DMG: 0,
  SKILL_ADDITIONAL_DMG: 0,
  ULT_ADDITIONAL_DMG: 0,
  FUA_ADDITIONAL_DMG: 0,

  MEMO_BUFF_PRIORITY: 0,
  DEPRIORITIZE_BUFFS: 0,

  MEMO_HP_SCALING: 0,
  MEMO_HP_FLAT: 0,
  MEMO_DEF_SCALING: 0,
  MEMO_DEF_FLAT: 0,
  MEMO_ATK_SCALING: 0,
  MEMO_ATK_FLAT: 0,
  MEMO_SPD_SCALING: 0,
  MEMO_SPD_FLAT: 0,

  MEMO_SKILL_SCALING: 0,
  MEMO_TALENT_SCALING: 0,

  MEMO_SKILL_DMG: 0,
  MEMO_TALENT_DMG: 0,

  RATIO_BASED_HP_BUFF: 0,
  RATIO_BASED_HP_P_BUFF: 0,
  RATIO_BASED_ATK_BUFF: 0,
  RATIO_BASED_ATK_P_BUFF: 0,
  RATIO_BASED_DEF_BUFF: 0,
  RATIO_BASED_DEF_P_BUFF: 0,
  RATIO_BASED_SPD_BUFF: 0,
  RATIO_BASED_CD_BUFF: 0,

  BREAK_EFFICIENCY_BOOST: 0,
  BASIC_BREAK_EFFICIENCY_BOOST: 0, // Boothill
  ULT_BREAK_EFFICIENCY_BOOST: 0, // Feixiao

  BASIC_DMG_TYPE: BASIC_DMG_TYPE,
  SKILL_DMG_TYPE: SKILL_DMG_TYPE,
  ULT_DMG_TYPE: ULT_DMG_TYPE,
  FUA_DMG_TYPE: FUA_DMG_TYPE,
  DOT_DMG_TYPE: DOT_DMG_TYPE,
  BREAK_DMG_TYPE: BREAK_DMG_TYPE,
  SUPER_BREAK_DMG_TYPE: SUPER_BREAK_DMG_TYPE,
  MEMO_DMG_TYPE: MEMO_DMG_TYPE,
  ADDITIONAL_DMG_TYPE: ADDITIONAL_DMG_TYPE,
}

export type SetsType = {
  [K in keyof typeof Sets]: number;
}

export type ComputedStatsObject = typeof baseComputedStatsObject
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
  low: number
  high: number

  sets: SetsType
  x: ComputedStatsObject | ComputedStatsObjectExternal
}

export type BasicStatsObjectCV = BasicStatsObject & {
  CV: number
}
