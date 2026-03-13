import { Flex } from '@mantine/core'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { useOrnamentsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import {
  ComboCharacter,
  ComboState,
  updateSelectedSets,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

function SetSelector({ selected, options, placeholder, submit }: {
  selected: string[]
  options: {
    value: string
    label: ReactElement
  }[]
  placeholder: string
  submit: (arr: string[]) => void
}) {
  const values = selected ?? []

  const stringOptions = options.map((opt) => ({
    value: opt.value,
    label: typeof opt.label === 'string' ? opt.label : opt.value,
  }))

  return (
    <MultiSelectPills
      dropdownWidth={300}
      maxDisplayedValues={1}
      maxDropdownHeight={800}
      clearable
      style={{ flex: 1 }}
      data={stringOptions}
      placeholder={placeholder}
      value={values}
      onChange={(val) => submit(val)}
/>
  )
}

export function SetSelectors({ comboOrigin, comboState, onComboStateChange }: {
  comboOrigin: ComboCharacter
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer.Placeholders' })
  const ornamentOptions = useOrnamentsOptions()
  const relicSetOptions = useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])
  return (
    <Flex w='100%' gap={10}>
      <SetSelector
        selected={comboOrigin?.displayedRelicSets}
        options={relicSetOptions}
        placeholder={t('Sets')} // 'Relic set conditionals'
        submit={(arr) => {
          const newState = updateSelectedSets(comboState, arr, false)
          if (newState) onComboStateChange(newState)
        }}
      />
      <SetSelector
        selected={comboOrigin?.displayedOrnamentSets}
        options={ornamentOptions}
        placeholder={t('Ornaments')} // 'Ornament set conditionals'
        submit={(arr) => {
          const newState = updateSelectedSets(comboState, arr, true)
          if (newState) onComboStateChange(newState)
        }}
      />
    </Flex>
  )
}
