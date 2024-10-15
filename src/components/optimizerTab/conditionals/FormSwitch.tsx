import styled from 'styled-components'
import { Flex, Form, Switch, Typography } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import WithPopover from 'components/common/WithPopover'
import { ComponentProps, ComponentType } from 'react'
import { FormSliderProps } from 'components/optimizerTab/conditionals/FormSlider'
import { FormSelectProps } from 'components/optimizerTab/conditionals/FormSelect'

const justify = 'flex-start'
const align = 'center'

const Text = styled(Typography)`
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
    return [conditionalType, props.name, 1]
  }
  const itemName = [conditionalType, props.name]
  if (props.teammateIndex != null) {
    itemName.unshift(`teammate${props.teammateIndex}`)
  }

  return itemName
}

export interface FormSwitchProps {
  disabled?: boolean
  name: string
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

  const internalSwitch = (
    <Switch
      checkedChildren={<CheckOutlined/>}
      unCheckedChildren={<CloseOutlined/>}
      disabled={props.disabled}
      style={{ width: 45, marginRight: 5 }}
      onChange={props.onChange}
      defaultChecked={props.value ?? undefined}
    />
  )

  return (
    <Flex justify={justify} align={align}>
      {
        props.removeForm
          ? internalSwitch
          : (
            <Form.Item name={itemName} valuePropName='checked'>
              {internalSwitch}
            </Form.Item>
          )
      }
      <Text>{props.text}</Text>
    </Flex>
  )
}

export const FormSwitchWithPopover = WithPopover(FormSwitch)

export type FormSwitchWithPopoverProps = ComponentProps<typeof FormSwitchWithPopover>
