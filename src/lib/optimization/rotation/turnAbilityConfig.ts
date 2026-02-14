import type { SortOptionKey } from 'lib/optimization/sortOptions'

// =============================================================================
// ENUMS
// =============================================================================

export enum AbilityKind {
  NULL = 'NULL',
  BASIC = 'BASIC',
  SKILL = 'SKILL',
  ULT = 'ULT',
  FUA = 'FUA',
  DOT = 'DOT',
  BREAK = 'BREAK',
  MEMO_SKILL = 'MEMO_SKILL',
  MEMO_TALENT = 'MEMO_TALENT',

  BASIC_HEAL = 'BASIC_HEAL',
  SKILL_HEAL = 'SKILL_HEAL',
  ULT_HEAL = 'ULT_HEAL',
  FUA_HEAL = 'FUA_HEAL',
  TALENT_HEAL = 'TALENT_HEAL',
  BASIC_SHIELD = 'BASIC_SHIELD',
  SKILL_SHIELD = 'SKILL_SHIELD',
  ULT_SHIELD = 'ULT_SHIELD',
  FUA_SHIELD = 'FUA_SHIELD',
  TALENT_SHIELD = 'TALENT_SHIELD',
}

export enum TurnMarker {
  DEFAULT = 'DEFAULT',
  START = 'START',
  END = 'END',
  WHOLE = 'WHOLE',
}

// =============================================================================
// ABILITY META CONFIG - Single source of truth
// =============================================================================

type AbilityCategory = 'damage' | 'heal' | 'shield' | 'null'

interface AbilityMetaEntry {
  label: string
  sortKey?: SortOptionKey // matches SortOption key, undefined = no sort option
  category: AbilityCategory
}

export const AbilityMeta = {
  [AbilityKind.NULL]: { label: 'None', sortKey: undefined, category: 'null' },
  [AbilityKind.BASIC]: { label: 'Basic', sortKey: 'BASIC', category: 'damage' },
  [AbilityKind.SKILL]: { label: 'Skill', sortKey: 'SKILL', category: 'damage' },
  [AbilityKind.ULT]: { label: 'Ult', sortKey: 'ULT', category: 'damage' },
  [AbilityKind.FUA]: { label: 'Fua', sortKey: 'FUA', category: 'damage' },
  [AbilityKind.DOT]: { label: 'Dot', sortKey: 'DOT', category: 'damage' },
  [AbilityKind.BREAK]: { label: 'Break', sortKey: 'BREAK', category: 'damage' },
  [AbilityKind.MEMO_SKILL]: { label: 'MemoSkill', sortKey: 'MEMO_SKILL', category: 'damage' },
  [AbilityKind.MEMO_TALENT]: { label: 'MemoTalent', sortKey: 'MEMO_TALENT', category: 'damage' },

  [AbilityKind.BASIC_HEAL]: { label: 'BasicHeal', sortKey: 'BASIC_HEAL', category: 'heal' },
  [AbilityKind.SKILL_HEAL]: { label: 'SkillHeal', sortKey: 'SKILL_HEAL', category: 'heal' },
  [AbilityKind.ULT_HEAL]: { label: 'UltHeal', sortKey: 'ULT_HEAL', category: 'heal' },
  [AbilityKind.FUA_HEAL]: { label: 'FuaHeal', sortKey: 'FUA_HEAL', category: 'heal' },
  [AbilityKind.TALENT_HEAL]: { label: 'TalentHeal', sortKey: 'TALENT_HEAL', category: 'heal' },
  [AbilityKind.BASIC_SHIELD]: { label: 'BasicShield', sortKey: 'BASIC_SHIELD', category: 'shield' },
  [AbilityKind.SKILL_SHIELD]: { label: 'SkillShield', sortKey: 'SKILL_SHIELD', category: 'shield' },
  [AbilityKind.ULT_SHIELD]: { label: 'UltShield', sortKey: 'ULT_SHIELD', category: 'shield' },
  [AbilityKind.FUA_SHIELD]: { label: 'FuaShield', sortKey: 'FUA_SHIELD', category: 'shield' },
  [AbilityKind.TALENT_SHIELD]: { label: 'TalentShield', sortKey: 'TALENT_SHIELD', category: 'shield' },
} as const

// Derived union of all combo option label strings (e.g. 'Basic' | 'Skill' | 'Ult' | ...)
export type ComboOptionLabel = typeof AbilityMeta[AbilityKind]['label']

// =============================================================================
// DERIVED MAPPINGS
// =============================================================================

// ComboOptionsLabelMapping - derived from AbilityMeta
export const ComboOptionsLabelMapping: Record<AbilityKind, ComboOptionLabel> = Object.fromEntries(
  Object.entries(AbilityMeta).map(([kind, meta]) => [kind, meta.label]),
) as Record<AbilityKind, ComboOptionLabel>

// AbilityToSortOption - maps AbilityKind to SortOption key (only for abilities with sortKey)
export const AbilityToSortOption: Partial<Record<AbilityKind, SortOptionKey>> = Object.fromEntries(
  Object.entries(AbilityMeta)
    .filter(([_, meta]) => meta.sortKey != null)
    .map(([kind, meta]) => [kind, meta.sortKey]),
) as Partial<Record<AbilityKind, SortOptionKey>>

// =============================================================================
// TURN ABILITY TYPES
// =============================================================================

const abilityKinds = Object.values(AbilityKind).filter((kind) => kind !== AbilityKind.NULL) as AbilityKind[]
const markers = Object.values(TurnMarker)

export type TurnAbilityName =
  | `${TurnMarker}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | 'NULL'

export interface TurnAbility {
  kind: AbilityKind
  marker: TurnMarker
  name: TurnAbilityName
}

export const NULL_TURN_ABILITY_NAME: TurnAbilityName = 'NULL'
export const NULL_TURN_ABILITY: TurnAbility = {
  kind: AbilityKind.NULL,
  marker: TurnMarker.DEFAULT,
  name: NULL_TURN_ABILITY_NAME,
}

// =============================================================================
// ABILITY GENERATION
// =============================================================================

export function createAbility(kind: AbilityKind | string, marker: TurnMarker): TurnAbility {
  if (kind === AbilityKind.NULL) {
    return NULL_TURN_ABILITY
  }

  const name = `${marker}_${kind}` as TurnAbilityName
  return { kind: kind as AbilityKind, marker, name }
}

// Generate all abilities record
const abilitiesRecord: Record<TurnAbilityName, TurnAbility> = {} as Record<TurnAbilityName, TurnAbility>
const abilityNamesRecord: Record<string, TurnAbilityName> = {}

for (const marker of markers) {
  for (const kind of abilityKinds) {
    const ability = createAbility(kind, marker)
    abilitiesRecord[ability.name] = ability
    abilityNamesRecord[`${marker}_${kind}`] = ability.name
  }
}

// =============================================================================
// EXPORTS - Programmatically generated
// =============================================================================

// Single object containing all ability names
export const Abilities = abilityNamesRecord as {
  [K in `${TurnMarker}_${Exclude<AbilityKind, AbilityKind.NULL>}`]: TurnAbilityName
}

// Individual exports for backwards compatibility (destructured from Abilities)
export const {
  DEFAULT_BASIC,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  DEFAULT_FUA,
  DEFAULT_DOT,
  DEFAULT_BREAK,
  DEFAULT_MEMO_SKILL,
  DEFAULT_MEMO_TALENT,
  DEFAULT_BASIC_HEAL,
  DEFAULT_SKILL_HEAL,
  DEFAULT_ULT_HEAL,
  DEFAULT_FUA_HEAL,
  DEFAULT_TALENT_HEAL,
  DEFAULT_BASIC_SHIELD,
  DEFAULT_SKILL_SHIELD,
  DEFAULT_ULT_SHIELD,
  DEFAULT_FUA_SHIELD,
  DEFAULT_TALENT_SHIELD,

  START_BASIC,
  START_SKILL,
  START_ULT,
  START_FUA,
  START_DOT,
  START_BREAK,
  START_MEMO_SKILL,
  START_MEMO_TALENT,
  START_BASIC_HEAL,
  START_SKILL_HEAL,
  START_ULT_HEAL,
  START_FUA_HEAL,
  START_TALENT_HEAL,
  START_BASIC_SHIELD,
  START_SKILL_SHIELD,
  START_ULT_SHIELD,
  START_FUA_SHIELD,
  START_TALENT_SHIELD,

  END_BASIC,
  END_SKILL,
  END_ULT,
  END_FUA,
  END_DOT,
  END_BREAK,
  END_MEMO_SKILL,
  END_MEMO_TALENT,
  END_BASIC_HEAL,
  END_SKILL_HEAL,
  END_ULT_HEAL,
  END_FUA_HEAL,
  END_TALENT_HEAL,
  END_BASIC_SHIELD,
  END_SKILL_SHIELD,
  END_ULT_SHIELD,
  END_FUA_SHIELD,
  END_TALENT_SHIELD,

  WHOLE_BASIC,
  WHOLE_SKILL,
  WHOLE_ULT,
  WHOLE_FUA,
  WHOLE_DOT,
  WHOLE_BREAK,
  WHOLE_MEMO_SKILL,
  WHOLE_MEMO_TALENT,
  WHOLE_BASIC_HEAL,
  WHOLE_SKILL_HEAL,
  WHOLE_ULT_HEAL,
  WHOLE_FUA_HEAL,
  WHOLE_TALENT_HEAL,
  WHOLE_BASIC_SHIELD,
  WHOLE_SKILL_SHIELD,
  WHOLE_ULT_SHIELD,
  WHOLE_FUA_SHIELD,
  WHOLE_TALENT_SHIELD,
} = Abilities

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const start = '['
const end = ']'

export function toVisual(ability: TurnAbility): string {
  if (!ability || ability == NULL_TURN_ABILITY) return ''

  switch (ability.marker) {
    case TurnMarker.START:
      return `${start} ${ability.kind}`
    case TurnMarker.END:
      return `${ability.kind} ${end}`
    case TurnMarker.WHOLE:
      return `${start} ${ability.kind} ${end}`
    default:
      return ability.kind
  }
}

export function abilityNameToVisual(name: TurnAbilityName): string {
  return toVisual(toTurnAbility(name))
}

export function toTurnAbility(name: TurnAbilityName): TurnAbility {
  if (!name || name === NULL_TURN_ABILITY_NAME || !abilitiesRecord[name]) return NULL_TURN_ABILITY
  return abilitiesRecord[name]
}

export function isStartTurnAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.START
}

export function isEndTurnAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.END
}

export function isWholeTurnAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.WHOLE
}

export function isDefaultAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.DEFAULT
}

export function isNullAbility(ability: TurnAbility): boolean {
  return !ability || !ability.kind || ability.kind == AbilityKind.NULL
}

export function getAbilityKind(turnAbilityName: TurnAbilityName): AbilityKind {
  if (!turnAbilityName || turnAbilityName == NULL_TURN_ABILITY_NAME) return AbilityKind.NULL
  return abilitiesRecord[turnAbilityName]?.kind ?? AbilityKind.NULL
}

export function getAbilityName(ability: TurnAbility): TurnAbilityName {
  if (!ability) return NULL_TURN_ABILITY_NAME
  return ability.name
}

export function stringifyAbilityArray(abilityArray: TurnAbilityName[]): string {
  return abilityArray.join(',')
}

export function compareAbilityNameArrays(array1: TurnAbilityName[], array2: TurnAbilityName[]): boolean {
  if (array1.length !== array2.length) return false
  return stringifyAbilityArray(array1) === stringifyAbilityArray(array2)
}

export const ALL_ABILITIES = abilityKinds

export const AbilityNameToTurnAbility: Record<TurnAbilityName, TurnAbility> = abilitiesRecord
