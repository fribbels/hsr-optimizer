import { Accordion, Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import { useRelicModalStore } from 'lib/overlays/modals/relicModalStore'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { getRelicById } from 'lib/stores/relicStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RecentRelics } from 'lib/tabs/tabRelics/RecentRelics'
import { RelicFilterBar } from 'lib/tabs/tabRelics/RelicFilterBar'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { RelicsGrid } from 'lib/tabs/tabRelics/RelicsGrid'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import { Toolbar } from 'lib/tabs/tabRelics/Toolbar'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { Relic } from 'types/relic'

export const TAB_WIDTH = 1460

export function RelicsTab() {
  const { focusCharacter, selectedRelicId, setSelectedRelicsIds } = useRelicsTabStore(
    useShallow((s) => ({
      focusCharacter: s.focusCharacter,
      selectedRelicId: s.selectedRelicId,
      setSelectedRelicsIds: s.setSelectedRelicsIds,
    })),
  )
  const { recentRelics } = useScannerState()
  const selectedRelic = getRelicById(selectedRelicId ?? '') ?? null
  const { t } = useTranslation('relicsTab')
  const setSelectedRelic = (r: Relic) => setSelectedRelicsIds([r.id])
  const score = (selectedRelic && focusCharacter)
    ? RelicScorer.scoreCurrentRelic(selectedRelic, focusCharacter)
    : undefined

  return (
    <Flex style={{ marginBottom: 100, width: TAB_WIDTH }}>
      <Flex direction="column" gap={10}>
        <RelicFilterBar />

        {recentRelics.length > 0 && (
          <Accordion defaultValue={['1']} multiple>
            <Accordion.Item value="1">
              <Accordion.Control>{t('RecentlyUpdatedRelics.Header') /* Recently Updated Relics */}</Accordion.Control>
              <Accordion.Panel><RecentRelics /></Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}

        <RelicsGrid />

        <Toolbar />

        <Flex gap={10}>
          <RelicPreview
            relic={selectedRelic}
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={(_open, relic) => {
              if (relic) {
                useRelicModalStore.getState().openOverlay({
                  selectedRelic: relic,
                  onOk: RelicsTabController.onRelicModalOk,
                })
              }
            }}
            score={score}
            scoringType={score ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
          />
          <Flex style={{ display: 'block' }}>
            <TooltipImage type={Hint.relics()} />
          </Flex>

          <RelicInsightsPanel />
        </Flex>
      </Flex>
    </Flex>
  )
}
