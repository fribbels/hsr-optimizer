import FormCard from '../FormCard'
import { Button, Flex, Form, Input, Radio, Select, Typography } from 'antd'
import { VerticalDivider } from '../../Dividers'
import InputNumberStyled from './InputNumberStyled'
import { SimulatedBuildsGrid } from "components/optimizerTab/optimizerForm/SimulatedBuildsGrid";
import { HeaderText } from "components/HeaderText";
import { DeleteOutlined, DoubleLeftOutlined } from "@ant-design/icons";

const { Text } = Typography

export function DamageCalculatorDisplay() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large' height={400}>
      <Flex gap={15}>

        <Flex vertical gap={10}>
          <Radio.Group
            onChange={(e) => {
              const { target: { value } } = e
              setStatSimulationDisplay(value)
            }}
            optionType="button"
            buttonStyle="solid"
            value={statSimulationDisplay}
            style={{ width: '400px', display: 'flex' }}
          >
            <Radio style={{ display: 'flex', flex: 0.6, justifyContent: 'center', paddingInline: 0 }} value="off" defaultChecked>Off</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="finalStats">Character stats</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="substatValues">Substat totals</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="substatRolls">Substat rolls</Radio>
          </Radio.Group>

          <SimulatedBuildsGrid />
        </Flex>

        <Flex vertical justify='space-around'>
          <Flex vertical gap={10} >
            <Button type="primary" style={{width: 35, height: 100, padding: 0}}>
              <DoubleLeftOutlined />
            </Button>
            <Button type="dashed" style={{width: 35, height: 35, padding: 0}}>
              <DeleteOutlined />
            </Button>
          </Flex>
        </Flex>

        <Flex vertical gap={5} style={{ width: 200 }}>
          <HeaderText>Character stat options</HeaderText>
          <Input placeholder='Build name' />

          <HeaderText>Sets</HeaderText>
          <Select placeholder='Relic set'/>
          <Select placeholder='Ornament set'/>

          <HeaderText>Main stats</HeaderText>
          <Select placeholder='Body'/>
          <Select placeholder='Feet'/>
          <Select placeholder='Rope'/>
          <Select placeholder='Sphere'/>
        </Flex>

        <VerticalDivider />

        {/*<Flex vertical gap={5}>*/}
        {/*  <HeaderText>Character stats</HeaderText>*/}
        {/*  <StatInput name="Hp" label="HP" />*/}
        {/*  <StatInput name="Atk" label="ATK" />*/}
        {/*  <StatInput name="Def" label="DEF" />*/}
        {/*  <StatInput name="Cr" label="CR" />*/}
        {/*  <StatInput name="Cd" label="CD" />*/}
        {/*  <StatInput name="Spd" label="SPD" />*/}
        {/*  <StatInput name="Ehr" label="EHR" />*/}
        {/*  <StatInput name="Res" label="RES" />*/}
        {/*  <StatInput name="Be" label="BE" />*/}
        {/*  <StatInput name="Ohb" label="HEAL" />*/}
        {/*  <StatInput name="Err" label="ERR" />*/}
        {/*  <StatInput name="Elem" label="DMG %" />*/}
        {/*</Flex>*/}
        {/*<VerticalDivider/>*/}

        <Flex vertical gap={5}>
          <HeaderText>Substat totals</HeaderText>
          <StatInput name="Hp" label="HP" />
          <StatInput name="Atk" label="ATK" />
          <StatInput name="Def" label="DEF" />
          <StatInput name="HpP" label="HP %" />
          <StatInput name="AtkP" label="ATK %" />
          <StatInput name="DefP" label="DEF %" />
          <StatInput name="Cr" label="Crit Rate %" />
          <StatInput name="Cd" label="Crit DMG %" />
          <StatInput name="Spd" label="SPD" />
          <StatInput name="Ehr" label="Effect Hit Rate" />
          <StatInput name="Res" label="Effect RES" />
          <StatInput name="Be" label="Break Effect" />
        </Flex>

      </Flex>
    </FormCard>
  )
}

function StatInput(props: {label: string, name: string}) {
  return (
    <Flex justify="space-between" style={{width: 170}}>
      <Text>
        {props.label}
      </Text>
      <Form.Item name={['statSim', 'sim' + props.name]}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
    </Flex>
  )
}
