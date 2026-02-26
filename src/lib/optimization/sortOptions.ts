import { StatKey, StatKeyValue } from 'lib/optimization/engine/config/keys'

export type SortOptionKey = keyof typeof SortOption

export type SortOptionProperties = {
  key: SortOptionKey,
  basicGridColumn: string,
  combatGridColumn: string,
  memoBasicGridColumn: string,
  memoCombatGridColumn: string,
  isComputedRating?: boolean,
  minFilterKey?: string,
  maxFilterKey?: string,
  statKey?: StatKeyValue,
}

// Builder for base stats — derives all 4 grid columns from the short key
function baseStat(key: string): SortOptionProperties {
  return {
    key: key as SortOptionKey,
    basicGridColumn: key,
    combatGridColumn: `x${key}`,
    memoBasicGridColumn: `m${key}`,
    memoCombatGridColumn: `mx${key}`,
  }
}

// BASIC → Basic, MEMO_SKILL → MemoSkill
function toPascalCase(key: string): string {
  return key.split('_').map((s) => s[0] + s.slice(1).toLowerCase()).join('')
}

// Builder for computed ratings — all 4 grid columns are identical (the value is display-mode-independent)
function computed(key: string, filterable?: boolean): SortOptionProperties {
  const pascal = filterable ? toPascalCase(key) : undefined
  return {
    key: key as SortOptionKey,
    basicGridColumn: key,
    combatGridColumn: key,
    memoBasicGridColumn: key,
    memoCombatGridColumn: key,
    isComputedRating: true,
    minFilterKey: pascal ? `min${pascal}` : undefined,
    maxFilterKey: pascal ? `max${pascal}` : undefined,
  }
}

export const SortOption: {
  ATK: SortOptionProperties,
  DEF: SortOptionProperties,
  HP: SortOptionProperties,
  SPD: SortOptionProperties,
  CR: SortOptionProperties,
  CD: SortOptionProperties,
  EHR: SortOptionProperties,
  RES: SortOptionProperties,
  BE: SortOptionProperties,
  OHB: SortOptionProperties,
  ERR: SortOptionProperties,
  EHP: SortOptionProperties,
  BASIC: SortOptionProperties,
  SKILL: SortOptionProperties,
  ULT: SortOptionProperties,
  FUA: SortOptionProperties,
  MEMO_SKILL: SortOptionProperties,
  MEMO_TALENT: SortOptionProperties,
  ELATION_SKILL: SortOptionProperties,
  DOT: SortOptionProperties,
  BREAK: SortOptionProperties,
  COMBO: SortOptionProperties,
  BASIC_HEAL: SortOptionProperties,
  SKILL_HEAL: SortOptionProperties,
  ULT_HEAL: SortOptionProperties,
  FUA_HEAL: SortOptionProperties,
  TALENT_HEAL: SortOptionProperties,
  BASIC_SHIELD: SortOptionProperties,
  SKILL_SHIELD: SortOptionProperties,
  ULT_SHIELD: SortOptionProperties,
  FUA_SHIELD: SortOptionProperties,
  TALENT_SHIELD: SortOptionProperties,
} = {
  // Base stats — each has basic/combat/memo-basic/memo-combat grid columns
  ATK: baseStat('ATK'),
  DEF: baseStat('DEF'),
  HP: baseStat('HP'),
  SPD: baseStat('SPD'),
  CR: baseStat('CR'),
  CD: baseStat('CD'),
  EHR: baseStat('EHR'),
  RES: baseStat('RES'),
  BE: baseStat('BE'),
  OHB: baseStat('OHB'),
  ERR: baseStat('ERR'),

  // EHP is a computed rating but has a separate memo variant (mxEHP)
  EHP: { ...computed('EHP'), memoBasicGridColumn: 'mxEHP', memoCombatGridColumn: 'mxEHP', statKey: StatKey.EHP },

  // Computed damage ratings — same column in all display modes
  BASIC: computed('BASIC', true),
  SKILL: computed('SKILL', true),
  ULT: computed('ULT', true),
  FUA: computed('FUA', true),
  MEMO_SKILL: computed('MEMO_SKILL', true),
  MEMO_TALENT: computed('MEMO_TALENT', true),
  ELATION_SKILL: computed('ELATION_SKILL', true),
  DOT: computed('DOT', true),
  BREAK: computed('BREAK', true),
  COMBO: { ...computed('COMBO'), statKey: StatKey.COMBO_DMG },

  // Computed heal/shield ratings
  BASIC_HEAL: computed('BASIC_HEAL'),
  SKILL_HEAL: computed('SKILL_HEAL'),
  ULT_HEAL: computed('ULT_HEAL'),
  FUA_HEAL: computed('FUA_HEAL'),
  TALENT_HEAL: computed('TALENT_HEAL'),
  BASIC_SHIELD: computed('BASIC_SHIELD'),
  SKILL_SHIELD: computed('SKILL_SHIELD'),
  ULT_SHIELD: computed('ULT_SHIELD'),
  FUA_SHIELD: computed('FUA_SHIELD'),
  TALENT_SHIELD: computed('TALENT_SHIELD'),
}
