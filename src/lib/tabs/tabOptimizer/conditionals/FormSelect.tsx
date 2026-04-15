import {
  Flex,
  Select,
} from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  conditionalAlign,
  conditionalJustify,
  ConditionalText as Text,
} from 'lib/tabs/tabOptimizer/conditionals/ConditionalShared'
import {
  getItemName,
  resolveConditionalValue,
} from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { WithPopover } from 'lib/ui/WithPopover'
import type {
  ComponentProps,
  ComponentType,
} from 'react'
import type { SelectOptionContent } from 'types/setConfig'

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

export const FormSelect: ComponentType<FormSelectProps> = ({
  disabled,
  id,
  text,
  lc,
  set,
  teammateIndex,
  removeForm,
  onChange,
  value,
  fullWidth,
  options,
}) => {
  const itemName = getItemName({ disabled, id, text, lc, set, teammateIndex, removeForm, onChange, value, fullWidth, options })

  const storeValue = useOptimizerRequestStore((s) => removeForm ? undefined : resolveConditionalValue(s, itemName as (string | number)[]) as number | undefined)

  const currentValue = removeForm ? value : storeValue
  const handleChange = removeForm
    ? onChange
    : (val: number) => handleConditionalChange(itemName as (string | number)[], val)

  const stringOptions = options?.map((opt) => ({
    label: opt.display || opt.label,
    value: String(opt.value),
  }))

  const internalSelect = (
    <Select
      disabled={disabled}
      style={{ minWidth: fullWidth ? '100%' : 80, width: fullWidth ? '100%' : 80, marginRight: 5 }}
      maxDropdownHeight={500}
      comboboxProps={{ keepMounted: false, styles: { dropdown: { width: 'fit-content' } } }}
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
    <Flex justify={conditionalJustify} align={conditionalAlign} style={{ width: fullWidth ? '100%' : undefined }}>
      {internalSelect}
      <Text>{fullWidth ? null : text}</Text>
    </Flex>
  )
}

export const FormSelectWithPopover = WithPopover(FormSelect)

export type FormSelectWithPopoverProps = ComponentProps<typeof FormSelectWithPopover>
