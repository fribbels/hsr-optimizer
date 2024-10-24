import { Constants } from 'lib/constants'
import { Gradient } from 'lib/gradient'
import { Renderer } from 'lib/renderer'
import { GetRowIdParams } from 'ag-grid-community'
import { Utils } from 'lib/utils'
import { TFunction } from 'i18next'

export const DIGITS_3 = 46
export const DIGITS_4 = 50
export const DIGITS_4_WEIGHT = 52
export const DIGITS_5 = 56
export const DIGITS_6 = 62

export const optimizerTabDefaultGap = 5
export const panelWidth = 211
export const defaultPadding = 11

export function getBaseColumnDefs(t: TFunction<'optimizerTab', undefined>) {
  return [
    { field: 'relicSetIndex', cellRenderer: Renderer.relicSet, width: 72, headerName: t('Grid.Headers.Basic.Set')/* 'Set' */ },
    { field: 'ornamentSetIndex', cellRenderer: Renderer.ornamentSet, width: 42, headerName: t('Grid.Headers.Basic.ATK')/* 'Set' */ },

    {
      field: Constants.Stats.ATK,
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.ATK'), // 'ATK',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.DEF,
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.DEF'), // 'DEF',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.HP,
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.HP'), // 'HP',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.SPD,
      valueFormatter: Renderer.tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.SPD'), // 'SPD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.CR,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.CR'), // 'CR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.CD,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.CD'), // 'CD',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.EHR,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.EHR'), // 'EHR',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.RES,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_3,
      headerName: t('Grid.Headers.Basic.RES'), // 'RES',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.BE,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.BE'), // 'BE',
      cellStyle: Gradient.getOptimizerColumnGradient,
    },
    {
      field: Constants.Stats.OHB,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_3,
      headerName: t('Grid.Headers.Basic.OHB'), // 'OHB',
    },
    {
      field: Constants.Stats.ERR,
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_3,
      headerName: t('Grid.Headers.Basic.ERR'), // 'ERR',
    },

    {
      field: 'ED',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.DMG'), // 'DMG',
    },
    {
      field: 'EHP',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.EHP'), // 'EHP',
    },
    {
      field: 'WEIGHT',
      valueFormatter: Renderer.floor,
      width: DIGITS_4_WEIGHT,
      headerName: t('Grid.Headers.Basic.WEIGHT'), // 'STAT\nWEIGHT',
    },

    {
      field: 'BASIC',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Basic.BASIC'), // 'BASIC\nDMG',
    },
    {
      field: 'SKILL',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Basic.SKILL'), // 'SKILL\nDMG',
    },
    {
      field: 'ULT',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Basic.ULT'), // 'ULT\nDMG',
    },
    {
      field: 'FUA',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Basic.FUA'), // 'FUA\nDMG',
    },
    {
      field: 'DOT',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Basic.DOT'), // 'DOT\nDMG',
    },
    {
      field: 'BREAK',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Basic.BREAK'), // 'BREAK\nDMG',
    },
    {
      field: 'COMBO',
      valueFormatter: Renderer.floor,
      width: DIGITS_6,
      headerName: t('Grid.Headers.Basic.COMBO'), // 'COMBO\nDMG',
    },
  ]
}

export function getCombatColumnDefs(t: TFunction<'optimizerTab', undefined>) {
  return [
    { field: 'relicSetIndex', cellRenderer: Renderer.relicSet, width: 72, headerName: t('Grid.Headers.Combat.Set') }, // Set
    { field: 'ornamentSetIndex', cellRenderer: Renderer.ornamentSet, width: 42, headerName: t('Grid.Headers.Combat.Set') }, // Set

    {
      field: 'xATK',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.ATK'), // 'Σ ATK',
    },
    {
      field: 'xDEF',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.DEF'), // 'Σ DEF',
    },
    {
      field: 'xHP',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.HP'), // 'Σ HP',
    },
    {
      field: 'xSPD',
      valueFormatter: Renderer.tenths,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.SPD'), // 'Σ SPD',
    },
    {
      field: 'xCR',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.CR'), // 'Σ CR',
    },
    {
      field: 'xCD',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.CD'), // 'Σ CD',
    },
    {
      field: 'xEHR',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.EHR'), // 'Σ EHR',
    },
    {
      field: 'xRES',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_3,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.RES'), // 'Σ RES',
    },
    {
      field: 'xBE',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      cellStyle: Gradient.getOptimizerColumnGradient,
      headerName: t('Grid.Headers.Combat.BE'), // 'Σ BE',
    },
    {
      field: 'xOHB',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_3,
      headerName: t('Grid.Headers.Combat.OHB'), // 'Σ OHB',
    },
    {
      field: 'xERR',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_3,
      headerName: t('Grid.Headers.Combat.ERR'), // 'Σ ERR',
    },

    {
      field: 'xELEMENTAL_DMG',
      valueFormatter: Renderer.x100Tenths,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Combat.DMG'), // 'Σ DMG',
    },
    {
      field: 'EHP',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Combat.EHP'), // 'EHP',
    },
    {
      field: 'WEIGHT',
      valueFormatter: Renderer.floor,
      width: DIGITS_4_WEIGHT,
      headerName: t('Grid.Headers.Combat.WEIGHT'), // 'STAT\nWEIGHT',
    },

    {
      field: 'BASIC',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Combat.BASIC'), // 'BASIC\nDMG',
    },
    {
      field: 'SKILL',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Combat.SKILL'), // 'SKILL\nDMG',
    },
    {
      field: 'ULT',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Combat.ULT'), // 'ULT\nDMG',
    },
    {
      field: 'FUA',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Combat.FUA'), // 'FUA\nDMG',
    },
    {
      field: 'DOT',
      valueFormatter: Renderer.floor,
      width: DIGITS_5,
      headerName: t('Grid.Headers.Combat.DOT'), // 'DOT\nDMG',
    },
    {
      field: 'BREAK',
      valueFormatter: Renderer.floor,
      width: DIGITS_4,
      headerName: t('Grid.Headers.Combat.BREAK'), // 'BREAK\nDMG',
    },
    {
      field: 'COMBO',
      valueFormatter: Renderer.floor,
      width: DIGITS_6,
      headerName: t('Grid.Headers.Combat.COMBO'), // 'COMBO\nDMG',
    },
  ]
}

export const gridOptions = {
  rowHeight: 33,
  pagination: true,
  rowModelType: 'infinite',
  datasource: null,
  paginationPageSize: 500,
  paginationPageSizeSelector: [100, 500, 1000],
  cacheBlockSize: 500,
  maxBlocksInCache: 1,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  getRowId: (params: GetRowIdParams) => String(params.data.id || Utils.randomId()),
}

export const defaultColDef = {
  cellStyle: Gradient.getOptimizerColumnGradient,
  sortable: true,
  sortingOrder: ['desc', 'asc'],
  wrapHeaderText: true,
  autoHeaderHeight: true,
}
