import { Box, Button, Flex, Group, SegmentedControl, Select, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { Hint } from 'lib/interactions/hint'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
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

  const selectedRelic = getRelicById(selectedRelicId ?? '') ?? null
  const setSelectedRelic = (r: Relic) => setSelectedRelicsIds([r.id])
  const score = (selectedRelic && focusCharacter)
    ? RelicScorer.scoreCurrentRelic(selectedRelic, focusCharacter)
    : undefined

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
    <Flex gap={10}>
      {/* Left: Standard relic preview */}
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

      {/* Right: Insights panel + controls */}
      <Flex direction="column" flex={1} gap={8}>
        {/* Controls row */}
        <Flex justify="space-between" align="center">
          <Group gap={6}>
            <SegmentedControl
              size="xs"
              value={String(insightsMode)}
              onChange={(value) => setInsightsMode(Number(value) as RelicInsights)}
              data={relicInsightOptions}
            />
            <Select
              size="xs"
              w={180}
              value={String(insightsCharacters)}
              onChange={(value) => setInsightsCharacters(Number(value) as InsightCharacters)}
              data={characterPlotOptions}
              comboboxProps={{ keepMounted: false }}
            />
            <TooltipImage type={Hint.relicInsight()} />
          </Group>

          <Group gap={6}>
            <RelicLocator relic={selectedRelic} />
            <TooltipImage type={Hint.relicLocation()} />

            <Button
              variant="default"
              size="xs"
              leftSection={<IconEdit size={14} />}
              disabled={selectedRelicsIds.length !== 1}
              onClick={RelicsTabController.editClicked}
            >
              {t('EditRelic')}
            </Button>

            <Tooltip label={isLiveImport ? t('LiveImportTooltip') : ''} disabled={!isLiveImport}>
              <Button
                variant="default"
                size="xs"
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

            <Tooltip label={isLiveImport ? t('LiveImportTooltip') : ''} disabled={!isLiveImport}>
              <Button
                variant="default"
                size="xs"
                leftSection={<IconPlus size={14} />}
                disabled={isLiveImport}
                onClick={RelicsTabController.addClicked}
              >
                {t('AddRelic')}
              </Button>
            </Tooltip>
          </Group>
        </Flex>

        {/* Insights chart */}
        <RelicInsightsPanel />
      </Flex>
    </Flex>
  )
}
