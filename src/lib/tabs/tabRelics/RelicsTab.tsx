import {
  Collapse,
  Flex,
} from 'antd'
import { Hint } from 'lib/interactions/hint'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RecentRelics } from 'lib/tabs/tabRelics/RecentRelics'
import RelicFilterBar from 'lib/tabs/tabRelics/RelicFilterBar'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { RelicsGrid } from 'lib/tabs/tabRelics/RelicsGrid'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import { Toolbar } from 'lib/tabs/tabRelics/Toolbar'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

export const TAB_WIDTH = 1460

export default function RelicsTab() {
  const { focusCharacter, selectedRelicId, relicModalOpen, setRelicModalOpen, setSelectedRelicsIds } = useRelicsTabStore()
  const { recentRelics } = useScannerState()
  const selectedRelic = DB.getRelicById(selectedRelicId ?? '') ?? null
  const { t } = useTranslation('relicsTab')
  const setSelectedRelic = (r: Relic) => setSelectedRelicsIds([r.id])
  const score = (selectedRelic && focusCharacter)
    ? RelicScorer.scoreCurrentRelic(selectedRelic, focusCharacter)
    : undefined

  return (
    <Flex style={{ marginBottom: 100, width: TAB_WIDTH }}>
      {
        <RelicModal
          open={relicModalOpen}
          setOpen={setRelicModalOpen}
          onOk={RelicsTabController.onRelicModalOk}
          selectedRelic={selectedRelic}
        />
      }
      <Flex vertical gap={10}>
        <RelicFilterBar />

        {recentRelics.length > 0 && (
          <Collapse
            defaultActiveKey={['1']}
            items={[
              {
                key: '1',
                label: t('RecentlyUpdatedRelics.Header'), /* Recently Updated Relics */
                children: <RecentRelics />,
              },
            ]}
          />
        )}

        <RelicsGrid />

        <Toolbar />

        <Flex gap={10}>
          <RelicPreview
            relic={selectedRelic}
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={setRelicModalOpen}
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
