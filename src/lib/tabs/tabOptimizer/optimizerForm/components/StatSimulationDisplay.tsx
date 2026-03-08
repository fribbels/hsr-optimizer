import {
  IconArrowsExchange,
  IconChevronDown,
  IconChevronUp,
  IconChevronsLeft,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react'
import {
  Button,
  Form as AntDForm,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Select,
  Typography,
} from 'antd'
import { Flex } from '@mantine/core'
import {
  Parts,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import {
  deleteAllStatSimulationBuilds,
  importOptimizerBuild,
  overwriteStatSimulationBuild,
  saveStatSimulationBuildFromForm,
  startOptimizerStatSimulation,
} from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { OrnamentSetTagRenderer } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentSetTagRenderer'
import GenerateOrnamentsOptions from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import { SimulatedBuildsGrid } from 'lib/tabs/tabOptimizer/optimizerForm/components/SimulatedBuildsGrid'
import FormCard from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { Utils } from 'lib/utils/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { OptimizerForm } from 'types/form'

const { Text } = Typography

export const STAT_SIMULATION_ROW_HEIGHT = 425
export const STAT_SIMULATION_GRID_WIDTH = 680
export const STAT_SIMULATION_OPTIONS_WIDTH = 215
export const STAT_SIMULATION_STATS_WIDTH = 190

// Helper to read a field from the statSim store
function useStatSimField<T = unknown>(simType: string, field: string): T | undefined {
  return useOptimizerFormStore((s) => {
    const sim = s.statSim as Record<string, Record<string, unknown>> | undefined
    return sim?.[simType]?.[field] as T | undefined
  })
}

// Helper to read a stat value from the statSim store
function useStatSimStat(simType: string, statName: string): number | undefined {
  return useOptimizerFormStore((s) => {
    const sim = s.statSim as Record<string, Record<string, Record<string, number>>> | undefined
    return sim?.[simType]?.stats?.[statName]
  })
}

export function StatSimulationDisplay() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const { t: tCommon } = useTranslation('common')
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = window.store((s) => s.setStatSimulationDisplay)

  function isHidden() {
    return statSimulationDisplay == StatSimTypes.Disabled || !statSimulationDisplay
  }

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large' height={STAT_SIMULATION_ROW_HEIGHT}>
      <Flex gap={15} style={{ height: '100%' }}>
        <Flex direction="column" gap={15} align='center'>
          <Radio.Group
            onChange={(e) => {
              const { target: { value } } = e
              setStatSimulationDisplay(value as StatSimTypes)
            }}
            optionType='button'
            buttonStyle='solid'
            value={statSimulationDisplay}
            style={{ width: `${STAT_SIMULATION_GRID_WIDTH}px`, display: 'flex' }}
          >
            <Radio
              style={{ display: 'flex', flex: 0.3, justifyContent: 'center', paddingInline: 0 }}
              value={StatSimTypes.Disabled}
            >
              {t('ModeSelector.Off') /* Off */}
            </Radio>
            <Radio
              style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
              value={StatSimTypes.SubstatRolls}
            >
              {t('ModeSelector.RollCount') /* Simulate custom substat rolls */}
            </Radio>
          </Radio.Group>

          <Flex style={{ minHeight: 302 }}>
            <SimulatedBuildsGrid />
          </Flex>

          <Flex gap={10}>
            <Button
              style={{ width: 200 }}
              disabled={isHidden()}
              onClick={startOptimizerStatSimulation}
              icon={<IconChevronDown />}
            >
              {t('FooterLabels.Simulate') /* Simulate builds */}
            </Button>
            <Button style={{ width: 200 }} disabled={isHidden()} onClick={importOptimizerBuild} icon={<IconChevronUp />}>
              {t('FooterLabels.Import') /* Import optimizer build */}
            </Button>
            <Button
              style={{ width: 200 }}
              disabled={isHidden()}
              onClick={() => setOpen(OpenCloseIDs.OPTIMIZER_SETS_DRAWER)}
              icon={<IconSettings />}
            >
              {t('FooterLabels.Conditionals') /* Conditional set effects */}
            </Button>
          </Flex>
        </Flex>

        <Flex direction="column" justify='space-around'>
          <Flex direction="column" gap={10}>
            <Button
              type='primary'
              style={{ width: 35, height: 100, padding: 0 }}
              onClick={() => saveStatSimulationBuildFromForm()}
              disabled={isHidden()}
            >
              <IconChevronsLeft />
            </Button>
            <Button
              type='dashed'
              style={{ width: 35, height: 35, padding: 0 }}
              disabled={isHidden()}
              onClick={overwriteStatSimulationBuild}
            >
              <IconArrowsExchange />
            </Button>
            <Popconfirm
              title={t('DeletePopup.Title')} // 'Erase stat simulations'
              description={t('DeletePopup.Description')} // "Are you sure you want to clear all of this character's saved simulations?"
              onConfirm={deleteAllStatSimulationBuilds}
              placement='bottom'
              okText={tCommon('Yes')} // 'Yes'
              cancelText={tCommon('Cancel')} // 'Cancel'
            >
              <Button
                type='dashed'
                style={{ width: 35, height: 35, padding: 0 }}
                disabled={isHidden()}
              >
                <IconTrash />
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
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulationDisplay = window.store((s) => s.statSimulationDisplay)

  // Hook into changes to the sim to calculate roll sum
  const statSimFormValues = useOptimizerFormStore((s) => s.statSim)
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

  const simType = StatSimTypes.SubstatRolls
  const nameValue = useStatSimField<string>(simType, 'name')

  const renderedOptions = useMemo(() => {
    return (
      <>
        <Flex gap={5} style={{ display: statSimulationDisplay == StatSimTypes.SubstatRolls ? 'flex' : 'none' }}>
          <Flex direction="column" gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
            <HeaderText>{t('SetSelection.Header')}</HeaderText>
            <OptimizerSetsSection simType={simType} />
            <MainStatsSection simType={simType} />

            <HeaderText>{t('OptionsHeader') /* Options */}</HeaderText>

            <Input
              placeholder={t('SimulationNamePlaceholder') /* 'Simulation name (Optional)' */}
              autoComplete='off'
              value={nameValue ?? ''}
              onChange={(e) => useOptimizerFormStore.getState().updateStatSimField(simType, 'name', e.target.value)}
            />
          </Flex>

          <VerticalDivider />

          <SubstatsSection simType={simType} title={t('RollsHeader') /* 'Substat max rolls' */} total={substatRollsTotal} />
        </Flex>

        <Flex gap={5} style={{ display: statSimulationDisplay == StatSimTypes.Disabled ? 'flex' : 'none' }}>
          <div style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }} />
          <VerticalDivider />
        </Flex>
      </>
    )
  }, [statSimulationDisplay, substatRollsTotal, nameValue, simType, t])

  return (
    <Flex style={{ minHeight: 300 }}>
      {renderedOptions}
    </Flex>
  )
}

// Optimizer-tab version: reads/writes from Zustand store (no AntD Form context needed)
function OptimizerSetsSection(props: { simType: string }) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const simType = props.simType

  const simRelicSet1 = useStatSimField<string>(simType, 'simRelicSet1')
  const simRelicSet2 = useStatSimField<string>(simType, 'simRelicSet2')
  const simOrnamentSet = useStatSimField<string>(simType, 'simOrnamentSet')

  const updateField = useOptimizerFormStore.getState().updateStatSimField

  // Save a click by assuming the first relic set is a 4p
  const handleRelicSet1Change = (value: string) => {
    updateField(simType, 'simRelicSet1', value)
    updateField(simType, 'simRelicSet2', value)
  }

  return (
    <>
      <Select
        dropdownStyle={{ width: 250 }}
        style={{ maxHeight: 32 }}
        listHeight={700}
        allowClear
        options={useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])}
        tagRender={OrnamentSetTagRenderer}
        value={simRelicSet1}
        onChange={handleRelicSet1Change}
        placeholder={t('SetSelection.RelicPlaceholder')} // 'Relic set'
        maxTagCount='responsive'
        showSearch
      />
      <Select
        dropdownStyle={{ width: 250 }}
        style={{ maxHeight: 32 }}
        listHeight={700}
        allowClear
        options={useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])}
        tagRender={OrnamentSetTagRenderer}
        value={simRelicSet2}
        onChange={(value) => updateField(simType, 'simRelicSet2', value)}
        placeholder={t('SetSelection.RelicPlaceholder')} // 'Relic set'
        maxTagCount='responsive'
        showSearch
      />
      <Select
        dropdownStyle={{ width: 250 }}
        style={{ maxHeight: 32 }}
        listHeight={600}
        allowClear
        options={useMemo(() => GenerateOrnamentsOptions(), [i18n.resolvedLanguage])}
        tagRender={OrnamentSetTagRenderer}
        value={simOrnamentSet}
        onChange={(value) => updateField(simType, 'simOrnamentSet', value)}
        placeholder={t('SetSelection.OrnamentPlaceholder')} // 'Ornament set'
        maxTagCount='responsive'
        showSearch
      />
    </>
  )
}

// BenchmarksTab version: uses AntD Form.Item for auto-binding (requires parent AntD Form context)
export function SetsSection(props: { simType: string }) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const benchmarkForm = AntDForm.useFormInstance<BenchmarkForm | OptimizerForm>()

  // Save a click by assuming the first relic set is a 4p
  const handleRelicSet1Change = (value: string) => {
    const path2 = formName(props.simType, 'simRelicSet2')
    // @ts-ignore
    benchmarkForm.setFieldValue(path2, value)
  }

  return (
    <>
      <AntDForm.Item name={formName(props.simType, 'simRelicSet1')} style={{ maxHeight: 32 }}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={700}
          allowClear
          options={useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])}
          tagRender={OrnamentSetTagRenderer}
          onChange={handleRelicSet1Change}
          placeholder={t('SetSelection.RelicPlaceholder')} // 'Relic set'
          maxTagCount='responsive'
          showSearch
        >
        </Select>
      </AntDForm.Item>
      <AntDForm.Item name={formName(props.simType, 'simRelicSet2')} style={{ maxHeight: 32 }}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={700}
          allowClear
          options={useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])}
          tagRender={OrnamentSetTagRenderer}
          placeholder={t('SetSelection.RelicPlaceholder')} // 'Relic set'
          maxTagCount='responsive'
          showSearch
        >
        </Select>
      </AntDForm.Item>

      <AntDForm.Item name={formName(props.simType, 'simOrnamentSet')} style={{ maxHeight: 32 }}>
        <Select
          dropdownStyle={{
            width: 250,
          }}
          listHeight={600}
          allowClear
          options={useMemo(() => GenerateOrnamentsOptions(), [i18n.resolvedLanguage])}
          tagRender={OrnamentSetTagRenderer}
          placeholder={t('SetSelection.OrnamentPlaceholder')} // 'Ornament set'
          maxTagCount='responsive'
          showSearch
        >
        </Select>
      </AntDForm.Item>
    </>
  )
}

export function MainStatsSection(props: { simType: string }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation.MainStatsSelection' })
  const BodyStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.CR, Stats.CD, Stats.EHR, Stats.OHB]
      .map((x) => {
        return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) }
      })
  }, [t])

  const FeetStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.SPD]
      .map((x) => {
        return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) }
      })
  }, [t])

  const LinkRopeStatOptions = useMemo(() => {
    return [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.BE, Stats.ERR]
      .map((x) => {
        return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) }
      })
  }, [t])

  const PlanarSphereStatOptions = useMemo(() => {
    return [
      Stats.HP_P,
      Stats.ATK_P,
      Stats.DEF_P,
      Stats.Physical_DMG,
      Stats.Fire_DMG,
      Stats.Ice_DMG,
      Stats.Lightning_DMG,
      Stats.Wind_DMG,
      Stats.Quantum_DMG,
      Stats.Imaginary_DMG,
    ]
      .map((x) => {
        return { value: x, short: t('ShortStat', { stat: x }), label: t('LabelStat', { stat: x }) }
      })
  }, [t])

  return (
    <>
      <HeaderText>{t('Header') /* Main stats */}</HeaderText>
      <Flex direction="column" gap={5}>
        <Flex gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <MainStatSelector placeholder={t('BodyPlaceholder') /* 'Body' */} part={Parts.Body} options={BodyStatOptions} simType={props.simType} />
          <MainStatSelector placeholder={t('FeetPlaceholder') /* 'Feet' */} part={Parts.Feet} options={FeetStatOptions} simType={props.simType} />
        </Flex>
        <Flex gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <MainStatSelector
            placeholder={t('SpherePlaceholder') /* 'Sphere' */}
            part={Parts.PlanarSphere}
            options={PlanarSphereStatOptions}
            simType={props.simType}
          />
          <MainStatSelector
            placeholder={t('RopePlaceholder') /* 'Rope' */}
            part={Parts.LinkRope}
            options={LinkRopeStatOptions}
            simType={props.simType}
          />
        </Flex>
      </Flex>
    </>
  )
}

type SelectorOptions = {
  value: string,
  short: string,
  label: string,
}

function MainStatSelector(props: { simType: string, placeholder: string, part: string, options: SelectorOptions[] }) {
  const field = 'sim' + props.part
  const value = useStatSimField<string>(props.simType, field)

  return (
    <Select
      placeholder={props.placeholder}
      style={{ flex: 1 }}
      allowClear
      optionLabelProp='short'
      maxTagCount='responsive'
      suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(props.part)} />}
      options={props.options}
      value={value}
      onChange={(val) => useOptimizerFormStore.getState().updateStatSimField(props.simType, field, val)}
      listHeight={750}
      popupMatchSelectWidth={200}
      showSearch
    />
  )
}

function SubstatsSection(props: { simType: StatSimTypes, title: string, total?: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  return (
    <>
      <Flex direction="column">
        <HeaderText>{props.title}</HeaderText>
        <Flex direction="column" gap={5}>
          <StatInput simType={props.simType} name={Stats.ATK_P} label={t('SubstatSelectorLabel', { stat: Stats.ATK_P }) /* 'ATK %' */} />
          <StatInput simType={props.simType} name={Stats.ATK} label={t('SubstatSelectorLabel', { stat: Stats.ATK }) /* 'ATK' */} />
          <StatInput simType={props.simType} name={Stats.CR} label={t('SubstatSelectorLabel', { stat: Stats.CR }) /* 'Crit Rate %' */} />
          <StatInput simType={props.simType} name={Stats.CD} label={t('SubstatSelectorLabel', { stat: Stats.CD }) /* 'Crit DMG %' */} />
          <StatInput simType={props.simType} name={Stats.SPD} label={t('SubstatSelectorLabel', { stat: Stats.SPD }) /* 'SPD' */} />
          <StatInput simType={props.simType} name={Stats.BE} label={t('SubstatSelectorLabel', { stat: Stats.BE }) /* 'Break Effect' */} />
          <StatInput simType={props.simType} name={Stats.HP_P} label={t('SubstatSelectorLabel', { stat: Stats.HP_P }) /* 'HP %' */} />
          <StatInput simType={props.simType} name={Stats.HP} label={t('SubstatSelectorLabel', { stat: Stats.HP }) /* 'HP' */} />
          <StatInput simType={props.simType} name={Stats.DEF_P} label={t('SubstatSelectorLabel', { stat: Stats.DEF_P }) /* 'DEF %' */} />
          <StatInput simType={props.simType} name={Stats.DEF} label={t('SubstatSelectorLabel', { stat: Stats.DEF }) /* 'DEF' */} />
          <StatInput simType={props.simType} name={Stats.EHR} label={t('SubstatSelectorLabel', { stat: Stats.EHR }) /* 'Effect Hit Rate' */} />
          <StatInput simType={props.simType} name={Stats.RES} label={t('SubstatSelectorLabel', { stat: Stats.RES }) /* 'Effect RES' */} />
          {(props.simType == StatSimTypes.SubstatRolls) && (
            <Flex justify='space-between' style={{ width: STAT_SIMULATION_STATS_WIDTH }}>
              <Text>
                {t('TotalRolls') /* Total rolls */}
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

function StatInput(props: { label: string, name: string, simType: string }) {
  const value = useStatSimStat(props.simType, props.name)

  return (
    <Flex justify='space-between' style={{ width: STAT_SIMULATION_STATS_WIDTH }}>
      <Text>
        {props.label}
      </Text>
      <InputNumber
        size='small'
        controls={false}
        value={value}
        onChange={(val) => {
          const store = useOptimizerFormStore.getState()
          const sim = store.statSim as Record<string, Record<string, unknown>> | undefined
          const currentStats = (sim?.[props.simType]?.stats ?? {}) as Record<string, number>
          store.updateStatSimField(props.simType, 'stats', {
            ...currentStats,
            [props.name]: val,
          })
        }}
        style={{ width: 70 }}
      />
    </Flex>
  )
}

// formName is still used by SetsSection (BenchmarksTab context)
function formName(str1: string, str2?: string, str3?: string): string[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (str1 == StatSimTypes.Benchmarks) return [str2, str3].filter((x) => x) as string[]
  return ['statSim', str1, str2, str3].filter((x) => x) as string[]
}
