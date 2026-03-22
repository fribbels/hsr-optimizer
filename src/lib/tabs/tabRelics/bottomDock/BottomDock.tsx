import { Button, Flex, Group, SegmentedControl, Select, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { Hint } from 'lib/interactions/hint'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { relicCardW } from 'lib/constants/constantsUi'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { getRelicById } from 'lib/stores/relicStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import {
  InsightCharacters,
  RelicInsights,
  useRelicsTabStore,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import type { Relic } from 'types/relic'

export function BottomDock() {
  const {
    focusCharacter,
    selectedRelicId,
    selectedRelicsIds,
    setSelectedRelicsIds,
    insightsMode,
    setInsightsMode,
    insightsCharacters,
    setInsightsCharacters,
  } = useRelicsTabStore(
    useShallow((s) => ({
      focusCharacter: s.focusCharacter,
      selectedRelicId: s.selectedRelicId,
      selectedRelicsIds: s.selectedRelicsIds,
      setSelectedRelicsIds: s.setSelectedRelicsIds,
      insightsMode: s.insightsMode,
      setInsightsMode: s.setInsightsMode,
      insightsCharacters: s.insightsCharacters,
      setInsightsCharacters: s.setInsightsCharacters,
    })),
  )

  const { ingest: isLiveImport } = useScannerState()
  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar' })
  const { t: tCommon } = useTranslation('common')

  console.log('[P3/P7/P8/P11] BottomDock RENDER — inline scoring, mixed subscriptions, useScannerState no selector')

  const selectedRelic = getRelicById(selectedRelicId ?? '') ?? null
  const setSelectedRelic = (r: Relic) => setSelectedRelicsIds([r.id])
  const score = (selectedRelic && focusCharacter)
    ? RelicScorer.scoreCurrentRelic(selectedRelic, focusCharacter)
    : undefined

  if (score) console.log('[P3] BottomDock computed score inline — new object ref, RelicPreview memo bypassed')

  const relicInsightOptions: Array<{ value: string; label: string }> = [
    { value: String(RelicInsights.Buckets), label: 'Buckets' },
    { value: String(RelicInsights.Top10), label: 'Top 10' },
    { value: String(RelicInsights.ESTBP), label: 'ESTBP' },
  ]

  const characterPlotOptions: Array<{ value: string; label: string }> = [
    { value: String(InsightCharacters.All), label: t('PlotOptions.PlotAll') },
    { value: String(InsightCharacters.Custom), label: t('PlotOptions.PlotCustom') },
    { value: String(InsightCharacters.Owned), label: t('PlotOptions.PlotOwned') },
  ]

  return (
    <Flex direction="column" gap={10}>
      {/* Button row — full width */}
      <Flex justify="space-between" align="center">
        <Group gap={10}>
          <RelicLocator relic={selectedRelic} compact style={{ width: relicCardW, outline: 'none', border: '1px solid var(--border-color)', height: 30 }} />
          <Button
            variant="default"
            size="xs"
            w={170}
            leftSection={<IconPlus size={14} />}
            disabled={isLiveImport}
            onClick={RelicsTabController.addClicked}
          >
            {t('AddRelic')}
          </Button>
          <Tooltip label={isLiveImport ? t('LiveImportTooltip') : ''} disabled={!isLiveImport}>
            <Button
              variant="default"
              size="xs"
              w={170}
              leftSection={<IconTrash size={14} />}
              disabled={selectedRelicsIds.length === 0 || isLiveImport}
              onClick={() => modals.openConfirmModal({
                title: tCommon('Confirm'),
                children: t('DeleteRelic.Warning', { count: selectedRelicsIds.length }),
                labels: { confirm: tCommon('Yes'), cancel: tCommon('Cancel') },
                centered: true,
                onConfirm: RelicsTabController.deleteConfirmed,
              })}
            >
              {t('DeleteRelic.ButtonText')}
            </Button>
          </Tooltip>
          <Button
            variant="default"
            size="xs"
            w={170}
            leftSection={<IconEdit size={14} />}
            disabled={selectedRelicsIds.length !== 1}
            onClick={RelicsTabController.editClicked}
          >
            {t('EditRelic')}
          </Button>
        </Group>

        <Group gap={10}>
          <SegmentedControl
            size="xs"
            value={String(insightsMode)}
            onChange={(value) => setInsightsMode(Number(value) as RelicInsights)}
            data={relicInsightOptions}
            styles={{ label: { height: 28 } }}
            style={{ width: 260 }}
          />
          <Select
            size="xs"
            w={220}
            value={String(insightsCharacters)}
            onChange={(value) => setInsightsCharacters(Number(value) as InsightCharacters)}
            data={characterPlotOptions}
            comboboxProps={{ keepMounted: false }}
          />
          <TooltipImage type={Hint.relicInsight()} />
        </Group>
      </Flex>

      {/* Relic preview + Insights panel side by side */}
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
        <Flex flex={1}>
          <RelicInsightsPanel />
        </Flex>
      </Flex>
    </Flex>
  )
}
