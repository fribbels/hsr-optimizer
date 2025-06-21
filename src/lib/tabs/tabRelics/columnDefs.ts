import {
  ColDef,
  ColGroupDef,
  ValueGetterParams,
} from 'ag-grid-community'
import { TFunction } from 'i18next'
import { Stats } from 'lib/constants/constants'
import { Renderer } from 'lib/rendering/renderer'
import { Relic } from 'types/relic'

export function generateOptionalColDefs(t: TFunction<'relicsTab', 'RelicGrid'>): ColDef<Relic>[] {
  return []
}

export function generateBaselineColDefs(t: TFunction<'relicsTab', 'RelicGrid'>): ColDef<Relic>[] {
  return [
    {
      field: 'equippedBy',
      headerName: t('Headers.EquippedBy'),
      width: 40,
      cellRenderer: Renderer.characterIcon,
    },
    {
      field: 'set',
      headerName: t('Headers.Set'),
      width: 40,
      cellRenderer: Renderer.anySet,
    },
    {
      field: 'grade',
      headerName: '★',
      width: 30,
      cellRenderer: Renderer.renderGradeCell,
    },
    {
      field: 'enhance',
      headerName: '+',
      width: 30,
    },
    {
      field: 'part',
      headerName: t('Headers.Part'),
      width: 55,
      valueFormatter: Renderer.readablePart,
    },
    {
      field: 'main.stat',
      headerName: t('Headers.MainStat'),
      width: 78,
      valueFormatter: Renderer.readableStat,
    },
    {
      field: 'main.value',
      headerName: t('Headers.MainValue'),
      width: 50,
      valueFormatter: Renderer.mainValueRenderer,
    },
    {
      field: `augmentedStats.${Stats.HP_P}`,
      headerName: t('Headers.HPP'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.ATK_P}`,
      headerName: t('Headers.ATKP'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.DEF_P}`,
      headerName: t('Headers.DEFP'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.HP}`,
      headerName: t('Headers.HP'),
      valueFormatter: Renderer.hideZeroesFloor,
    },
    {
      field: `augmentedStats.${Stats.ATK}`,
      headerName: t('Headers.ATK'),
      valueFormatter: Renderer.hideZeroesFloor,
    },
    {
      field: `augmentedStats.${Stats.DEF}`,
      headerName: t('Headers.DEF'),
      valueFormatter: Renderer.hideZeroesFloor,
    },
    {
      field: `augmentedStats.${Stats.SPD}`,
      headerName: t('Headers.SPD'),
      valueFormatter: Renderer.hideZeroes10thsRelicTabSpd,
    },
    {
      field: `augmentedStats.${Stats.CR}`,
      headerName: t('Headers.CR'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.CD}`,
      headerName: t('Headers.CD'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.EHR}`,
      headerName: t('Headers.EHR'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.RES}`,
      headerName: t('Headers.RES'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      field: `augmentedStats.${Stats.BE}`,
      headerName: t('Headers.BE'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
    {
      valueGetter: calculateCv,
      headerName: t('Headers.CV'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
    },
  ]
}

function calculateCv(params: ValueGetterParams<Relic>) {
  const stats = params.data?.augmentedStats
  if (!stats) return 0
  return 2 * stats[Stats.CR] + stats[Stats.CD]
}

export const defaultRelicsGridColDefs: ColDef<Relic> = {
  sortable: true,
  width: 46,
  headerClass: 'relicsTableHeader',
  sortingOrder: ['desc', 'asc'],
  filterParams: { maxNumConditions: 200 },
  wrapHeaderText: true,
  autoHeaderHeight: true,
  suppressHeaderMenuButton: true,
}
