import { Table, TableColumnsType } from 'antd'
import { CloseOutlined } from "@ant-design/icons";
import { STAT_SIMULATION_GRID_WIDTH } from "components/optimizerTab/optimizerForm/DamageCalculatorDisplay";
import { deleteStatSimulationBuild, renderDefaultSimulationName } from "lib/statSimulationController.tsx";
import { IRowNode } from "ag-grid-community";
import { useEffect } from "react";

interface DataType {
  key: React.Key
  name: string
  simType: string
  request: object
  hash: string
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Build name',
    dataIndex: 'name',
    fixed: 'left',
    width: '560',
    render: (_, record) => {
      // Show the custom name, otherwise generate one
      return record.name || renderDefaultSimulationName(record)
    },
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    render: (_, record) => {
      return (
        <a onClick={() => {
          deleteStatSimulationBuild(record)
        }}>
          <CloseOutlined/>
        </a>
      )
    },
    width: 40,
    fixed: 'right',
  },
];

export function SimulatedBuildsGrid() {
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
    window.optimizerGrid.current!.api.forEachNode((node) => {
      if (node.data.statSim?.key == statSim.key) {
        matchingNode = node
      }
    })
    if (matchingNode) {
      matchingNode.setSelected(true, true)
    }

    // Update the form with selected sim
    window.optimizerForm.setFieldValue(['statSim', statSim.simType], statSim.request)
    window.store.getState().setStatSimulationDisplay(statSim.simType)
  }

  useEffect(() => {
    if (selectedStatSimulations.length) {
      updateSimulationForm(selectedStatSimulations[0])
    }
  }, [selectedStatSimulations])

  return (
    <Table
      rowSelection={{
        selectedRowKeys: selectedStatSimulations,
        type: 'radio',
        columnWidth: 0,
        renderCell: () => "", // Render nothing for the selection column
      }}
      columns={columns}
      dataSource={statSimulations}
      onRow={(record) => ({
        onClick: () => {
          setSelectedStatSimulations(record.key != null ? [record.key] : [])
        }
      })}
      pagination={false}
      size='small'
      style={{
        flex: 1,
        width: STAT_SIMULATION_GRID_WIDTH,
        borderRadius: 8,
        boxShadow: '0 0px 1px #000000',
        height: '100%'
      }}
      scroll={{
        y: 265,
      }}
    />
  );
}
