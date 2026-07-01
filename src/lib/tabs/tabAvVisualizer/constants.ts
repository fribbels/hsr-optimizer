import type { ElementName } from 'lib/constants/constants'

// Fallback for slots/companions whose element can't be resolved (e.g. metadata not loaded yet) — distinct
// per slot so multiple unresolved characters are still visually distinguishable.
export const SLOT_COLORS = ['#4dabf7', '#ff922b', '#69db7c', '#cc5de8'] as const

export const ELEMENT_COLORS: Record<ElementName, string> = {
  Fire: '#f52229',
  Ice: '#2894d4',
  Quantum: '#6058c3',
  Wind: '#62cd96',
  Lightning: '#cd6ee7',
  Physical: '#ceced0',
  Imaginary: '#f2e634',
}

export const ROW_SIZE = 100

export const TIMELINE_ROW_HEIGHT = 260
export const TIMELINE_RULER_Y = 130    // Pixel distance from the top of the row to the ruler line (room for two avatar layers above and below)
export const TIMELINE_AVATAR_SIZE = 50
// Vertical gap between stacked avatar layers (ActionMarker's close/far positions, and any further
// extraOffset levels companions attach beyond their owner) — shared so TimelineRow's row-height padding
// math stays in sync with ActionMarker's own position calculations.
export const TIMELINE_AVATAR_STACK_GAP = 8
