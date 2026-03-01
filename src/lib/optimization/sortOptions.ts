import { GlobalRegister, StatKey, StatKeyValue } from 'lib/optimization/engine/config/keys'

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
  globalRegisterIndex?: number,
}

// Builder for base stats — derives all 4 grid columns from the short key
function baseStat(key: string, filterable?: boolean): SortOptionProperties {
  const pascal = filterable ? toPascalCase(key) : undefined
  return {
    key: key as SortOptionKey,
    basicGridColumn: key,
    combatGridColumn: `x${key}`,
    memoBasicGridColumn: `m${key}`,
    memoCombatGridColumn: `mx${key}`,
    minFilterKey: pascal ? `min${pascal}` : undefined,
    maxFilterKey: pascal ? `max${pascal}` : undefined,
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
  ATK: baseStat('ATK', true),
  DEF: baseStat('DEF', true),
  HP: baseStat('HP', true),
  SPD: baseStat('SPD', true),
  CR: baseStat('CR', true),
  CD: baseStat('CD', true),
  EHR: baseStat('EHR', true),
  RES: baseStat('RES', true),
  BE: baseStat('BE', true),
  OHB: baseStat('OHB'),
  ERR: baseStat('ERR', true),

  // EHP is a computed rating but has a separate memo variant (mxEHP)
  EHP: { ...computed('EHP', true), memoBasicGridColumn: 'mxEHP', memoCombatGridColumn: 'mxEHP', statKey: StatKey.EHP },

  // Computed damage ratings — same column in all display modes
  BASIC: computed('BASIC', true),
  SKILL: computed('SKILL', true),
  ULT: computed('ULT', true),
  FUA: computed('FUA', true),
  MEMO_SKILL: computed('MEMO_SKILL', true),
  MEMO_TALENT: computed('MEMO_TALENT'),
  ELATION_SKILL: computed('ELATION_SKILL'),
  DOT: computed('DOT', true),
  BREAK: computed('BREAK', true),
  COMBO: { ...computed('COMBO'), globalRegisterIndex: GlobalRegister.COMBO_DMG },

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

export function getGridColumn(option: SortOptionProperties, statDisplay: string, memoDisplay: string): string {
  if (memoDisplay === 'memo') {
    return statDisplay === 'combat' ? option.memoCombatGridColumn : option.memoBasicGridColumn
  }
  return statDisplay === 'combat' ? option.combatGridColumn : option.basicGridColumn
}

export const columnsToAggregateMap: Record<string, boolean> = {}
for (const option of Object.values(SortOption)) {
  columnsToAggregateMap[option.basicGridColumn] = true
  columnsToAggregateMap[option.combatGridColumn] = true
  columnsToAggregateMap[option.memoBasicGridColumn] = true
  columnsToAggregateMap[option.memoCombatGridColumn] = true
}
// Display-only columns not in SortOption but needed for gradient coloring
for (const col of ['ELEMENTAL_DMG', 'xELEMENTAL_DMG', 'mELEMENTAL_DMG', 'mxELEMENTAL_DMG']) {
  columnsToAggregateMap[col] = true
}
