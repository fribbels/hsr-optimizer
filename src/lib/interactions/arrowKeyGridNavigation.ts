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
  let nextRowIndex: number, newSelectedNode: IRowNode<T>

  function selectCell(nextRowIndex: number) {
    if (nextRowIndex >= renderedRowCount || nextRowIndex <= -1) {
      return null
    }

    newSelectedNode = grid.current!.api.getDisplayedRowAtIndex(nextRowIndex)!
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
      nextRowIndex = previousCell.rowIndex - 1
      return selectCell(nextRowIndex)
    case KEY_DOWN:
      nextRowIndex = previousCell.rowIndex + 1
      return selectCell(nextRowIndex)
    case KEY_LEFT:
    case KEY_RIGHT:
    default:
      return null
  }
}
