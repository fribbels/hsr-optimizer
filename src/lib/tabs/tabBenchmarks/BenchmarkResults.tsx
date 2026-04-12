import {
  Badge,
  Flex,
  Table,
  Tabs,
} from '@mantine/core'
import {
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'
import chroma from 'chroma-js'
import i18next from 'i18next'
import { CharacterStatSummary } from 'lib/characterPreview/card/CharacterStatSummary'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import {
  type ElementName,
  ElementToDamage,
  type SubStats,
} from 'lib/constants/constants'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import { getElementalDmgFromContainer } from 'lib/scoring/simScoringUtils'
import type { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { arrowColor } from 'lib/utils/displayUtils'
import {
  currentLocale,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { uuid } from 'lib/utils/miscUtils'
import {
  Fragment,
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import styles from './BenchmarkResults.module.css'

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

export const BenchmarkResults = memo(function BenchmarkResults() {
  const orchestrators = useBenchmarksTabStore((s) => s.orchestrators)

  const { rows100, rows200 } = useMemo(() => generateBenchmarkRows(orchestrators), [orchestrators])

  return (
    <div className={styles.resultsContainer}>
      <PercentageTabs dataSource100={rows100} dataSource200={rows200} />
    </div>
  )
})

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

  return (
    <div className={styles.tableWrapper}>
      <Table
        className={styles.benchmarkTable}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={styles.expandColumn} />
            <Table.Th className={styles.comboColumn}>{t('Combo')}</Table.Th>
            <Table.Th className={styles.deltaColumn}>{t('Delta')}</Table.Th>
            <Table.Th className={styles.centeredColumn}>{tCommon('Body')}</Table.Th>
            <Table.Th className={styles.centeredColumn}>{tCommon('Feet')}</Table.Th>
            <Table.Th className={styles.centeredColumn}>{tCommon('PlanarSphere')}</Table.Th>
            <Table.Th className={styles.centeredColumn}>{tCommon('LinkRope')}</Table.Th>
            <Table.Th className={styles.setsColumn}>{t('Sets')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pagedData.map((row) => {
            const expanded = expandedKeys.has(row.key)
            return (
              <Fragment key={row.key}>
                <Table.Tr
                  onClick={() => toggleExpand(row.key)}
                  className={styles.clickableRow}
                >
                  <Table.Td>
                    {expanded ? <IconChevronDown /> : <IconChevronRight />}
                  </Table.Td>
                  <Table.Td className={styles.comboCellInner}>
                    <ComboDmgCell comboDmg={row.comboDmg} row={row} />
                  </Table.Td>
                  <Table.Td className={styles.centeredCell}>
                    <DeltaPercentCell delta={row.deltaPercent} />
                  </Table.Td>
                  <Table.Td className={styles.centeredCell}>
                    <StatCell stat={row.simBody as SubStats} />
                  </Table.Td>
                  <Table.Td className={styles.centeredCell}>
                    <StatCell stat={row.simFeet as SubStats} />
                  </Table.Td>
                  <Table.Td className={styles.centeredCell}>
                    <StatCell stat={row.simPlanarSphere as SubStats} />
                  </Table.Td>
                  <Table.Td className={styles.centeredCell}>
                    <StatCell stat={row.simLinkRope as SubStats} />
                  </Table.Td>
                  <Table.Td className={styles.centeredCell}>
                    <SetsCell row={row} />
                  </Table.Td>
                </Table.Tr>
                {expanded && (
                  <Table.Tr>
                    <Table.Td colSpan={8} className={styles.expandedCell}>
                      <ExpandedRow row={row} />
                    </Table.Td>
                  </Table.Tr>
                )}
              </Fragment>
            )
          })}
        </Table.Tbody>
      </Table>
      {totalPages > 1 && (
        <Flex justify='center' gap={8} className={styles.paginationBar}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={styles.paginationButton}
              style={{
                background: i === page ? 'var(--color-accent)' : 'var(--layer-1)',
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
      label: t('100', { Speed: precisionRound(spd).toLocaleString(currentLocale()) }),
      children: <BenchmarkTable dataSource={dataSource100} />,
    },
    {
      key: '200',
      label: t('200', { Speed: precisionRound(spd).toLocaleString(currentLocale()) }),
      children: <BenchmarkTable dataSource={dataSource200} />,
    },
  ], [t, spd, dataSource100, dataSource200])

  return (
    <Tabs
      variant='outline'
      defaultValue='200'
      styles={{ tab: { height: 36, paddingInline: 32 } }}
    >
      <Tabs.List className={styles.tabsList}>
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
  const element = getGameMetadata().characters[characterId].element as ElementName
  const elementalDmgValue = ElementToDamage[element]

  combatStats[elementalDmgValue] = getElementalDmgFromContainer(x, element)

  return (
    <Flex className={styles.expandedRow} gap={10} justify='space-around'>
      <Flex direction='column' className={styles.statsColumn} align='center' gap={5}>
        <HeaderText className={styles.sectionHeader}>{t('BasicStats') /* Basic Stats */}</HeaderText>

        <CharacterStatSummary
          characterId={characterId}
          finalStats={basicStats}
          elementalDmgValue={ElementToDamage[element]}
          hasScoring
          simScore={result.simScore}
          showAll={true}
          zebra={true}
        />
      </Flex>

      <VerticalDivider />

      <Flex direction='column' className={styles.statsColumn} align='center' gap={5}>
        <HeaderText className={styles.sectionHeader}>{t('CombatStats') /* Combat Stats */}</HeaderText>

        <CharacterStatSummary
          characterId={characterId}
          finalStats={combatStats}
          elementalDmgValue={ElementToDamage[element]}
          hasScoring
          simScore={result.simScore}
          showAll={true}
          zebra={true}
        />
      </Flex>

      <VerticalDivider />

      <Flex direction='column' align='center' gap={5}>
        <HeaderText className={styles.sectionHeader}>{t('Rolls') /* Substat Rolls */}</HeaderText>

        <SubstatRollsSummary
          simRequest={simulation.request}
          precision={0}
          diminish={row.percentage === 100}
          columns={1}
        />
      </Flex>

      <VerticalDivider />

      <Flex direction='column' align='center' gap={5}>
        <HeaderText className={styles.sectionHeader}>{t('Damage') /* Ability Damage */}</HeaderText>
        <AbilityDamageSummary rotationDamage={simulation.result!.rotationDamage ?? []} />
      </Flex>
    </Flex>
  )
}

function StatCell({ stat }: { stat: SubStats }) {
  return (
    <Flex align='center' justify='center' gap={2}>
      <img src={Assets.getStatIcon(stat)} className={styles.statIcon} />
      <span>{i18next.t(`common:ReadableStats.${stat}`)}</span>
    </Flex>
  )
}

function SetsCell({ row }: { row: BenchmarkRow }) {
  return (
    <Flex align='center' justify='center' gap={3}>
      <img src={Assets.getSetImage(row.simRelicSet1)} className={styles.statIcon} />
      <img src={Assets.getSetImage(row.simRelicSet2)} className={styles.statIcon} />
      <span className={styles.setSpacer}></span>
      <img src={Assets.getSetImage(row.simOrnamentSet)} className={styles.statIcon} />
    </Flex>
  )
}

function ComboDmgCell({ comboDmg, row }: { comboDmg: number, row: BenchmarkRow }) {
  return (
    <Flex className={styles.comboDmgOverlay} align='center'>
      <div
        className={styles.comboDmgBar}
        style={{
          width: `${(100 - row.deltaBaselinePercent)}%`,
          backgroundColor: chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0.70, 0.90, 1])(1 - row.deltaBaselinePercent * 0.01).alpha(0.70).hex(),
        }}
      />

      <Flex className={styles.comboDmgContent} justify='center' align='center'>
        <Badge color='#000000aa' className={styles.comboDmgBadge}>
          <div className={styles.comboDmgText}>
            {`${localeNumber_0(comboDmg / 1000)}K`}
          </div>
        </Badge>
      </Flex>
    </Flex>
  )
}

function DeltaPercentCell({ delta }: { delta: number }) {
  const increase = delta <= 0.0001
  const icon = increase ? '⬤' : '▼'
  const color = arrowColor(increase)

  return (
    <Flex align='center' justify='center' gap={5}>
      <span className={styles.deltaIcon} style={{ color }}>
        {icon}
      </span>
      {increase ? '' : `-${localeNumber_0(delta)}%`}
    </Flex>
  )
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
      key: uuid(),
      comboDmg,
      deltaPercent: delta * 100,
      deltaBaselinePercent: deltaBaselinePercent * 100,
      percentage,
      simulation,
      orchestrator,
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
