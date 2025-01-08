import { GetRowIdParams } from 'ag-grid-community'
import { TFunction } from 'i18next'
import { Constants } from 'lib/constants/constants'
import { Gradient } from 'lib/rendering/gradient'
import { Renderer } from 'lib/rendering/renderer'
import { Utils } from 'lib/utils/utils'

export const DIGITS_3 = 46
export const DIGITS_4 = 50
export const DIGITS_4_WEIGHT = 52
export const DIGITS_5 = 56
export const DIGITS_6 = 62

export const optimizerTabDefaultGap = 5
export const panelWidth = 211
export const defaultPadding = 11

export const optimizerGridOptions = {
  rowHeight: 33,
  pagination: true,
  rowModelType: 'infinite',
  datasource: null,
  paginationPageSize: 500,
  paginationPageSizeSelector: [100, 500, 1000],
  cacheBlockSize: 500,
  maxBlocksInCache: 1,
  alwaysShowVerticalScroll: true,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  getRowId: (params: GetRowIdParams) => String(params.data.id || Utils.randomId()),
}

export const optimizerGridDefaultColDef = {
  cellStyle: Gradient.getOptimizerColumnGradient,
  sortable: true,
  sortingOrder: ['desc', 'asc'],
  wrapHeaderText: true,
  autoHeaderHeight: true,
}

const memo = 'ᴹ'

export function getBasicColumnDefs(t: TFunction<'optimizerTab', undefined>) {
  return [
    {
      field: 'relicSetIndex',
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Grid.Headers.Basic.Set'), /* 'Set' */
    },
    {
      field: 'ornamentSetIndex',
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Grid.Headers.Basic.Set'), /* 'Set' */
    },

    {
      field: Constants.Stats.ATK,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.ATK'), // 'ATK',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.DEF,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.DEF'), // 'DEF',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.HP,
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.HP'), // 'HP',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.SPD,
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.SPD'), // 'SPD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.CR,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.CR'), // 'CR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.CD,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.CD'), // 'CD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.EHR,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.EHR'), // 'EHR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.RES,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.RES'), // 'RES',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.BE,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.BE'), // 'BE',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.OHB,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.OHB'), // 'OHB',
    },
    {
      field: Constants.Stats.ERR,
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.ERR'), // 'ERR',
    },

    {
      field: 'ED',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.DMG'), // 'DMG',
    },
    {
      field: 'EHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.EHP'), // 'EHP',
    },
    {
      field: 'HEAL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.HEAL'), // 'HEAL',
    },
    {
      field: 'SHIELD',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.SHIELD'), // 'SHIELD',
    },
    {
      field: 'WEIGHT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4_WEIGHT,
      flex: 10,
      headerName: t('Grid.Headers.Basic.WEIGHT'), // 'STAT\nWEIGHT',
    },

    {
      field: 'BASIC',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.BASIC'), // 'BASIC\nDMG',
    },
    {
      field: 'SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.SKILL'), // 'SKILL\nDMG',
    },
    {
      field: 'ULT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.ULT'), // 'ULT\nDMG',
    },
    {
      field: 'FUA',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.FUA'), // 'FUA\nDMG',
    },
    {
      field: 'MEMO_SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.MEMO_SKILL'), // 'SKILLᴹ\nDMG',
    },
    {
      field: 'DOT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.DOT'), // 'DOT\nDMG',
    },
    {
      field: 'BREAK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 12,
      headerName: t('Grid.Headers.Basic.BREAK'), // 'BREAK\nDMG',
    },
    {
      field: 'COMBO',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_6,
      flex: 13,
      headerName: t('Grid.Headers.Basic.COMBO'), // 'COMBO\nDMG',
    },
  ]
}

export function getMemoBasicColumnDefs(t: TFunction<'optimizerTab', undefined>) {
  return [
    {
      field: 'relicSetIndex',
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Grid.Headers.Basic.Set'), /* 'Set' */
    },
    {
      field: 'ornamentSetIndex',
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Grid.Headers.Basic.Set'), /* 'Set' */
    },

    {
      field: 'mATK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.ATK') + memo, // 'ATK',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mDEF',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.DEF') + memo, // 'DEF',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.HP') + memo, // 'HP',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mSPD',
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.SPD') + memo, // 'SPD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mCR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.CR') + memo, // 'CR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mCD',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.CD') + memo, // 'CD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mEHR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.EHR') + memo, // 'EHR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mRES',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.RES') + memo, // 'RES',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mBE',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.BE') + memo, // 'BE',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: 'mOHB',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.OHB') + memo, // 'OHB',
    },
    {
      field: 'mERR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.ERR') + memo, // 'ERR',
    },

    {
      field: 'mELEMENTAL_DMG',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.DMG') + memo, // 'DMG',
    },
    {
      field: 'mxEHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Basic.EHP'), // 'EHP',
    },
    {
      field: 'HEAL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.HEAL'), // 'HEAL',
    },
    {
      field: 'SHIELD',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Basic.SHIELD'), // 'SHIELD',
    },
    {
      field: 'WEIGHT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4_WEIGHT,
      flex: 10,
      headerName: t('Grid.Headers.Basic.WEIGHT'), // 'STAT\nWEIGHT',
    },

    {
      field: 'BASIC',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.BASIC'), // 'BASIC\nDMG',
    },
    {
      field: 'SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.SKILL'), // 'SKILL\nDMG',
    },
    {
      field: 'ULT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.ULT'), // 'ULT\nDMG',
    },
    {
      field: 'FUA',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.FUA'), // 'FUA\nDMG',
    },
    {
      field: 'MEMO_SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.MEMO_SKILL'), // 'SKILLᴹ\nDMG',
    },
    {
      field: 'DOT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Basic.DOT'), // 'DOT\nDMG',
    },
    {
      field: 'BREAK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 12,
      headerName: t('Grid.Headers.Basic.BREAK'), // 'BREAK\nDMG',
    },
    {
      field: 'COMBO',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_6,
      flex: 13,
      headerName: t('Grid.Headers.Basic.COMBO'), // 'COMBO\nDMG',
    },
  ]
}

export function getCombatColumnDefs(t: TFunction<'optimizerTab', undefined>) {
  return [
    {
      field: 'relicSetIndex',
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Grid.Headers.Combat.Set'),
    }, // Set
    {
      field: 'ornamentSetIndex',
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Grid.Headers.Combat.Set'),
    }, // Set
    {
      field: 'xATK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.ATK'), // 'Σ ATK',
    },
    {
      field: 'xDEF',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.DEF'), // 'Σ DEF',
    },
    {
      field: 'xHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.HP'), // 'Σ HP',
    },
    {
      field: 'xSPD',
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.SPD'), // 'Σ SPD',
    },
    {
      field: 'xCR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.CR'), // 'Σ CR',
    },
    {
      field: 'xCD',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.CD'), // 'Σ CD',
    },
    {
      field: 'xEHR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.EHR'), // 'Σ EHR',
    },
    {
      field: 'xRES',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.RES'), // 'Σ RES',
    },
    {
      field: 'xBE',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.BE'), // 'Σ BE',
    },
    {
      field: 'xOHB',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.OHB'), // 'Σ OHB',
    },
    {
      field: 'xERR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.ERR'), // 'Σ ERR',
    },

    {
      field: 'xELEMENTAL_DMG',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Combat.DMG'), // 'Σ DMG',
    },
    {
      field: 'EHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Combat.EHP'), // 'EHP',
    },
    {
      field: 'HEAL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.HEAL'), // 'HEAL',
    },
    {
      field: 'SHIELD',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.SHIELD'), // 'SHIELD',
    },
    {
      field: 'WEIGHT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4_WEIGHT,
      flex: 10,
      headerName: t('Grid.Headers.Combat.WEIGHT'), // 'STAT\nWEIGHT',
    },

    {
      field: 'BASIC',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.BASIC'), // 'BASIC\nDMG',
    },
    {
      field: 'SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.SKILL'), // 'SKILL\nDMG',
    },
    {
      field: 'ULT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.ULT'), // 'ULT\nDMG',
    },
    {
      field: 'FUA',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.FUA'), // 'FUA\nDMG',
    },
    {
      field: 'MEMO_SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.MEMO_SKILL'), // 'SKILLᴹ\nDMG',
    },
    {
      field: 'DOT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.DOT'), // 'DOT\nDMG',
    },
    {
      field: 'BREAK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 12,
      headerName: t('Grid.Headers.Combat.BREAK'), // 'BREAK\nDMG',
    },
    {
      field: 'COMBO',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_6,
      flex: 13,
      headerName: t('Grid.Headers.Combat.COMBO'), // 'COMBO\nDMG',
    },
  ]
}

export function getMemoCombatColumnDefs(t: TFunction<'optimizerTab', undefined>) {
  return [
    {
      field: 'relicSetIndex',
      cellRenderer: Renderer.relicSet,
      width: 72,
      headerName: t('Grid.Headers.Combat.Set'),
    }, // Set
    {
      field: 'ornamentSetIndex',
      cellRenderer: Renderer.ornamentSet,
      width: 42,
      headerName: t('Grid.Headers.Combat.Set'),
    }, // Set
    {
      field: 'mxATK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.ATK') + memo, // 'Σ ATK',
    },
    {
      field: 'mxDEF',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.DEF') + memo, // 'Σ DEF',
    },
    {
      field: 'mxHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.HP') + memo, // 'Σ HP',
    },
    {
      field: 'mxSPD',
      valueFormatter: Renderer.tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.SPD') + memo, // 'Σ SPD',
    },
    {
      field: 'mxCR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.CR') + memo, // 'Σ CR',
    },
    {
      field: 'mxCD',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.CD') + memo, // 'Σ CD',
    },
    {
      field: 'mxEHR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.EHR') + memo, // 'Σ EHR',
    },
    {
      field: 'mxRES',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.RES') + memo, // 'Σ RES',
    },
    {
      field: 'mxBE',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.BE') + memo, // 'Σ BE',
    },
    {
      field: 'mxOHB',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.OHB') + memo, // 'Σ OHB',
    },
    {
      field: 'mxERR',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.ERR') + memo, // 'Σ ERR',
    },

    {
      field: 'mxELEMENTAL_DMG',
      valueFormatter: Renderer.x100Tenths,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Combat.DMG') + memo, // 'Σ DMG',
    },
    {
      field: 'mxEHP',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 10,
      headerName: t('Grid.Headers.Combat.EHP'), // 'EHP',
    },
    {
      field: 'HEAL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.HEAL'), // 'HEAL',
    },
    {
      field: 'SHIELD',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_3,
      flex: 10,
      headerName: t('Grid.Headers.Combat.SHIELD'), // 'SHIELD',
    },
    {
      field: 'WEIGHT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4_WEIGHT,
      flex: 10,
      headerName: t('Grid.Headers.Combat.WEIGHT'), // 'STAT\nWEIGHT',
    },

    {
      field: 'BASIC',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.BASIC'), // 'BASIC\nDMG',
    },
    {
      field: 'SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.SKILL'), // 'SKILL\nDMG',
    },
    {
      field: 'ULT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.ULT'), // 'ULT\nDMG',
    },
    {
      field: 'FUA',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.FUA'), // 'FUA\nDMG',
    },
    {
      field: 'MEMO_SKILL',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.MEMO_SKILL'), // 'SKILLᴹ\nDMG',
    },
    {
      field: 'DOT',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_5,
      flex: 12,
      headerName: t('Grid.Headers.Combat.DOT'), // 'DOT\nDMG',
    },
    {
      field: 'BREAK',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_4,
      flex: 12,
      headerName: t('Grid.Headers.Combat.BREAK'), // 'BREAK\nDMG',
    },
    {
      field: 'COMBO',
      valueFormatter: Renderer.floor,
      minWidth: DIGITS_6,
      flex: 13,
      headerName: t('Grid.Headers.Combat.COMBO'), // 'COMBO\nDMG',
    },
  ]
}
