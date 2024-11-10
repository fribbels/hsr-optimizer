// This file tracks the mapping between various stat property references between the optimizer / worker / grid / buffer packer
// This sucks - clean up the discrepancies eventually

import { Key } from 'lib/optimization/computedStatsArray'

export type SortOptionProperties = {
  key: string
  gpuProperty: string
  basicProperty: string
  combatProperty: string
  basicGridColumn: string
  combatGridColumn: string
  optimizerKey: number
  isComputedRating?: boolean
}

export const SortOption: {
  ATK: SortOptionProperties
  DEF: SortOptionProperties
  HP: SortOptionProperties
  SPD: SortOptionProperties
  CR: SortOptionProperties
  CD: SortOptionProperties
  EHR: SortOptionProperties
  RES: SortOptionProperties
  BE: SortOptionProperties
  OHB: SortOptionProperties
  ERR: SortOptionProperties
  ELEMENTAL_DMG: SortOptionProperties
  EHP: SortOptionProperties
  BASIC: SortOptionProperties
  SKILL: SortOptionProperties
  ULT: SortOptionProperties
  FUA: SortOptionProperties
  DOT: SortOptionProperties
  BREAK: SortOptionProperties
  COMBO: SortOptionProperties
  HEAL: SortOptionProperties
  SHIELD: SortOptionProperties
} = {
  ATK: {
    key: 'ATK',
    gpuProperty: 'ATK',
    basicProperty: 'ATK',
    combatProperty: 'ATK',
    basicGridColumn: 'ATK',
    combatGridColumn: 'xATK',
    optimizerKey: Key.ATK,
  },
  DEF: {
    key: 'DEF',
    gpuProperty: 'DEF',
    basicProperty: 'DEF',
    combatProperty: 'DEF',
    basicGridColumn: 'DEF',
    combatGridColumn: 'xDEF',
    optimizerKey: Key.DEF,
  },
  HP: {
    key: 'HP',
    gpuProperty: 'HP',
    basicProperty: 'HP',
    combatProperty: 'HP',
    basicGridColumn: 'HP',
    combatGridColumn: 'xHP',
    optimizerKey: Key.HP,
  },
  SPD: {
    key: 'SPD',
    gpuProperty: 'SPD',
    basicProperty: 'SPD',
    combatProperty: 'SPD',
    basicGridColumn: 'SPD',
    combatGridColumn: 'xSPD',
    optimizerKey: Key.SPD,
  },
  CR: {
    key: 'CR',
    gpuProperty: 'CR',
    basicProperty: 'CRIT Rate',
    combatProperty: 'CRIT Rate',
    basicGridColumn: 'CRIT Rate',
    combatGridColumn: 'xCR',
    optimizerKey: Key.CR,
  },
  CD: {
    key: 'CD',
    gpuProperty: 'CD',
    basicProperty: 'CRIT DMG',
    combatProperty: 'CRIT DMG',
    basicGridColumn: 'CRIT DMG',
    combatGridColumn: 'xCD',
    optimizerKey: Key.CD,
  },
  EHR: {
    key: 'EHR',
    gpuProperty: 'EHR',
    basicProperty: 'Effect Hit Rate',
    combatProperty: 'Effect Hit Rate',
    basicGridColumn: 'Effect Hit Rate',
    combatGridColumn: 'xEHR',
    optimizerKey: Key.EHR,
  },
  RES: {
    key: 'RES',
    gpuProperty: 'RES',
    basicProperty: 'Effect RES',
    combatProperty: 'Effect RES',
    basicGridColumn: 'Effect RES',
    combatGridColumn: 'xRES',
    optimizerKey: Key.RES,
  },
  BE: {
    key: 'BE',
    gpuProperty: 'BE',
    basicProperty: 'Break Effect',
    combatProperty: 'Break Effect',
    basicGridColumn: 'Break Effect',
    combatGridColumn: 'xBE',
    optimizerKey: Key.BE,
  },
  OHB: {
    key: 'OHB',
    gpuProperty: 'OHB',
    basicProperty: 'Outgoing Healing Boost',
    combatProperty: 'Outgoing Healing Boost',
    basicGridColumn: 'Outgoing Healing Boost',
    combatGridColumn: 'xOHB',
    optimizerKey: Key.OHB,
  },
  ERR: {
    key: 'ERR',
    gpuProperty: 'ERR',
    basicProperty: 'Energy Regeneration Rate',
    combatProperty: 'Energy Regeneration Rate',
    basicGridColumn: 'Energy Regeneration Rate',
    combatGridColumn: 'xERR',
    optimizerKey: Key.ERR,
  },
  ELEMENTAL_DMG: {
    key: 'ELEMENTAL_DMG',
    gpuProperty: 'ELEMENTAL_DMG',
    basicProperty: 'ELEMENTAL_DMG',
    combatProperty: 'ELEMENTAL_DMG',
    basicGridColumn: 'ED',
    combatGridColumn: 'xELEMENTAL_DMG',
    optimizerKey: Key.ELEMENTAL_DMG,
    isComputedRating: true,
  },
  EHP: {
    key: 'EHP',
    gpuProperty: 'EHP',
    basicProperty: 'EHP',
    combatProperty: 'EHP',
    basicGridColumn: 'EHP',
    combatGridColumn: 'EHP',
    optimizerKey: Key.EHP,
    isComputedRating: true,
  },
  BASIC: {
    key: 'BASIC',
    gpuProperty: 'BASIC_DMG',
    basicProperty: 'BASIC_DMG',
    combatProperty: 'BASIC_DMG',
    basicGridColumn: 'BASIC',
    combatGridColumn: 'BASIC',
    optimizerKey: Key.BASIC_DMG,
    isComputedRating: true,
  },
  SKILL: {
    key: 'SKILL',
    gpuProperty: 'SKILL_DMG',
    basicProperty: 'SKILL_DMG',
    combatProperty: 'SKILL_DMG',
    basicGridColumn: 'SKILL',
    combatGridColumn: 'SKILL',
    optimizerKey: Key.SKILL_DMG,
    isComputedRating: true,
  },
  ULT: {
    key: 'ULT',
    gpuProperty: 'ULT_DMG',
    basicProperty: 'ULT_DMG',
    combatProperty: 'ULT_DMG',
    basicGridColumn: 'ULT',
    combatGridColumn: 'ULT',
    optimizerKey: Key.ULT_DMG,
    isComputedRating: true,
  },
  FUA: {
    key: 'FUA',
    gpuProperty: 'FUA_DMG',
    basicProperty: 'FUA_DMG',
    combatProperty: 'FUA_DMG',
    basicGridColumn: 'FUA',
    combatGridColumn: 'FUA',
    optimizerKey: Key.FUA_DMG,
    isComputedRating: true,
  },
  DOT: {
    key: 'DOT',
    gpuProperty: 'DOT_DMG',
    basicProperty: 'DOT_DMG',
    combatProperty: 'DOT_DMG',
    basicGridColumn: 'DOT',
    combatGridColumn: 'DOT',
    optimizerKey: Key.DOT_DMG,
    isComputedRating: true,
  },
  BREAK: {
    key: 'BREAK',
    gpuProperty: 'BREAK_DMG',
    basicProperty: 'BREAK_DMG',
    combatProperty: 'BREAK_DMG',
    basicGridColumn: 'BREAK',
    combatGridColumn: 'BREAK',
    optimizerKey: Key.BREAK_DMG,
    isComputedRating: true,
  },
  COMBO: {
    key: 'COMBO',
    gpuProperty: 'COMBO_DMG',
    basicProperty: 'COMBO_DMG',
    combatProperty: 'COMBO_DMG',
    basicGridColumn: 'COMBO',
    combatGridColumn: 'COMBO',
    optimizerKey: Key.COMBO_DMG,
    isComputedRating: true,
  },
  HEAL: {
    key: 'HEAL',
    gpuProperty: 'HEAL_VALUE',
    basicProperty: 'HEAL_VALUE',
    combatProperty: 'HEAL_VALUE',
    basicGridColumn: 'HEAL',
    combatGridColumn: 'HEAL',
    optimizerKey: Key.HEAL_VALUE,
    isComputedRating: true,
  },
  SHIELD: {
    key: 'SHIELD',
    gpuProperty: 'SHIELD_VALUE',
    basicProperty: 'SHIELD_VALUE',
    combatProperty: 'SHIELD_VALUE',
    basicGridColumn: 'SHIELD',
    combatGridColumn: 'SHIELD',
    optimizerKey: Key.SHIELD_VALUE,
    isComputedRating: true,
  },
}
