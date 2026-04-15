import {
  Flex,
  Switch,
} from '@mantine/core'
import type { OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  conditionalAlign,
  conditionalJustify,
  ConditionalText as Text,
} from 'lib/tabs/tabOptimizer/conditionals/ConditionalShared'
import type { FormSelectProps } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import type { FormSliderProps } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { WithPopover } from 'lib/ui/WithPopover'
import type {
  ComponentProps,
  ComponentType,
} from 'react'

function getConditionalType(props: FormSwitchProps | FormSliderProps | FormSelectProps) {
  if (props.set) {
    return 'setConditionals'
  }
  if (props.lc) {
    return 'lightConeConditionals'
  }
  return 'characterConditionals'
}

export function getItemName(props: FormSwitchProps | FormSliderProps | FormSelectProps) {
  const conditionalType = getConditionalType(props)
  if (props.set) {
    return [conditionalType, props.id, 1]
  }
  const itemName = [conditionalType, props.id]
  if (props.teammateIndex != null) {
    itemName.unshift(`teammate${props.teammateIndex}`)
  }

  return itemName
}

const teammateKeyToIndex: Record<string, 0 | 1 | 2> = {
  teammate0: 0,
  teammate1: 1,
  teammate2: 2,
}

export function resolveConditionalValue(
  state: OptimizerRequestState,
  itemName: (string | number)[],
): unknown {
  // itemName is like ['characterConditionals', 'id'] or ['teammate0', 'lightConeConditionals', 'id'] or ['setConditionals', 'id', 1]
  const [first, ...rest] = itemName
  const tmIndex = teammateKeyToIndex[first as string]
  if (tmIndex != null) {
    // Teammate path: resolve from state.teammates[N]
    let current: unknown = state.teammates[tmIndex]
    for (const key of rest) {
      if (current == null) return undefined
      current = (current as Record<string | number, unknown>)[key]
    }
    return current
  }
  // Main character path: resolve from state directly
  let current: unknown = state
  for (const key of itemName) {
    if (current == null) return undefined
    current = (current as Record<string | number, unknown>)[key]
  }
  return current
}

export interface FormSwitchProps {
  disabled?: boolean
  id: string
  text: string
  lc?: boolean
  set?: boolean
  teammateIndex?: number
  removeForm?: boolean
  onChange?: (checked: boolean) => void
  value?: boolean
}

export const FormSwitch: ComponentType<FormSwitchProps> = ({
  disabled,
  id,
  text,
  lc,
  set,
  teammateIndex,
  removeForm,
  onChange: onChangeProp,
  value,
}) => {
  const itemName = getItemName({ disabled, id, text, lc, set, teammateIndex, removeForm, onChange: onChangeProp, value })

  const storeValue = useOptimizerRequestStore((s) =>
    removeForm ? undefined : resolveConditionalValue(s, itemName as (string | number)[]) as boolean | undefined
  )

  const checked = removeForm ? value : storeValue
  const onChange = removeForm
    ? onChangeProp
    : (val: boolean) => handleConditionalChange(itemName as (string | number)[], val)

  return (
    <Flex justify={conditionalJustify} align={conditionalAlign}>
      <Switch
        disabled={disabled}
        style={{ marginRight: 5 }}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        checked={checked}
      />
      <Text>{text}</Text>
    </Flex>
  )
}

export const FormSwitchWithPopover = WithPopover(FormSwitch)

export type FormSwitchWithPopoverProps = ComponentProps<typeof FormSwitchWithPopover>
