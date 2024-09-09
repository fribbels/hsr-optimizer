import { Sets } from 'lib/constants'

export const ASHBLAZING_ATK_STACK = 0.06

// Ability types
export const BASIC_TYPE = 1
export const SKILL_TYPE = 2
export const ULT_TYPE = 4
export const FUA_TYPE = 8
export const DOT_TYPE = 16
export const BREAK_TYPE = 32
export const SUPER_BREAK_TYPE = 64

export const baseComputedStatsObject = {
  BASIC_DMG_TYPE: BASIC_TYPE,
  SKILL_DMG_TYPE: SKILL_TYPE,
  ULT_DMG_TYPE: ULT_TYPE,
  FUA_DMG_TYPE: FUA_TYPE,
  DOT_DMG_TYPE: DOT_TYPE,
  BREAK_DMG_TYPE: BREAK_TYPE,
  SUPER_BREAK_DMG_TYPE: SUPER_BREAK_TYPE,

  ['HP%']: 0,
  ['ATK%']: 0,
  ['DEF%']: 0,
  ['SPD%']: 0,
  ['HP']: 0,
  ['ATK']: 0,
  ['DEF']: 0,
  ['SPD']: 0.0001,
  ['CRIT DMG']: 0,
  ['CRIT Rate']: 0,
  ['Effect Hit Rate']: 0,
  ['Effect RES']: 0,
  ['Break Effect']: 0,
  ['Energy Regeneration Rate']: 0,
  ['Outgoing Healing Boost']: 0,

  ['Physical DMG Boost']: 0,
  ['Fire DMG Boost']: 0,
  ['Ice DMG Boost']: 0,
  ['Lightning DMG Boost']: 0,
  ['Wind DMG Boost']: 0,
  ['Quantum DMG Boost']: 0,
  ['Imaginary DMG Boost']: 0,

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

  ENEMY_WEAKNESS_BROKEN: 0,

  SUPER_BREAK_MODIFIER: 0,
  BASIC_SUPER_BREAK_MODIFIER: 0,
  SUPER_BREAK_HMC_MODIFIER: 0,
  BASIC_TOUGHNESS_DMG: 0,
  SKILL_TOUGHNESS_DMG: 0,
  ULT_TOUGHNESS_DMG: 0,
  FUA_TOUGHNESS_DMG: 0,

  // e.g. Acheron multiplier
  BASIC_ORIGINAL_DMG_BOOST: 0,
  SKILL_ORIGINAL_DMG_BOOST: 0,
  ULT_ORIGINAL_DMG_BOOST: 0,

  // Boothill
  BASIC_BREAK_DMG_MODIFIER: 0,

  // Robin
  ULT_CD_OVERRIDE: 0,
  ULT_BOOSTS_MULTI: 1,

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

  sets: {} as SetsType,
  WEIGHT: 0,
}

type SetsType = {
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

  relicSetIndex: number
  ornamentSetIndex: number
  id: number

  x: ComputedStatsObject
}
