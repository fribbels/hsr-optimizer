// define some handy keycode constants

import {
  CellPosition,
  IRowNode,
  NavigateToNextCellParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { MutableRefObject } from 'react'

// FIXME LOW

const KEY_LEFT = 'ArrowLeft'
const KEY_UP = 'ArrowUp'
const KEY_RIGHT = 'ArrowRight'
const KEY_DOWN = 'ArrowDown'

// https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/
export const arrowKeyGridNavigation = <T>(
  params: NavigateToNextCellParams,
  grid: MutableRefObject<AgGridReact<T>>,
  callback: (x: IRowNode<T>) => void,
): CellPosition | null => {
  const previousCell = params.previousCellPosition
  let nextRowIndex: number, renderedRowCount: number, newSelectedNode: IRowNode<T>

  function selectCell(nextRowIndex: number) {
    if (nextRowIndex >= renderedRowCount || nextRowIndex <= -1) {
      return null
    }

    newSelectedNode = grid.current.api.getDisplayedRowAtIndex(nextRowIndex)!
    grid.current.api.setNodesSelected({ nodes: [newSelectedNode], newValue: true })
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
      renderedRowCount = params.api.getDisplayedRowCount()

      return selectCell(nextRowIndex)
    case KEY_LEFT:
    case KEY_RIGHT:
    default:
      return null
  }
}
