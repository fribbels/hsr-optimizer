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
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
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
    useRelicsTabStore.getState().setSelectedRelicsIds([relic.id])
  },

  onRowDoubleClicked(e: RowDoubleClickedEvent<Relic>) {
    const relic = e.data
    if (!relic) return
    useRelicsTabStore.getState().setSelectedRelicsIds([relic.id])
  },

  onSelectionChanged(e: SelectionChangedEvent<Relic>) {
    useRelicsTabStore.getState().setSelectedRelicsIds((e.api.getSelectedRows() as Relic[]).map((row) => row.id))
  },

  navigateToNextCell(params: NavigateToNextCellParams<Relic>) {
    return arrowKeyGridNavigation(params, window.relicsGrid, RelicsTabController.nodeClickedCallback)
  },

  editClicked() {
    const { selectedRelicId, setRelicModalOpen } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelicId) return Message.error(t('NoRelicSelected') /* No relic selected */)
    setRelicModalOpen(true)
  },

  addClicked() {
    const { setSelectedRelicsIds, setRelicModalOpen } = useRelicsTabStore.getState()
    setSelectedRelicsIds([])
    setRelicModalOpen(true)
  },

  deleteClicked(isOpen: boolean) {
    const { selectedRelicsIds, setDeleteConfirmOpen } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelicsIds.length) {
      setDeleteConfirmOpen(false)
      return Message.error(t('NoRelicSelected'))
    }
    setDeleteConfirmOpen(isOpen)
  },

  deleteConfirmed() {
    const { selectedRelicsIds, setSelectedRelicsIds } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelicsIds.length) return Message.error(t('NoRelicSelected'))
    setSelectedRelicsIds([])
    selectedRelicsIds.forEach((id) => DB.deleteRelic(id))
    SaveState.delayedSave()
    Message.success(t('DeleteRelicSuccess'))
  },

  onRelicModalOk(relic: Relic) {
    const { selectedRelicId, setSelectedRelicsIds } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (selectedRelicId) {
      // edit relic
      const oldRelic = DB.getRelicById(selectedRelicId)
      if (!oldRelic) return
      RelicModalController.onEditOk(oldRelic, relic)
    } else {
      // add new relic
      DB.setRelic(relic)
      setSelectedRelicsIds([relic.id])
      SaveState.delayedSave()
      Message.success(t('AddRelicSuccess') /* Successfully added relic */)
    }
  },
}
