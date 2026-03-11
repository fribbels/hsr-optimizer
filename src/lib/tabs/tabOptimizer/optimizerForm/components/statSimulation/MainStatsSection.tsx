import { Flex, Select } from '@mantine/core'
import { Parts, Stats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  STAT_SIMULATION_OPTIONS_WIDTH,
  useStatSimField,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type SelectorOptions = {
  value: string
  short: string
  label: string
}

function MainStatSelector(props: { simType: string; placeholder: string; part: string; options: SelectorOptions[] }) {
  const field = 'sim' + props.part
  const value = useStatSimField<string>(props.simType, field)

  return (
    <Select
      placeholder={props.placeholder}
      style={{ flex: 1 }}
      clearable
      rightSection={<img style={{ width: 16 }} src={Assets.getPart(props.part)} />}
      data={props.options.map((opt) => ({ value: opt.value, label: opt.short }))}
      value={value}
      onChange={(val) => useOptimizerRequestStore.getState().updateStatSimField(props.simType, field, val)}
      maxDropdownHeight={750}
      comboboxProps={{ width: 200 }}
      searchable
    />
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
      <HeaderText>{t('Header')}</HeaderText>
      <Flex direction="column" gap={5}>
        <Flex gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <MainStatSelector placeholder={t('BodyPlaceholder')} part={Parts.Body} options={BodyStatOptions} simType={props.simType} />
          <MainStatSelector placeholder={t('FeetPlaceholder')} part={Parts.Feet} options={FeetStatOptions} simType={props.simType} />
        </Flex>
        <Flex gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <MainStatSelector
            placeholder={t('SpherePlaceholder')}
            part={Parts.PlanarSphere}
            options={PlanarSphereStatOptions}
            simType={props.simType}
          />
          <MainStatSelector
            placeholder={t('RopePlaceholder')}
            part={Parts.LinkRope}
            options={LinkRopeStatOptions}
            simType={props.simType}
          />
        </Flex>
      </Flex>
    </>
  )
}
