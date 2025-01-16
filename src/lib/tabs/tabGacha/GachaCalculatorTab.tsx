import { Button, Card, Flex, Form, InputNumber, Radio, Select, SelectProps, theme, Typography } from 'antd'
import { simulateWarps, WarpMilestoneResult, WarpStrategy } from 'lib/tabs/tabGacha/gachaCalculatorController'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import React from 'react'

const { useToken } = theme
const { Text } = Typography

type ChangelogContent = { title: string; date: string; content: string[] }

export default function GachaCalculatorTab(): React.JSX.Element {
  const { token } = useToken()

  const activeKey = window.store((s) => s.activeKey)

  return (
    <Flex vertical style={{ height: 1400 }}>
      <Inputs/>
      <Results/>
    </Flex>
  )
}

function Inputs() {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      initialValues={{
        passes: 0,
        jades: 0,
        income: 'none',
        strategy: WarpStrategy.E0,
        pityCharacter: 0,
        guaranteedCharacter: false,
        pityLightCone: 0,
        guaranteedLightCone: false,
      }}
      style={{
        width: 600,
      }}
    >
      <Card>
        <Flex vertical gap={10}>
          <Flex gap={20}>
            <Flex vertical>
              <HeaderText>Tickets</HeaderText>
              <Form.Item name='passes'>
                <InputNumber/>
              </Form.Item>
            </Flex>
            <Flex vertical>
              <HeaderText>Jade</HeaderText>
              <Form.Item name='jades'>
                <InputNumber/>
              </Form.Item>
            </Flex>
            <Flex vertical>
              <HeaderText>Additional pulls</HeaderText>
              <Form.Item name='income'>
                <Select
                  options={generateIncomeOptions()}
                  style={{ width: 300 }}
                />
              </Form.Item>
            </Flex>
          </Flex>

          <Flex gap={20}>
            <Flex vertical>
              <HeaderText>Strategy</HeaderText>

              <Form.Item name='strategy'>
                <Select
                  options={generateStrategyOptions()}
                  style={{ width: 300 }}
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
              onClick={() => simulateWarps(form.getFieldsValue())}
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

  const chances = Object.entries(warpResult.milestoneResults)
    .map(([label, result]) => <Chance target={label} key={label} result={result}/>)

  console.log(warpResult)

  return (
    <Flex vertical gap={20}>
      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Warp Probabilities
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
      <pre style={{ margin: 0 }}>
        {props.target} — {probabilityDisplay}% chance — {warpsDisplay} warps average
      </pre>
    </Text>
  )
}

function PityInputs(props: { banner: string }) {
  return (
    <Flex gap={20}>
      <Flex vertical>
        <HeaderText>Pity counter</HeaderText>

        <Form.Item name={`pity${props.banner}`}>
          <InputNumber/>
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
  const options: SelectProps['options'] = [
    { value: 'none', label: 'None' },
    { value: 'f2p', label: 'v3.0 F2P: +13,490 jade, +25 tickets' },
    { value: 'express', label: 'v3.0 Express: +17,270 jade, +25 tickets' },
    { value: 'expressbp', label: 'v3.0 Express + BP: +17,950 jade, +29 tickets' },
  ]

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
