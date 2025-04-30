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

export type TurnAbility = string

export interface TurnAbilityConfig {
  kind: AbilityKind
  marker: TurnMarker

  toVisual(): string

  toString(): string
}

function createAbilityConfig(kind: AbilityKind, marker: TurnMarker = TurnMarker.DEFAULT): TurnAbilityConfig {
  return {
    kind,
    marker,
    toVisual() {
      switch (this.marker) {
        case TurnMarker.START:
          return `(${this.kind}`
        case TurnMarker.END:
          return `${this.kind})`
        case TurnMarker.WHOLE:
          return `(${this.kind})`
        default:
          return this.kind
      }
    },
    toString() {
      return `${this.marker}_${this.kind}`
    },
  }
}

export const NULL_TURN_ABILITY = 'NULL_NULL' as TurnAbility

const abilityKinds = Object.values(AbilityKind)
  .filter((kind) => kind !== AbilityKind.NULL) as readonly AbilityKind[]

const markers = Object.values(TurnMarker) as readonly TurnMarker[]

const abilities: Record<string, TurnAbility> = {}
const abilityConfigs: Record<string, TurnAbilityConfig> = {}

for (const marker of markers) {
  for (const kind of abilityKinds) {
    const config = createAbilityConfig(kind, marker)
    const abilityName = config.toString()
    abilities[abilityName] = abilityName
    abilityConfigs[abilityName] = config
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

export const AbilityNameToConfig: Record<string, TurnAbilityConfig> = abilityConfigs

export function isStartTurnAbility(ability: TurnAbility): boolean {
  return ability.startsWith(`${TurnMarker.START}_`)
}

export function isEndTurnAbility(ability: TurnAbility): boolean {
  return ability.startsWith(`${TurnMarker.END}_`)
}

export function isWholeTurnAbility(ability: TurnAbility): boolean {
  return ability.startsWith(`${TurnMarker.WHOLE}_`)
}

export function isDefaultAbility(ability: TurnAbility): boolean {
  return ability.startsWith(`${TurnMarker.DEFAULT}_`)
}

export function getAbilityKind(ability: TurnAbility): AbilityKind {
  if (!ability) return AbilityKind.NULL
  const config = AbilityNameToConfig[ability]
  return config ? config.kind : AbilityKind.NULL
}

export function getVisualTurn(ability: TurnAbility): string {
  const config = AbilityNameToConfig[ability]
  return config ? config.toVisual() : ability
}

export const ALL_ABILITIES = abilityKinds

export function createAbility(kind: AbilityKind, marker: TurnMarker = TurnMarker.DEFAULT): TurnAbility {
  if (kind === AbilityKind.NULL) {
    return NULL_TURN_ABILITY
  }

  return `${marker}_${kind}`
}
