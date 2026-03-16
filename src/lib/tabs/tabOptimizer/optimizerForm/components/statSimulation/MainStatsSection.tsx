import { CheckIcon, Combobox, Flex, Group, Input, InputBase, useCombobox } from '@mantine/core'
import { Parts, Stats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  STAT_SIMULATION_OPTIONS_WIDTH,
  useStatSimField,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { HeaderText } from 'lib/ui/HeaderText'
import type { StatSimType } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type SelectorOptions = {
  value: string
  short: string
  label: string
}

function MainStatSelector({ simType, placeholder, part, options }: { simType: StatSimType; placeholder: string; part: string; options: SelectorOptions[] }) {
  const field = 'sim' + part
  const value = useStatSimField<string>(simType, field)

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.short ?? null
  }, [options, value])

  return (
    <Combobox
      store={combobox}
      width={200}
      onOptionSubmit={(val) => {
        useOptimizerRequestStore.getState().updateStatSimField(simType, field, val)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          size="xs"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          style={{ flex: 1 }}
        >
          {selectedLabel || <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={750} style={{ overflowY: 'auto' }}>
          {combobox.dropdownOpened && options.map((opt) => (
            <Combobox.Option key={opt.value} value={opt.value} active={opt.value === value} style={{ whiteSpace: 'nowrap' }}>
              <Group gap={6} justify='space-between'>
                <Flex align='center' gap={6}>
                  <img src={Assets.getStatIcon(opt.value, true)} className={iconClasses.icon22} />
                  {opt.short}
                </Flex>
                {opt.value === value && <CheckIcon size={12} />}
              </Group>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

export function MainStatsSection({ simType }: { simType: StatSimType }) {
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
