export enum ColumnWidth {
  SNUG = 'snug',
  ROOMY = 'roomy',
  WIDE = 'wide',
  WIDEST = 'wideTight',
}

interface ColumnFootprint {
  width: number
  gap: number
}

interface ColumnWidthOption {
  value: ColumnWidth
  label: string
}

const MAT_GAP = 14

export const COLUMN_WIDTH_SPECS: Record<ColumnWidth, ColumnFootprint> = {
  [ColumnWidth.SNUG]: { width: 196, gap: MAT_GAP },
  [ColumnWidth.ROOMY]: { width: 212, gap: MAT_GAP },
  [ColumnWidth.WIDE]: { width: 225, gap: MAT_GAP },
  [ColumnWidth.WIDEST]: { width: 235, gap: MAT_GAP },
}

export const COLUMN_WIDTH_OPTIONS: ColumnWidthOption[] = [
  { value: ColumnWidth.SNUG, label: '196 (baseline)' },
  { value: ColumnWidth.ROOMY, label: '212' },
  { value: ColumnWidth.WIDE, label: '225' },
  { value: ColumnWidth.WIDEST, label: '235' },
]
