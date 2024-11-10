import { AgGridReact } from 'ag-grid-react'
import { Flex, theme } from 'antd'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { getGridTheme } from 'lib/rendering/theme'
import DB from 'lib/state/db'
import {
  getBasicColumnDefs,
  getCombatColumnDefs,
  optimizerGridDefaultColDef,
  optimizerGridOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const { useToken } = theme

export function OptimizerGrid() {
  console.log('======================================================================= RENDER OptimizerGrid')

  const { token } = useToken()
  const { t, i18n } = useTranslation('optimizerTab')
  const optimizerGrid = useRef()
  const [gridDestroyed, setGridDestroyed] = useState(false)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  window.optimizerGrid = optimizerGrid

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const columnDefs = useMemo(() => {
    let columnDefinitions = statDisplay == 'combat'
      ? getCombatColumnDefs(t)
      : getBasicColumnDefs(t)

    if (optimizerTabFocusCharacter) {
      const hiddenColumns = DB.getMetadata().characters[optimizerTabFocusCharacter].scoringMetadata.hiddenColumns ?? []
      const hiddenFields = hiddenColumns.map((column) => statDisplay == 'combat'
        ? column.combatGridColumn
        : column.basicGridColumn,
      )

      columnDefinitions = columnDefinitions.filter((column) => !hiddenFields.includes(column.field))
    }

    return columnDefinitions
  }, [optimizerTabFocusCharacter, statDisplay, t])

  optimizerGridOptions.datasource = datasource

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
            defaultColDef={optimizerGridDefaultColDef}
            gridOptions={optimizerGridOptions}
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
