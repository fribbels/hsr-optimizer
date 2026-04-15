import {
  type IRowNode,
  type NavigateToNextCellParams,
  type RowDoubleClickedEvent,
  type SelectionChangedEvent,
} from 'ag-grid-community'
import i18next from 'i18next'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { Message } from 'lib/interactions/message'
import { RelicModalController } from 'lib/overlays/modals/relicModal/relicModalController'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { type ScoredRelic } from 'lib/relics/scoreRelics'
import * as equipmentService from 'lib/services/equipmentService'
import { SaveState } from 'lib/state/saveState'
import { gridStore } from 'lib/stores/gridStore'
import { getRelicById } from 'lib/stores/relic/relicStore'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import type { Relic } from 'types/relic'

export const RelicsTabController = {
  nodeClickedCallback(node: IRowNode<ScoredRelic>) {
    node.setSelected(true, true)
  },

  onRowDoubleClicked(e: RowDoubleClickedEvent<ScoredRelic>) {
    const relic = e.data
    if (!relic) return
    useRelicsTabStore.getState().setSelectedRelicsIds([relic.id])
    useRelicModalStore.getState().openOverlay({
      selectedRelic: relic,
      onOk: RelicsTabController.onRelicModalOk,
    })
  },

  onSelectionChanged(e: SelectionChangedEvent<ScoredRelic>) {
    useRelicsTabStore.getState().setSelectedRelicsIds((e.api.getSelectedRows() as ScoredRelic[]).map((row) => row.id))
  },

  navigateToNextCell(params: NavigateToNextCellParams<ScoredRelic>) {
    return arrowKeyGridNavigation(params, gridStore.getRelicsGrid()!, RelicsTabController.nodeClickedCallback)
  },

  editClicked() {
    const { selectedRelicId } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelicId) return Message.error(t('NoRelicSelected'))
    const relic = getRelicById(selectedRelicId)
    if (!relic) return
    useRelicModalStore.getState().openOverlay({
      selectedRelic: relic,
      onOk: RelicsTabController.onRelicModalOk,
    })
  },

  addClicked() {
    useRelicsTabStore.getState().setSelectedRelicsIds([])
    useRelicModalStore.getState().openOverlay({
      selectedRelic: null,
      onOk: RelicsTabController.onRelicModalOk,
    })
  },

  deleteConfirmed() {
    const { selectedRelicsIds, setSelectedRelicsIds } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (!selectedRelicsIds.length) return Message.error(t('NoRelicSelected'))
    setSelectedRelicsIds([])
    selectedRelicsIds.forEach((id) => equipmentService.removeRelic(id))
    SaveState.delayedSave()
    Message.success(t('DeleteRelicSuccess'))
  },

  onRelicModalOk(relic: Relic) {
    const { selectedRelicId, setSelectedRelicsIds } = useRelicsTabStore.getState()
    const t = i18next.getFixedT(null, 'relicsTab', 'Messages')
    if (selectedRelicId) {
      const oldRelic = getRelicById(selectedRelicId)
      if (!oldRelic) return
      RelicModalController.onEditOk(oldRelic, relic)
    } else {
      equipmentService.upsertRelicWithEquipment(relic)
      setSelectedRelicsIds([relic.id])
      SaveState.delayedSave()
      Message.success(t('AddRelicSuccess'))

      setTimeout(() => {
        const api = gridStore.relicsGridApi()
        if (!api) return
        const node = api.getRowNode(relic.id)
        if (!node) return
        node.setSelected(true, true)
        api.ensureNodeVisible(node)
      }, 0)
    }
  },
}
