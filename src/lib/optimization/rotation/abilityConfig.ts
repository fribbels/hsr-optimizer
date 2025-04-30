export enum AbilityKind {
  NULL = 'NULL',
  BASIC = 'BASIC',
  SKILL = 'SKILL',
  ULT = 'ULT',
  FUA = 'FUA',
  MEMO_SKILL = 'MEMO_SKILL',
  MEMO_TALENT = 'MEMO_TALENT',
}

export enum TurnMarker {
  DEFAULT = 'DEFAULT',
  START = 'START',
  END = 'END',
  WHOLE = 'WHOLE',
}

// Define TurnAbilityName as a string literal type
export type TurnAbilityName =
  | `${TurnMarker.DEFAULT}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | `${TurnMarker.START}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | `${TurnMarker.END}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | `${TurnMarker.WHOLE}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | 'NULL_NULL'

// Simple TurnAbility interface - just data, no methods
export interface TurnAbility {
  kind: AbilityKind
  marker: TurnMarker
}

// Null ability placeholder
export const NULL_TURN_ABILITY: TurnAbility = {
  kind: AbilityKind.NULL,
  marker: TurnMarker.DEFAULT,
}

// Helper function to create an ability
export function createAbility(kind: AbilityKind, marker: TurnMarker = TurnMarker.DEFAULT): TurnAbility {
  return { kind, marker }
}

// Helper functions for visualization and conversion
export function toVisual(ability: TurnAbility): string {
  if (!ability) return ''

  switch (ability.marker) {
    case TurnMarker.START:
      return `(${ability.kind}`
    case TurnMarker.END:
      return `${ability.kind})`
    case TurnMarker.WHOLE:
      return `(${ability.kind})`
    default:
      return ability.kind
  }
}

export function toString(ability: TurnAbility): TurnAbilityName {
  if (!ability) return 'NULL_NULL' as TurnAbilityName
  return `${ability.marker}_${ability.kind}` as TurnAbilityName
}

export function fromString(name: TurnAbilityName): TurnAbility {
  if (name === 'NULL_NULL') return NULL_TURN_ABILITY

  const [markerStr, kindStr] = name.split('_')
  return createAbility(kindStr as AbilityKind, markerStr as TurnMarker)
}

// Generate all ability combinations
const abilityKinds = Object.values(AbilityKind)
  .filter((kind) => kind !== AbilityKind.NULL) as readonly AbilityKind[]

const markers = Object.values(TurnMarker) as readonly TurnMarker[]

// Generate all abilities
const abilities: Record<string, TurnAbility> = {}
const abilityNames: Record<string, TurnAbilityName> = {}

// Map from ability name to corresponding ability object
for (const marker of markers) {
  for (const kind of abilityKinds) {
    const ability = createAbility(kind, marker)
    const name = toString(ability)
    abilities[name] = ability
    abilityNames[name] = name
  }
}

// Export all individual abilities
export const {
  // Default abilities
  DEFAULT_BASIC,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  DEFAULT_FUA,
  DEFAULT_MEMO_SKILL,
  DEFAULT_MEMO_TALENT,

  // Start turn abilities
  START_BASIC,
  START_SKILL,
  START_ULT,
  START_FUA,
  START_MEMO_SKILL,
  START_MEMO_TALENT,

  // End turn abilities
  END_BASIC,
  END_SKILL,
  END_ULT,
  END_FUA,
  END_MEMO_SKILL,
  END_MEMO_TALENT,

  // Whole turn abilities
  WHOLE_BASIC,
  WHOLE_SKILL,
  WHOLE_ULT,
  WHOLE_FUA,
  WHOLE_MEMO_SKILL,
  WHOLE_MEMO_TALENT,
} = abilities

// Export all ability names
export const ABILITY_NAMES = abilityNames

// Helper functions
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

export function getBaseAbility(ability: TurnAbility): AbilityKind {
  if (!ability) return AbilityKind.NULL
  return ability.kind
}

export function getBaseAbilityFromString(abilityString: TurnAbilityName): AbilityKind {
  if (!abilityString) return AbilityKind.NULL
  const ability = abilities[abilityString]
  return ability ? ability.kind : AbilityKind.NULL
}

export function stringifyAbilityArray(abilityArray: TurnAbility[]): string {
  return abilityArray.map((ability) => toString(ability)).join(',')
}

export function compareAbilityArrays(array1: TurnAbility[], array2: TurnAbility[]): boolean {
  if (array1.length !== array2.length) return false
  return stringifyAbilityArray(array1) === stringifyAbilityArray(array2)
}

// Export all ability kinds
export const ALL_ABILITIES = abilityKinds

// Export the mapping for lookups
export const AbilityNameToTurnAbility: Record<TurnAbilityName, TurnAbility> = abilities as Record<TurnAbilityName, TurnAbility>
