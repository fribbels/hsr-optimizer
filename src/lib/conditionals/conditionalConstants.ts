import { Constants } from 'lib/constants'

const Stats = Constants.Stats

export const ASHBLAZING_ATK_STACK = 0.06

// TODO profile & convert to array for performance?
export const baseComputedStatsObject = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 0,
  [Stats.DEF_P]: 0,
  [Stats.SPD_P]: 0,
  [Stats.HP]: 0,
  [Stats.ATK]: 0,
  [Stats.DEF]: 0,
  [Stats.SPD]: 0.0001,
  [Stats.CD]: 0,
  [Stats.CR]: 0,
  [Stats.EHR]: 0,
  [Stats.RES]: 0,
  [Stats.BE]: 0,
  [Stats.ERR]: 0,
  [Stats.OHB]: 0,

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

  // Robin
  ULT_CD_OVERRIDE: 0,
  ULT_BOOSTS_MULTI: 1,

  BASIC_BOOST: 0,
  SKILL_BOOST: 0,
  ULT_BOOST: 0,
  FUA_BOOST: 0,
  DOT_BOOST: 0,

  DMG_TAKEN_MULTI: 0, // TODO: Rename to VULNERABILITY
  BASIC_VULNERABILITY: 0,
  SKILL_VULNERABILITY: 0,
  ULT_VULNERABILITY: 0,
  FUA_VULNERABILITY: 0,
  DOT_VULNERABILITY: 0,
  BREAK_VULNERABILITY: 0,

  // TODO: Consolidate wording as DEF_SHRED
  DEF_SHRED: 0,
  BASIC_DEF_PEN: 0,
  SKILL_DEF_PEN: 0,
  ULT_DEF_PEN: 0,
  FUA_DEF_PEN: 0,
  DOT_DEF_PEN: 0,
  BREAK_DEF_PEN: 0,
  SUPER_BREAK_DEF_PEN: 0,

  RES_PEN: 0, // TODO: Rename to ALL_TYPE_RES_PEN
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

  ELEMENTAL_DMG: 0, // TODO: Rename to ALL_TYPE_DMG_BOOST

  [Stats.Physical_DMG]: 0,
  [Stats.Fire_DMG]: 0,
  [Stats.Ice_DMG]: 0,
  [Stats.Lightning_DMG]: 0,
  [Stats.Wind_DMG]: 0,
  [Stats.Quantum_DMG]: 0,
  [Stats.Imaginary_DMG]: 0,

  // e.g. Acheron multiplier
  BASIC_ORIGINAL_DMG_BOOST: 0,
  SKILL_ORIGINAL_DMG_BOOST: 0,
  ULT_ORIGINAL_DMG_BOOST: 0,

  // Boothill
  BASIC_BREAK_DMG_MODIFIER: 0,

  BREAK_EFFICIENCY_BOOST: 0,
  BASIC_BREAK_EFFICIENCY_BOOST: 0, // Boothill

  RATIO_BASED_ATK_BUFF: 0,
  RATIO_BASED_ATK_P_BUFF: 0,

  BASIC_DMG: 0,
  SKILL_DMG: 0,
  ULT_DMG: 0,
  FUA_DMG: 0,
  DOT_DMG: 0,
  BREAK_DMG: 0,
  COMBO_DMG: 0,

  DOT_CHANCE: 0,
  EFFECT_RES_SHRED: 0,

  // Black swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_SPLIT: 0,
  DOT_STACKS: 0,

  ENEMY_WEAKNESS_BROKEN: 0,

  SUPER_BREAK_MODIFIER: 0,
  SUPER_BREAK_HMC_MODIFIER: 0,
  BASIC_TOUGHNESS_DMG: 0,
  SKILL_TOUGHNESS_DMG: 0,
  ULT_TOUGHNESS_DMG: 0,
  FUA_TOUGHNESS_DMG: 0,

  DMG_RED_MULTI: 1, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi)
}
export type ComputedStatsObject = typeof baseComputedStatsObject
