import { Table, TableColumnsType } from 'antd'
import { Key, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { STAT_SIMULATION_GRID_WIDTH } from "components/optimizerTab/optimizerForm/DamageCalculatorDisplay";
import { deleteStatSimulationBuild } from "lib/statSimulationController";

interface DataType {
  key: React.Key;
  name: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Build name',
    dataIndex: 'name',
    fixed: 'left',
    width: '560'
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

const data: DataType[] = [];
for (let i = 0; i < 22; i++) {
  data.push({
    name: 'Build ' + i,
    key: i
  })
}

export function SimulatedBuildsGrid(props: { data?: any }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const statSimulations = window.store((s) => s.statSimulations)
  const selectedStatSimulations = window.store((s) => s.selectedStatSimulations)
  const setSelectedStatSimulations = window.store((s) => s.setSelectedStatSimulations)
  // const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)

  return (
    <Table
      rowSelection={{
        selectedRowKeys: selectedStatSimulations,
        type: 'radio',
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        columnWidth: 0,
        renderCell: () => "", // Render nothing for the selection column
      }}
      columns={columns}
      dataSource={statSimulations}
      onRow={(record) => ({
        onClick: () => {
          setSelectedStatSimulations(record.key != null ? [record.key] : [])
          console.log('Change', record)
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
