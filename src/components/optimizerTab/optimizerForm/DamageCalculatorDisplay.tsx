import FormCard from '../FormCard'
import { Flex, Form, Table, Typography } from 'antd'
import { VerticalDivider } from '../../Dividers'
import InputNumberStyled from './InputNumberStyled'

const { Text } = Typography

export function DamageCalculatorDisplay() {
  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large'>
      <Flex gap={10}>
        <Table dataSource={dataSource} columns={columns} size="small"  />

        <VerticalDivider/>

        <Flex>
          <StatInput name="Cd" label="CD" />
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={5}>
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
          <StatInput name="Cd" label="CD" />
        </Flex>
      </Flex>
    </FormCard>
  )
}

function StatInput(props: {label: string, name: string}) {
  return (
    <Flex justify="space-between" style={{width: 150}}>
      <Text>
        {props.label}
      </Text>
      <Form.Item name={props.name}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
    </Flex>
  )
}
