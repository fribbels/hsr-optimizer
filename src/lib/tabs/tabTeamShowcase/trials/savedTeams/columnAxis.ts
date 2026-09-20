import type { TrialOption } from 'lib/tabs/tabTeamShowcase/layouts/trialStyles'

/**
 * The saved-teams column's footprint: how wide it is and how far it sits from the grid.
 *
 * Only type and constant imports here. The trial store reads these while it initialises, so a cycle
 * back through a component would leave them in their temporal dead zone.
 */

// ---------------------------------------------------------------------------
// Footprint: column width and the gap to the grid
// ---------------------------------------------------------------------------

/**
 * The Characters tab is 1593px wide and the matted grid is a fixed 1344px, so the column and the gap
 * between it and the grid have 249px to share. Every spec below spends exactly that or less.
 */
export const COLUMN_BUDGET = 249

export enum ColumnWidth {
  SNUG = 'snug',
  ROOMY = 'roomy',
  WIDE = 'wide',
  WIDE_TIGHT = 'wideTight',
}

export interface ColumnFootprint {
  width: number
  /** Gap between the column and the grid's mat */
  gap: number
}

export const COLUMN_WIDTH_SPECS: Record<ColumnWidth, ColumnFootprint> = {
  [ColumnWidth.SNUG]: { width: 196, gap: 24 },
  [ColumnWidth.ROOMY]: { width: 212, gap: 24 },
  [ColumnWidth.WIDE]: { width: 225, gap: 24 },
  [ColumnWidth.WIDE_TIGHT]: { width: 235, gap: 14 },
}

export const COLUMN_WIDTH_OPTIONS: TrialOption<ColumnWidth>[] = [
  { value: ColumnWidth.SNUG, label: '196 (baseline)' },
  { value: ColumnWidth.ROOMY, label: '212' },
  { value: ColumnWidth.WIDE, label: '225' },
  { value: ColumnWidth.WIDE_TIGHT, label: '235, tight gap' },
]
