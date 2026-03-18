import type {
  CellClickedEvent,
  IRowNode,
  NavigateToNextCellParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { Flex } from '@mantine/core'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import type { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { SortOption } from 'lib/optimization/sortOptions'
import { AbilityKind, AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import { Renderer } from 'lib/rendering/renderer'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  DIGITS_5,
  getBasicColumnDefs,
  getCombatColumnDefs,
  getMemoBasicColumnDefs,
  getMemoCombatColumnDefs,
  type OptimizerGridColumnDef,
  optimizerGridDefaultColDef,
  optimizerGridOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useGridLocale, useGridLocaleRebuild } from 'lib/hooks/useGridLocale'
import { useTranslation } from 'react-i18next'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { isRemembrance } from 'lib/tabs/tabOptimizer/sidebar/MemoViewSelect'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { gridStore } from 'lib/utils/gridStore'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'

const defaultHiddenColumns = [
  SortOption.OHB,
]

const GRID_DIMENSIONS = {
  WIDTH: 1302,
  HEIGHT: 600,
  MIN_HEIGHT: 300,
}

export function OptimizerGrid() {
  const { getLocaleText, paginationNumberFormatter } = useGridLocale('optimizerTab', 'Grid')
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Grid' })
  const { gridDestroyed } = useGridLocaleRebuild()
  const optimizerGrid = useRef<AgGridReact<OptimizerDisplayDataStatSim> | null>(null)
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  const context = useOptimizerDisplayStore((s) => s.context)

  useEffect(() => {
    gridStore.setOptimizerGrid(optimizerGrid)
  }, [optimizerGrid])

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = useOptimizerRequestStore((s) => s.statDisplay)
  const memoDisplay = useOptimizerRequestStore((s) => s.memoDisplay)
  const showMemo = memoDisplay === 'memo' && isRemembrance(optimizerTabFocusCharacter)

  const columnDefs = useMemo(() => {
    let columnDefinitions: OptimizerGridColumnDef = statDisplay === 'combat'
      ? (showMemo ? getMemoCombatColumnDefs(t) : getCombatColumnDefs(t))
      : (showMemo ? getMemoBasicColumnDefs(t) : getBasicColumnDefs(t))

    if (optimizerTabFocusCharacter) {
      const scoringMetadata = getGameMetadata().characters[optimizerTabFocusCharacter].scoringMetadata
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

    if (context) {
      // Insert dynamic ability columns before COMBO (last column)
      const comboColumn = columnDefinitions.pop()
      for (const action of context.defaultActions) {
        const meta = AbilityMeta[action.actionType]
        if (meta && action.actionType !== AbilityKind.NULL) {
          columnDefinitions.push({
            field: action.actionName as any,
            valueFormatter: Renderer.floor,
            minWidth: DIGITS_5,
            flex: 12,
            headerName: t(`Headers.Basic.${action.actionType}` as any) as string,
          })
        }
      }
      if (comboColumn) {
        columnDefinitions.push(comboColumn)
      }
    }

    return columnDefinitions
  }, [optimizerTabFocusCharacter, statDisplay, memoDisplay, context, t])

  optimizerGridOptions.datasource = datasource

  const navigateToNextCell = useCallback((params: NavigateToNextCellParams) => {
    return arrowKeyGridNavigation(
      params,
      optimizerGrid,
      (selectedNode: IRowNode<OptimizerDisplayDataStatSim>) => OptimizerTabController.cellClicked(selectedNode),
    )
  }, [])

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
            width: GRID_DIMENSIONS.WIDTH,
            minHeight: GRID_DIMENSIONS.MIN_HEIGHT,
            height: GRID_DIMENSIONS.HEIGHT,
            resize: 'vertical',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow-flat)',
          }}
        >
          <AgGridReact
            animateRows={false}
            columnDefs={columnDefs}
            defaultColDef={optimizerGridDefaultColDef}
            gridOptions={optimizerGridOptions}
            headerHeight={36}
            onCellClicked={onCellClicked}
            ref={optimizerGrid}
            paginationNumberFormatter={paginationNumberFormatter}
            getLocaleText={getLocaleText}
            navigateToNextCell={navigateToNextCell}
            rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
          />
        </div>
      )}
    </Flex>
  )
}
