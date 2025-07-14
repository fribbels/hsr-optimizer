import {
  Button,
  Flex,
  Popconfirm,
  Select,
  Tooltip,
} from 'antd'
import { Hint } from 'lib/interactions/hint'
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
    selectedRelic,
    selectedRelics,
    insightsMode,
    setInsightsMode,
    insightsCharacters,
    setInsightsCharacters,
    deleteConfirmOpen,
  } = useRelicsTabStore()
  const { ingest: isLiveImport } = useScannerState()
  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar' })
  const { t: tCommon } = useTranslation('common')

  const relicInsightOptions: Array<{ value: RelicInsights, label: string }> = [
    { value: RelicInsights.Buckets, label: t('InsightOptions.Buckets') /* Relic Insight: Buckets */ },
    { value: RelicInsights.Top10, label: t('InsightOptions.Top10') /* Relic Insight: Top 10 */ },
  ]
  const characterPlotOptions: Array<{ value: InsightCharacters, label: string }> = [
    { value: InsightCharacters.All, label: t('PlotOptions.PlotAll') /* Show all characters */ },
    { value: InsightCharacters.Custom, label: t('PlotOptions.PlotCustom') /* Show custom characters */ },
  ]

  return (
    <Flex gap={10} justify='space-between'>
      <Button
        type='primary'
        style={{ width: 170 }}
        disabled={selectedRelics.length !== 1}
        onClick={RelicsTabController.editClicked}
      >
        {t('EditRelic')}
      </Button>

      <Popconfirm
        title={tCommon('Confirm')}
        description={t('DeleteRelic.Warning', { count: selectedRelics.length })}
        placement='bottom'
        okText={tCommon('Yes')}
        cancelText={tCommon('Cancel')}
        onOpenChange={RelicsTabController.deleteClicked}
        onConfirm={RelicsTabController.deleteConfirmed}
        open={deleteConfirmOpen}
      >
        <Tooltip title={isLiveImport ? 'Disabled in live import mode.' : ''}>
          <Button type='primary' style={{ width: 170 }} disabled={selectedRelics.length === 0 || isLiveImport}>
            {t('DeleteRelic.ButtonText') /* Delete relic */}
          </Button>
        </Tooltip>
      </Popconfirm>

      <Tooltip title={isLiveImport ? 'Disabled in live import mode.' : ''}>
        <Button
          type='primary'
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
        value={insightsMode}
        onChange={setInsightsMode}
        options={relicInsightOptions}
        style={{ width: 275 }}
      />
      <Flex style={{ display: 'block' }}>
        <TooltipImage type={Hint.relicInsight()} />
      </Flex>

      <Select
        value={insightsCharacters}
        onChange={setInsightsCharacters}
        options={characterPlotOptions}
        style={{ width: 275 }}
      />
    </Flex>
  )
}
