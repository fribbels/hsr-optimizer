import { useCallback } from 'react'
import { useRelicScore } from 'lib/tabs/tabRelics/bottomDock/useRelicScore'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useRelicById } from 'lib/stores/relic/relicStore'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import type { Relic } from 'types/relic'

export function ScoredRelicPreview() {
  const selectedRelicId = useRelicsTabStore((s) => s.selectedRelicId)
  const focusCharacter = useRelicsTabStore((s) => s.focusCharacter)
  const selectedRelic = useRelicById(selectedRelicId)
  const score = useRelicScore(selectedRelic, focusCharacter)

  const setSelectedRelic = useCallback((r: Relic) => {
    useRelicsTabStore.getState().setSelectedRelicsIds([r.id])
  }, [])

  const setEditModalOpen = useCallback((_open: boolean, relic?: Relic) => {
    if (relic) {
      useRelicModalStore.getState().openOverlay({
        selectedRelic: relic,
        onOk: RelicsTabController.onRelicModalOk,
      })
    }
  }, [])

  return (
    <RelicPreview
      relic={selectedRelic}
      setSelectedRelic={setSelectedRelic}
      setEditModalOpen={setEditModalOpen}
      score={score}
      scoringType={score ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
    />
  )
}
