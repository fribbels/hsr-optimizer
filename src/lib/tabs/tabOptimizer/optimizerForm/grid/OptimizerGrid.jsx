import { AgGridReact } from 'ag-grid-react'
import { Flex, theme } from 'antd'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { SortOption } from 'lib/optimization/sortOptions'
import { getGridTheme } from 'lib/rendering/theme'
import DB from 'lib/state/db'
import { ExpandedDataPanel } from 'lib/tabs/tabOptimizer/optimizerForm/grid/ExpandedDataPanel'
import {
  getBasicColumnDefs,
  getCombatColumnDefs,
  getMemoBasicColumnDefs,
  getMemoCombatColumnDefs,
  optimizerGridDefaultColDef,
  optimizerGridOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { isRemembrance } from 'lib/tabs/tabOptimizer/Sidebar'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const { useToken } = theme

const defaultHiddenColumns = [
  SortOption.OHB,
  SortOption.HEAL,
  SortOption.SHIELD,
  SortOption.MEMO_SKILL,
]

const DATA_PANEL_HEIGHT = 200

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

  const isFullWidthRow = useCallback((params) => {
    return params.rowNode.rowPinned === 'bottom'
  }, [])
  const getRowHeight = useCallback((params) => {
    if (params.node.rowPinned === 'bottom') return DATA_PANEL_HEIGHT
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const memoDisplay = window.store((s) => s.memoDisplay)
  const hasMemo = isRemembrance(optimizerTabFocusCharacter)
  const showMemo = hasMemo && memoDisplay === 'memo'

  const columnDefs = useMemo(() => {
    let columnDefinitions = statDisplay === 'combat'
      ? (showMemo ? getMemoCombatColumnDefs(t) : getCombatColumnDefs(t))
      : (showMemo ? getMemoBasicColumnDefs(t) : getBasicColumnDefs(t))

    if (optimizerTabFocusCharacter) {
      const scoringMetadata = DB.getMetadata().characters[optimizerTabFocusCharacter].scoringMetadata
      const hiddenColumns = new Set([...(scoringMetadata.hiddenColumns ?? []), ...defaultHiddenColumns])
      const addedColumns = new Set(scoringMetadata.addedColumns ?? [])

      const hiddenFields = Array.from(hiddenColumns)
        .filter((column) => !addedColumns.has(column)).map((column) => statDisplay === 'combat'
          ? (showMemo ? column.memoCombatGridColumn : column.combatGridColumn)
          : (showMemo ? column.memoBasicGridColumn : column.basicGridColumn),
        )

      columnDefinitions = columnDefinitions.filter((column) => !hiddenFields.includes(column.field))
    }

    return columnDefinitions
  }, [optimizerTabFocusCharacter, statDisplay, memoDisplay, t])

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
            isFullWidthRow={isFullWidthRow}
            fullWidthCellRenderer={ExpandedDataPanel}
            getRowHeight={getRowHeight}
            ref={optimizerGrid}
            paginationNumberFormatter={(param) => param.value.toLocaleString(i18n.resolvedLanguage.split('_')[0])}
            getLocaleText={getLocaleText}
            navigateToNextCell={navigateToNextCell}
            rowSelection='single'
          />
        </div>
      )}
    </Flex>
  )
}
