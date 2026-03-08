import { Button, Flex, Select, Tooltip } from '@mantine/core'
import { PopConfirm } from 'lib/ui/PopConfirm'
import { Hint } from 'lib/interactions/hint'
import DB from 'lib/state/db'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import useRelicsTabStore, {
  InsightCharacters,
  RelicInsights,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'

export function Toolbar() {
  const {
    selectedRelicId,
    selectedRelicsIds,
    insightsMode,
    setInsightsMode,
    insightsCharacters,
    setInsightsCharacters,
    deleteConfirmOpen,
  } = useRelicsTabStore()
  const { ingest: isLiveImport } = useScannerState()
  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar' })
  const { t: tCommon } = useTranslation('common')

  const relicInsightOptions: Array<{ value: string, label: string }> = [
    { value: String(RelicInsights.Buckets), label: t('InsightOptions.Buckets') /* Relic Insight: Buckets */ },
    { value: String(RelicInsights.Top10), label: t('InsightOptions.Top10') /* Relic Insight: Top 10 */ },
    { value: String(RelicInsights.ESTBP), label: t('InsightOptions.ESTBP') /* Relic Insights: ESTBP */ },
  ]
  const characterPlotOptions: Array<{ value: string, label: string }> = [
    { value: String(InsightCharacters.All), label: t('PlotOptions.PlotAll') /* Show all characters */ },
    { value: String(InsightCharacters.Custom), label: t('PlotOptions.PlotCustom') /* Show custom characters */ },
    { value: String(InsightCharacters.Owned), label: t('PlotOptions.PlotOwned') /*  Show owned characters */ },
  ]

  const selectedRelic = DB.getRelicById(selectedRelicId ?? '') ?? null

  return (
    <Flex gap={10} justify='space-between'>
      <Button
        style={{ width: 170 }}
        disabled={selectedRelicsIds.length !== 1}
        onClick={RelicsTabController.editClicked}
      >
        {t('EditRelic')}
      </Button>

      <PopConfirm
        title={tCommon('Confirm')}
        description={t('DeleteRelic.Warning', { count: selectedRelicsIds.length })}
        placement='bottom'
        okText={tCommon('Yes')}
        cancelText={tCommon('Cancel')}
        onOpenChange={RelicsTabController.deleteClicked}
        onConfirm={RelicsTabController.deleteConfirmed}
        open={deleteConfirmOpen}
      >
        <Tooltip label={isLiveImport ? t('LiveImportTooltip') : ''}>
          <Button style={{ width: 170 }} disabled={selectedRelicsIds.length === 0 || isLiveImport}>
            {t('DeleteRelic.ButtonText') /* Delete relic */}
          </Button>
        </Tooltip>
      </PopConfirm>

      <Tooltip label={isLiveImport ? t('LiveImportTooltip') : ''}>
        <Button
          onClick={RelicsTabController.addClicked}
          style={{ width: 170 }}
          disabled={isLiveImport}
        >
          {t('AddRelic') /* Add New Relic */}
        </Button>
      </Tooltip>

      <RelicLocator relic={selectedRelic} />
      <Flex style={{ display: 'block' }}>
        <TooltipImage type={Hint.relicLocation()} />
      </Flex>

      <Select
        value={String(insightsMode)}
        onChange={(value) => setInsightsMode(Number(value) as RelicInsights)}
        data={relicInsightOptions}
        style={{ width: 275 }}
      />
      <Flex style={{ display: 'block' }}>
        <TooltipImage type={Hint.relicInsight()} />
      </Flex>

      <Select
        value={String(insightsCharacters)}
        onChange={(value) => setInsightsCharacters(Number(value) as InsightCharacters)}
        data={characterPlotOptions}
        style={{ width: 275 }}
      />
    </Flex>
  )
}
