import { Button, Card, Flex, Form, InputNumber, Radio, Select, SelectProps, theme, Typography } from 'antd'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import React from 'react'

const { useToken } = theme
const { Text } = Typography

type ChangelogContent = { title: string; date: string; content: string[] }

export default function GachaCalculatorTab(): React.JSX.Element {
  const { token } = useToken()

  const activeKey = window.store((s) => s.activeKey)

  return (
    <Flex vertical>
      <Inputs/>
      <Results/>
    </Flex>
  )
}

function Inputs() {
  return (
    <Form
      style={{
        width: 600,
      }}
    >
      <Card>
        <Flex vertical gap={10}>
          <Flex gap={20}>
            <Flex vertical>
              <HeaderText>Tickets</HeaderText>
              <InputNumber defaultValue={100}/>
            </Flex>
            <Flex vertical>
              <HeaderText>Jade</HeaderText>
              <InputNumber/>
            </Flex>
            <Flex vertical>
              <HeaderText>Additional pulls</HeaderText>
              <Select
                options={generateIncomeOptions()}
                style={{ width: 300 }}
              />
            </Flex>
          </Flex>

          <Flex gap={20}>
            <Flex vertical>
              <HeaderText>Strategy</HeaderText>
              <Select
                options={generateStrategyOptions()}
                style={{ width: 300 }}
              />
            </Flex>

            <Flex vertical>
              <HeaderText>Simulations</HeaderText>
              <Select
                defaultValue={10000}
                options={generateSimulationOptions()}
                style={{ width: 200 }}
              />
            </Flex>
          </Flex>

          <HorizontalDivider>
            Character
          </HorizontalDivider>
          <GuaranteedInputs banner='Character'/>

          <HorizontalDivider>
            Light Cone
          </HorizontalDivider>
          <GuaranteedInputs banner='Light Cone'/>

          <HorizontalDivider>
          </HorizontalDivider>
          <Flex style={{ width: '100%' }} gap={20}>
            <Button type='primary' block>
              Calculate
            </Button>
          </Flex>
        </Flex>
      </Card>


    </Form>
  )
}

function Results() {
  return (
    <Flex vertical gap={20}>
      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Warp Probabilities
        </pre>
      </Flex>

      <Flex vertical gap={10}>
        <Chance target={'E0S0'} probability={100.00}/>
        <Chance target={'E0S1'} probability={100.00}/>
        <Chance target={'E1S1'} probability={85.03}/>
        <Chance target={'E2S1'} probability={40.20}/>
        <Chance target={'E3S1'} probability={9.95}/>
        <Chance target={'E4S1'} probability={1.80}/>
        <Chance target={'E5S1'} probability={0.27}/>
        <Chance target={'E6S1'} probability={0.02}/>
      </Flex>
    </Flex>
  )
}

function Chance(props: { target: string, probability: number }) {
  return (
    <Text style={{ fontSize: 18 }}>
      <pre style={{ margin: 0 }}>
        {props.target} — {props.probability}% chance
      </pre>
    </Text>
  )
}

function GuaranteedInputs(props: { banner: string }) {
  return (
    <Flex gap={20}>
      <Flex vertical>
        <HeaderText>Pity counter</HeaderText>
        <InputNumber/>
      </Flex>
      <Flex vertical>
        <HeaderText>Guaranteed</HeaderText>
        <Radio.Group
          block
          defaultValue={false}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio.Button value={true}>Yes</Radio.Button>
          <Radio.Button value={false}>No</Radio.Button>
        </Radio.Group>
      </Flex>
    </Flex>
  )
}

function generateSimulationOptions() {
  const options: SelectProps['options'] = [
    { value: 10000, label: '100,000' },
    { value: 100000, label: '1,000,000' },
    { value: 1000000, label: '10,000,000' },
  ]

  return options
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
    { value: '0', label: 'S1 first, then character banner' },
    { value: '1', label: 'E0S1 first, then character banner' },
    { value: '2', label: 'E0S0 first, then character banner' },
    { value: '', label: '' },
    { value: '3', label: 'E1S0 first, then character banner' },
    { value: '4', label: 'E2S0 first, then character banner' },
    { value: '5', label: 'E3S0 first, then character banner' },
    { value: '6', label: 'E4S0 first, then character banner' },
    { value: '7', label: 'E5S0 first, then character banner' },
    { value: '8', label: 'E6S0 first, then light cone banner' },
  ]

  return options
}
