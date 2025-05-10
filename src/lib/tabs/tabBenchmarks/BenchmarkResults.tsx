import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { Flex, Table, TableProps, Tabs, TabsProps, Tag, Typography } from 'antd'
import chroma from 'chroma-js'
import i18next from 'i18next'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { ComboRotationSummary } from 'lib/characterPreview/summary/ComboRotationSummary'
import { tableStyle } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import { ElementToDamage, SubStats } from 'lib/constants/constants'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { toComputedStatsObject } from 'lib/optimization/computedStatsArray'
import { Assets } from 'lib/rendering/assets'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { Simulation } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { arrowColor } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'

const { Text } = Typography

type BenchmarkRow = {
  key: string
  comboDmg: number
  deltaPercent: number
  deltaBaselinePercent: number
  simRelicSet1: string
  simRelicSet2: string
  simOrnamentSet: string
  simBody: string
  simFeet: string
  simPlanarSphere: string
  simLinkRope: string

  percentage: number
  simulation: Simulation
  orchestrator: BenchmarkSimulationOrchestrator
}

const columns: TableProps<BenchmarkRow>['columns'] = [
  {
    title: 'Combo DMG',
    dataIndex: 'comboDmg',
    align: 'center',
    render: renderComboDmg(),
    width: 200,
  },
  {
    title: 'Delta',
    dataIndex: 'deltaPercent',
    align: 'center',
    render: renderDeltaPercent(),
    width: 100,
  },
  {
    title: 'Body',
    dataIndex: 'simBody',
    align: 'center',
    render: renderStat(),
  },
  {
    title: 'Feet',
    dataIndex: 'simFeet',
    align: 'center',
    render: renderStat(),
  },
  {
    title: 'Planar Sphere',
    dataIndex: 'simPlanarSphere',
    align: 'center',
    render: renderStat(),
  },
  {
    title: 'Link Rope',
    dataIndex: 'simLinkRope',
    align: 'center',
    render: renderStat(),
  },
  {
    title: 'Sets',
    dataIndex: 'simRelicSet1',
    align: 'center',
    render: renderSets(),
    width: 150,
  },
]

export function BenchmarkResults() {
  const { orchestrators } = useBenchmarksTabStore()

  const { rows100, rows200 } = generateBenchmarkRows(orchestrators)

  return (
    <Flex vertical>
      <PercentageTabs dataSource100={rows100} dataSource200={rows200}/>
    </Flex>
  )
}

function BenchmarkTable({ dataSource }: { dataSource: BenchmarkRow[] }) {
  const { loading } = useBenchmarksTabStore()

  return (
    <div
      style={{
        padding: 8,
        backgroundColor: '#243356',
        border: '1px solid #354b7d',
        borderTop: 'none',
      }}
    >
      <Table<BenchmarkRow>
        className='remove-table-bottom-border'
        columns={columns}
        dataSource={dataSource}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 25,
          showSizeChanger: false,
        }}
        size='small'
        style={benchmarkTableStyle}
        loading={loading}
        locale={{ emptyText: '' }}
        expandable={{
          expandedRowRender: (row) => <ExpandedRow row={row}/>,
          expandIcon: ({ expanded, onExpand, record }) => {
            return expanded
              ? <CaretDownOutlined onClick={(e) => onExpand(record, e)}/>
              : <CaretRightOutlined onClick={(e) => onExpand(record, e)}/>
          },
          expandRowByClick: true,
        }}
        onRow={() => ({
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}

function PercentageTabs({ dataSource100, dataSource200 }: { dataSource100: BenchmarkRow[]; dataSource200: BenchmarkRow[] }) {
  const spd = dataSource100[0]?.orchestrator.flags.benchmarkBasicSpdTarget
  const suffix = spd == null ? '' : `(${TsUtils.precisionRound(spd)} SPD)`
  const items: TabsProps['items'] = [
    {
      key: '100',
      label: `100% Benchmark Builds ${suffix}`,
      children: <BenchmarkTable dataSource={dataSource100}/>,
    },
    {
      key: '200',
      label: `200% Perfection Builds ${suffix}`,
      children: <BenchmarkTable dataSource={dataSource200}/>,
    },
  ]

  return (
    <Tabs
      className='benchmark-tabs'
      animated
      size='large'
      type='card'
      tabBarGutter={5}
      defaultActiveKey='200'
      items={items}
      tabBarStyle={{ width: '100%', margin: 0 }}
    />
  )
}

function ExpandedRow({ row }: { row: BenchmarkRow }) {
  const simulation = row.simulation
  const orchestrator = row.orchestrator
  const result = simulation.result!
  const characterId = orchestrator.form!.characterId
  const basicStats = toBasicStatsObject(result.ca)
  const combatStats = toComputedStatsObject(result.xa)
  const element = DB.getMetadata().characters[characterId].element

  return (
    <Flex style={{ margin: 8 }} gap={10} justify='space-around'>
      <Flex vertical style={{ minWidth: 300 }} align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>Basic Stats</HeaderText>

        <CharacterStatSummary
          characterId={characterId}
          finalStats={basicStats}
          elementalDmgValue={ElementToDamage[element]}
          asyncSimScoringExecution={null}
          simScore={result.simScore}
          showAll={true}
        />
      </Flex>

      <VerticalDivider/>

      <Flex vertical style={{ minWidth: 300 }} align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>Combat Stats</HeaderText>

        <CharacterStatSummary
          characterId={characterId}
          finalStats={combatStats}
          elementalDmgValue={ElementToDamage[element]}
          asyncSimScoringExecution={null}
          simScore={result.simScore}
          showAll={true}
        />
      </Flex>

      <VerticalDivider/>

      <Flex vertical align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>Substat Rolls</HeaderText>

        <SubstatRollsSummary
          simRequest={simulation.request}
          precision={0}
          diminish={row.percentage == 100}
          columns={1}
        />
      </Flex>

      <VerticalDivider/>

      <Flex vertical align='center' justify='space-between'>
        <Flex vertical align='center' gap={5}>
          <HeaderText style={{ fontSize: 16 }}>Combo Rotation</HeaderText>
          <ComboRotationSummary simMetadata={orchestrator.metadata}/>
        </Flex>

        <Flex vertical align='center' gap={5}>
          <HeaderText style={{ fontSize: 16 }}>Ability Damage</HeaderText>
          <AbilityDamageSummary simResult={simulation.result!}/>
        </Flex>
      </Flex>
    </Flex>
  )
}

function renderStat() {
  const t = i18next.getFixedT(null, 'common')

  return (stat: string) => (
    <Flex align='center' justify='center' gap={2}>
      <img src={Assets.getStatIcon(stat)} style={{ width: ICON_SIZE }}/>
      <span>
        {t(`ReadableStats.${stat as SubStats}`)}
      </span>
    </Flex>
  )
}

function renderSets() {
  return (_: string, row: BenchmarkRow) => (
    <Flex align='center' justify='center' gap={3}>
      <img src={Assets.getSetImage(row.simRelicSet1)} style={{ width: ICON_SIZE }}/>
      <img src={Assets.getSetImage(row.simRelicSet2)} style={{ width: ICON_SIZE }}/>
      <span style={{ width: 10 }}></span>
      <img src={Assets.getSetImage(row.simOrnamentSet)} style={{ width: ICON_SIZE }}/>
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
        <Tag color='#000000aa' style={{ opacity: 1, border: 0, padding: '1px 12px 1px 12px' }}>
          <Text style={{ margin: 0, alignItems: 'center' }}>
            {`${localeNumber_0(n / 1000)}K`}
          </Text>
        </Tag>
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
