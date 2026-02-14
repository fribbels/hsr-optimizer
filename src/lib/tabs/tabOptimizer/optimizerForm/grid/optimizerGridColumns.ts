import {
  ColDef,
  GetRowIdParams,
  GridOptions,
} from 'ag-grid-community'
import { TFunction } from 'i18next'
import { Constants } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
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

const memo = 'ᴹ'

function comboColumnDef(headerName: string) {
  return {
    field: 'COMBO' as const,
    valueFormatter: Renderer.floor,
    minWidth: DIGITS_6, // DIGITS_7
    flex: 13, // 14
    headerName: headerName,
  }
}

export function getBasicColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return [
    {
      field: 'relicSetIndex' as const,
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Headers.Basic.Set'), /* 'Set' */
    },
    {
      field: 'ornamentSetIndex' as const,
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Headers.Basic.Set'), /* 'Set' */
    },

    {
      field: Constants.Stats.ATK,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.ATK'), // 'ATK',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.DEF,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.DEF'), // 'DEF',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.HP,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.HP'), // 'HP',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.SPD,
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.SPD'), // 'SPD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.CR,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.CR'), // 'CR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.CD,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.CD'), // 'CD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.EHR,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.EHR'), // 'EHR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.RES,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Basic.RES'), // 'RES',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.BE,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.BE'), // 'BE',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.OHB,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Basic.OHB'), // 'OHB',
    },
    {
      field: Constants.Stats.ERR,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Basic.ERR'), // 'ERR',
    },

    {
      field: 'ED' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.DMG'), // 'DMG',
    },
    {
      field: 'EHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.EHP'), // 'EHP',
    },
    // Dynamic ability columns (BASIC, SKILL, ULT, etc.) are injected in OptimizerGrid.tsx
    comboColumnDef(t('Headers.Basic.COMBO')),
  ]
}

export function getMemoBasicColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return [
    {
      field: 'relicSetIndex' as const,
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Headers.Basic.Set'), /* 'Set' */
    },
    {
      field: 'ornamentSetIndex' as const,
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Headers.Basic.Set'), /* 'Set' */
    },

    {
      field: 'mATK' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.ATK') + memo, // 'ATK',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mDEF' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.DEF') + memo, // 'DEF',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.HP') + memo, // 'HP',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mSPD' as const,
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.SPD') + memo, // 'SPD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mCR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.CR') + memo, // 'CR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mCD' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.CD') + memo, // 'CD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mEHR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.EHR') + memo, // 'EHR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mRES' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Basic.RES') + memo, // 'RES',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mBE' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.BE') + memo, // 'BE',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mOHB' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Basic.OHB') + memo, // 'OHB',
    },
    {
      field: 'mERR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Basic.ERR') + memo, // 'ERR',
    },

    {
      field: 'mELEMENTAL_DMG' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.DMG') + memo, // 'DMG',
    },
    {
      field: 'mxEHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Basic.EHP'), // 'EHP',
    },
    // Dynamic ability columns (BASIC, SKILL, ULT, etc.) are injected in OptimizerGrid.tsx
    comboColumnDef(t('Headers.Basic.COMBO')),
  ]
}

export function getCombatColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return [
    {
      field: 'relicSetIndex' as const,
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Headers.Combat.Set'),
    }, // Set
    {
      field: 'ornamentSetIndex' as const,
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Headers.Combat.Set'),
    }, // Set
    {
      field: 'xATK' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.ATK'), // 'Σ ATK',
    },
    {
      field: 'xDEF' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.DEF'), // 'Σ DEF',
    },
    {
      field: 'xHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.HP'), // 'Σ HP',
    },
    {
      field: 'xSPD' as const,
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.SPD'), // 'Σ SPD',
    },
    {
      field: 'xCR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.CR'), // 'Σ CR',
    },
    {
      field: 'xCD' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.CD'), // 'Σ CD',
    },
    {
      field: 'xEHR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.EHR'), // 'Σ EHR',
    },
    {
      field: 'xRES' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.RES'), // 'Σ RES',
    },
    {
      field: 'xBE' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.BE'), // 'Σ BE',
    },
    {
      field: 'xOHB' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Combat.OHB'), // 'Σ OHB',
    },
    {
      field: 'xERR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Combat.ERR'), // 'Σ ERR',
    },

    {
      field: 'xELEMENTAL_DMG' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Combat.DMG'), // 'Σ DMG',
    },
    {
      field: 'EHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Combat.EHP'), // 'EHP',
    },
    // Dynamic ability columns (BASIC, SKILL, ULT, etc.) are injected in OptimizerGrid.tsx
    comboColumnDef(t('Headers.Combat.COMBO')),
  ]
}

export function getMemoCombatColumnDefs(t: TFunction<'optimizerTab', 'Grid'>) {
  return [
    {
      field: 'relicSetIndex' as const,
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Headers.Combat.Set'),
    }, // Set
    {
      field: 'ornamentSetIndex' as const,
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Headers.Combat.Set'),
    }, // Set
    {
      field: 'mxATK' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.ATK') + memo, // 'Σ ATK',
    },
    {
      field: 'mxDEF' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.DEF') + memo, // 'Σ DEF',
    },
    {
      field: 'mxHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.HP') + memo, // 'Σ HP',
    },
    {
      field: 'mxSPD' as const,
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.SPD') + memo, // 'Σ SPD',
    },
    {
      field: 'mxCR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.CR') + memo, // 'Σ CR',
    },
    {
      field: 'mxCD' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.CD') + memo, // 'Σ CD',
    },
    {
      field: 'mxEHR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.EHR') + memo, // 'Σ EHR',
    },
    {
      field: 'mxRES' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.RES') + memo, // 'Σ RES',
    },
    {
      field: 'mxBE' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Headers.Combat.BE') + memo, // 'Σ BE',
    },
    {
      field: 'mxOHB' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Combat.OHB') + memo, // 'Σ OHB',
    },
    {
      field: 'mxERR' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Headers.Combat.ERR') + memo, // 'Σ ERR',
    },

    {
      field: 'mxELEMENTAL_DMG' as const,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Combat.DMG') + memo, // 'Σ DMG',
    },
    {
      field: 'mxEHP' as const,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Headers.Combat.EHP'), // 'EHP',
    },
    // Dynamic ability columns (BASIC, SKILL, ULT, etc.) are injected in OptimizerGrid.tsx
    comboColumnDef(t('Headers.Combat.COMBO')),
  ]
}

// this stops ts from whining when we filter the columns later on
export type OptimizerGridColumnDef = Array<
  | ReturnType<typeof getMemoBasicColumnDefs>[number]
  | ReturnType<typeof getMemoCombatColumnDefs>[number]
  | ReturnType<typeof getBasicColumnDefs>[number]
  | ReturnType<typeof getCombatColumnDefs>[number]
>
