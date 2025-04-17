import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { Flex, Table, TableProps } from 'antd'
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
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/new/orchestrator/benchmarkSimulationOrchestrator'
import { Simulation } from 'lib/simulations/new/statSimulationTypes'
import DB from 'lib/state/db'
import { BenchmarkForm, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { arrowColor } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'

type BenchmarkRow = {
  key: string
  comboDmg: number
  deltaPercent: number
  simRelicSet1: string
  simRelicSet2: string
  simOrnamentSet: string
  simBody: string
  simFeet: string
  simPlanarSphere: string
  simLinkRope: string

  simulation: Simulation
  benchmarkForm: BenchmarkForm
  orchestrator: BenchmarkSimulationOrchestrator
}

export function BenchmarkResults() {
  const {
    benchmarkForm,
    orchestrator,
    benchmarkCache,
  } = useBenchmarksTabStore()
  console.log(benchmarkCache)
  if (!benchmarkForm || !orchestrator) return <></>

  const columns: TableProps<BenchmarkRow>['columns'] = [
    {
      title: 'Sets',
      dataIndex: 'simRelicSet1',
      align: 'center',
      render: renderSets(),
      width: '15%',
    },
    {
      title: 'Body',
      dataIndex: 'simBody',
      align: 'center',
      render: renderStat(),
      width: '15%',
    },
    {
      title: 'Feet',
      dataIndex: 'simFeet',
      align: 'center',
      render: renderStat(),
      width: '15%',
    },
    {
      title: 'Planar Sphere',
      dataIndex: 'simPlanarSphere',
      align: 'center',
      render: renderStat(),
      width: '15%',
    },
    {
      title: 'Link Rope',
      dataIndex: 'simLinkRope',
      align: 'center',
      render: renderStat(),
      width: '15%',
    },
    {
      title: 'Combo DMG',
      dataIndex: 'comboDmg',
      align: 'center',
      render: renderComboDmg(),
    },
    {
      title: 'Delta',
      dataIndex: 'deltaPercent',
      align: 'center',
      render: renderDeltaPercent(),
    },
  ]

  const dataSource = generateBenchmarkRows(benchmarkForm, orchestrator)

  console.log(dataSource)

  return (
    <Table<BenchmarkRow>
      className='remove-table-bottom-border'
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size='small'
      style={benchmarkTableStyle}
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
        style: { cursor: 'pointer' }, // Change cursor to pointer on hover
      })}
    />
  )
}

function ExpandedRow({ row }: { row: BenchmarkRow }) {
  const simulation = row.simulation
  const orchestrator = row.orchestrator
  const result = simulation.result!
  const benchmarkForm = row.benchmarkForm
  const basicStats = toBasicStatsObject(result.ca)
  const combatStats = toComputedStatsObject(result.xa)
  const element = DB.getMetadata().characters[benchmarkForm.characterId].element

  return (
    <Flex style={{ margin: 8 }} gap={10} justify='space-around'>
      <Flex vertical style={{ minWidth: 300 }} align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>Combat Stats</HeaderText>

        <CharacterStatSummary
          characterId={benchmarkForm.characterId}
          finalStats={basicStats}
          elementalDmgValue={ElementToDamage[element]}
          simScore={result.simScore}
          showAll={true}
        />
      </Flex>

      <VerticalDivider/>

      <Flex vertical style={{ minWidth: 300 }} align='center' gap={5}>
        <HeaderText style={{ fontSize: 16 }}>Combat Stats</HeaderText>

        <CharacterStatSummary
          characterId={benchmarkForm.characterId}
          finalStats={combatStats}
          elementalDmgValue={ElementToDamage[element]}
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
    <Flex align='center' justify='center' gap={5}>
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
  return (n: number) => (
    <Flex align='center' justify='center' gap={5}>
      {`${localeNumber_0(n / 1000)}K`}
    </Flex>
  )
}

function renderDeltaPercent() {
  return (n: number) => {
    const increase = n <= 0
    const icon = increase ? '⬤' : '▼'
    const color = arrowColor(increase)

    return (
      <Flex align='center' justify='center' gap={5}>
        <span style={{ fontSize: 10, lineHeight: '17px', color: color }}>
          {icon}
        </span>
        {n == 0 ? '' : `-${localeNumber_0(n)}%`}
      </Flex>
    )
  }
}

function generateBenchmarkRows(benchmarkForm: BenchmarkForm, orchestrator: BenchmarkSimulationOrchestrator) {
  const candidates = benchmarkForm.percentage == 200 ? orchestrator.perfectionSimCandidates! : orchestrator.benchmarkSimCandidates!
  const top = benchmarkForm.percentage == 200 ? orchestrator.perfectionSimResult!.simScore : orchestrator.benchmarkSimResult!.simScore

  const dataSource: BenchmarkRow[] = candidates.map((simulation: Simulation) => {
    const request = simulation.request
    const comboDmg = simulation.result!.simScore
    const delta = (top - comboDmg) / top

    const benchmarkRow: BenchmarkRow = {
      ...request,
      key: TsUtils.uuid(),
      comboDmg: comboDmg,
      deltaPercent: delta * 100,
      simulation: simulation,
      benchmarkForm: benchmarkForm,
      orchestrator: orchestrator,
    }

    return benchmarkRow
  }).sort((a, b) => b.comboDmg - a.comboDmg)

  return dataSource
}

const benchmarkTableStyle = {
  ...tableStyle,
  width: 1200,
}

const ICON_SIZE = 32
