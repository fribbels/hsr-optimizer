import {
  IRowNode,
  NavigateToNextCellParams,
  RowClickedEvent,
  RowDoubleClickedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { Relic } from 'types/relic'

export const RelicsTabController = {
  rowClickedListener(node: IRowNode<Relic>) {
    node.setSelected(true, true)
  },
  onRowClicked(e: RowClickedEvent<Relic>) {
    if (e.type === 'rowClicked') {
    }
  },

  onRowDoubleClicked(e: RowDoubleClickedEvent<Relic>) {
  },

  onSelectionChanged(e: SelectionChangedEvent<Relic>) {
  },

  navigateToNextCell(params: NavigateToNextCellParams<Relic>) {
    return arrowKeyGridNavigation(params, window.relicsGrid, RelicsTabController.rowClickedListener /* TODO: FIX THIS CALLBACK */)
  },
}
