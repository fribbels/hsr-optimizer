import {
  ColDef,
  GetRowIdParams,
  GridOptions,
} from 'ag-grid-community'
import { TFunction } from 'i18next'
import {
  OptimizerDisplayData,
  OptimizerDisplayDataStatSim,
} from 'lib/optimization/bufferPacker'
import {
  getGridColumn,
  SortOption,
} from 'lib/optimization/sortOptions'
import { Gradient } from 'lib/rendering/gradient'
import { Renderer } from 'lib/rendering/renderer'
import { Utils } from 'lib/utils/utils'

export const DIGITS_3 = 46
export const DIGITS_4 = 50
export const DIGITS_5 = 56
export const DIGITS_6 = 62
export const DIGITS_7 = 68

export const optimizerTabDefaultGap = 5
export const panelWidth = 211
export const defaultPadding = 11

export const optimizerGridOptions: GridOptions<OptimizerDisplayDataStatSim> = {
  rowHeight: 33,
  pagination: true,
  rowModelType: 'infinite',
  datasource: undefined,
  paginationPageSize: 500,
  paginationPageSizeSelector: [100, 500, 1000],
  cacheBlockSize: 500,
  maxBlocksInCache: 1,
  alwaysShowVerticalScroll: false,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  getRowId: (params: GetRowIdParams<OptimizerDisplayDataStatSim>) => String(params.data.id || Utils.randomId()),
}

export const optimizerGridDefaultColDef: ColDef<OptimizerDisplayDataStatSim> = {
  cellStyle: Gradient.getOptimizerColumnGradient,
  sortable: true,
  sortingOrder: ['desc', 'asc'],
  wrapHeaderText: true,
  autoHeaderHeight: true,
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
    { field: 'relicSetIndex' as const, cellRenderer: Renderer.relicSet, width: 72, headerName: header('Set') },
    { field: 'ornamentSetIndex' as const, cellRenderer: Renderer.ornamentSet, width: 42, headerName: header('Set') },

    ...statColumns.map((col) => ({
      field: getGridColumn(col.option, statDisplay, memoDisplay) as keyof OptimizerDisplayData,
      valueFormatter: col.renderer,
      minWidth: col.minWidth,
      flex: 10,
      headerName: headerMemo(col.headerKey),
    })),

    { field: dmgFields[mode] as keyof OptimizerDisplayData, valueFormatter: Renderer.x100Tenths, minWidth: DIGITS_4, flex: 10, headerName: headerMemo('DMG') },
    {
      field: getGridColumn(SortOption.EHP, statDisplay, memoDisplay) as keyof OptimizerDisplayData,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: header('EHP'),
    },
    // Dynamic ability columns (BASIC, SKILL, ULT, etc.) are injected in OptizerGrid.tsx
    { field: getGridColumn(SortOption.COMBO, statDisplay, memoDisplay) as keyof OptimizerDisplayData, valueFormatter: Renderer.floor, minWidth: DIGITS_6, flex: 13, headerName: header('COMBO') },
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
