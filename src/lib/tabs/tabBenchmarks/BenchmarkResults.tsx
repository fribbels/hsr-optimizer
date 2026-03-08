import {
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'
import { Badge, Flex, Table, Tabs, Text } from '@mantine/core'
import chroma from 'chroma-js'
import i18next from 'i18next'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { ComboRotationSummary } from 'lib/characterPreview/summary/ComboRotationSummary'
import { tableStyle } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import {
  ElementName,
  ElementToDamage,
  SubStats,
} from 'lib/constants/constants'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import { getElementalDmgFromContainer } from 'lib/scoring/simScoringUtils'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { Simulation } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { arrowColor } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  currentLocale,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type BenchmarkRow = {
  key: string,
  comboDmg: number,
  deltaPercent: number,
  deltaBaselinePercent: number,
  simRelicSet1: string,
  simRelicSet2: string,
  simOrnamentSet: string,
  simBody: string,
  simFeet: string,
  simPlanarSphere: string,
  simLinkRope: string,

  percentage: number,
  simulation: Simulation,
  orchestrator: BenchmarkSimulationOrchestrator,
}

const PAGE_SIZE = 25

export function BenchmarkResults() {
  const { orchestrators } = useBenchmarksTabStore()

  const { rows100, rows200 } = generateBenchmarkRows(orchestrators)

  return (
    <Flex direction="column" style={{ width: '100%' }}>
      <PercentageTabs dataSource100={rows100} dataSource200={rows200} />
    </Flex>
  )
}

function BenchmarkTable({ dataSource }: { dataSource: BenchmarkRow[] }) {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'ResultsGrid' })
  const tCommon = useMemo(() => i18next.getFixedT(null, 'common', 'Parts'), [])
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)

  const pagedData = dataSource.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(dataSource.length / PAGE_SIZE)

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const statRenderer = renderStat()
  const setsRenderer = renderSets()
  const comboDmgRenderer = renderComboDmg()
  const deltaPercentRenderer = renderDeltaPercent()

  return (
    <div
      style={{
        padding: 8,
        backgroundColor: '#243356',
        border: '1px solid #354b7d',
        borderTop: 'none',
      }}
    >
      <Table
        className='remove-table-bottom-border'
        style={benchmarkTableStyle}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 30 }} />
            <Table.Th style={{ textAlign: 'center', width: 200 }}>{t('Combo')}</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 100 }}>{t('Delta')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{tCommon('Body')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{tCommon('Feet')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{tCommon('PlanarSphere')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{tCommon('LinkRope')}</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 150 }}>{t('Sets')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pagedData.map((row) => {
            const expanded = expandedKeys.has(row.key)
            return (
              <React.Fragment key={row.key}>
                <Table.Tr
                  onClick={() => toggleExpand(row.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    {expanded ? <IconChevronDown /> : <IconChevronRight />}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center', position: 'relative' }}>
                    {comboDmgRenderer(row.comboDmg, row)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {deltaPercentRenderer(row.deltaPercent)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {statRenderer(row.simBody as SubStats)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {statRenderer(row.simFeet as SubStats)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {statRenderer(row.simPlanarSphere as SubStats)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {statRenderer(row.simLinkRope as SubStats)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {setsRenderer(row.simRelicSet1, row)}
                  </Table.Td>
                </Table.Tr>
                {expanded && (
                  <Table.Tr>
                    <Table.Td colSpan={8} style={{ padding: 0 }}>
                      <ExpandedRow row={row} />
                    </Table.Td>
                  </Table.Tr>
                )}
              </React.Fragment>
            )
          })}
        </Table.Tbody>
      </Table>
      {totalPages > 1 && (
        <Flex justify='center' gap={8} style={{ padding: 8 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                padding: '4px 10px',
                cursor: 'pointer',
                background: i === page ? '#1668dc' : '#243356',
                color: '#fff',
                border: '1px solid #354b7d',
                borderRadius: 4,
              }}
            >
              {i + 1}
            </button>
          ))}
        </Flex>
      )}
    </div>
  )
}

function PercentageTabs({ dataSource100, dataSource200 }: { dataSource100: BenchmarkRow[], dataSource200: BenchmarkRow[] }) {
  const spd = dataSource100[0]?.orchestrator.flags.benchmarkBasicSpdTarget
  const { t } = useTranslation('benchmarksTab', { keyPrefix: `ResultsTabs.${spd == null ? 'WithoutSpeed' : 'WithSpeed'}` })
  const items = useMemo(() => [
    {
      key: '100',
      label: t('100', { Speed: TsUtils.precisionRound(spd).toLocaleString(currentLocale()) }),
      children: <BenchmarkTable dataSource={dataSource100} />,
    },
    {
      key: '200',
      label: t('200', { Speed: TsUtils.precisionRound(spd).toLocaleString(currentLocale()) }),
      children: <BenchmarkTable dataSource={dataSource200} />,
    },
  ], [t, spd, dataSource100, dataSource200])

  return (
    <Tabs
      className='benchmark-tabs'
      variant='outline'
      defaultValue='200'
    >
      <Tabs.List style={{ width: '100%', margin: 0 }}>
        {items.map((item) => <Tabs.Tab key={item.key} value={item.key}>{item.label}</Tabs.Tab>)}
      </Tabs.List>
      {items.map((item) => <Tabs.Panel key={item.key} value={item.key}>{item.children}</Tabs.Panel>)}
    </Tabs>
  )
}

function ExpandedRow({ row }: { row: BenchmarkRow }) {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'ResultsPanel' })
  const simulation = row.simulation
  const orchestrator = row.orchestrator
  const result = simulation.result!
  const x = result.x ?? ComputedStatsContainer.fromArrays(result.xa, result.ca)
  const characterId = orchestrator.form!.characterId
  const basicStats = toBasicStatsObject(result.ca)
  const combatStats = x.toComputedStatsObject()
  const element = DB.getMetadata().characters[characterId].element as ElementName
  const elementalDmgValue = ElementToDamage[element]

  combatStats[elementalDmgValue] = getElementalDmgFromContainer(x, element)

  return (
    <Flex style={{ margin: 8 }} gap={10} justify='space-around'>
      <Flex direction="column" style={{ minWidth: 300 }} align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>{t('BasicStats') /* Basic Stats */}</HeaderText>

        <CharacterStatSummary
          characterId={characterId}
          finalStats={basicStats}
          elementalDmgValue={ElementToDamage[element]}
          asyncSimScoringExecution={null}
          simScore={result.simScore}
          showAll={true}
        />
      </Flex>

      <VerticalDivider />

      <Flex direction="column" style={{ minWidth: 300 }} align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>{t('CombatStats') /* Combat Stats */}</HeaderText>

        <CharacterStatSummary
          characterId={characterId}
          finalStats={combatStats}
          elementalDmgValue={ElementToDamage[element]}
          asyncSimScoringExecution={null}
          simScore={result.simScore}
          showAll={true}
        />
      </Flex>

      <VerticalDivider />

      <Flex direction="column" align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>{t('Rolls') /* Substat Rolls */}</HeaderText>

        <SubstatRollsSummary
          simRequest={simulation.request}
          precision={0}
          diminish={row.percentage == 100}
          columns={1}
        />
      </Flex>

      <VerticalDivider />

      <Flex direction="column" align='center' justify='space-between'>
        <Flex direction="column" align='center' gap={5}>
          <HeaderText style={{ fontSize: 16 }}>{t('Combo') /* Combo Rotation */}</HeaderText>
          <ComboRotationSummary simMetadata={orchestrator.metadata} />
        </Flex>

        <Flex direction="column" align='center' gap={5}>
          <HeaderText style={{ fontSize: 16 }}>{t('Damage') /* Ability Damage */}</HeaderText>
          <AbilityDamageSummary simResult={simulation.result!} />
        </Flex>
      </Flex>
    </Flex>
  )
}

function renderStat() {
  const t = i18next.getFixedT(null, 'common', 'ReadableStats')

  return (stat: SubStats) => (
    <Flex align='center' justify='center' gap={2}>
      <img src={Assets.getStatIcon(stat)} style={{ width: ICON_SIZE }} />
      <span>
        {t(stat)}
      </span>
    </Flex>
  )
}

function renderSets() {
  return (_: string, row: BenchmarkRow) => (
    <Flex align='center' justify='center' gap={3}>
      <img src={Assets.getSetImage(row.simRelicSet1)} style={{ width: ICON_SIZE }} />
      <img src={Assets.getSetImage(row.simRelicSet2)} style={{ width: ICON_SIZE }} />
      <span style={{ width: 10 }}></span>
      <img src={Assets.getSetImage(row.simOrnamentSet)} style={{ width: ICON_SIZE }} />
    </Flex>
  )
}

function renderComboDmg() {
  return (n: number, row: BenchmarkRow) => (
    <Flex style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }} align='center'>
      <div
        style={{
          display: 'block',
          width: `${(100 - row.deltaBaselinePercent)}%`,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
          position: 'absolute',
          height: '100%',
          backgroundColor: chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0.70, 0.90, 1])(1 - row.deltaBaselinePercent * 0.01).alpha(0.70).hex(),
          zIndex: 1,
        }}
      />

      <Flex style={{ width: '100%', zIndex: 2 }} justify='center' align='center'>
        <Badge color='#000000aa' style={{ opacity: 1, border: 0, padding: '1px 12px 1px 12px' }}>
          <Text style={{ margin: 0, alignItems: 'center' }}>
            {`${localeNumber_0(n / 1000)}K`}
          </Text>
        </Badge>
      </Flex>
    </Flex>
  )
}

function renderDeltaPercent() {
  return (n: number) => {
    const increase = n <= 0.0001
    const icon = increase ? '⬤' : '▼'
    const color = arrowColor(increase)

    return (
      <Flex align='center' justify='center' gap={5}>
        <span style={{ fontSize: 10, lineHeight: '17px', color: color }}>
          {icon}
        </span>
        {increase ? '' : `-${localeNumber_0(n)}%`}
      </Flex>
    )
  }
}

function aggregateCandidates(candidates: Simulation[], top: number, baseline: number, orchestrator: BenchmarkSimulationOrchestrator, percentage: number) {
  const dataSource: BenchmarkRow[] = candidates.map((simulation: Simulation) => {
    const request = simulation.request
    const comboDmg = simulation.result!.simScore
    const delta = (top - comboDmg) / top

    // Compare the delta relative to the range from [top score to top baseline]
    const deltaBaselinePercent = (top - comboDmg) / (top - baseline)

    const benchmarkRow: BenchmarkRow = {
      ...request,
      key: TsUtils.uuid(),
      comboDmg: comboDmg,
      deltaPercent: delta * 100,
      deltaBaselinePercent: deltaBaselinePercent * 100,
      percentage: percentage,
      simulation: simulation,
      orchestrator: orchestrator,
    }

    return benchmarkRow
  }).sort((a, b) => b.comboDmg - a.comboDmg)

  return dataSource
}

function generateBenchmarkRows(orchestrators: BenchmarkSimulationOrchestrator[]) {
  let rows100: BenchmarkRow[] = []
  let rows200: BenchmarkRow[] = []

  let topBenchmarkSimScore = 0
  let topPerfectionSimScore = 0
  let topBaselineScore = 0

  for (const orchestrator of orchestrators) {
    const benchmarkScore = orchestrator.benchmarkSimResult!.simScore
    const perfectionScore = orchestrator.perfectionSimResult!.simScore
    const baselineScore = orchestrator.baselineSimResult!.simScore

    topBenchmarkSimScore = Math.max(topBenchmarkSimScore, benchmarkScore)
    topPerfectionSimScore = Math.max(topPerfectionSimScore, perfectionScore)
    topBaselineScore = Math.max(topBaselineScore, baselineScore)
  }

  for (const orchestrator of orchestrators) {
    const dataSource100 = aggregateCandidates(orchestrator.benchmarkSimCandidates!, topBenchmarkSimScore, topBaselineScore, orchestrator, 100)
    const dataSource200 = aggregateCandidates(orchestrator.perfectionSimCandidates!, topPerfectionSimScore, topBaselineScore, orchestrator, 200)

    rows100 = rows100.concat(dataSource100)
    rows200 = rows200.concat(dataSource200)
  }

  rows100.sort((a, b) => b.comboDmg - a.comboDmg)
  rows200.sort((a, b) => b.comboDmg - a.comboDmg)

  return { rows100, rows200 }
}

const benchmarkTableStyle = {
  ...tableStyle,
  width: 1200,
}

const ICON_SIZE = 32
