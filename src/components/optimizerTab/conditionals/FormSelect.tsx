import styled from 'styled-components'
import { Flex, Form, Select, Typography } from 'antd'
import WithPopover from 'components/common/WithPopover'
import { ComponentProps, ComponentType, useState } from 'react'
import { SelectOptionContent } from 'lib/optimizer/rotation/setConditionalContent'
import { getItemName } from 'components/optimizerTab/conditionals/FormSwitch'

const justify = 'flex-start'
const align = 'center'

const Text = styled(Typography)`
    white-space: pre-line;
`

export interface FormSelectProps {
  disabled?: boolean
  name: string
  text: string
  lc?: boolean
  set?: boolean
  teammateIndex?: number
  removeForm?: boolean
  onChange?: (value: number) => void
  value?: number
  options?: SelectOptionContent[]
}

export const FormSelect: ComponentType<FormSelectProps> = (props) => {
  const [state, setState] = useState(props.value ?? undefined)

  const itemName = getItemName(props)

  const internalSelect = (
    <Select
      disabled={props.disabled}
      style={{ minWidth: 80, width: 80, marginRight: 5 }}
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
    <Flex justify={justify} align={align}>
      {
        props.removeForm
          ? internalSelect
          : (
            <Form.Item name={itemName}>
              {internalSelect}
            </Form.Item>
          )
      }
      <Text>{props.text}</Text>
    </Flex>
  )
}

export const FormSelectWithPopover = WithPopover(FormSelect)

export type FormSelectWithPopoverProps = ComponentProps<typeof FormSelectWithPopover>
