import {
  ColDef,
  GetLocaleTextParams,
  GetRowIdParams,
  IRowNode,
  IsExternalFilterPresentParams,
  PaginationNumberFormatterParams,
} from 'ag-grid-community'
import {
  AgGridReact,
  AgGridReactProps,
} from 'ag-grid-react'
import {
  defaultRelicsGridColDefs,
  generateBaselineColDefs,
  generateOptionalColDefs,
} from 'lib/tabs/tabRelics/columnDefs'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { currentLocale } from 'lib/utils/i18nUtils'
import {
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

const gridOptions = {
  rowHeight: 33,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  getRowId: (params: GetRowIdParams<Relic>) => params.data.id,
}

const paginationSettings: AgGridReactProps<Relic> = {
  pagination: true,
  paginationPageSizeSelector: false,
  paginationPageSize: 2100,
  // TODO: does this actually work or do I need it in the component to keep currentLocale() up to date
  paginationNumberFormatter: (params: PaginationNumberFormatterParams<Relic>) => params.value.toLocaleString(currentLocale()),
}

export function RelicsGrid() {
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicGrid' })

  const relics = window.store((s) => s.relics)
  const filters = useRelicsTabStore((s) => s.filters)

  const gridRef = useRef<AgGridReact<Relic>>(null)

  const getLocaleText = useCallback((params: GetLocaleTextParams<Relic>) => {
    if (params.key == 'to') return (t('To') /* to */)
    if (params.key == 'of') return (t('Of') /* of */)
    if (params.key == 'noRowsToShow') return ''
    return params.key
  }, [t])

  const isExternalFilterPresent = useCallback((_params: IsExternalFilterPresentParams<Relic>) => {
    return Object.values(filters).reduce((acc, cur) => acc + cur.length, 0) === 0
  }, [filters])

  const doesExternalFilterPass = useCallback((node: IRowNode<Relic>) => {
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
    return (!filters.subStat.length || relic.substats.some((s) => filters.subStat.includes(s.stat)))
  }, [filters])

  const columnDefs: ColDef<Relic>[] = useMemo(() => {
    const baselineCols = generateBaselineColDefs(t)
    const optionalCols = generateOptionalColDefs(t)
    return baselineCols.concat(optionalCols)
  }, [t])

  return (
    <AgGridReact
      ref={gridRef}
      rowData={relics}
      columnDefs={columnDefs}
      defaultColDef={defaultRelicsGridColDefs}
      gridOptions={gridOptions}
      onSelectionChanged={RelicsTabController.onSelectionChanged}
      onRowClicked={RelicsTabController.onRowClicked}
      onRowDoubleClicked={RelicsTabController.onRowDoubleClicked}
      navigateToNextCell={RelicsTabController.navigateToNextCell}
      isExternalFilterPresent={isExternalFilterPresent}
      doesExternalFilterPass={doesExternalFilterPass}
      {...paginationSettings}
      getLocaleText={getLocaleText}
      headerHeight={24}
      animateRows={true}
      rowSelection='multiple'
    />
  )
}
