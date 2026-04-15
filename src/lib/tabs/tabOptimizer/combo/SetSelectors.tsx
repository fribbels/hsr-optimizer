import { Flex } from '@mantine/core'
import { persistSelectedSets } from 'lib/tabs/tabOptimizer/combo/comboDrawerService'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { useOrnamentsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import {
  type ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'types/components'

function SetSelector({ selected, options, placeholder, submit }: {
  selected: string[],
  options: {
    value: string,
    label: ReactElement,
  }[],
  placeholder: string,
  submit: (arr: string[]) => void,
}) {
  const values = selected ?? []

  const stringOptions = options.map((opt) => ({
    value: opt.value,
    label: typeof opt.label === 'string' ? opt.label : opt.value,
  }))

  const labelMap = useMemo(
    () => new Map(options.map((opt) => [opt.value, opt.label])),
    [options],
  )

  const renderOption = useCallback(
    (opt: { value: string, label: string }): ReactNode => labelMap.get(opt.value) ?? opt.label,
    [labelMap],
  )

  return (
    <MultiSelectPills
      dropdownWidth={600}
      maxDisplayedValues={1}
      maxDropdownHeight={600}
      columns={2}
      clearable
      style={{ flex: 1 }}
      data={stringOptions}
      placeholder={placeholder}
      value={values}
      onChange={(val) => submit(val)}
      renderOption={renderOption}
    />
  )
}

const EMPTY_SETS: string[] = []

export function SetSelectors() {
  const displayedRelicSets = useComboDrawerStore((s) => s.comboCharacter?.displayedRelicSets ?? EMPTY_SETS)
  const displayedOrnamentSets = useComboDrawerStore((s) => s.comboCharacter?.displayedOrnamentSets ?? EMPTY_SETS)
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer.Placeholders' })
  const ornamentOptions = useOrnamentsOptions()
  const relicSetOptions = useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])

  return (
    <Flex w='100%' gap={10}>
      <SetSelector
        selected={displayedRelicSets}
        options={relicSetOptions}
        placeholder={t('Sets')} // 'Relic set conditionals'
        submit={(arr) => {
          useComboDrawerStore.getState().updateSelectedSets(arr, false)
          persistSelectedSets()
        }}
      />
      <SetSelector
        selected={displayedOrnamentSets}
        options={ornamentOptions}
        placeholder={t('Ornaments')} // 'Ornament set conditionals'
        submit={(arr) => {
          useComboDrawerStore.getState().updateSelectedSets(arr, true)
          persistSelectedSets()
        }}
      />
    </Flex>
  )
}
