import type {
  ColDef,
  GetRowIdParams,
  GridOptions,
} from 'ag-grid-community'
import type { TFunction } from 'i18next'
import type {
  OptimizerDisplayData,
  OptimizerDisplayDataStatSim,
} from 'lib/optimization/bufferPacker'
import {
  getGridColumn,
  SortOption,
} from 'lib/optimization/sortOptions'
import { Gradient } from 'lib/rendering/gradient'
import {
  OrnamentSetCellRenderer,
  RelicSetCellRenderer,
} from 'lib/rendering/gridRenderers'
import { Renderer } from 'lib/rendering/renderer'
import { uuid } from 'lib/utils/miscUtils'

const DIGITS_3 = 46
const DIGITS_4 = 50
export const DIGITS_5 = 56
const DIGITS_6 = 62

export const optimizerTabDefaultGap = 5
export const panelWidth = 226

export const optimizerGridOptions: GridOptions<OptimizerDisplayDataStatSim> = {
  rowHeight: 33,
  rowBuffer: 20,
  pagination: true,
  rowModelType: 'infinite',
  paginationPageSize: 500,
  paginationPageSizeSelector: [100, 500, 1000],
  cacheBlockSize: 500,
  maxBlocksInCache: 2,
  alwaysShowVerticalScroll: false,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  suppressNoRowsOverlay: true,
  getRowId: (params: GetRowIdParams<OptimizerDisplayDataStatSim>) => String(params.data.id ?? uuid()),
}

export const optimizerRowSelection = { mode: 'singleRow' as const, checkboxes: false, enableClickSelection: false }

export const optimizerGridDefaultColDef: ColDef<OptimizerDisplayDataStatSim> = {
  sortable: true,
  sortingOrder: ['desc', 'asc'],
  wrapHeaderText: true,
}

const MEMO_MARKER = '\u1D39' // ᴹ

const statColumns = [
  { option: SortOption.ATK, headerKey: 'ATK', renderer: Renderer.floor, minWidth: DIGITS_4 },
  { option: SortOption.DEF, headerKey: 'DEF', renderer: Renderer.floor, minWidth: DIGITS_4 },
  { option: SortOption.HP, headerKey: 'HP', renderer: Renderer.floor, minWidth: DIGITS_4 },
  { option: SortOption.SPD, headerKey: 'SPD', renderer: Renderer.tenths, minWidth: DIGITS_4 },
  { option: SortOption.CR, headerKey: 'CR', renderer: Renderer.x100Tenths, minWidth: DIGITS_4 },
  { option: SortOption.CD, headerKey: 'CD', renderer: Renderer.x100Tenths, minWidth: DIGITS_4 },
  { option: SortOption.EHR, headerKey: 'EHR', renderer: Renderer.x100Tenths, minWidth: DIGITS_4 },
  { option: SortOption.RES, headerKey: 'RES', renderer: Renderer.x100Tenths, minWidth: DIGITS_3 },
  { option: SortOption.BE, headerKey: 'BE', renderer: Renderer.x100Tenths, minWidth: DIGITS_4 },
  { option: SortOption.OHB, headerKey: 'OHB', renderer: Renderer.x100Tenths, minWidth: DIGITS_3 },
  { option: SortOption.ERR, headerKey: 'ERR', renderer: Renderer.x100Tenths, minWidth: DIGITS_3 },
]

type DisplayMode = 'basic' | 'combat' | 'memoBasic' | 'memoCombat'

const dmgFields: Record<DisplayMode, string> = {
  basic: 'ELEMENTAL_DMG',
  combat: 'xELEMENTAL_DMG',
  memoBasic: 'mELEMENTAL_DMG',
  memoCombat: 'mxELEMENTAL_DMG',
}

function buildColumnDefs(mode: DisplayMode, t: TFunction<'optimizerTab', 'Grid'>) {
  const isCombat = mode === 'combat' || mode === 'memoCombat'
  const isMemo = mode === 'memoBasic' || mode === 'memoCombat'
  const headerGroup = isCombat ? 'Headers.Combat' : 'Headers.Basic'
  const suffix = isMemo ? MEMO_MARKER : ''
  const statDisplay = isCombat ? 'combat' : ''
  const memoDisplay = isMemo ? 'memo' : ''

  const header = (key: string) => t(`${headerGroup}.${key}` as any) as string
  const headerMemo = (key: string) => (t(`${headerGroup}.${key}` as any) as string) + suffix

  return [
    { field: 'relicSetIndex' as const, cellRenderer: RelicSetCellRenderer, width: 72, headerName: header('Set') },
    { field: 'ornamentSetIndex' as const, cellRenderer: OrnamentSetCellRenderer, width: 42, headerName: header('Set') },

    ...statColumns.map((col) => ({
      field: getGridColumn(col.option, statDisplay, memoDisplay) as keyof OptimizerDisplayData,
      valueFormatter: col.renderer,
      cellStyle: Gradient.getOptimizerColumnGradient,
      minWidth: col.minWidth,
      flex: 10,
      headerName: headerMemo(col.headerKey),
    })),

    {
      field: dmgFields[mode] as keyof OptimizerDisplayData,
      valueFormatter: Renderer.x100Tenths,
      cellStyle: Gradient.getOptimizerColumnGradient,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: headerMemo('DMG'),
    },
    {
      field: getGridColumn(SortOption.EHP, statDisplay, memoDisplay) as keyof OptimizerDisplayData,
      valueFormatter: Renderer.floor,
      cellStyle: Gradient.getOptimizerColumnGradient,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: header('EHP'),
    },
    // Dynamic ability columns (BASIC, SKILL, ULT, etc.) are injected in OptimizerGrid.tsx
    {
      field: getGridColumn(SortOption.COMBO, statDisplay, memoDisplay) as keyof OptimizerDisplayData,
      valueFormatter: Renderer.floor,
      cellStyle: Gradient.getOptimizerColumnGradient,
      minWidth: DIGITS_6,
      flex: 13,
      headerName: header('COMBO'),
    },
  ]
}

export function getBasicColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return buildColumnDefs('basic', t)
}

export function getMemoBasicColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return buildColumnDefs('memoBasic', t)
}

export function getCombatColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return buildColumnDefs('combat', t)
}

export function getMemoCombatColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return buildColumnDefs('memoCombat', t)
}

// this stops ts from whining when we filter the columns later on
export type OptimizerGridColumnDef = Array<
  | ReturnType<typeof getMemoBasicColumnDefs>[number]
  | ReturnType<typeof getMemoCombatColumnDefs>[number]
  | ReturnType<typeof getBasicColumnDefs>[number]
  | ReturnType<typeof getCombatColumnDefs>[number]
>
