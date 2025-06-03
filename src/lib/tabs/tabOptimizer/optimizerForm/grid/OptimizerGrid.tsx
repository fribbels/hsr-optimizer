import {
  CellClickedEvent,
  GetLocaleTextParams,
  IRowNode,
  NavigateToNextCellParams,
  PaginationNumberFormatterParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import {
  Flex,
  theme,
} from 'antd'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { SortOption } from 'lib/optimization/sortOptions'
import { getGridTheme } from 'lib/rendering/theme'
import DB from 'lib/state/db'
import {
  getBasicColumnDefs,
  getCombatColumnDefs,
  getMemoBasicColumnDefs,
  getMemoCombatColumnDefs,
  OptimizerGridColumnDef,
  optimizerGridDefaultColDef,
  optimizerGridOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { isRemembrance } from 'lib/tabs/tabOptimizer/Sidebar'
import { localeNumber } from 'lib/utils/i18nUtils'
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

const { useToken } = theme

const defaultHiddenColumns = [
  SortOption.OHB,
  SortOption.HEAL,
  SortOption.SHIELD,
  SortOption.MEMO_SKILL,
  SortOption.MEMO_TALENT,
]

export const GRID_DIMENSIONS = {
  WIDTH: 1227,
  HEIGHT: 600,
  MIN_HEIGHT: 300,
}

export function OptimizerGrid() {
  console.log('======================================================================= RENDER OptimizerGrid')

  const { token } = useToken()
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'Grid' })
  const optimizerGrid = useRef<AgGridReact<OptimizerDisplayDataStatSim> | null>(null)
  const [gridDestroyed, setGridDestroyed] = useState(false)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const gridLanguage = useRef(i18n.resolvedLanguage)

  window.optimizerGrid = optimizerGrid

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const memoDisplay = window.store((s) => s.memoDisplay)
  const showMemo = memoDisplay === 'memo' && isRemembrance(optimizerTabFocusCharacter)

  const columnDefs = useMemo(() => {
    let columnDefinitions: OptimizerGridColumnDef = statDisplay === 'combat'
      ? (showMemo ? getMemoCombatColumnDefs(t) : getCombatColumnDefs(t))
      : (showMemo ? getMemoBasicColumnDefs(t) : getBasicColumnDefs(t))

    if (optimizerTabFocusCharacter) {
      const scoringMetadata = DB.getMetadata().characters[optimizerTabFocusCharacter].scoringMetadata
      const hiddenColumns = new Set([...(scoringMetadata.hiddenColumns ?? []), ...defaultHiddenColumns])
      const addedColumns = new Set(scoringMetadata.addedColumns ?? [])

      const hiddenFields = Array.from(hiddenColumns)
        .filter((column) => !addedColumns.has(column)).map((column) =>
          statDisplay === 'combat'
            ? (showMemo ? column.memoCombatGridColumn : column.combatGridColumn)
            : (showMemo ? column.memoBasicGridColumn : column.basicGridColumn)
        )

      columnDefinitions = columnDefinitions.filter((column) => !hiddenFields.includes(column.field))
    }

    return columnDefinitions
  }, [optimizerTabFocusCharacter, statDisplay, memoDisplay, t])

  optimizerGridOptions.datasource = datasource

  const navigateToNextCell = useCallback((params: NavigateToNextCellParams) => {
    return arrowKeyGridNavigation(
      params,
      optimizerGrid as MutableRefObject<AgGridReact<OptimizerDisplayDataStatSim>>,
      (selectedNode: IRowNode<OptimizerDisplayDataStatSim>) => OptimizerTabController.cellClicked(selectedNode),
    )
  }, [])

  useEffect(() => {
    // locale updates require the grid to be destroyed and reconstructed in order to take effect
    if (i18n.resolvedLanguage !== gridLanguage.current) {
      setGridDestroyed(true)
      gridLanguage.current = i18n.resolvedLanguage
      setTimeout(() => setGridDestroyed(false), 100)
    }
  }, [i18n.resolvedLanguage])

  const getLocaleText = useCallback((param: GetLocaleTextParams<OptimizerDisplayDataStatSim>) => {
    const localeLookup: Partial<Record<typeof param['key'], string>> = {
      to: t('To'),
      pageSizeSelectorLabel: t('PageSelectorLabel'),
      of: t('Of'),
      page: t('Page'),
      loadingOoo: t('Loading'),
    }
    return localeLookup[param.key] ?? param.defaultValue
  }, [t])

  const paginationNumberFormatter = useCallback((param: PaginationNumberFormatterParams<OptimizerDisplayDataStatSim>) => {
    return localeNumber(param.value)
  }, [i18n.resolvedLanguage])

  const onCellClicked = useCallback((event: CellClickedEvent<OptimizerDisplayDataStatSim>) => {
    return OptimizerTabController.cellClicked(event.node)
  }, [])

  return (
    <Flex>
      {gridDestroyed && <div style={{ width: GRID_DIMENSIONS.WIDTH, height: GRID_DIMENSIONS.HEIGHT }} />}
      {!gridDestroyed && (
        <div
          id='optimizerGridContainer'
          className='ag-theme-balham-dark'
          style={{
            ...{
              width: GRID_DIMENSIONS.WIDTH,
              minHeight: GRID_DIMENSIONS.MIN_HEIGHT,
              height: GRID_DIMENSIONS.HEIGHT,
              resize: 'vertical',
              overflow: 'hidden',
              boxShadow: cardShadowNonInset,
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
            onCellClicked={onCellClicked}
            ref={optimizerGrid}
            paginationNumberFormatter={paginationNumberFormatter}
            getLocaleText={getLocaleText}
            navigateToNextCell={navigateToNextCell}
            rowSelection='single'
          />
        </div>
      )}
    </Flex>
  )
}
