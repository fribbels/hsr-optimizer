import {
  GetRowIdParams,
  GridOptions,
  IRowNode,
  IsExternalFilterPresentParams,
} from 'ag-grid-community'
import {
  AgGridReact,
  AgGridReactProps,
} from 'ag-grid-react'
import { useGridLocale, useGridLocaleRebuild } from 'lib/hooks/useGridLocale'
import {
  ScoredRelic,
  scoreRelics,
} from 'lib/relics/scoreRelics'
import {
  defaultRelicsGridColDefs,
  generateBaselineColDefs,
  generateOptionalColDefs,
} from 'lib/tabs/tabRelics/columnDefs'
import { TAB_WIDTH } from 'lib/tabs/tabRelics/RelicsTab'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import useRelicsTabStore, { ValueColumnField } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { gridStore } from 'lib/utils/gridStore'
import {
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useRelicStore } from 'lib/stores/relicStore'
import { useScoringStore } from 'lib/stores/scoringStore'

const gridOptions: GridOptions<ScoredRelic> = {
  rowHeight: 33,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  suppressNoRowsOverlay: true,
  getRowId: (params: GetRowIdParams<ScoredRelic>) => params.data.id,
}

const paginationSettings: AgGridReactProps<ScoredRelic> = {
  pagination: true,
  paginationPageSizeSelector: false,
  paginationPageSize: 3100,
}

export function RelicsGrid() {
  const { getLocaleText, paginationNumberFormatter, t } = useGridLocale('relicsTab', 'RelicGrid')

  

  const { gridDestroyed } = useGridLocaleRebuild()

  const relics = useRelicStore((s) => s.relics)
  const scoringMetadataOverrides = useScoringStore((s) => s.scoringMetadataOverrides)

  const { focusCharacter, excludedRelicPotentialCharacters } = useRelicsTabStore()

  const gridRef = useRef<AgGridReact<ScoredRelic>>(null)
  gridStore.setRelicsGrid(gridRef)

  const scoredRelics = useMemo(() => {
    return scoreRelics(relics, excludedRelicPotentialCharacters, focusCharacter, scoringMetadataOverrides)
  }, [relics, scoringMetadataOverrides, focusCharacter, excludedRelicPotentialCharacters])

  const { filters, valueColumns } = useRelicsTabStore()

  const columnDefs = useMemo(() => {
    return generateBaselineColDefs(t)
      .concat(generateOptionalColDefs(t).filter((x) => valueColumns.includes(x.field as ValueColumnField)))
  }, [valueColumns, t])

  const isExternalFilterPresent = useCallback((_params: IsExternalFilterPresentParams<ScoredRelic>) => {
    return !Object.values(filters).every((filter) => filter.length === 0)
  }, [filters])

  const doesExternalFilterPass = useCallback((node: IRowNode<ScoredRelic>) => {
    const relic = node.data
    if (!relic) return false
    if (filters.part.length && !filters.part.includes(relic.part)) return false
    if (filters.enhance.length && !filters.enhance.flatMap((x) => [x, x + 1, x + 2]).includes(relic.enhance)) return false
    if (filters.grade.length && !filters.grade.includes(relic.grade)) return false
    if (filters.initialRolls.length && !filters.initialRolls.includes(relic.initialRolls ?? 3)) return false
    if (filters.verified.length && !filters.verified.includes(relic.verified ?? false)) return false
    if (filters.equipped.length && !filters.equipped.includes(relic.equippedBy != null)) return false
    if (filters.set.length && !filters.set.includes(relic.set)) return false
    if (filters.mainStat.length && !filters.mainStat.includes(relic.main.stat)) return false
    if (
      filters.subStat.length && !filters.subStat.every((filterStat) => {
        return relic.substats.some((s) => s.stat === filterStat)
          || relic.previewSubstats.some((s) => s.stat === filterStat)
      })
    ) {
      return false
    }
    return true
  }, [filters])

  return (
    <div
      id='relicGrid'
      className='ag-theme-balham-dark'
      style={{
        width: TAB_WIDTH,
        height: 500,
        resize: 'vertical',
        overflow: 'hidden',
      }}
    >
      {!gridDestroyed && (
        <AgGridReact
          ref={gridRef}
          rowData={scoredRelics}
          columnDefs={columnDefs}
          defaultColDef={defaultRelicsGridColDefs}
          gridOptions={gridOptions}
          onSelectionChanged={RelicsTabController.onSelectionChanged}
          onRowClicked={RelicsTabController.onRowClicked}
          onRowDoubleClicked={RelicsTabController.onRowDoubleClicked}
          navigateToNextCell={RelicsTabController.navigateToNextCell}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          getLocaleText={getLocaleText}
          headerHeight={24}
          animateRows={true}
          rowSelection={{ mode: 'multiRow', checkboxes: false, headerCheckbox: false, enableClickSelection: true }}
          paginationNumberFormatter={paginationNumberFormatter}
          {...paginationSettings}
        />
      )}
    </div>
  )
}
