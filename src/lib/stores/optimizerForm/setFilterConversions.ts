import { RelicSetFilterOptions } from 'lib/constants/constants'
import { STAT_TAG_TO_SETS } from 'lib/sets/setConfigRegistry'
import type { SetsRelics } from 'lib/sets/setConfigRegistry'
import type { OrnamentSetFilters, RelicSetFilters } from 'types/form'
import type { ModalState, SetFilters, TwoPieceSlot } from 'lib/stores/optimizerForm/setFilterTypes'
import { TwoPieceSlotType } from 'lib/stores/optimizerForm/setFilterTypes'

export const DEFAULT_SET_FILTERS: SetFilters = {
  fourPiece: [],
  twoPieceCombos: [],
  ornaments: [],
}

// ── Expand SetFilters → pipeline types (called in displayToInternal) ──

function resolveSlot(slot: TwoPieceSlot): SetsRelics[] {
  switch (slot.type) {
    case TwoPieceSlotType.Set: return [slot.value]
    case TwoPieceSlotType.Stat: return STAT_TAG_TO_SETS[slot.value] ?? []
    case TwoPieceSlotType.Any: return []
  }
}

export function expandSetFilters(display: SetFilters): {
  relicSets: RelicSetFilters
  ornamentSets: OrnamentSetFilters
} {
  const relicSets: RelicSetFilters = []

  for (const set of display.fourPiece) {
    relicSets.push([RelicSetFilterOptions.relic4Piece, set])
  }

  for (const combo of display.twoPieceCombos) {
    const aSets = resolveSlot(combo.a)
    const bSets = resolveSlot(combo.b)

    if (combo.b.type === TwoPieceSlotType.Any) {
      for (const set of aSets) {
        relicSets.push([RelicSetFilterOptions.relic2PlusAny, set])
      }
    } else {
      for (const a of aSets) {
        for (const b of bSets) {
          if (a === b) continue
          relicSets.push([RelicSetFilterOptions.relic2Plus2Piece, a, b])
        }
      }
    }
  }

  return { relicSets, ornamentSets: [...display.ornaments] }
}

// ── Parse SetFilters → ModalState (modal open) ──

export function parseDisplayToModalState(display: SetFilters): ModalState {
  return {
    checked4p: new Set(display.fourPiece),
    combos: [...display.twoPieceCombos],
    checkedOrnaments: new Set(display.ornaments),
  }
}

// ── Build SetFilters from ModalState (Apply) ──

export function buildDisplayFromModalState(state: ModalState): SetFilters {
  return {
    fourPiece: [...state.checked4p],
    twoPieceCombos: [...state.combos],
    ornaments: [...state.checkedOrnaments],
  }
}
