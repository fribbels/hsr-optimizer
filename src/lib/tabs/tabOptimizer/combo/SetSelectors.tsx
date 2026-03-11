import { Flex, MultiSelect } from '@mantine/core'
import GenerateOrnamentsOptions from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import {
  ComboCharacter,
  ComboState,
  updateSelectedSets,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

function SetSelector(props: {
  selected: string[]
  options: {
    value: string
    label: ReactElement
  }[]
  placeholder: string
  submit: (arr: string[]) => void
}) {
  const stringOptions = props.options.map((opt) => ({
    value: opt.value,
    label: typeof opt.label === 'string' ? opt.label : opt.value,
  }))

  return (
    <MultiSelect
      comboboxProps={{ styles: { dropdown: { width: 300 } } }}
      maxDropdownHeight={800}
      clearable
      style={{ flex: 1 }}
      data={stringOptions}
      placeholder={props.placeholder}
      value={props.selected ?? []}
      onChange={(val) => {
        props.submit(val)
      }}
    />
  )
}

export function SetSelectors(props: {
  comboOrigin: ComboCharacter
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer.Placeholders' })
  const ornamentOptions = useMemo(() => GenerateOrnamentsOptions(), [i18n.resolvedLanguage])
  const relicSetOptions = useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])
  return (
    <Flex style={{ width: '100%' }} gap={10}>
      <SetSelector
        selected={props.comboOrigin?.displayedRelicSets}
        options={relicSetOptions}
        placeholder={t('Sets')} // 'Relic set conditionals'
        submit={(arr) => {
          const newState = updateSelectedSets(props.comboState, arr, false)
          if (newState) props.onComboStateChange(newState)
        }}
      />
      <SetSelector
        selected={props.comboOrigin?.displayedOrnamentSets}
        options={ornamentOptions}
        placeholder={t('Ornaments')} // 'Ornament set conditionals'
        submit={(arr) => {
          const newState = updateSelectedSets(props.comboState, arr, true)
          if (newState) props.onComboStateChange(newState)
        }}
      />
    </Flex>
  )
}
