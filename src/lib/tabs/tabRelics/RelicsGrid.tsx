import { ColDef,GetRowIdParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { currentLocale } from 'lib/utils/i18nUtils'
import {
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

export function RelicsGrid() {
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicGrid' })

  const relics = window.store((s) => s.relics)

  const gridRef = useRef<AgGridReact<Relic>>(null)

  const columnDefs: ColDef<Relic>[] = useMemo(() => [
    {
      field: 'equippedBy',
    },
    {
      field: 'set',
    },
  ], [])

  const gridOptions = useMemo(() => ({
    rowHeight: 33,
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    suppressMultiSort: true,
    getRowId: (params: GetRowIdParams) => String(params.data.id)
  }), [])

  return (
    <AgGridReact
      ref={gridRef}
      rowData={relics}
      animateRows={true}
      headerHeight={24}
      pagination={true}
      paginationPageSizeSelector={false}
      paginationPageSize={2100}
      paginationNumberFormatter={(param) => param.value.toLocaleString(currentLocale())}
    />
  )
}
