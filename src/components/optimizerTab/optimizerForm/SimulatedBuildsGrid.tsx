import { Table, TableColumnsType, theme } from 'antd'
import { Key, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import {
  STAT_SIMULATION_GRID_WIDTH,
  STAT_SIMULATION_ROW_HEIGHT
} from "components/optimizerTab/optimizerForm/DamageCalculatorDisplay";

const { useToken } = theme
const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

const panelWidth = 203

interface DataType {
  key: React.Key;
  name: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Build name',
    dataIndex: 'name',
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    render: () => <a><CloseOutlined/></a>,
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

  return (
    <Table
      rowSelection={{
        selectedRowKeys: selectedRowKeys,
        type: 'radio',
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        columnWidth: 0,
        renderCell: () => "", // Render nothing for the selection column
      }}
      columns={columns}
      dataSource={data}
      onRow={(record) => ({
        onClick: () => {
          setSelectedRowKeys(record.key != null ? [record.key] : [])
        }
      })}
      pagination={false}
      size='small'
      style={{
        flex: 1,
        width: STAT_SIMULATION_GRID_WIDTH,
        borderRadius: 8,
        boxShadow: '0 0px 1px #000000'
      }}
      scroll={{
        y: STAT_SIMULATION_ROW_HEIGHT - 115
      }}
    />
  );
}
