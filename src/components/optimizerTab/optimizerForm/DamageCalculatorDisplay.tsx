import FormCard from '../FormCard'
import { Button, Flex, Form, Input, Popconfirm, Radio, Select, Typography } from 'antd'
import { VerticalDivider } from '../../Dividers'
import InputNumberStyled from './InputNumberStyled'
import { SimulatedBuildsGrid } from "components/optimizerTab/optimizerForm/SimulatedBuildsGrid";
import { HeaderText } from "components/HeaderText";
import { DeleteOutlined, DoubleLeftOutlined, DownOutlined, SettingOutlined, UpOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import {
  deleteAllStatSimulationBuilds,
  importOptimizerBuild,
  saveStatSimulationBuild,
  startOptimizerStatSimulation
} from "lib/statSimulationController.tsx";
import { Parts } from "lib/constants";
import { Assets } from "lib/assets";
import {
  BodyStatOptions,
  FeetStatOptions,
  LinkRopeStatOptions,
  OrnamentSetTagRenderer,
  PlanarSphereStatOptions
} from "components/optimizerTab/optimizerForm/RelicMainSetFilters";
import GenerateOrnamentsOptions from "components/optimizerTab/optimizerForm/OrnamentsOptions";
import { GenerateBasicSetsOptions } from "components/optimizerTab/optimizerForm/SetsOptions";

const { Text } = Typography

export enum StatSimTypes {
  Disabled = "disabled",
  CharacterStats = 'characterStats',
  SubstatTotals = 'substatTotals',
  SubstatRolls = 'substatRolls',
}

export const STAT_SIMULATION_ROW_HEIGHT = 425
export const STAT_SIMULATION_GRID_WIDTH = 680
export const STAT_SIMULATION_OPTIONS_WIDTH = 215
export const STAT_SIMULATION_STATS_WIDTH = 180

export function DamageCalculatorDisplay() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)

  function isHidden() {
    return statSimulationDisplay == StatSimTypes.Disabled || !statSimulationDisplay
  }

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large' height={STAT_SIMULATION_ROW_HEIGHT}>
      <Flex gap={15} style={{height: '100%'}}>
        <Flex vertical gap={15} align='center'>
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
            <Radio style={{ display: 'flex', flex: 0.6, justifyContent: 'center', paddingInline: 0 }} value={StatSimTypes.Disabled}>Off</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimTypes.SubstatRolls}>Simulate substat rolls</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimTypes.SubstatTotals}>Simulate substat totals</Radio>
            {/*<Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimTypes.CharacterStats} disabled>Character stats</Radio>*/}
          </Radio.Group>

          <Flex flex={1}>
            <SimulatedBuildsGrid />
          </Flex>

          <Flex gap={10}>
            <Button style={{width: 200, display: isHidden() ? 'none' : 'block'}} onClick={startOptimizerStatSimulation} icon={<DownOutlined/>}>
              Simulate selected builds
            </Button>
            <Button style={{width: 200, display: isHidden() ? 'none' : 'block'}} onClick={importOptimizerBuild} icon={<UpOutlined/>}>
              Import optimizer build
            </Button>
            <Button style={{width: 200, display: isHidden() ? 'none' : 'block'}} onClick={importOptimizerBuild} icon={<UpOutlined/>}>
              Import optimizer build
            </Button>
          </Flex>
        </Flex>

        <Flex vertical justify='space-around' style={{display: isHidden() ? 'none' : 'flex'}} >
          <Flex vertical gap={10} >
            <Button type="primary" style={{width: 35, height: 100, padding: 0}} onClick={saveStatSimulationBuild}>
              <DoubleLeftOutlined />
            </Button>
            <Popconfirm
              title="Erase stat simulations"
              description="Are you sure you want to clear all of this character's saved simulations?"
              onConfirm={deleteAllStatSimulationBuilds}
              placement="bottom"
              okText="Yes"
              cancelText="Cancel"
            >
              <Button type="dashed" style={{width: 35, height: 35, padding: 0}}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Flex>
        </Flex>

        <SimulationInputs />
      </Flex>
    </FormCard>
  )
}

function SimulationInputs() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  // Hook into changes to the sim to calculate roll sum
  const statSimFormValues = Form.useWatch((values) => values.statSim, window.optimizerForm)
  const substatRollsTotal = useMemo(() => {
    if (!statSimFormValues) return 0

    let sum = 0
    for (const substatName of substatInputNames) {
      const rolls = statSimFormValues.substatRolls
      if (rolls && rolls['sim' + substatName]) {
        sum += rolls['sim' + substatName]
      }
    }
    return sum
  }, [statSimFormValues])

  const renderedOptions = useMemo(() => {
    return (
      <>
        <Form.Item name={formName('simulations')}>
          <Input placeholder='This is a fake hidden input to save simulations into the form' style={{display: 'none'}}/>
        </Form.Item>

        {/*<Flex gap={5} style={{display: statSimulationDisplay == StatSimTypes.CharacterStats ? 'flex' : 'none'}}>*/}
        {/*  <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>*/}
        {/*    <HeaderText>Character stat options</HeaderText>*/}
        {/*    <Form.Item name={formName(StatSimTypes.CharacterStats, 'name')}>*/}
        {/*      <Input placeholder='Build name (Optional)' />*/}
        {/*    </Form.Item>*/}

        {/*    <SetsSection simType={StatSimTypes.CharacterStats} />*/}

        {/*    <HeaderText>Options</HeaderText>*/}
        {/*    <Button*/}
        {/*      onClick={() => setConditionalSetEffectsDrawerOpen(true)}*/}
        {/*      icon={<SettingOutlined />}*/}
        {/*    >*/}
        {/*      Conditional set effects*/}
        {/*    </Button>*/}
        {/*  </Flex>*/}

        {/*  <VerticalDivider />*/}

        {/*  <CharacterStatsSection />*/}
        {/*</Flex>*/}
        <Flex gap={5} style={{display: statSimulationDisplay == StatSimTypes.SubstatTotals ? 'flex' : 'none'}}>
          <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
            <HeaderText>Character stat options</HeaderText>
            <Form.Item name={formName(StatSimTypes.SubstatTotals, 'name')}>
              <Input placeholder='Build name (Optional)' />
            </Form.Item>

            <SetsSection simType={StatSimTypes.SubstatTotals} />
            <MainStatsSection simType={StatSimTypes.SubstatTotals}/>

            <HeaderText>Options</HeaderText>
            <Button
              onClick={() => setConditionalSetEffectsDrawerOpen(true)}
              icon={<SettingOutlined />}
            >
              Conditional set effects
            </Button>
          </Flex>

          <VerticalDivider />

          <SubstatsSection simType={StatSimTypes.SubstatTotals} title='Substat totals'/>
        </Flex>
        <Flex gap={5} style={{display: statSimulationDisplay == StatSimTypes.SubstatRolls ? 'flex' : 'none'}}>
          <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
            <HeaderText>Character stat options</HeaderText>
            <Form.Item name={formName(StatSimTypes.SubstatRolls, 'name')}>
              <Input placeholder='Build name (Optional)' />
            </Form.Item>

            <SetsSection simType={StatSimTypes.SubstatRolls} />
            <MainStatsSection simType={StatSimTypes.SubstatRolls} />

            <HeaderText>Options</HeaderText>
            <Button
              onClick={() => setConditionalSetEffectsDrawerOpen(true)}
              icon={<SettingOutlined />}
            >
              Conditional set effects
            </Button>
            {/*<Select placeholder='Roll quality' />*/}
          </Flex>

          <VerticalDivider />

          <SubstatsSection simType={StatSimTypes.SubstatRolls} title='Substat rolls' total={substatRollsTotal}/>
        </Flex>
        <Flex style={{display: statSimulationDisplay == StatSimTypes.Disabled ? 'flex' : 'none'}}>
          <></>
        </Flex>
      </>
    )
  }, [statSimulationDisplay, substatRollsTotal])

  return (
    <Flex style={{minHeight: 300}}>
      {renderedOptions}
    </Flex>
  )
}

function SetsSection(props: { simType: string }) {
  return (
    <>
      <HeaderText>Sets</HeaderText>
      <Form.Item name={formName(props.simType, 'simRelicSet1')}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={600}
          allowClear
          options={GenerateBasicSetsOptions()}
          tagRender={OrnamentSetTagRenderer}
          placeholder="Relic set"
          maxTagCount="responsive"
        >
        </Select>
      </Form.Item>
      <Form.Item name={formName(props.simType, 'simRelicSet2')}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={600}
          allowClear
          options={GenerateBasicSetsOptions()}
          tagRender={OrnamentSetTagRenderer}
          placeholder="Relic set"
          maxTagCount="responsive"
        >
        </Select>
      </Form.Item>

      <Form.Item name={formName(props.simType, 'simOrnamentSet')}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={600}
          allowClear
          options={GenerateOrnamentsOptions()}
          tagRender={OrnamentSetTagRenderer}
          placeholder="Ornament set"
          maxTagCount="responsive"
        >
        </Select>
      </Form.Item>
    </>
  )
}

function MainStatsSection(props: { simType: string }) {
  return (
    <>
      <HeaderText>Main stats</HeaderText>
      <Flex vertical gap={5}>
        <Flex gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
          <MainStatSelector placeholder='Body' part={Parts.Body} options={BodyStatOptions} simType={props.simType}/>
          <MainStatSelector placeholder='Feet' part={Parts.Feet} options={FeetStatOptions} simType={props.simType}/>
        </Flex>
        <Flex gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
          <MainStatSelector placeholder='Sphere' part={Parts.PlanarSphere} options={PlanarSphereStatOptions} simType={props.simType}/>
          <MainStatSelector placeholder='Rope' part={Parts.LinkRope} options={LinkRopeStatOptions} simType={props.simType}/>
        </Flex>
      </Flex>
    </>
  )
}

function MainStatSelector(props: { simType: string, placeholder: string, part: string, options: any[] }) {
  return (
    <Form.Item name={formName(props.simType, 'sim' + props.part)} style={{flex: 1}}>
      <Select
        placeholder={props.placeholder}
        style={{flex: 1}}
        allowClear
        optionLabelProp="short"
        maxTagCount="responsive"
        suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(props.part)} />}
        options={props.options}
        listHeight={750}
        popupMatchSelectWidth={200}
      />
    </Form.Item>
  )
}

function CharacterStatsSection() {
  return (
    <>
      <Flex vertical gap={5}>
        <HeaderText>Character display stats</HeaderText>
        <StatInput simType={StatSimTypes.CharacterStats} name="Hp" label="HP" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Atk" label="ATK" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Def" label="DEF" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Cr" label="Crit Rate %" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Cd" label="Crit DMG %" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Spd" label="SPD" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Ehr" label="Effect Hit Rate" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Res" label="Effect RES" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Be" label="Break Effect" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Ohb" label="Healing Boost" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Err" label="Energy Regen" />
        <StatInput simType={StatSimTypes.CharacterStats} name="Elem" label="Elemental DMG %" />
      </Flex>
    </>
  )
}

function SubstatsSection(props: { simType: string, title: string, total?: number }) {
  return (
    <>
      <Flex vertical>
        <HeaderText>{props.title}</HeaderText>
        <Flex vertical gap={5}>
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
          {(props.simType == StatSimTypes.SubstatRolls) && (
            <Flex justify="space-between" style={{width: STAT_SIMULATION_STATS_WIDTH}}>
              <Text>
                Total rolls
              </Text>
              <InputNumberStyled
                size="small"
                controls={false}
                disabled={true}
                value={props.total}
                variant="borderless"
                formatter={(value) => `${value} / 54`}
                max={54}
                status={props.total! > 54 ? 'error' : undefined}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  )
}

function StatInput(props: {label: string, name: string, simType: string, disabled?: boolean, value?: number}) {
  return (
    <Flex justify="space-between" style={{width: STAT_SIMULATION_STATS_WIDTH}}>
      <Text>
        {props.label}
      </Text>
      <Form.Item name={formName(props.simType, 'sim' + props.name)}>
        <InputNumberStyled size="small" controls={false} disabled={props.disabled} value={props.value}/>
      </Form.Item>
    </Flex>
  )
}

function formName(str1: string, str2?: string): string[] {
  return str2 ? ['statSim', str1, str2] : ['statSim', str1]
}

const substatInputNames = [
  'Hp',
  'Atk',
  'Def',
  'HpP',
  'AtkP',
  'DefP',
  'Cr',
  'Cd',
  'Spd',
  'Ehr',
  'Res',
  'Be',
]