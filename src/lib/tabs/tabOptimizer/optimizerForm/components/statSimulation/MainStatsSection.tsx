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

function MainStatSelector({ simType, placeholder, part, options }: { simType: string; placeholder: string; part: string; options: SelectorOptions[] }) {
  const field = 'sim' + part
  const value = useStatSimField<string>(simType, field)

  return (
    <Select
      placeholder={placeholder}
      style={{ flex: 1 }}
      clearable
      rightSection={<img style={{ width: 16 }} src={Assets.getPart(part)} />}
      data={options.map((opt) => ({ value: opt.value, label: opt.short }))}
      value={value}
      onChange={(val) => useOptimizerRequestStore.getState().updateStatSimField(simType, field, val)}
      maxDropdownHeight={750}
      comboboxProps={{ keepMounted: false, width: 200 }}
      searchable
    />
  )
}

export function MainStatsSection({ simType }: { simType: string }) {
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
        <Flex gap={5} w={STAT_SIMULATION_OPTIONS_WIDTH}>
          <MainStatSelector placeholder={t('BodyPlaceholder')} part={Parts.Body} options={BodyStatOptions} simType={simType} />
          <MainStatSelector placeholder={t('FeetPlaceholder')} part={Parts.Feet} options={FeetStatOptions} simType={simType} />
        </Flex>
        <Flex gap={5} w={STAT_SIMULATION_OPTIONS_WIDTH}>
          <MainStatSelector
            placeholder={t('SpherePlaceholder')}
            part={Parts.PlanarSphere}
            options={PlanarSphereStatOptions}
            simType={simType}
          />
          <MainStatSelector
            placeholder={t('RopePlaceholder')}
            part={Parts.LinkRope}
            options={LinkRopeStatOptions}
            simType={simType}
          />
        </Flex>
      </Flex>
    </>
  )
}
