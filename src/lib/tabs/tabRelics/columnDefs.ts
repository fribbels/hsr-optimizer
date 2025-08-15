import {
  ColDef,
  ValueGetterParams,
} from 'ag-grid-community'
import { TFunction } from 'i18next'
import { Stats } from 'lib/constants/constants'
import { ScoredRelic } from 'lib/relics/scoreRelics'
import { Gradient } from 'lib/rendering/gradient'
import { Renderer } from 'lib/rendering/renderer'

export function generateValueColumnOptions(t: TFunction<'relicsTab', 'RelicGrid'>) {
  return [
    {
      label: t('ValueColumns.SelectedCharacter.Label'), /* Selected character */
      options: [
        /* 'Selected Char\nScore' | 'Selected character: Score' */
        {
          column: t('ValueColumns.SelectedCharacter.ScoreCol.Header'),
          value: 'weights.current',
          label: t('ValueColumns.SelectedCharacter.ScoreCol.Label'),
        },
        /* 'Selected Char\nAvg Potential' | 'Selected character: Average potential' */
        {
          column: t('ValueColumns.SelectedCharacter.AvgPotCol.Header'),
          value: 'weights.potentialSelected.averagePct',
          label: t('ValueColumns.SelectedCharacter.AvgPotCol.Label'),
          percent: true,
        },
        /* 'Selected Char\nMax Potential' | 'Selected character: Max potential' */
        {
          column: t('ValueColumns.SelectedCharacter.MaxPotCol.Header'),
          value: 'weights.potentialSelected.bestPct',
          label: t('ValueColumns.SelectedCharacter.MaxPotCol.Label'),
          percent: true,
        },
        // Selected Char\nReroll Avg | Selected character: Reroll average potential
        {
          column: t('ValueColumns.SelectedCharacter.RerollAvg.Header'),
          value: 'weights.rerollAvgSelected',
          label: t('ValueColumns.SelectedCharacter.RerollAvg.Label'),
          percent: true,
        },
        // Selected Char\nΔ Reroll Avg | Selected character: Reroll average delta potential
        {
          column: t('ValueColumns.SelectedCharacter.RerollAvgDelta.Header'),
          value: 'weights.rerollAvgSelectedDelta',
          label: t('ValueColumns.SelectedCharacter.RerollAvgDelta.Label'),
          percent: true,
        },
        // Selected Char\n∆ Reroll AVG\nVS Equipped | Selected character: Reroll average delta potential vs equipped
        {
          column: t('ValueColumns.SelectedCharacter.RerollAvgEquippedDelta.Header'),
          value: 'weights.rerollAvgSelectedEquippedDelta',
          label: t('ValueColumns.SelectedCharacter.RerollAvgEquippedDelta.Label'),
          percent: true,
        },
      ],
    },
    {
      label: t('ValueColumns.CustomCharacters.Label'), /* Custom characters */
      options: [
        /* 'Custom Chars\nAvg Potential' | 'Custom characters: Average potential' */
        {
          column: t('ValueColumns.CustomCharacters.AvgPotCol.Header'),
          value: 'weights.potentialAllCustom.averagePct',
          label: t('ValueColumns.CustomCharacters.AvgPotCol.Label'),
          percent: true,
        },
        /* 'Custom Chars\nMax Potential' | 'Custom characters: Max potential' */
        {
          column: t('ValueColumns.CustomCharacters.MaxPotCol.Header'),
          value: 'weights.potentialAllCustom.bestPct',
          label: t('ValueColumns.CustomCharacters.MaxPotCol.Label'),
          percent: true,
        },
        // Custom Chars\nAvg Reroll | Custom characters: Average reroll potential
        {
          column: t('ValueColumns.CustomCharacters.RerollAvg.Header'),
          value: 'weights.rerollAllCustom',
          label: t('ValueColumns.CustomCharacters.RerollAvg.Label'),
          percent: true,
        },
      ],
    },
    {
      label: t('ValueColumns.AllCharacters.Label'), /* All characters */
      options: [
        /* 'All Chars\nAvg Potential' | 'All characters: Average potential' */
        {
          column: t('ValueColumns.AllCharacters.AvgPotCol.Header'),
          value: 'weights.potentialAllAll.averagePct',
          label: t('ValueColumns.AllCharacters.AvgPotCol.Label'),
          percent: true,
        },
        /* 'All Chars\nMax Potential' | 'All characters: Max potential' */
        {
          column: t('ValueColumns.AllCharacters.MaxPotCol.Header'),
          value: 'weights.potentialAllAll.bestPct',
          label: t('ValueColumns.AllCharacters.MaxPotCol.Label'),
          percent: true,
        },
        // All Chars\nAvg Reroll | All characters: Average reroll potential
        {
          column: t('ValueColumns.AllCharacters.RerollAvg.Header'),
          value: 'weights.rerollAllAll',
          label: t('ValueColumns.AllCharacters.RerollAvg.Label'),
          percent: true,
        },
      ],
    },
  ] satisfies ValueColumnGroup[]
}

type ValueColumnGroup = {
  label: string,
  options: {
    column: string,
    value: ColDef<ScoredRelic>['field'],
    label: string,
    percent?: boolean,
    disabled?: boolean,
  }[],
}

export function generateOptionalColDefs(t: TFunction<'relicsTab', 'RelicGrid'>) {
  return generateValueColumnOptions(t)
    .flatMap((x) =>
      (x.options as ValueColumnGroup['options']).map((x) => {
        const colDef: ColDef<ScoredRelic> = {
          field: x.value,
          headerName: x.column,
          cellStyle: Gradient.getRelicGradient,
          valueFormatter: x.percent ? Renderer.hideNaNAndFloorPercent : Renderer.hideNaNAndFloor,
          width: 75,
        }
        return colDef
      })
    )
}

export function generateBaselineColDefs(t: TFunction<'relicsTab', 'RelicGrid'>): ColDef<ScoredRelic>[] {
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
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.ATK_P}`,
      headerName: t('Headers.ATKP'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.DEF_P}`,
      headerName: t('Headers.DEFP'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.HP}`,
      headerName: t('Headers.HP'),
      valueFormatter: Renderer.hideZeroesFloor,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.ATK}`,
      headerName: t('Headers.ATK'),
      valueFormatter: Renderer.hideZeroesFloor,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.DEF}`,
      headerName: t('Headers.DEF'),
      valueFormatter: Renderer.hideZeroesFloor,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.SPD}`,
      headerName: t('Headers.SPD'),
      valueFormatter: Renderer.hideZeroes10thsRelicTabSpd,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.CR}`,
      headerName: t('Headers.CR'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.CD}`,
      headerName: t('Headers.CD'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.EHR}`,
      headerName: t('Headers.EHR'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.RES}`,
      headerName: t('Headers.RES'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      field: `augmentedStats.${Stats.BE}`,
      headerName: t('Headers.BE'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
    {
      // we use colId when applying the gradient, default value is the field, cv has no associated field so we need to explicitly set the id
      colId: 'cv',
      valueGetter: calculateCv,
      headerName: t('Headers.CV'),
      valueFormatter: Renderer.hideZeroesX100Tenths,
      cellStyle: Gradient.getRelicGradient,
    },
  ]
}

function calculateCv(params: ValueGetterParams<ScoredRelic>) {
  const stats = params.data?.augmentedStats
  if (!stats) return 0
  return 2 * stats[Stats.CR] + stats[Stats.CD]
}

export const defaultRelicsGridColDefs: ColDef<ScoredRelic> = {
  sortable: true,
  width: 46,
  headerClass: 'relicsTableHeader',
  sortingOrder: ['desc', 'asc'],
  filterParams: { maxNumConditions: 200 },
  wrapHeaderText: true,
  autoHeaderHeight: true,
  suppressHeaderMenuButton: true,
}
