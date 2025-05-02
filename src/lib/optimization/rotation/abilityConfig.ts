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

export type TurnAbilityName =
  | `${TurnMarker}_${Exclude<AbilityKind, AbilityKind.NULL>}`
  | 'NULL_NULL'

export interface TurnAbility {
  kind: AbilityKind
  marker: TurnMarker
  name: TurnAbilityName
}

export const NULL_TURN_ABILITY: TurnAbility = {
  kind: AbilityKind.NULL,
  marker: TurnMarker.DEFAULT,
  name: 'NULL_NULL',
}

export function createAbility(kind: AbilityKind, marker: TurnMarker): TurnAbility {
  if (kind === AbilityKind.NULL) {
    return NULL_TURN_ABILITY
  }

  const name = `${marker}_${kind}` as TurnAbilityName
  return { kind, marker, name }
}

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

export function toTurnAbility(name: TurnAbilityName): TurnAbility {
  if (!name || name === NULL_TURN_ABILITY.name || !abilities[name]) return NULL_TURN_ABILITY
  return abilities[name]
}

const abilityKinds = Object.values(AbilityKind)
  .filter((kind) => kind !== AbilityKind.NULL) as readonly AbilityKind[]

const markers = Object.values(TurnMarker) as readonly TurnMarker[]

const abilities: Record<TurnAbilityName, TurnAbility> = {} as Record<TurnAbilityName, TurnAbility>

for (const marker of markers) {
  for (const kind of abilityKinds) {
    const ability = createAbility(kind, marker)
    abilities[ability.name] = ability
  }
}

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
  if (!turnAbilityName || turnAbilityName == NULL_TURN_ABILITY.name) return AbilityKind.NULL
  return abilities[turnAbilityName].kind
}

export function getAbilityName(ability: TurnAbility): TurnAbilityName {
  if (!ability) return 'NULL_NULL'
  return ability.name
}

export function stringifyAbilityArray(abilityArray: TurnAbility[]): string {
  return abilityArray.map((ability) => ability.name).join(',')
}

export function compareAbilityArrays(array1: TurnAbility[], array2: TurnAbility[]): boolean {
  if (array1.length !== array2.length) return false
  return stringifyAbilityArray(array1) === stringifyAbilityArray(array2)
}

export const ALL_ABILITIES = abilityKinds

export const AbilityNameToTurnAbility: Record<TurnAbilityName, TurnAbility> = abilities
