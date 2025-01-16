import { Button, Card, Flex, Form, InputNumber, Radio, Select, SelectProps, Typography } from 'antd'
import { DEFAULT_WARP_REQUEST, simulateWarps, WarpIncome, WarpIncomeValuesMapping, WarpMilestoneResult, WarpStrategy } from 'lib/tabs/tabWarp/warpCalculatorController'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import React, { useMemo } from 'react'

const { Text } = Typography

export default function WarpCalculatorTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  return (
    <Flex vertical style={{ height: 1400 }} align='center'>
      <Flex justify='space-around' style={{ margin: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Warp Calculator (Beta: UI WIP)
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
    return Object.assign({}, DEFAULT_WARP_REQUEST, warpRequest)
  }, [])

  return (
    <Form
      form={form}
      initialValues={initialValues}
      style={{
        width: 600,
      }}
    >
      <Card>
        <Flex vertical gap={10}>
          <Flex gap={20} flex={1}>
            <Flex vertical>
              <HeaderText>Warp passes</HeaderText>
              <Form.Item name='passes'>
                <InputNumber placeholder='0' min={0}/>
              </Form.Item>
            </Flex>
            <Flex vertical>
              <HeaderText>Jades</HeaderText>
              <Form.Item name='jades'>
                <InputNumber placeholder='0' min={0}/>
              </Form.Item>
            </Flex>
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
              <HeaderText>Additional warp income</HeaderText>
              <Form.Item name='income'>
                <Select
                  options={generateIncomeOptions()}
                />
              </Form.Item>
            </Flex>
          </Flex>

          <HorizontalDivider>
            Character
          </HorizontalDivider>
          <PityInputs banner='Character'/>

          <HorizontalDivider>
            Light Cone
          </HorizontalDivider>
          <PityInputs banner='LightCone'/>

          <HorizontalDivider/>

          <Flex style={{ width: '100%' }} gap={20}>
            <Button
              type='primary'
              block
              onClick={() => {
                // @ts-ignore
                window.store.getState().setWarpResult(null)
                setTimeout(() => simulateWarps(form.getFieldsValue()), 50)
              }}
            >
              Calculate
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Form>
  )
}

function Results() {
  const warpResult = window.store((s) => s.warpResult)

  if (!warpResult) {
    return <></>
  }

  const chances = Object.entries(warpResult.milestoneResults ?? {})
    .map(([label, result]) => <Chance target={label} key={label} result={result}/>)

  const title = `Warp Probabilities (${warpResult.request.warps} warps)`

  console.log(warpResult)

  return (
    <Flex vertical gap={20} style={{ width: 450 }}>
      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          {title}
        </pre>
      </Flex>

      <Flex vertical gap={10}>
        {chances}
      </Flex>
    </Flex>
  )
}

function Chance(props: { target: string, result: WarpMilestoneResult }) {
  const probabilityDisplay = Utils.truncate100ths(props.result.wins * 100).toFixed(2)
  const warpsDisplay = Math.ceil(props.result.warps)

  return (
    <Text style={{ fontSize: 18 }}>
      <Flex align='center' gap={5} justify='flex-start'>
        <pre style={{ margin: 0, width: 75 }}>
          <Flex justify='space-around'>
            {props.target}
          </Flex>
        </pre>
        <Flex flex={1} justify='flex-end'>
          {probabilityDisplay}% chance
        </Flex>
        <Flex flex={1} justify='flex-end'>
          {warpsDisplay} warps average
        </Flex>
      </Flex>
    </Text>
  )
}

function PityInputs(props: { banner: string }) {
  return (
    <Flex gap={20}>
      <Flex vertical>
        <HeaderText>Pity counter</HeaderText>

        <Form.Item name={`pity${props.banner}`}>
          <InputNumber placeholder='0' min={0} max={props.banner == 'Character' ? 89 : 79}/>
        </Form.Item>
      </Flex>
      <Flex vertical>
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
  const options: SelectProps['options'] = Object.entries(WarpIncomeValuesMapping).map(([incomeType, values]) => ({
    value: incomeType,
    label: incomeType == WarpIncome.NONE
      ? 'None'
      : `[${values.label}] +${values.passes} passes +${values.jades.toLocaleString()} jades`,
  }))

  return options
}

function generateStrategyOptions() {
  const options: SelectProps['options'] = [
    { value: WarpStrategy.S1, label: 'S1 first, then E0' },
    { value: WarpStrategy.E0, label: 'E0 first, then S1' },
    { value: WarpStrategy.E1, label: 'E1 first, then S1' },
    { value: WarpStrategy.E2, label: 'E2 first, then S1' },
    { value: WarpStrategy.E3, label: 'E3 first, then S1' },
    { value: WarpStrategy.E4, label: 'E4 first, then S1' },
    { value: WarpStrategy.E5, label: 'E5 first, then S1' },
    { value: WarpStrategy.E6, label: 'E6 first, then S1' },
  ]

  return options
}
