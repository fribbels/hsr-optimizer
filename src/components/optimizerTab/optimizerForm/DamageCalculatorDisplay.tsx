import FormCard from '../FormCard'
import { Button, Flex, Form, Input, Radio, Select, Typography } from 'antd'
import { VerticalDivider } from '../../Dividers'
import InputNumberStyled from './InputNumberStyled'
import { SimulatedBuildsGrid } from "components/optimizerTab/optimizerForm/SimulatedBuildsGrid";
import { HeaderText } from "components/HeaderText";
import { DeleteOutlined, DoubleLeftOutlined, SettingOutlined } from "@ant-design/icons";
import React, { useMemo } from "react";
import { saveStatSimulationBuild } from "lib/statSimulationController";

const { Text } = Typography

enum StatSimulationOptions {
  Disabled = "disabled",
  CharacterStats = 'characterStats',
  SubstatTotals = 'substatTotals',
  SubstatRolls = 'substatRolls',
}

export const STAT_SIMULATION_ROW_HEIGHT = 425
export const STAT_SIMULATION_GRID_WIDTH = 600
export const STAT_SIMULATION_OPTIONS_WIDTH = 225
export const STAT_SIMULATION_STATS_WIDTH = 225

export function DamageCalculatorDisplay() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large' height={STAT_SIMULATION_ROW_HEIGHT}>
      <Flex gap={15}>
        <Flex vertical gap={15}>
          <Radio.Group
            onChange={(e) => {
              const { target: { value } } = e
              setStatSimulationDisplay(value)
            }}
            optionType="button"
            buttonStyle="solid"
            value={statSimulationDisplay}
            style={{ width: `${STAT_SIMULATION_GRID_WIDTH}px`, display: 'flex' }}
          >
            <Radio style={{ display: 'flex', flex: 0.6, justifyContent: 'center', paddingInline: 0 }} value={StatSimulationOptions.Disabled}>Off</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimulationOptions.CharacterStats}>Character stats</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimulationOptions.SubstatTotals}>Substat totals</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimulationOptions.SubstatRolls}>Substat rolls</Radio>
          </Radio.Group>

          <Flex flex={1} style={{minHeight: STAT_SIMULATION_ROW_HEIGHT - 75}}>
            <SimulatedBuildsGrid />
          </Flex>
        </Flex>

        <Flex vertical justify='space-around'>
          <Flex vertical gap={10} >
            <Button type="primary" style={{width: 35, height: 100, padding: 0}} onClick={saveStatSimulationBuild}>
              <DoubleLeftOutlined />
            </Button>
            <Button type="dashed" style={{width: 35, height: 35, padding: 0}}>
              <DeleteOutlined />
            </Button>
          </Flex>
        </Flex>

        <SimulationInputs />
      </Flex>
    </FormCard>
  )
}

function SimulationInputs() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  const renderedOptions = useMemo(() => {
    switch(statSimulationDisplay) {
      case StatSimulationOptions.CharacterStats:
        return (
          <>
            <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
              <HeaderText>Character stat options</HeaderText>
              <Form.Item>
                <Input placeholder='Build name (Optional)' />
              </Form.Item>

              <SetsSection />

              <HeaderText>Options</HeaderText>
              <Button
                onClick={() => setConditionalSetEffectsDrawerOpen(true)}
                icon={<SettingOutlined />}
              >
                Conditional set effects
              </Button>
            </Flex>

            <VerticalDivider />

            <CharacterStatsSection />
          </>
        )
      case StatSimulationOptions.SubstatTotals:
        return (
          <>
            <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
              <HeaderText>Character stat options</HeaderText>
              <Input placeholder='Build name (Optional)' />

              <SetsSection />
              <MainStatsSection />

              <HeaderText>Options</HeaderText>
              <Button
                onClick={() => setConditionalSetEffectsDrawerOpen(true)}
                icon={<SettingOutlined />}
              >
                Conditional set effects
              </Button>
            </Flex>

            <VerticalDivider />

            <SubstatsSection simType={StatSimulationOptions.SubstatTotals} />
          </>
        )
      case StatSimulationOptions.SubstatRolls:
        return (
          <>
            <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
              <HeaderText>Character stat options</HeaderText>
              <Input placeholder='Build name (Optional)' />

              <SetsSection />
              <MainStatsSection />

              <HeaderText>Options</HeaderText>
              <Button
                onClick={() => setConditionalSetEffectsDrawerOpen(true)}
                icon={<SettingOutlined />}
              >
                Conditional set effects
              </Button>
              <Select placeholder='Roll quality' />
            </Flex>

            <VerticalDivider />

            <SubstatsSection simType={StatSimulationOptions.SubstatRolls} />
          </>
        )
      default:
        return (
          <>
          </>
        )
    }
  }, [statSimulationDisplay])

  return (
    <Flex style={{minHeight: 300}} gap={15}>
      {renderedOptions}
    </Flex>
  )
}


function SetsSection() {
  return (
    <>
      <HeaderText>Sets</HeaderText>
      <Select placeholder='Relic set'/>
      <Select placeholder='Ornament set'/>
    </>
  )
}

function MainStatsSection() {
  return (
    <>
      <HeaderText>Main stats</HeaderText>
      <Flex vertical gap={5}>
        <Flex gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
          <Select placeholder='Body' style={{flex: 1}}/>
          <Select placeholder='Feet' style={{flex: 1}}/>
        </Flex>
        <Flex gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
          <Select placeholder='Rope' style={{flex: 1}}/>
          <Select placeholder='Sphere' style={{flex: 1}}/>
        </Flex>
      </Flex>
    </>
  )
}

function CharacterStatsSection() {
  return (
    <>
      <Flex vertical gap={5}>
        <HeaderText>Substat rolls</HeaderText>
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Hp" label="HP" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Atk" label="ATK" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Def" label="DEF" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Cr" label="Crit Rate %" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Cd" label="Crit DMG %" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Spd" label="SPD" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Ehr" label="Effect Hit Rate" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Res" label="Effect RES" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Be" label="Break Effect" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Ohb" label="Healing Boost" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Err" label="Energy Regen" />
        <StatInput simType={StatSimulationOptions.CharacterStats} name="Elem" label="Elemental DMG %" />
      </Flex>
    </>
  )
}

function SubstatsSection(props: { simType: string }) {
  return (
    <>
      <Flex vertical gap={5}>
        <HeaderText>Substat rolls</HeaderText>
        <StatInput simType={props.simType} name="Hp" label="HP" />
        <StatInput simType={props.simType} name="Atk" label="ATK" />
        <StatInput simType={props.simType} name="Def" label="DEF" />
        <StatInput simType={props.simType} name="HpP" label="HP %" />
        <StatInput simType={props.simType} name="AtkP" label="ATK %" />
        <StatInput simType={props.simType} name="DefP" label="DEF %" />
        <StatInput simType={props.simType} name="Cr" label="Crit Rate %" />
        <StatInput simType={props.simType} name="Cd" label="Crit DMG %" />
        <StatInput simType={props.simType} name="Spd" label="SPD" />
        <StatInput simType={props.simType} name="Ehr" label="Effect Hit Rate" />
        <StatInput simType={props.simType} name="Res" label="Effect RES" />
        <StatInput simType={props.simType} name="Be" label="Break Effect" />
      </Flex>
    </>
  )
}

function StatInput(props: {label: string, name: string, simType: string}) {
  return (
    <Flex justify="space-between" style={{width: STAT_SIMULATION_STATS_WIDTH}}>
      <Text>
        {props.label}
      </Text>
      <Form.Item name={formName(props.simType, 'sim' + props.name)}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
    </Flex>
  )
}

function formName(str1: string, str2?: string): string[] {
  return str2 ? ['statSim', str1, str2] : ['statSim', str1]
}
