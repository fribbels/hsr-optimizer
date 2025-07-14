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

  editClicked() {
    const { selectedRelic, setRelicModalOpen } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelic) return Message.error(t('NoRelicSelected') /* No relic selected */)
    setRelicModalOpen(true)
  },

  addClicked() {
    const { setSelectedRelics, setRelicModalOpen } = useRelicsTabStore.getState()
    setSelectedRelics([])
    setRelicModalOpen(true)
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

  onRelicModalOk(relic: Relic) { // TODO: implementation
    const { selectedRelic, selectedRelics, setSelectedRelics } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (selectedRelic) {
      const newRelic = RelicModalController.onEditOk(selectedRelic, relic)
      setSelectedRelics(selectedRelics.map((relic) => relic.id === newRelic.id ? newRelic : relic))
    } else {
      DB.setRelic(relic)
      setSelectedRelics([relic])
      SaveState.delayedSave()
      Message.success(t('AddRelicSuccess') /* Successfully added relic */)
    }
  },
}
