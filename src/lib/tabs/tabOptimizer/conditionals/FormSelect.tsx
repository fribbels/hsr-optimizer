import { Flex, Form, Select, Typography } from 'antd'
import { SelectOptionContent } from 'lib/optimization/rotation/setConditionalContent'
import { getItemName } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import WithPopover from 'lib/ui/WithPopover'
import { ComponentProps, ComponentType, useState } from 'react'
import styled from 'styled-components'

const justify = 'flex-start'
const align = 'center'

const Text = styled(Typography)`
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
  const [state, setState] = useState(props.value ?? undefined)

  const itemName = getItemName(props)

  const internalSelect = (
    <Select
      disabled={props.disabled}
      style={{ minWidth: props.fullWidth ? '100%' : 80, width: props.fullWidth ? '100%' : 80, marginRight: 5 }}
      optionLabelProp='display'
      listHeight={500}
      size='small'
      dropdownStyle={{ width: 'fit-content' }}
      options={props.options}
      onChange={(newValue) => {
        if (props.onChange) {
          setState(newValue ?? 0)
        }
      }}
      onBlur={() => {
        if (props.onChange) {
          props.onChange(state ?? 0)
        }
      }}
      value={props.value == null ? undefined : state}
    />
  )

  return (
    <Flex justify={justify} align={align} style={{ width: props.fullWidth ? '100%' : undefined }}>
      {
        props.removeForm
          ? internalSelect
          : (
            <Form.Item name={itemName} style={{ width: props.fullWidth ? '100%' : undefined }}>
              {internalSelect}
            </Form.Item>
          )
      }
      <Text>{props.fullWidth ? null : props.text}</Text>
    </Flex>
  )
}

export const FormSelectWithPopover = WithPopover(FormSelect)

export type FormSelectWithPopoverProps = ComponentProps<typeof FormSelectWithPopover>
