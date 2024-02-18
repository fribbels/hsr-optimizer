import { AgGridReact } from 'ag-grid-react'
import { baseColumnDefs, combatColumnDefs, defaultColDef } from 'components/optimizerTab/constants.tsx'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import React, { useMemo, useRef } from 'react'
import { Flex } from 'antd'

const renderer = (x) => {
  console.log('!!!y')
  return (
    <Flex>
      {JSON.stringify(x.node.data)}
    </Flex>
  )
}

export function OptimizerGrid() {
  console.log('======================================================================= RENDER OptimizerGrid')
  let showOptimizerGridDetails = window.store((s) => s.showOptimizerGridDetails)

  const optimizerGrid = useRef()
  window.optimizerGrid = optimizerGrid

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const columnDefs = useMemo(() => {
    return statDisplay == 'combat' ? combatColumnDefs : baseColumnDefs
  }, [statDisplay])

  const gridOptions = useMemo(() => {
    console.log('!!!z')
    return {
      rowHeight: 33,
      pagination: true,
      rowSelection: 'single',
      rowModelType: 'infinite',
      datasource: datasource,
      paginationPageSize: 500,
      paginationPageSizeSelector: [100, 500, 1000],
      cacheBlockSize: 500,
      maxBlocksInCache: 1,
      suppressDragLeaveHidesColumns: true,
      suppressScrollOnNewData: true,
      suppressMultiSort: true,
      suppressCellFocus: true,
    }
  }, [showOptimizerGridDetails])

  const x = useMemo(() => {
    console.log('!!!x')
    return (params) => params?.rowNode?.data?.fullWidth
  }, [showOptimizerGridDetails])

  // TODO: I think these things need memos: https://www.ag-grid.com/react-data-grid/react-hooks/
  return (
    <Flex>
      <div id="optimizerGridContainer" className="ag-theme-balham-dark" style={{ width: 1225, minHeight: 300, height: 600, resize: 'vertical', overflow: 'hidden' }}>
        <AgGridReact
          animateRows={false}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          headerHeight={24}
          onCellClicked={OptimizerTabController.cellClicked}
          ref={optimizerGrid}
          rowSelection="single"
          isFullWidthRow={x}
          fullWidthCellRenderer={renderer}
          pinnedBottomRowData={showOptimizerGridDetails}
        />
      </div>
    </Flex>
  )
}
