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

export const ComboOptionsLabelMapping: Record<AbilityKind, AbilityLabel> = {
  [AbilityKind.NULL]: 'None',
  [AbilityKind.BASIC]: 'Basic',
  [AbilityKind.SKILL]: 'Skill',
  [AbilityKind.ULT]: 'Ult',
  [AbilityKind.FUA]: 'Fua',
  [AbilityKind.DOT]: 'Dot',
  [AbilityKind.BREAK]: 'Break',
  [AbilityKind.MEMO_SKILL]: 'MemoSkill',
  [AbilityKind.MEMO_TALENT]: 'MemoTalent',
  [AbilityKind.BASIC_HEAL]: 'BASIC_HEAL',
  [AbilityKind.SKILL_HEAL]: 'SKILL_HEAL',
  [AbilityKind.ULT_HEAL]: 'ULT_HEAL',
  [AbilityKind.FUA_HEAL]: 'FUA_HEAL',
  [AbilityKind.TALENT_HEAL]: 'TALENT_HEAL',
  [AbilityKind.BASIC_SHIELD]: 'BASIC_SHIELD',
  [AbilityKind.SKILL_SHIELD]: 'SKILL_SHIELD',
  [AbilityKind.ULT_SHIELD]: 'ULT_SHIELD',
  [AbilityKind.FUA_SHIELD]: 'FUA_SHIELD',
  [AbilityKind.TALENT_SHIELD]: 'TALENT_SHIELD',
}

type AbilityLabel =
  | 'None'
  | 'Basic'
  | 'Skill'
  | 'Ult'
  | 'Fua'
  | 'Dot'
  | 'Break'
  | 'MemoSkill'
  | 'MemoTalent'
  | 'BASIC_HEAL'
  | 'SKILL_HEAL'
  | 'ULT_HEAL'
  | 'FUA_HEAL'
  | 'TALENT_HEAL'
  | 'BASIC_SHIELD'
  | 'SKILL_SHIELD'
  | 'ULT_SHIELD'
  | 'FUA_SHIELD'
  | 'TALENT_SHIELD'

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

export function abilityNameToVisual(name: TurnAbilityName): string {
  return toVisual(toTurnAbility(name))
}

export function toTurnAbility(name: TurnAbilityName): TurnAbility {
  if (!name || name === NULL_TURN_ABILITY_NAME || !abilities[name]) return NULL_TURN_ABILITY
  return abilities[name]
}

const abilityKinds = Object.values(AbilityKind)
  .filter((kind) => kind !== AbilityKind.NULL) as readonly AbilityKind[]

const markers = Object.values(TurnMarker) as readonly TurnMarker[]

const abilities: Record<TurnAbilityName, TurnAbility> = {} as Record<TurnAbilityName, TurnAbility>
const abilityNames: Record<TurnAbilityName, TurnAbilityName> = {} as Record<TurnAbilityName, TurnAbilityName>

for (const marker of markers) {
  for (const kind of abilityKinds) {
    const ability = createAbility(kind, marker)
    abilities[ability.name] = ability
    abilityNames[ability.name] = ability.name
  }
}

export const {
  // Default abilities
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

  // Start turn abilities
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

  // End turn abilities
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

  // Whole turn abilities
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
} = abilityNames

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
  return abilities[turnAbilityName]?.kind ?? AbilityKind.NULL
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

export const AbilityNameToTurnAbility: Record<TurnAbilityName, TurnAbility> = abilities
