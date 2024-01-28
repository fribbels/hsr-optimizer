import { Constants } from 'lib/constants';
const Stats = Constants.Stats

export const ASHBLAZING_ATK_STACK = 0.06;

// TODO profile & convert to array for performance?
export const baseComputedStatsObject = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 0,
  [Stats.DEF_P]: 0,
  [Stats.SPD_P]: 0,
  [Stats.HP]: 0,
  [Stats.ATK]: 0,
  [Stats.DEF]: 0,
  [Stats.SPD]: 0,
  [Stats.CD]: 0,
  [Stats.CR]: 0,
  [Stats.EHR]: 0,
  [Stats.RES]: 0,
  [Stats.BE]: 0,
  [Stats.ERR]: 0,
  [Stats.OHB]: 0,

  ELEMENTAL_DMG: 0,
  DEF_SHRED: 0,
  DMG_TAKEN_MULTI: 0,
  ALL_DMG_MULTI: 0,
  RES_PEN: 0,
  DMG_RED_MULTI: 1,

  BASIC_CR_BOOST: 0,
  SKILL_CR_BOOST: 0,
  ULT_CR_BOOST: 0,
  FUA_CR_BOOST: 0,

  BASIC_CD_BOOST: 0,
  SKILL_CD_BOOST: 0,
  ULT_CD_BOOST: 0,
  FUA_CD_BOOST: 0,

  BASIC_SCALING: 0,
  SKILL_SCALING: 0,
  ULT_SCALING: 0,
  FUA_SCALING: 0,
  DOT_SCALING: 0,

  BASIC_BOOST: 0,
  SKILL_BOOST: 0,
  ULT_BOOST: 0,
  FUA_BOOST: 0,
  DOT_BOOST: 0,

  BASIC_VULNERABILITY: 0,
  SKILL_VULNERABILITY: 0,
  ULT_VULNERABILITY: 0,
  FUA_VULNERABILITY: 0,
  DOT_VULNERABILITY: 0,

  BASIC_DMG: 0,
  SKILL_DMG: 0,
  ULT_DMG: 0,
  FUA_DMG: 0,
  DOT_DMG: 0,

  BASIC_DEF_PEN: 0,
  SKILL_DEF_PEN: 0,
  ULT_DEF_PEN: 0,
  FUA_DEF_PEN: 0,
  DOT_DEF_PEN: 0,

  BASIC_RES_PEN: 0,
  SKILL_RES_PEN: 0,
  ULT_RES_PEN: 0,
  FUA_RES_PEN: 0,
  DOT_RES_PEN: 0,
};
export type ComputedStatsObject = typeof baseComputedStatsObject;