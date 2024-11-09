// define some handy keycode constants

import { CellPosition, NavigateToNextCellParams } from 'ag-grid-community'

const KEY_LEFT = 'ArrowLeft'
const KEY_UP = 'ArrowUp'
const KEY_RIGHT = 'ArrowRight'
const KEY_DOWN = 'ArrowDown'

// https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/
export const arrowKeyGridNavigation = (params: NavigateToNextCellParams, grid, callback): CellPosition | null => {
  const previousCell = params.previousCellPosition
  let nextRowIndex, renderedRowCount, newSelectedNode

  function selectCell(nextRowIndex) {
    if (nextRowIndex >= renderedRowCount || nextRowIndex <= -1) {
      return null
    }

    newSelectedNode = grid.current.api.getDisplayedRowAtIndex(nextRowIndex)
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
