import { ThunderboltFilled } from '@ant-design/icons'
import { Button, Card, Flex, Form, InputNumber, Radio, Select, SelectProps, Table, TableProps, Tag, Typography } from 'antd'
import chroma from 'chroma-js'
import { Assets } from 'lib/rendering/assets'
import {
  DEFAULT_WARP_REQUEST,
  NONE_WARP_INCOME_OPTION,
  simulateWarps,
  WarpIncomeDefinition,
  WarpIncomeOptions,
  WarpIncomeType,
  WarpMilestoneResult,
  WarpStrategy,
} from 'lib/tabs/tabWarp/warpCalculatorController'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import React, { useMemo } from 'react'

const { Text } = Typography

export default function WarpCalculatorTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  return (
    <Flex vertical style={{ height: 1400, width: 950 }} align='center'>
      <Flex justify='space-around' style={{ margin: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Warp Planner
        </pre>
      </Flex>

      <Inputs/>

      <Results/>
    </Flex>
  )
}

function Inputs() {
  const warpRequest = window.store((s) => s.warpRequest)
  const [form] = Form.useForm()

  const initialValues = useMemo(() => {
    if (!WarpIncomeOptions.find(option => option.id == warpRequest.income)) {
      warpRequest.income = NONE_WARP_INCOME_OPTION.id
    }
    return Object.assign({}, DEFAULT_WARP_REQUEST, warpRequest)
  }, [])

  return (
    <Form
      form={form}
      initialValues={initialValues}
      style={{
        width: 800,
      }}
    >
      <Card style={{ width: 800 }}>
        <Flex style={{ marginBottom: 30 }}>
          <Flex vertical style={{ flex: 1 }}>
            <Title>
              <Flex justify='center' gap={10}>
                Settings
                <a
                  href='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/warp-planner.md'
                  target='_blank'
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <img src={Assets.getQuestion()} style={{ height: 16, width: 16, opacity: 0.6, marginLeft: 'auto' }}/>
                </a>
              </Flex>
            </Title>

            <Flex vertical gap={16}>
              <Flex gap={50} justify='space-between'>
                <Flex align='flex-end' gap={8} flex={1}>
                  <Flex vertical>
                    <HeaderText>Passes</HeaderText>
                    <Form.Item name='passes'>
                      <InputNumber placeholder='0' min={0} style={{ width: '100%' }} controls={false}/>
                    </Form.Item>
                  </Flex>

                  <img src={Assets.getPass()} style={{ height: 32 }}/>
                </Flex>


                <Flex align='flex-end' gap={8} flex={1}>
                  <Flex vertical>
                    <HeaderText>Jades</HeaderText>
                    <Form.Item name='jades'>
                      <InputNumber placeholder='0' min={0} style={{ width: '100%' }} controls={false}/>
                    </Form.Item>
                  </Flex>
                  <img src={Assets.getJade()} style={{ height: 32 }}/>
                </Flex>
              </Flex>

              <Flex gap={20}>
                <Flex vertical flex={1}>
                  <HeaderText>Strategy</HeaderText>

                  <Form.Item name='strategy'>
                    <Select
                      options={generateStrategyOptions()}
                    />
                  </Form.Item>
                </Flex>
              </Flex>

              <Flex gap={20}>
                <Flex vertical flex={1}>
                  <HeaderText>Additional resources</HeaderText>
                  <Form.Item name='income'>
                    <Select
                      options={generateIncomeOptions()}
                    />
                  </Form.Item>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <VerticalDivider width={40}/>

          <Flex vertical style={{ flex: 1 }} justify='space-between'>
            <Flex vertical>
              <Title>Character</Title>
              <PityInputs banner='Character'/>
            </Flex>

            <Flex vertical>
              <Title>Light Cone</Title>
              <PityInputs banner='LightCone'/>
            </Flex>
          </Flex>
        </Flex>

        <Flex style={{ width: '100%' }} gap={20}>
          <Button
            type='primary'
            block
            style={{ height: 45 }}
            onClick={() => {
              // @ts-ignore
              window.store.getState().setWarpResult(null)
              setTimeout(() => simulateWarps(form.getFieldsValue()), 50)
            }}
            icon={<ThunderboltFilled/>}
          >
            Calculate
          </Button>
        </Flex>
      </Card>
    </Form>
  )
}

function Title(props: { children: React.ReactNode }) {
  return (
    <Typography.Title level={5} style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>
      {props.children}
    </Typography.Title>
  )
}

function Results() {
  const warpResult = window.store((s) => s.warpResult)

  if (!warpResult?.request) {
    return <></>
  }

  const warpTableData: WarpTableData[] = Object.entries(warpResult.milestoneResults ?? {})
    .map(([label, result]) => ({ key: label, warps: result.warps, wins: result.wins }))

  const title = `Results`

  console.log(warpResult)

  const columns: TableProps<WarpMilestoneResult>['columns'] = [
    {
      title: 'Goal',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width: 200,
      render: (key: string, record: WarpMilestoneResult) => (
        <Flex style={{ position: 'relative', marginLeft: 5, height: '100%' }} align='center'>
          <div
            style={{
              display: record.wins < chanceThreshold ? 'none' : 'block',
              width: `${record.wins * 100}%`,
              borderRadius: 4,
              position: 'absolute',
              height: '100%',
              backgroundColor: chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0, 0.33, 1])(record.wins).hex(),
              zIndex: 1,
            }}
          />

          <Flex style={{ width: '100%', zIndex: 2 }} justify='center' align='center'>
            <Tag color={'#000000aa'} style={{ opacity: opacity(record.wins), border: 0, padding: '2px 12px 2px 12px' }}>
              <Text style={{ margin: 0, alignItems: 'center' }}>
                {key}
              </Text>
            </Tag>
          </Flex>
        </Flex>
      ),
    },
    {
      title: (
        <Flex justify='center' align='center' gap={5}>
          {`Success chance with ${warpResult.request.warps.toLocaleString()}`}
          <img style={{ height: 18 }} src={Assets.getPass()}/>
        </Flex>
      ),
      dataIndex: 'wins',
      width: 250,
      align: 'center',
      render: (n: number) => `${Utils.truncate10ths(n * 100).toFixed(1)}%`,
    },
    {
      // title: 'Average # of warps required',
      title: (
        <Flex justify='center' align='center' gap={5}>
          {`Average # of`}
          <img style={{ height: 18 }} src={Assets.getPass()}/>
          {`required`}
        </Flex>
      ),
      dataIndex: 'warps',
      align: 'center',
      width: 250,
      render: (n: number, record: WarpMilestoneResult) => (
        <Flex align='center' justify='center' gap={4}>
          <>
            {`${Math.ceil(n)}`}
            <img style={{ height: 16, opacity: opacity(record.wins) }} src={Assets.getPass()}/>
          </>
        </Flex>
      ),
    },
  ]

  return (
    <Flex vertical gap={20} style={{}} align='center'>
      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          {title}
        </pre>
      </Flex>

      <Text style={{ fontSize: 18 }}>
        <pre style={{ margin: 0 }}>
          <Flex align='center' gap={5}>
            <span>{'Total warps available:'}</span>

            {`( ${warpResult.request.totalJade.toLocaleString()}`}
            <img style={{ height: 18 }} src={Assets.getJade()}/>
            <span>{') + ('}</span>
            {`${warpResult.request.totalPasses.toLocaleString()}`}
            <img style={{ height: 18 }} src={Assets.getPass()}/>
            <span>{') ='}</span>
            {warpResult.request.warps.toLocaleString()}
            <img style={{ height: 18 }} src={Assets.getPass()}/>
          </Flex>
        </pre>
      </Text>

      <Flex vertical gap={10} style={{ width: '100%' }}>
        <Table<WarpMilestoneResult>
          style={{ width: '100%' }}
          columns={columns}
          dataSource={warpTableData}
          pagination={false}
          rowClassName={(record) => `
            warp-table-row 
            ${record.wins < chanceThreshold ? 'warp-table-row-disabled' : ''}
          `}
        />
      </Flex>
    </Flex>
  )
}

const chanceThreshold = 0.001

type WarpTableData = {
  key: string;
} & WarpMilestoneResult

function opacity(n: number) {
  return n < chanceThreshold ? 0.2 : 1.0
}

function PityInputs(props: { banner: string }) {
  return (
    <Flex gap={50} style={{ width: '100%' }}>
      <Flex vertical flex={1}>
        <HeaderText>Pity counter</HeaderText>

        <Form.Item name={`pity${props.banner}`}>
          <InputNumber placeholder='0' min={0} max={props.banner == 'Character' ? 89 : 79} style={{ width: '100%' }} controls={false}/>
        </Form.Item>
      </Flex>
      <Flex vertical flex={1}>
        <HeaderText>Guaranteed</HeaderText>
        <Form.Item name={`guaranteed${props.banner}`}>
          <Radio.Group
            block
            optionType='button'
            buttonStyle='solid'
          >
            <Radio.Button value={true}>Yes</Radio.Button>
            <Radio.Button value={false}>No</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Flex>
    </Flex>
  )
}

function generateIncomeOptions() {
  const options: SelectProps['options'] = WarpIncomeOptions.map((option) => ({
    value: option.id,
    label: option.type == WarpIncomeType.NONE
      ? 'None'
      : (
        <Flex align='center' gap={3}>
          <IncomeOptionLabel option={option}/>
          {`+${option.passes.toLocaleString()}`}
          <img style={{ height: 18 }} src={Assets.getPass()}/>
          {`+${option.jades.toLocaleString()}`}
          <img style={{ height: 18 }} src={Assets.getJade()}/>
        </Flex>
      ),
  }))

  return options
}

function IncomeOptionLabel(props: { option: WarpIncomeDefinition }) {
  return (
    <div style={{ marginRight: 2 }}>
      {`[v${props.option.version} ${props.option.type}]: `}
    </div>
  )
}

function generateStrategyOptions() {
  const options: SelectProps['options'] = [
    { value: WarpStrategy.S1, label: 'S1 first' },
    { value: WarpStrategy.E0, label: 'E0 first' },
    { value: WarpStrategy.E1, label: 'E1 first' },
    { value: WarpStrategy.E2, label: 'E2 first' },
    { value: WarpStrategy.E3, label: 'E3 first' },
    { value: WarpStrategy.E4, label: 'E4 first' },
    { value: WarpStrategy.E5, label: 'E5 first' },
    { value: WarpStrategy.E6, label: 'E6 first' },
  ]

  return options
}
