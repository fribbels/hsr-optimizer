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

// Define TurnAbilityName as a single template literal type
export type TurnAbilityName =
  | `${TurnMarker}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | 'NULL_NULL'

// Simple TurnAbility interface with a name field
export interface TurnAbility {
  kind: AbilityKind
  marker: TurnMarker
  name: TurnAbilityName
}

// Null ability placeholder
export const NULL_TURN_ABILITY: TurnAbility = {
  kind: AbilityKind.NULL,
  marker: TurnMarker.DEFAULT,
  name: 'NULL_NULL',
}

// Helper function to create an ability
export function createAbility(kind: AbilityKind, marker: TurnMarker): TurnAbility {
  if (kind === AbilityKind.NULL) {
    return NULL_TURN_ABILITY
  }

  const name = `${marker}_${kind}` as TurnAbilityName
  return { kind, marker, name }
}

// Helper functions for visualization
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

export function turnAbilityFromName(name: TurnAbilityName): TurnAbility {
  if (name === NULL_TURN_ABILITY.name) return NULL_TURN_ABILITY

  const [markerStr, kindStr] = name.split('_')
  return createAbility(kindStr as AbilityKind, markerStr as TurnMarker)
}

// Generate all ability combinations
const abilityKinds = Object.values(AbilityKind)
  .filter((kind) => kind !== AbilityKind.NULL) as readonly AbilityKind[]

const markers = Object.values(TurnMarker) as readonly TurnMarker[]

// Generate all abilities
const abilities: Record<TurnAbilityName, TurnAbility> = {} as Record<TurnAbilityName, TurnAbility>

// Map from ability name to corresponding ability object
for (const marker of markers) {
  for (const kind of abilityKinds) {
    const ability = createAbility(kind, marker)
    abilities[ability.name] = ability
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

export function getAbilityKind(ability: TurnAbility): AbilityKind {
  if (!ability) return AbilityKind.NULL
  return ability.kind
}

export function getAbilityName(ability: TurnAbility): TurnAbilityName {
  if (!ability) return 'NULL_NULL'
  return ability.name
}

// Utility functions for array handling with abilities
export function stringifyAbilityArray(abilityArray: TurnAbility[]): string {
  return abilityArray.map((ability) => ability.name).join(',')
}

export function compareAbilityArrays(array1: TurnAbility[], array2: TurnAbility[]): boolean {
  if (array1.length !== array2.length) return false
  return stringifyAbilityArray(array1) === stringifyAbilityArray(array2)
}
