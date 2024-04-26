import { Table, TableColumnsType, theme } from 'antd'
import { Key, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";

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
for (let i = 0; i < 20; i++) {
  data.push({
    name: 'Build ' + i,
    key: i
  })
}

export function SimulatedBuildsGrid(props: { data?: any }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  return (
    <div>
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
          width: 400,
          borderRadius: 8,
          boxShadow: '0 0px 1px #000000'
        }}
        scroll={{
          y: 305
        }}
      />
    </div>
  );
}
