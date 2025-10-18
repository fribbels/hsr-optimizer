import {
  GetLocaleTextParams,
  GetRowIdParams,
  GridOptions,
  IRowNode,
  IsExternalFilterPresentParams,
  PaginationNumberFormatterParams,
} from 'ag-grid-community'
import {
  AgGridReact,
  AgGridReactProps,
} from 'ag-grid-react'
import { theme } from 'antd'
import {
  ScoredRelic,
  scoreRelics,
} from 'lib/relics/scoreRelics'
import { getGridTheme } from 'lib/rendering/theme'
import {
  defaultRelicsGridColDefs,
  generateBaselineColDefs,
  generateOptionalColDefs,
} from 'lib/tabs/tabRelics/columnDefs'
import { TAB_WIDTH } from 'lib/tabs/tabRelics/RelicsTab'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import useRelicsTabStore, { ValueColumnField } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { currentLocale } from 'lib/utils/i18nUtils'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

const gridOptions: GridOptions<ScoredRelic> = {
  rowHeight: 33,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  getRowId: (params: GetRowIdParams<ScoredRelic>) => params.data.id,
}

const paginationSettings: AgGridReactProps<ScoredRelic> = {
  pagination: true,
  paginationPageSizeSelector: false,
  paginationPageSize: 3100,
  paginationNumberFormatter: (params: PaginationNumberFormatterParams<ScoredRelic>) => params.value.toLocaleString(currentLocale()),
}

const { useToken } = theme

export function RelicsGrid() {
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicGrid' })

  const { token } = useToken()

  const [gridActive, setGridActive] = useState(true)

  const { relics, scoringMetadataOverrides } = window.store()

  const { focusCharacter, excludedRelicPotentialCharacters } = useRelicsTabStore()

  const gridRef = useRef<AgGridReact<ScoredRelic>>(null)
  window.relicsGrid = gridRef

  const scoredRelics = useMemo(() => {
    return scoreRelics(relics, excludedRelicPotentialCharacters, focusCharacter)
    // relic scores have sn implicit dependency on scoringMetadataOverrides
    // settings only relevant on first load so doesn't need to be in array
    // eslint-disable-next-line exhaustive-deps
  }, [relics, scoringMetadataOverrides, focusCharacter, excludedRelicPotentialCharacters])

  const { filters, valueColumns } = useRelicsTabStore()

  useEffect(() => {
    setGridActive(false)
    setTimeout(() => setGridActive(true), 100)
  }, [t])

  const getLocaleText = useCallback((params: GetLocaleTextParams<ScoredRelic>) => {
    if (params.key == 'to') return (t('To') /* to */)
    if (params.key == 'of') return (t('Of') /* of */)
    if (params.key == 'noRowsToShow') return ''
    return params.key
  }, [t])

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
    if (filters.subStat.length && !filters.subStat.every((filterStat) => relic.substats.some((s) => s.stat === filterStat))) return false
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
        ...getGridTheme(token),
      }}
    >
      {gridActive && (
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
          rowSelection='multiple'
          {...paginationSettings}
        />
      )}
    </div>
  )
}
