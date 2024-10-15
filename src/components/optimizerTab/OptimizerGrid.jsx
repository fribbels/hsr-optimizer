import { AgGridReact } from 'ag-grid-react'
import { defaultColDef, getBaseColumnDefs, getCombatColumnDefs, gridOptions } from 'components/optimizerTab/optimizerTabConstants.ts'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flex, theme } from 'antd'
import { arrowKeyGridNavigation } from 'lib/arrowKeyGridNavigation'
import { getGridTheme } from 'lib/theme'
import { useTranslation } from 'react-i18next'

const { useToken } = theme

export function OptimizerGrid() {
  console.log('======================================================================= RENDER OptimizerGrid')

  const { token } = useToken()
  const { t, i18n } = useTranslation('optimizerTab')
  const optimizerGrid = useRef()
  window.optimizerGrid = optimizerGrid
  const [gridDestroyed, setGridDestroyed] = useState(false)

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const columnDefs = useMemo(() => {
    return statDisplay == 'combat'
      ? getCombatColumnDefs(t)
      : getBaseColumnDefs(t)
  }, [statDisplay, t])

  gridOptions.datasource = datasource

  const navigateToNextCell = useCallback((params) => {
    return arrowKeyGridNavigation(params, optimizerGrid, (selectedNode) => OptimizerTabController.cellClicked(selectedNode))
  }, [])

  useEffect(() => {
    setGridDestroyed(true) // locale updates require the grid to be destroyed and reconstructed in order to take effect
    setTimeout(() => setGridDestroyed(false), 50) // 0 delay doesn't seem to work, can be manually decreased until minimum found
  }, [i18n.resolvedLanguage]) // is minimum delay consistent across users?

  const getLocaleText = useCallback((param) => {
    const localeLookup = {
      to: t('Grid.To'),
      pageSizeSelectorLabel: t('Grid.PageSelectorLabel'),
      of: t('Grid.Of'),
      page: t('Grid.Page'),
    }
    return localeLookup[param.key] ?? param.defaultValue
  }, [t])

  // TODO: I think these things need memos: https://www.ag-grid.com/react-data-grid/react-hooks/
  return (
    <Flex>
      {!gridDestroyed && (
        <div
          id='optimizerGridContainer'
          className='ag-theme-balham-dark'
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
            paginationNumberFormatter={(param) => param.value.toLocaleString(i18n.resolvedLanguage)}
            getLocaleText={getLocaleText}
            navigateToNextCell={navigateToNextCell}
            rowSelection='single'
          />
        </div>
      )}
    </Flex>
  )
}
