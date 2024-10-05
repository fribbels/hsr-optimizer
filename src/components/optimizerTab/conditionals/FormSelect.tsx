import styled from 'styled-components'
import { Flex, Form, Select, Typography } from 'antd'
import WithPopover from 'components/common/WithPopover'
import { ComponentProps, ComponentType } from 'react'
import { SelectOptionContent } from 'lib/optimizer/rotation/setConditionalContent'

const justify = 'flex-start'
const align = 'center'

const Text = styled(Typography)`
    white-space: pre-line;
`

function conditionalType(props: FormSelectProps) {
  if (props.lc) {
    return 'lightConeConditionals'
  }
  return 'characterConditionals'
}

export interface FormSelectProps {
  disabled?: boolean
  name: string
  text: string
  lc?: boolean
  teammateIndex?: number
  removeForm?: boolean
  onChange?: (checked: boolean) => void
  value?: number
  options?: SelectOptionContent[]
}

export const FormSelect: ComponentType<FormSelectProps> = (props) => {
  const itemName = [conditionalType(props), props.name]
  if (props.teammateIndex != null) {
    itemName.unshift(`teammate${props.teammateIndex}`)
  }

  const internalSelect = (
    <Select
      disabled={props.disabled}
      style={{ width: 80, marginRight: 5 }}
      optionLabelProp='display'
      listHeight={500}
      size='small'
      dropdownStyle={{ width: 'fit-content' }}
      options={props.options}
      onChange={props.onChange}
    />
  )

  return (
    <Flex justify={justify} align={align}>
      {
        props.removeForm ?
          internalSelect
          :
          <Form.Item name={itemName}>
            {internalSelect}
          </Form.Item>
      }
      <Text>{props.text}</Text>
    </Flex>
  )
}

export const FormSelectWithPopover = WithPopover(FormSelect)

export type FormSelectWithPopoverProps = ComponentProps<typeof FormSelectWithPopover>
