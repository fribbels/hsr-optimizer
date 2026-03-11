import { Flex, Select, Text as MantineText } from '@mantine/core'
import { SelectOptionContent } from 'lib/optimization/rotation/setConditionalContent'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { getItemName, resolveConditionalValue } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import WithPopover from 'lib/ui/WithPopover'
import {
  ComponentProps,
  ComponentType,
} from 'react'
import styled from 'styled-components'

const justify = 'flex-start'
const align = 'center'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const Text = styled(MantineText as any)`
    white-space: pre-line;
`

export interface FormSelectProps {
  disabled?: boolean
  id: string
  text: string
  lc?: boolean
  set?: boolean
  teammateIndex?: number
  removeForm?: boolean
  onChange?: (value: number) => void
  value?: number
  fullWidth?: boolean
  options?: SelectOptionContent[]
}

export const FormSelect: ComponentType<FormSelectProps> = (props) => {
  const itemName = getItemName(props)

  const storeValue = useOptimizerRequestStore((s) =>
    props.removeForm ? undefined : resolveConditionalValue(s, itemName as (string | number)[]) as number | undefined,
  )

  const currentValue = props.removeForm ? props.value : storeValue
  const handleChange = props.removeForm
    ? props.onChange
    : (val: number) => handleConditionalChange(itemName as (string | number)[], val)

  const stringOptions = props.options?.map((opt) => ({
    label: opt.display || opt.label,
    value: String(opt.value),
  }))

  const internalSelect = (
    <Select
      disabled={props.disabled}
      style={{ minWidth: props.fullWidth ? '100%' : 80, width: props.fullWidth ? '100%' : 80, marginRight: 5 }}
      maxDropdownHeight={500}
      size='xs'
      comboboxProps={{ styles: { dropdown: { width: 'fit-content' } } }}
      data={stringOptions}
      onChange={(newValue) => {
        if (handleChange) {
          handleChange(newValue ? Number(newValue) : 0)
        }
      }}
      value={currentValue != null ? String(currentValue) : null}
    />
  )

  return (
    <Flex justify={justify} align={align} style={{ width: props.fullWidth ? '100%' : undefined }}>
      {internalSelect}
      <Text>{props.fullWidth ? null : props.text}</Text>
    </Flex>
  )
}

export const FormSelectWithPopover = WithPopover(FormSelect)

export type FormSelectWithPopoverProps = ComponentProps<typeof FormSelectWithPopover>
