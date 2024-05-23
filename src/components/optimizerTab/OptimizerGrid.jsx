import { AgGridReact } from 'ag-grid-react'
import {
  baseColumnDefs,
  combatColumnDefs,
  defaultColDef,
  gridOptions
} from 'components/optimizerTab/optimizerTabConstants.ts'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import React, { useCallback, useMemo, useRef } from 'react'
import { Flex, theme } from 'antd'
import { arrowKeyGridNavigation } from 'lib/arrowKeyGridNavigation'
import { getGridTheme } from 'lib/theme'

const {useToken} = theme

export function OptimizerGrid() {
  console.log('======================================================================= RENDER OptimizerGrid')

  const {token} = useToken()
  const optimizerGrid = useRef()
  window.optimizerGrid = optimizerGrid

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const columnDefs = useMemo(() => {
    return statDisplay == 'combat'
      ? combatColumnDefs
      : baseColumnDefs
  }, [statDisplay])

  gridOptions.datasource = datasource

  const navigateToNextCell = useCallback((params) => {
    return arrowKeyGridNavigation(params, optimizerGrid, (selectedNode) => OptimizerTabController.cellClicked(selectedNode))
  }, [])

  // TODO: I think these things need memos: https://www.ag-grid.com/react-data-grid/react-hooks/
  return (
    <Flex>
      <div
        id="optimizerGridContainer"
        className="ag-theme-balham-dark"
        style={{
          ...{
            width: 1225,
            minHeight: 300,
            height: 600,
            resize: 'vertical',
            overflow: 'hidden',
          },
          ...getGridTheme(token),
        }}
      >
        <AgGridReact
          animateRows={false}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          headerHeight={24}
          onCellClicked={OptimizerTabController.cellClicked}
          ref={optimizerGrid}
          rowSelection="single"
          navigateToNextCell={navigateToNextCell}
        />
      </div>
    </Flex>
  )
}
