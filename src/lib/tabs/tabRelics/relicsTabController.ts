import {
  IRowNode,
  NavigateToNextCellParams,
  RowClickedEvent,
  RowDoubleClickedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community'
import i18next from 'i18next'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { Message } from 'lib/interactions/message'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { Relic } from 'types/relic'

export const RelicsTabController = {
  nodeClickedCallback(node: IRowNode<Relic>) {
    node.setSelected(true, true)
  },
  onRowClicked(e: RowClickedEvent<Relic>) {
    const relic = e.data
    if (!relic) return
    useRelicsTabStore.getState().setSelectedRelics([relic])
  },

  onRowDoubleClicked(e: RowDoubleClickedEvent<Relic>) {
    const relic = e.data
    if (!relic) return
    useRelicsTabStore.getState().setSelectedRelics([relic])
  },

  onSelectionChanged(e: SelectionChangedEvent<Relic>) {
    useRelicsTabStore.getState().setSelectedRelics(e.api.getSelectedRows())
  },

  navigateToNextCell(params: NavigateToNextCellParams<Relic>) {
    return arrowKeyGridNavigation(params, window.relicsGrid, RelicsTabController.nodeClickedCallback)
  },

  deleteClicked(isOpen: boolean) {
    const { selectedRelics, setDeleteConfirmOpen } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelics.length) {
      setDeleteConfirmOpen(false)
      return Message.error(t('NoRelicSelected'))
    }
    setDeleteConfirmOpen(isOpen)
  },

  deleteConfirmed() {
    const { selectedRelics, setSelectedRelics } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelics.length) return Message.error(t('NoRelicSelected'))
    setSelectedRelics([])
    selectedRelics.forEach((r) => DB.deleteRelic(r.id))
    SaveState.delayedSave()
    Message.success(t('DeleteRelicSuccess'))
  },
}
