import FormCard from '../FormCard'
import { Button, Flex, Form, Input, InputNumber, Popconfirm, Radio, Select, Typography } from 'antd'
import { VerticalDivider } from '../../Dividers'
import { SimulatedBuildsGrid } from 'components/optimizerTab/optimizerForm/SimulatedBuildsGrid'
import { HeaderText } from 'components/HeaderText'
import { DeleteOutlined, DoubleLeftOutlined, DownOutlined, SettingOutlined, UpOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import {
  deleteAllStatSimulationBuilds,
  importOptimizerBuild,
  saveStatSimulationBuildFromForm,
  startOptimizerStatSimulation
} from 'lib/statSimulationController.tsx'
import {
  BodyStatOptions,
  FeetStatOptions,
  LinkRopeStatOptions,
  Parts,
  PlanarSphereStatOptions,
  Stats,
  SubStats
} from 'lib/constants'
import { Assets } from 'lib/assets'
import GenerateOrnamentsOptions from 'components/optimizerTab/optimizerForm/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'components/optimizerTab/optimizerForm/SetsOptions'
import { Utils } from 'lib/utils'
import { OrnamentSetTagRenderer } from 'components/optimizerTab/optimizerForm/OrnamentSetTagRenderer'

const {Text} = Typography

export enum StatSimTypes {
  Disabled = 'disabled',
  CharacterStats = 'characterStats',
  SubstatTotals = 'substatTotals',
  SubstatRolls = 'substatRolls',
}

export const STAT_SIMULATION_ROW_HEIGHT = 425
export const STAT_SIMULATION_GRID_WIDTH = 680
export const STAT_SIMULATION_OPTIONS_WIDTH = 215
export const STAT_SIMULATION_STATS_WIDTH = 190

export function StatSimulationDisplay() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  function isHidden() {
    return statSimulationDisplay == StatSimTypes.Disabled || !statSimulationDisplay
  }

  return (
    <FormCard style={{overflow: 'hidden'}} size="large" height={STAT_SIMULATION_ROW_HEIGHT}>
      <Flex gap={15} style={{height: '100%'}}>
        <Flex vertical gap={15} align="center">
          <Radio.Group
            onChange={(e) => {
              const {target: {value}} = e
              setStatSimulationDisplay(value)
            }}
            optionType="button"
            buttonStyle="solid"
            value={statSimulationDisplay}
            style={{width: `${STAT_SIMULATION_GRID_WIDTH}px`, display: 'flex'}}
          >
            <Radio style={{display: 'flex', flex: 0.3, justifyContent: 'center', paddingInline: 0}}
                   value={StatSimTypes.Disabled}>Off</Radio>
            <Radio style={{display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0}}
                   value={StatSimTypes.SubstatRolls}>Simulate custom substat rolls</Radio>
            <Radio style={{display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0}}
                   value={StatSimTypes.SubstatTotals}>Simulate custom substat totals</Radio>
            {/*<Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimTypes.CharacterStats} disabled>Character stats</Radio>*/}
          </Radio.Group>

          <Flex style={{minHeight: 302}}>
            <SimulatedBuildsGrid/>
          </Flex>

          <Flex gap={10}>
            <Button style={{width: 200}} disabled={isHidden()} onClick={startOptimizerStatSimulation}
                    icon={<DownOutlined/>}>
              Simulate builds
            </Button>
            <Button style={{width: 200}} disabled={isHidden()} onClick={importOptimizerBuild} icon={<UpOutlined/>}>
              Import optimizer build
            </Button>
            <Button style={{width: 200}} disabled={isHidden()}
                    onClick={() => setConditionalSetEffectsDrawerOpen(true)}
                    icon={<SettingOutlined/>}
            >
              Conditional set effects
            </Button>
          </Flex>
        </Flex>

        <Flex vertical justify="space-around">
          <Flex vertical gap={10}>
            <Button
              type="primary"
              style={{width: 35, height: 100, padding: 0}}
              onClick={saveStatSimulationBuildFromForm}
              disabled={isHidden()}
            >
              <DoubleLeftOutlined/>
            </Button>
            <Popconfirm
              title="Erase stat simulations"
              description="Are you sure you want to clear all of this character's saved simulations?"
              onConfirm={deleteAllStatSimulationBuilds}
              placement="bottom"
              okText="Yes"
              cancelText="Cancel"
            >
              <Button
                type="dashed"
                style={{width: 35, height: 35, padding: 0}}
                disabled={isHidden()}
              >
                <DeleteOutlined/>
              </Button>
            </Popconfirm>
          </Flex>
        </Flex>

        <SimulationInputs/>
      </Flex>
    </FormCard>
  )
}

function SimulationInputs() {
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)

  // Hook into changes to the sim to calculate roll sum
  const statSimFormValues = Form.useWatch((values) => values.statSim, window.optimizerForm)
  const substatRollsTotal = useMemo(() => {
    if (!statSimFormValues) return 0

    let sum = 0
    for (const stat of SubStats) {
      const rolls = statSimFormValues.substatRolls
      if (rolls && rolls.stats[stat]) {
        sum += rolls.stats[stat]
      }
    }
    return sum
  }, [statSimFormValues])

  const renderedOptions = useMemo(() => {
    return (
      <>
        <Form.Item name={formName('simulations')}>
          <Input placeholder="This is a fake hidden input to save simulations into the form"
                 style={{display: 'none'}}/>
        </Form.Item>

        <Flex gap={5} style={{display: statSimulationDisplay == StatSimTypes.SubstatTotals ? 'flex' : 'none'}}>
          <Flex vertical gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
            <SetsSection simType={StatSimTypes.SubstatTotals}/>
            <MainStatsSection simType={StatSimTypes.SubstatTotals}/>

            <HeaderText>Options</HeaderText>

            <Form.Item name={formName(StatSimTypes.SubstatTotals, 'name')}>
              <Input placeholder="Simulation name (Optional)" autoComplete="off"/>
            </Form.Item>
          </Flex>

          <VerticalDivider/>

          <SubstatsSection simType={StatSimTypes.SubstatTotals} title="Substat value totals"/>
        </Flex>

        <Flex gap={5} style={{display: statSimulationDisplay == StatSimTypes.SubstatRolls ? 'flex' : 'none'}}>
          <Flex vertical gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
            <SetsSection simType={StatSimTypes.SubstatRolls}/>
            <MainStatsSection simType={StatSimTypes.SubstatRolls}/>

            <HeaderText>Options</HeaderText>

            <Form.Item name={formName(StatSimTypes.SubstatRolls, 'name')}>
              <Input placeholder="Simulation name (Optional)" autoComplete="off"/>
            </Form.Item>
          </Flex>

          <VerticalDivider/>

          <SubstatsSection simType={StatSimTypes.SubstatRolls} title="Substat max rolls" total={substatRollsTotal}/>
        </Flex>

        <Flex gap={5} style={{display: statSimulationDisplay == StatSimTypes.Disabled ? 'flex' : 'none'}}>
          <div style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}/>
          <VerticalDivider/>
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
      <Form.Item name={formName(props.simType, 'simRelicSet1')} style={{maxHeight: 32}}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={700}
          allowClear
          options={GenerateBasicSetsOptions()}
          tagRender={OrnamentSetTagRenderer}
          placeholder="Relic set"
          maxTagCount="responsive"
          showSearch
        >
        </Select>
      </Form.Item>
      <Form.Item name={formName(props.simType, 'simRelicSet2')} style={{maxHeight: 32}}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={700}
          allowClear
          options={GenerateBasicSetsOptions()}
          tagRender={OrnamentSetTagRenderer}
          placeholder="Relic set"
          maxTagCount="responsive"
          showSearch
        >
        </Select>
      </Form.Item>

      <Form.Item name={formName(props.simType, 'simOrnamentSet')} style={{maxHeight: 32}}>
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
          showSearch
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
          <MainStatSelector placeholder="Body" part={Parts.Body} options={BodyStatOptions} simType={props.simType}/>
          <MainStatSelector placeholder="Feet" part={Parts.Feet} options={FeetStatOptions} simType={props.simType}/>
        </Flex>
        <Flex gap={5} style={{width: STAT_SIMULATION_OPTIONS_WIDTH}}>
          <MainStatSelector placeholder="Sphere" part={Parts.PlanarSphere} options={PlanarSphereStatOptions}
                            simType={props.simType}/>
          <MainStatSelector placeholder="Rope" part={Parts.LinkRope} options={LinkRopeStatOptions}
                            simType={props.simType}/>
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
        suffixIcon={<img style={{width: 16}} src={Assets.getPart(props.part)}/>}
        options={props.options}
        listHeight={750}
        popupMatchSelectWidth={200}
        showSearch
      />
    </Form.Item>
  )
}

function SubstatsSection(props: { simType: string, title: string, total?: number }) {
  return (
    <>
      <Flex vertical>
        <HeaderText>{props.title}</HeaderText>
        <Flex vertical gap={5}>
          <StatInput simType={props.simType} name={Stats.ATK_P} label="ATK %"/>
          <StatInput simType={props.simType} name={Stats.ATK} label="ATK"/>
          <StatInput simType={props.simType} name={Stats.CR} label="Crit Rate %"/>
          <StatInput simType={props.simType} name={Stats.CD} label="Crit DMG %"/>
          <StatInput simType={props.simType} name={Stats.SPD} label="SPD"/>
          <StatInput simType={props.simType} name={Stats.BE} label="Break Effect"/>
          <StatInput simType={props.simType} name={Stats.HP_P} label="HP %"/>
          <StatInput simType={props.simType} name={Stats.HP} label="HP"/>
          <StatInput simType={props.simType} name={Stats.DEF_P} label="DEF %"/>
          <StatInput simType={props.simType} name={Stats.DEF} label="DEF"/>
          <StatInput simType={props.simType} name={Stats.EHR} label="Effect Hit Rate"/>
          <StatInput simType={props.simType} name={Stats.RES} label="Effect RES"/>
          {(props.simType == StatSimTypes.SubstatRolls) && (
            <Flex justify="space-between" style={{width: STAT_SIMULATION_STATS_WIDTH}}>
              <Text>
                Total rolls
              </Text>
              <InputNumber
                size="small"
                controls={false}
                disabled={true}
                value={Utils.truncate10ths(props.total)}
                variant="borderless"
                formatter={(value) => `${value} / 54`}
                max={54}
                status={props.total! > 54 ? 'error' : undefined}
                style={{width: 70}}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  )
}

function StatInput(props: { label: string, name: string, simType: string, disabled?: boolean, value?: number }) {
  return (
    <Flex justify="space-between" style={{width: STAT_SIMULATION_STATS_WIDTH}}>
      <Text>
        {props.label}
      </Text>
      <Form.Item name={formName(props.simType, 'stats', props.name)}>
        <InputNumber size="small" controls={false} disabled={props.disabled} value={props.value} style={{width: 70}}/>
      </Form.Item>
    </Flex>
  )
}

function formName(str1: string, str2?: string, str3?: string): string[] {
  return ['statSim', str1, str2, str3].filter(x => x)
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