import { CloseOutlined } from '@ant-design/icons'
import { IRowNode } from 'ag-grid-community'
import { Empty, Flex, Table, TableColumnsType } from 'antd'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import { deleteStatSimulationBuild, renderDefaultSimulationName } from 'lib/simulations/statSimulationController'
import { Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { STAT_SIMULATION_GRID_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// FIXME MED

interface DataType {
  key: React.Key
  name: string
  simType: string
  request: object
  hash: string
}

const columns: TableColumnsType<DataType> = [
  {
    title: (<Flex style={{ marginLeft: 5 }}>Simulation details</Flex>),
    dataIndex: 'name',
    fixed: 'left',
    width: '560',
    render: (_, record) => {
      // Show the custom name, otherwise generate one
      return renderDefaultSimulationName(record as Simulation)
    },
    key: 'y',
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    render: (_, record) => {
      return (
        <a
          onClick={() => {
            deleteStatSimulationBuild(record)
          }} style={{ display: 'flex', justifyContent: 'center' }}
        >
          <CloseOutlined/>
        </a>
      )
    },
    width: 36,
    fixed: 'right',
  },
]

function zeroesToNull<T extends Record<string, number | null | undefined>>(obj: T): T {
  for (const [key, value] of Object.entries(obj)) {
    if (value === 0) {
      (obj as Record<string, number | null>)[key] = null
    }
  }
  return obj
}

export function SimulatedBuildsGrid() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulations = window.store((s) => s.statSimulations)
  const selectedStatSimulations = window.store((s) => s.selectedStatSimulations)
  const setSelectedStatSimulations = window.store((s) => s.setSelectedStatSimulations)

  // Links the table -> form & grid
  function updateSimulationForm(key: string) {
    // Check to avoid update loop
    if (selectedStatSimulations[0] != key) {
      setSelectedStatSimulations(key != null ? [key] : [])
    }

    const statSim = statSimulations.find((s) => s.key === key)
    console.log('Syncing matching statSim', statSim)

    if (!statSim) return

    // Match the selected sim on the optimizer grid and select it
    let matchingNode: IRowNode | undefined
    window.optimizerGrid.current!.api.forEachNode((node: IRowNode<OptimizerDisplayData>) => {
      if (node.data?.statSim?.key == statSim.key) {
        matchingNode = node
      }
    })
    if (matchingNode) {
      matchingNode.setSelected(true, true)
    }

    // Update the form with selected sim
    const cloneRequest = TsUtils.clone(statSim.request)
    zeroesToNull(cloneRequest.stats)
    window.optimizerForm.setFieldValue(['statSim', statSim.simType as Exclude<StatSimTypes, StatSimTypes.Disabled>], cloneRequest)
    window.store.getState().setStatSimulationDisplay(statSim.simType)
  }

  useEffect(() => {
    if (selectedStatSimulations.length) {
      updateSimulationForm(selectedStatSimulations[0]!)
    }
  }, [selectedStatSimulations])

  return (
    <Table
      showHeader={false}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('NoStatSimulations')}/* 'No custom stat simulations selected' *//> }}
      rowSelection={{
        selectedRowKeys: selectedStatSimulations as string[],
        type: 'radio',
        columnWidth: 0,
        renderCell: () => '', // Render nothing for the selection column
      }}
      columns={columns}
      dataSource={statSimulations}
      onRow={(record) => ({
        onClick: () => {
          setSelectedStatSimulations(record.key != null ? [record.key] : [])
        },
      })}
      pagination={false}
      size='small'
      style={{
        flex: 1,
        width: STAT_SIMULATION_GRID_WIDTH,
        // borderRadius: 8,
        height: '100%',
        backgroundColor: '#0000001a',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
      scroll={{
        y: 300,
      }}
    />
  )
}
