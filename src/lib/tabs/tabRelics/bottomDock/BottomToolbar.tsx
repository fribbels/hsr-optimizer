import { Button, Group, SegmentedControl, Select, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { Hint } from 'lib/interactions/hint'
import { relicCardW } from 'lib/constants/constantsUi'
import { useRelicById } from 'lib/stores/relic/relicStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import {
  InsightCharacters,
  RelicInsights,
  useRelicsTabStore,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { TooltipImage } from 'lib/ui/TooltipImage'

export function BottomToolbar() {
  const { selectedRelicId, selectedRelicsIds, insightsMode, setInsightsMode, insightsCharacters, setInsightsCharacters } = useRelicsTabStore(
    useShallow((s) => ({
      selectedRelicId: s.selectedRelicId,
      selectedRelicsIds: s.selectedRelicsIds,
      insightsMode: s.insightsMode,
      setInsightsMode: s.setInsightsMode,
      insightsCharacters: s.insightsCharacters,
      setInsightsCharacters: s.setInsightsCharacters,
    })),
  )

  const isLiveImport = useScannerState((s) => s.ingest)
  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar' })
  const { t: tCommon } = useTranslation('common')

  const selectedRelic = useRelicById(selectedRelicId)

  const relicInsightOptions = useMemo(() => [
    { value: String(RelicInsights.Buckets), label: t('InsightOptions.Buckets') },
    { value: String(RelicInsights.Top10), label: t('InsightOptions.Top10') },
    { value: String(RelicInsights.ESTBP), label: t('InsightOptions.ESTBP') },
  ], [t])

  const characterPlotOptions = useMemo(() => [
    { value: String(InsightCharacters.All), label: t('PlotOptions.PlotAll') },
    { value: String(InsightCharacters.Custom), label: t('PlotOptions.PlotCustom') },
    { value: String(InsightCharacters.Owned), label: t('PlotOptions.PlotOwned') },
  ], [t])

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Group gap={5}>
        <RelicLocator relic={selectedRelic} compact style={{ width: relicCardW, outline: 'none', border: '1px solid var(--border-default)', height: 30 }} />
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

      <Group gap={5}>
        <TooltipImage type={Hint.relicInsight()} />
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
      </Group>
    </div>
  )
}
