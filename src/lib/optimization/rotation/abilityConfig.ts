export enum AbilityKind {
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

// Composite ability object
export interface TurnAbility {
  kind: AbilityKind
  marker: TurnMarker

  toVisual(): string

  toString(): string
}

export function createAbility(kind: AbilityKind, marker: TurnMarker = TurnMarker.DEFAULT): TurnAbility {
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

// Normal abilities
export const BASIC = createAbility(AbilityKind.BASIC)
export const SKILL = createAbility(AbilityKind.SKILL)
export const ULT = createAbility(AbilityKind.ULT)
export const FUA = createAbility(AbilityKind.FUA)
export const MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL)
export const MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT)

// Start turn abilities
export const START_BASIC = createAbility(AbilityKind.BASIC, TurnMarker.START)
export const START_SKILL = createAbility(AbilityKind.SKILL, TurnMarker.START)
export const START_ULT = createAbility(AbilityKind.ULT, TurnMarker.START)
export const START_FUA = createAbility(AbilityKind.FUA, TurnMarker.START)
export const START_MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL, TurnMarker.START)
export const START_MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT, TurnMarker.START)

// End turn abilities
export const END_BASIC = createAbility(AbilityKind.BASIC, TurnMarker.END)
export const END_SKILL = createAbility(AbilityKind.SKILL, TurnMarker.END)
export const END_ULT = createAbility(AbilityKind.ULT, TurnMarker.END)
export const END_FUA = createAbility(AbilityKind.FUA, TurnMarker.END)
export const END_MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL, TurnMarker.END)
export const END_MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT, TurnMarker.END)

// Whole turn abilities
export const WHOLE_BASIC = createAbility(AbilityKind.BASIC, TurnMarker.WHOLE)
export const WHOLE_SKILL = createAbility(AbilityKind.SKILL, TurnMarker.WHOLE)
export const WHOLE_ULT = createAbility(AbilityKind.ULT, TurnMarker.WHOLE)
export const WHOLE_FUA = createAbility(AbilityKind.FUA, TurnMarker.WHOLE)
export const WHOLE_MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL, TurnMarker.WHOLE)
export const WHOLE_MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT, TurnMarker.WHOLE)

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
  return ability.kind
}

export const ALL_ABILITIES = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.MEMO_SKILL,
  AbilityKind.MEMO_TALENT,
] as const
