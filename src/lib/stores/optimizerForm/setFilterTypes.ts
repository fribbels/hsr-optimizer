import type { TwoPieceStatTag } from 'lib/constants/constants'
import type { SetsOrnaments, SetsRelics } from 'lib/sets/setConfigRegistry'

// ── Relic set mode (4-piece vs 2-piece toggle) ──

export const RelicSetMode = {
  FourPiece: '4p',
  TwoPiece: '2p',
} as const
export type RelicSetMode = (typeof RelicSetMode)[keyof typeof RelicSetMode]

// ── Slot type discriminant ──

export const TwoPieceSlotType = {
  Set: 'Set',
  Stat: 'Stat',
  Any: 'Any',
} as const
export type TwoPieceSlotType = (typeof TwoPieceSlotType)[keyof typeof TwoPieceSlotType]

// ── Valid 2pc stat tags — subset of Constants.Stats values ──
export { TwoPieceStatTags, type TwoPieceStatTag } from 'lib/constants/constants'

// ── Combo slot types ──

export type TwoPieceSlotSet = { type: 'Set'; value: SetsRelics }
export type TwoPieceSlotStat = { type: 'Stat'; value: TwoPieceStatTag }
export type TwoPieceSlotAny = { type: 'Any' }

export type TwoPieceSlot = TwoPieceSlotSet | TwoPieceSlotStat | TwoPieceSlotAny
export type TwoPieceSlotNonAny = TwoPieceSlotSet | TwoPieceSlotStat

// ── A complete 2-piece combo (slot A is never 'Any') ──

export type TwoPieceCombo = {
  a: TwoPieceSlotNonAny
  b: TwoPieceSlot
}

// ── The persisted model (single source of truth in store) ──

export type SetFilters = {
  fourPiece: SetsRelics[]
  twoPieceCombos: TwoPieceCombo[]
  ornaments: SetsOrnaments[]
}

// ── Ephemeral modal state (local useState, not persisted) ──

export type ModalState = {
  checked4p: Set<SetsRelics>
  combos: TwoPieceCombo[]
  checkedOrnaments: Set<SetsOrnaments>
}
