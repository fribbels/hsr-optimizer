import type {
  CellPosition,
  IRowNode,
  NavigateToNextCellParams,
} from 'ag-grid-community'
import type { AgGridReact } from 'ag-grid-react'
import type { RefObject } from 'react'

const KEY_LEFT = 'ArrowLeft'
const KEY_UP = 'ArrowUp'
const KEY_RIGHT = 'ArrowRight'
const KEY_DOWN = 'ArrowDown'

// https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/
export const arrowKeyGridNavigation = <T>(
  params: NavigateToNextCellParams,
  grid: RefObject<AgGridReact<T> | null>,
  callback: (x: IRowNode<T>) => void,
): CellPosition | null => {
  if (!grid.current) return null
  const previousCell = params.previousCellPosition
  const renderedRowCount = params.api.getDisplayedRowCount()

  function selectCell(nextRowIndex: number) {
    if (nextRowIndex >= renderedRowCount || nextRowIndex <= -1) {
      return null
    }

    const newSelectedNode = grid.current!.api.getDisplayedRowAtIndex(nextRowIndex)!
    grid.current!.api.setNodesSelected({ nodes: [newSelectedNode], newValue: true })
    callback(newSelectedNode)

    return {
      rowIndex: nextRowIndex,
      column: previousCell.column,
      rowPinned: previousCell.rowPinned,
    }
  }

  switch (params.key) {
    case KEY_UP:
      return selectCell(previousCell.rowIndex - 1)
    case KEY_DOWN:
      return selectCell(previousCell.rowIndex + 1)
    case KEY_LEFT:
    case KEY_RIGHT:
    default:
      return null
  }
}
