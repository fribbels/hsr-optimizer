import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Flex, Switch, Text as MantineText } from '@mantine/core'
import { OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { FormSelectProps } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { FormSliderProps } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
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

export function getConditionalType(props: FormSwitchProps | FormSliderProps | FormSelectProps) {
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

export const FormSwitch: ComponentType<FormSwitchProps> = (props) => {
  const itemName = getItemName(props)

  const storeValue = useOptimizerRequestStore((s) =>
    props.removeForm ? undefined : resolveConditionalValue(s, itemName as (string | number)[]) as boolean | undefined,
  )

  const checked = props.removeForm ? props.value : storeValue
  const onChange = props.removeForm
    ? props.onChange
    : (val: boolean) => handleConditionalChange(itemName as (string | number)[], val)

  return (
    <Flex justify={justify} align={align}>
      <Switch
        onLabel={<IconCheck />}
        offLabel={<IconX />}
        disabled={props.disabled}
        style={{ width: 45, marginRight: 5 }}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        checked={checked}
      />
      <Text>{props.text}</Text>
    </Flex>
  )
}

export const FormSwitchWithPopover = WithPopover(FormSwitch)

export type FormSwitchWithPopoverProps = ComponentProps<typeof FormSwitchWithPopover>
