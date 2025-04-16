import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { Flex, Table, TableProps } from 'antd'
import { tableStyle } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { Assets } from 'lib/rendering/assets'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/new/orchestrator/BenchmarkSimulationOrchestrator'
import { Simulation } from 'lib/simulations/new/statSimulationTypes'
import { BenchmarkForm, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'

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
}

export function BenchmarkResults() {
  const {
    benchmarkForm,
    orchestrator,
  } = useBenchmarksTabStore()
  console.log(benchmarkForm, orchestrator)
  if (!benchmarkForm || !orchestrator) return <></>

  const columns: TableProps<BenchmarkRow>['columns'] = [
    {
      title: 'Combo DMG',
      dataIndex: 'comboDmg',
      align: 'center',
      render: renderComboDmg(),
      width: '12.5%',
    },
    {
      title: 'Delta',
      dataIndex: 'deltaPercent',
      align: 'center',
      render: renderDeltaPercent(),
      width: '12.5%',
    },
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
        expandedRowRender: (record) => <div style={{ margin: 0 }}>WIP analysis render</div>,
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

function renderStat() {
  return (stat: string) => (
    <Flex align='center' justify='center' gap={5}>
      <img src={Assets.getStatIcon(stat)} style={{ width: ICON_SIZE }}/>
      <span>
        {stat}
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
  return (n: number) => (
    <Flex align='center' justify='center' gap={5}>
      {n == 0 ? '-' : `-${localeNumber_0(n)}%`}
    </Flex>
  )
}

function generateBenchmarkRows(benchmarkForm: BenchmarkForm, orchestrator: BenchmarkSimulationOrchestrator) {
  const candidates = benchmarkForm.percentage == 200 ? orchestrator.perfectionSimCandidates! : orchestrator.benchmarkSimCandidates!
  const top = orchestrator.perfectionSimResult!.simScore

  const dataSource: BenchmarkRow[] = candidates.map((simulation: Simulation) => {
    const request = simulation.request
    const comboDmg = simulation.result!.simScore
    const delta = (top - comboDmg) / top

    const benchmarkRow: BenchmarkRow = {
      ...request,
      key: TsUtils.uuid(),
      comboDmg: comboDmg,
      deltaPercent: delta * 100,
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
