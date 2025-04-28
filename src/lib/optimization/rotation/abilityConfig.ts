export enum AbilityKind {
  BASIC = 'BASIC',
  SKILL = 'SKILL',
  ULT = 'ULT',
  FUA = 'FUA',
  MEMO_SKILL = 'MEMO_SKILL',
  MEMO_TALENT = 'MEMO_TALENT',
}

// Turn marker enum
export enum TurnMarker {
  NONE = '',
  START = 'START',
  END = 'END',
  FULL = 'FULL',
}

// Composite ability object
export interface TurnAbility {
  kind: AbilityKind
  marker: TurnMarker

  toString(): string
}

// Factory function for creating ability tokens
export function createAbility(kind: AbilityKind, marker: TurnMarker = TurnMarker.NONE): TurnAbility {
  return {
    kind,
    marker,
    toString() {
      switch (this.marker) {
        case TurnMarker.START:
          return `(${this.kind}`
        case TurnMarker.END:
          return `${this.kind})`
        case TurnMarker.FULL:
          return `(${this.kind})`
        default:
          return this.kind
      }
    },
  }
}

// Export all ability constants
export const BASIC = createAbility(AbilityKind.BASIC)
export const SKILL = createAbility(AbilityKind.SKILL)
export const ULT = createAbility(AbilityKind.ULT)
export const FUA = createAbility(AbilityKind.FUA)
export const MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL)
export const MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT)

// Start turn abilities
export const START_TURN_BASIC = createAbility(AbilityKind.BASIC, TurnMarker.START)
export const START_TURN_SKILL = createAbility(AbilityKind.SKILL, TurnMarker.START)
export const START_TURN_ULT = createAbility(AbilityKind.ULT, TurnMarker.START)
export const START_TURN_FUA = createAbility(AbilityKind.FUA, TurnMarker.START)
export const START_TURN_MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL, TurnMarker.START)
export const START_TURN_MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT, TurnMarker.START)

// End turn abilities
export const END_TURN_BASIC = createAbility(AbilityKind.BASIC, TurnMarker.END)
export const END_TURN_SKILL = createAbility(AbilityKind.SKILL, TurnMarker.END)
export const END_TURN_ULT = createAbility(AbilityKind.ULT, TurnMarker.END)
export const END_TURN_FUA = createAbility(AbilityKind.FUA, TurnMarker.END)
export const END_TURN_MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL, TurnMarker.END)
export const END_TURN_MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT, TurnMarker.END)

// Full turn abilities
export const FULL_TURN_BASIC = createAbility(AbilityKind.BASIC, TurnMarker.FULL)
export const FULL_TURN_SKILL = createAbility(AbilityKind.SKILL, TurnMarker.FULL)
export const FULL_TURN_ULT = createAbility(AbilityKind.ULT, TurnMarker.FULL)
export const FULL_TURN_FUA = createAbility(AbilityKind.FUA, TurnMarker.FULL)
export const FULL_TURN_MEMO_SKILL = createAbility(AbilityKind.MEMO_SKILL, TurnMarker.FULL)
export const FULL_TURN_MEMO_TALENT = createAbility(AbilityKind.MEMO_TALENT, TurnMarker.FULL)

// Type guards
export function isStartTurnAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.START
}

export function isEndTurnAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.END
}

export function isFullTurnAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.FULL
}

export function isRegularAbility(ability: TurnAbility): boolean {
  return ability.marker === TurnMarker.NONE
}

export function getBaseAbility(ability: TurnAbility): AbilityKind {
  return ability.kind
}

// Helper for array-based iteration
export const ALL_ABILITIES = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.MEMO_SKILL,
  AbilityKind.MEMO_TALENT,
] as const
