import { Divider, Flex, Paper, SegmentedControl, Select, Table } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { UseFormReturnType } from '@mantine/form'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { calculateWarps } from 'lib/tabs/tabWarp/warpCalculatorController'
import { DEFAULT_WARP_TARGET, EidolonLevel, type EnrichedWarpRequest, PlannerMode, SuperimpositionLevel, type WarpRequest, WarpStrategy, type WarpTargetResult } from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import classes from './WarpCalculatorTab.module.css'
import { useWarpScannerSync } from 'lib/tabs/tabWarp/useWarpScannerSync'
import { WarpSettingsPanel } from 'lib/tabs/tabWarp/WarpSettingsPanel'
import { WarpUnifiedTable } from 'lib/tabs/tabWarp/WarpUnifiedTable'
import { PassIcon, toMilestoneRows, WarpMilestoneRows, WarpTableHeader } from 'lib/tabs/tabWarp/WarpMilestoneTable'

export function WarpCalculatorTab() {
  const { t } = useTranslation('warpCalculatorTab')

  return (
    <Flex direction="column" style={{ maxWidth: 950, width: '100%' }} align='center' gap="xl">
      <ColorizedTitleWithInfo
        text={t('SectionTitles.Planner')/* Warp Planner */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/warp-planner.md'
      />

      <WarpPlanner/>
    </Flex>
  )
}

function WarpPlanner() {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const storedWarpRequest = useWarpCalculatorStore((s) => s.request)

  const form = useForm<WarpRequest>({
    initialValues: storedWarpRequest,
    onValuesChange: (values) => {
      useWarpCalculatorStore.getState().setRequest(values)
      SaveState.delayedSave(10_000)
    },
  })

  useWarpScannerSync(form)

  const plannerMode = form.getValues().plannerMode ?? PlannerMode.MULTI

  const warpResult = calculateWarps(
    plannerMode === PlannerMode.SIMPLE
      ? {
        ...form.getValues(),
        targets: [{
          ...DEFAULT_WARP_TARGET,
          id: 'quick-combined',
          targetEidolonLevel: EidolonLevel.E6,
          targetSuperimpositionLevel: SuperimpositionLevel.S5,
          currentEidolonLevel: EidolonLevel.NONE,
          currentSuperimpositionLevel: SuperimpositionLevel.NONE,
        }],
      }
      : form.getValues(),
  )

  return (
    <div className={classes.plannerShell}>
      <Paper style={{ width: '100%', padding: 16 }} withBorder>
        <WarpSettingsPanel form={form}/>

        <SegmentedControl
          fullWidth
          size='sm'
          data={[
            { value: PlannerMode.SIMPLE, label: t('Simple')/* Simple */ },
            { value: PlannerMode.MULTI, label: t('MultiTarget')/* Multi Target */ },
          ]}
          value={plannerMode}
          onChange={(val) => form.setFieldValue('plannerMode', val as PlannerMode)}
        />

        {plannerMode === PlannerMode.SIMPLE && (
          <Flex justify='center' mt={12}>
            <Select
              w={210}
              size='xs'
              leftSection={<span style={{ fontSize: 12, whiteSpace: 'nowrap', paddingLeft: 2 }}>{t('Strategy')/* Strategy */}:</span>}
              leftSectionWidth={62} leftSectionPointerEvents='none'
              styles={{ input: { paddingLeft: 68 } }}
              data={generateStrategyOptions()}
              value={String(form.getValues().strategy)}
              onChange={(val) => { if (val) form.setFieldValue('strategy', Number(val) as WarpStrategy) }}
              comboboxProps={{ keepMounted: false, width: 'target' }}
              allowDeselect={false}
            />
          </Flex>
        )}

        <WarpSummary enriched={warpResult.request}/>

        {plannerMode === PlannerMode.SIMPLE && (
          <QuickResultsTable targetResults={warpResult.targetResults} request={warpResult.request}/>
        )}
        {plannerMode === PlannerMode.MULTI && (
          <WarpUnifiedTable form={form} targetResults={warpResult.targetResults} request={warpResult.request}/>
        )}
      </Paper>
    </div>
  )
}

function QuickResultsTable(props: { targetResults: WarpTargetResult[]; request: EnrichedWarpRequest }) {
  const { targetResults, request } = props

  const allMilestones = targetResults.flatMap((tr) => toMilestoneRows(tr.milestoneResults))

  return (
    <Table className={classes.warpTable} style={{ tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, marginTop: 16 }}>
      <colgroup>
        <col style={{ width: '25%' }}/>
        <col/>
        <col/>
      </colgroup>
      <WarpTableHeader request={request}/>
      <Table.Tbody>
        <WarpMilestoneRows milestones={allMilestones}/>
      </Table.Tbody>
    </Table>
  )
}

function WarpSummary(props: { enriched: EnrichedWarpRequest }) {
  const { enriched } = props

  return (
    <Divider
      mt={20} mb={20}
      label={
        <Flex align='center' gap={4} style={{ fontSize: 16 }}>
          {localeNumberComma(enriched.totalJade)}
          <img style={{ height: 16 }} src={Assets.getJade()}/>
          <span>+</span>
          {localeNumberComma(enriched.passes)}
          <PassIcon/>
          {enriched.additionalPasses > 0 && (
            <>
              <span>+</span>
              {localeNumberComma(enriched.additionalPasses)}
              <PassIcon/>
            </>
          )}
          <span>+</span>
          {localeNumberComma(enriched.totalStarlight)}
          <img style={{ height: 16 }} src={Assets.getStarlight()}/>
          <span>=</span>
          {localeNumberComma(enriched.warps)}
          <PassIcon/>
        </Flex>
      }
      labelPosition='center'
    />
  )
}

function generateStrategyOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'StrategyLabels')
  return [
    { value: String(WarpStrategy.S1), label: t('S1')/* 'S1 first' */ },
    { value: String(WarpStrategy.E0), label: t('E0')/* 'E0 first' */ },
    { value: String(WarpStrategy.E1), label: t('E1')/* 'E1 first' */ },
    { value: String(WarpStrategy.E2), label: t('E2')/* 'E2 first' */ },
    { value: String(WarpStrategy.E3), label: t('E3')/* 'E3 first' */ },
    { value: String(WarpStrategy.E4), label: t('E4')/* 'E4 first' */ },
    { value: String(WarpStrategy.E5), label: t('E5')/* 'E5 first' */ },
    { value: String(WarpStrategy.E6), label: t('E6')/* 'E6 first' */ },
  ]
}
