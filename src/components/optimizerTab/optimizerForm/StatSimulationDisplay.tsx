import FormCard from '../FormCard'
import { Button, Flex, Form, Input, InputNumber, Popconfirm, Radio, Select, Typography } from 'antd'
import { VerticalDivider } from '../../Dividers'
import { SimulatedBuildsGrid } from 'components/optimizerTab/optimizerForm/SimulatedBuildsGrid'
import { HeaderText } from 'components/HeaderText'
import { DeleteOutlined, DoubleLeftOutlined, DownOutlined, SettingOutlined, UpOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { deleteAllStatSimulationBuilds, importOptimizerBuild, saveStatSimulationBuildFromForm, startOptimizerStatSimulation } from 'lib/statSimulationController'
import { Parts, Stats, SubStats } from 'lib/constants'
import { Assets } from 'lib/assets'
import GenerateOrnamentsOptions from 'components/optimizerTab/optimizerForm/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'components/optimizerTab/optimizerForm/SetsOptions'
import { Utils } from 'lib/utils'
import { OrnamentSetTagRenderer } from 'components/optimizerTab/optimizerForm/OrnamentSetTagRenderer'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

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
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  function isHidden() {
    return statSimulationDisplay == StatSimTypes.Disabled || !statSimulationDisplay
  }

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large' height={STAT_SIMULATION_ROW_HEIGHT}>
      <Flex gap={15} style={{ height: '100%' }}>
        <Flex vertical gap={15} align='center'>
          <Radio.Group
            onChange={(e) => {
              const { target: { value } } = e
              setStatSimulationDisplay(value)
            }}
            optionType='button'
            buttonStyle='solid'
            value={statSimulationDisplay}
            style={{ width: `${STAT_SIMULATION_GRID_WIDTH}px`, display: 'flex' }}
          >
            <Radio
              style={{ display: 'flex', flex: 0.3, justifyContent: 'center', paddingInline: 0 }}
              value={StatSimTypes.Disabled}
            >{t('ModeSelector.Off')/* Off */}
            </Radio>
            <Radio
              style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
              value={StatSimTypes.SubstatRolls}
            >{t('ModeSelector.RollCount')/* Simulate custom substat rolls */}
            </Radio>
            <Radio
              style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
              value={StatSimTypes.SubstatTotals}
            >{t('ModeSelector.Totals')/* Simulate custom substat totals */}
            </Radio>
            {/* <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={StatSimTypes.CharacterStats} disabled>Character stats</Radio> */}
          </Radio.Group>

          <Flex style={{ minHeight: 302 }}>
            <SimulatedBuildsGrid/>
          </Flex>

          <Flex gap={10}>
            <Button
              style={{ width: 200 }} disabled={isHidden()} onClick={startOptimizerStatSimulation}
              icon={<DownOutlined/>}
            >
              {t('FooterLabels.Simulate')/* Simulate builds */}
            </Button>
            <Button style={{ width: 200 }} disabled={isHidden()} onClick={importOptimizerBuild} icon={<UpOutlined/>}>
              {t('FooterLabels.Import')/* Import optimizer build */}
            </Button>
            <Button
              style={{ width: 200 }} disabled={isHidden()}
              onClick={() => setConditionalSetEffectsDrawerOpen(true)}
              icon={<SettingOutlined/>}
            >
              {t('FooterLabels.Conditionals')/* Conditional set effects */}
            </Button>
          </Flex>
        </Flex>

        <Flex vertical justify='space-around'>
          <Flex vertical gap={10}>
            <Button
              type='primary'
              style={{ width: 35, height: 100, padding: 0 }}
              onClick={saveStatSimulationBuildFromForm}
              disabled={isHidden()}
            >
              <DoubleLeftOutlined/>
            </Button>
            <Popconfirm
              title={t('DeletePopup.Title')}// 'Erase stat simulations'
              description={t('DeletePopup.Description')}// "Are you sure you want to clear all of this character's saved simulations?"
              onConfirm={deleteAllStatSimulationBuilds}
              placement='bottom'
              okText={t('DeletePopup.OkText')}// 'Yes'
              cancelText={t('DeletePopup.CancelText')}// 'Cancel'
            >
              <Button
                type='dashed'
                style={{ width: 35, height: 35, padding: 0 }}
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
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)

  // Hook into changes to the sim to calculate roll sum
  const statSimFormValues = Form.useWatch((values) => values.statSim, window.optimizerForm)
  const substatRollsTotal = useMemo(() => {
    if (!statSimFormValues) return 0

    let sum = 0
    for (const stat of SubStats) {
      const rolls = statSimFormValues.substatRolls
      if (rolls?.stats[stat]) {
        sum += rolls.stats[stat]
      }
    }
    return sum
  }, [statSimFormValues])

  const renderedOptions = useMemo(() => {
    return (
      <>
        <Form.Item name={formName('simulations')}>
          <Input
            placeholder='This is a fake hidden input to save simulations into the form'
            style={{ display: 'none' }}
          />
        </Form.Item>

        <Flex gap={5} style={{ display: statSimulationDisplay == StatSimTypes.SubstatTotals ? 'flex' : 'none' }}>
          <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
            <SetsSection simType={StatSimTypes.SubstatTotals}/>
            <MainStatsSection simType={StatSimTypes.SubstatTotals}/>

            <HeaderText>{t('OptionsHeader')/* Options */}</HeaderText>

            <Form.Item name={formName(StatSimTypes.SubstatTotals, 'name')}>
              <Input placeholder={t('SimulationNamePlaceholder')/* 'Simulation name (Optional)' */} autoComplete='off'/>
            </Form.Item>
          </Flex>

          <VerticalDivider/>

          <SubstatsSection simType={StatSimTypes.SubstatTotals} title={t('TotalsHeader')/* 'Substat value totals' */}/>
        </Flex>

        <Flex gap={5} style={{ display: statSimulationDisplay == StatSimTypes.SubstatRolls ? 'flex' : 'none' }}>
          <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
            <SetsSection simType={StatSimTypes.SubstatRolls}/>
            <MainStatsSection simType={StatSimTypes.SubstatRolls}/>

            <HeaderText>{t('OptionsHeader')/* Options */}</HeaderText>

            <Form.Item name={formName(StatSimTypes.SubstatRolls, 'name')}>
              <Input placeholder={t('SimulationNamePlaceholder')/* 'Simulation name (Optional)' */} autoComplete='off'/>
            </Form.Item>
          </Flex>

          <VerticalDivider/>

          <SubstatsSection simType={StatSimTypes.SubstatRolls} title={t('RollsHeader')/* 'Substat max rolls' */} total={substatRollsTotal}/>
        </Flex>

        <Flex gap={5} style={{ display: statSimulationDisplay == StatSimTypes.Disabled ? 'flex' : 'none' }}>
          <div style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}/>
          <VerticalDivider/>
        </Flex>
      </>
    )
  }, [statSimulationDisplay, substatRollsTotal, t])

  return (
    <Flex style={{ minHeight: 300 }}>
      {renderedOptions}
    </Flex>
  )
}

function SetsSection(props: { simType: string }) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  return (
    <>
      <HeaderText>Sets</HeaderText>
      <Form.Item name={formName(props.simType, 'simRelicSet1')} style={{ maxHeight: 32 }}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={700}
          allowClear
          options={useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])}
          tagRender={OrnamentSetTagRenderer}
          placeholder={t('RelicSetPlaceholder')}// 'Relic set'
          maxTagCount='responsive'
          showSearch
        >
        </Select>
      </Form.Item>
      <Form.Item name={formName(props.simType, 'simRelicSet2')} style={{ maxHeight: 32 }}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={700}
          allowClear
          options={useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])}
          tagRender={OrnamentSetTagRenderer}
          placeholder={t('RelicSetPlaceholder')}// 'Relic set'
          maxTagCount='responsive'
          showSearch
        >
        </Select>
      </Form.Item>

      <Form.Item name={formName(props.simType, 'simOrnamentSet')} style={{ maxHeight: 32 }}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={600}
          allowClear
          options={useMemo(() => GenerateOrnamentsOptions(), [i18n.resolvedLanguage])}
          tagRender={OrnamentSetTagRenderer}
          placeholder={t('OrnamentSetPlaceholder')}// 'Ornament set'
          maxTagCount='responsive'
          showSearch
        >
        </Select>
      </Form.Item>
    </>
  )
}

function MainStatsSection(props: { simType: string }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation.MainStatsSelection' })
  const BodyStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.CR, Stats.CD, Stats.EHR, Stats.OHB]
      .map((x) => { return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) } })
  }, [t])

  const FeetStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.SPD]
      .map((x) => { return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) } })
  }, [t])

  const LinkRopeStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.BE, Stats.ERR]
      .map((x) => { return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) } })
  }, [t])

  const PlanarSphereStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.Physical_DMG, Stats.Fire_DMG, Stats.Ice_DMG, Stats.Lightning_DMG, Stats.Wind_DMG, Stats.Quantum_DMG, Stats.Imaginary_DMG]
      .map((x) => { return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) } })
  }, [t])

  return (
    <>
      <HeaderText>{t('Header')/* Main stats */}</HeaderText>
      <Flex vertical gap={5}>
        <Flex gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <MainStatSelector placeholder={t('BodyPlaceholder')/* 'Body' */} part={Parts.Body} options={BodyStatOptions} simType={props.simType}/>
          <MainStatSelector placeholder={t('FeetPlaceholder')/* 'Feet' */} part={Parts.Feet} options={FeetStatOptions} simType={props.simType}/>
        </Flex>
        <Flex gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <MainStatSelector
            placeholder={t('SpherePlaceholder')/* 'Sphere' */} part={Parts.PlanarSphere} options={PlanarSphereStatOptions}
            simType={props.simType}
          />
          <MainStatSelector
            placeholder={t('SpherePlaceholder')/* 'Rope' */} part={Parts.LinkRope} options={LinkRopeStatOptions}
            simType={props.simType}
          />
        </Flex>
      </Flex>
    </>
  )
}

function MainStatSelector(props: { simType: string; placeholder: string; part: string; options: any[] }) {
  return (
    <Form.Item name={formName(props.simType, 'sim' + props.part)} style={{ flex: 1 }}>
      <Select
        placeholder={props.placeholder}
        style={{ flex: 1 }}
        allowClear
        optionLabelProp='short'
        maxTagCount='responsive'
        suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(props.part)}/>}
        options={props.options}
        listHeight={750}
        popupMatchSelectWidth={200}
        showSearch
      />
    </Form.Item>
  )
}

function SubstatsSection(props: { simType: string; title: string; total?: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  return (
    <>
      <Flex vertical>
        <HeaderText>{props.title}</HeaderText>
        <Flex vertical gap={5}>
          <StatInput simType={props.simType} name={Stats.ATK_P} label={t('SubstatSelectorLabel', { stat: Stats.ATK_P })/* 'ATK %' */}/>
          <StatInput simType={props.simType} name={Stats.ATK} label={t('SubstatSelectorLabel', { stat: Stats.ATK })/* 'ATK' */}/>
          <StatInput simType={props.simType} name={Stats.CR} label={t('SubstatSelectorLabel', { stat: Stats.CR })/* 'Crit Rate %' */}/>
          <StatInput simType={props.simType} name={Stats.CD} label={t('SubstatSelectorLabel', { stat: Stats.CD })/* 'Crit DMG %' */}/>
          <StatInput simType={props.simType} name={Stats.SPD} label={t('SubstatSelectorLabel', { stat: Stats.SPD })/* 'SPD' */}/>
          <StatInput simType={props.simType} name={Stats.BE} label={t('SubstatSelectorLabel', { stat: Stats.BE })/* 'Break Effect' */}/>
          <StatInput simType={props.simType} name={Stats.HP_P} label={t('SubstatSelectorLabel', { stat: Stats.HP_P })/* 'HP %' */}/>
          <StatInput simType={props.simType} name={Stats.HP} label={t('SubstatSelectorLabel', { stat: Stats.HP })/* 'HP' */}/>
          <StatInput simType={props.simType} name={Stats.DEF_P} label={t('SubstatSelectorLabel', { stat: Stats.DEF_P })/* 'DEF %' */}/>
          <StatInput simType={props.simType} name={Stats.DEF} label={t('SubstatSelectorLabel', { stat: Stats.DEF })/* 'DEF' */}/>
          <StatInput simType={props.simType} name={Stats.EHR} label={t('SubstatSelectorLabel', { stat: Stats.EHR })/* 'Effect Hit Rate' */}/>
          <StatInput simType={props.simType} name={Stats.RES} label={t('SubstatSelectorLabel', { stat: Stats.RES })/* 'Effect RES' */}/>
          {(props.simType == StatSimTypes.SubstatRolls) && (
            <Flex justify='space-between' style={{ width: STAT_SIMULATION_STATS_WIDTH }}>
              <Text>
                {t('TotalRolls')/* Total rolls */}
              </Text>
              <InputNumber
                size='small'
                controls={false}
                disabled={true}
                value={Utils.truncate10ths(props.total)}
                variant='borderless'
                formatter={(value) => `${value} / 54`}
                max={54}
                status={props.total! > 54 ? 'error' : undefined}
                style={{ width: 70 }}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  )
}

function StatInput(props: { label: string; name: string; simType: string; disabled?: boolean; value?: number }) {
  return (
    <Flex justify='space-between' style={{ width: STAT_SIMULATION_STATS_WIDTH }}>
      <Text>
        {props.label}
      </Text>
      <Form.Item name={formName(props.simType, 'stats', props.name)}>
        <InputNumber size='small' controls={false} disabled={props.disabled} value={props.value} style={{ width: 70 }}/>
      </Form.Item>
    </Flex>
  )
}

function formName(str1: string, str2?: string, str3?: string): string[] {
  return ['statSim', str1, str2, str3].filter((x) => x)
}
