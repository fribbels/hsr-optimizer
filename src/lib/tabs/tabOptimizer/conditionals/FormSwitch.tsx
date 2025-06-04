import {
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import {
  Flex,
  Form,
  Switch,
  Typography,
} from 'antd'
import { FormSelectProps } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { FormSliderProps } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import WithPopover from 'lib/ui/WithPopover'
import {
  ComponentProps,
  ComponentType,
} from 'react'
import styled from 'styled-components'

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
    return [conditionalType, props.id, 1]
  }
  const itemName = [conditionalType, props.id]
  if (props.teammateIndex != null) {
    itemName.unshift(`teammate${props.teammateIndex}`)
  }

  return itemName
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

  const internalSwitch = (
    <Switch
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
      disabled={props.disabled}
      style={{ width: 45, marginRight: 5 }}
      onChange={props.onChange}
      defaultChecked={props.value ?? undefined}
    />
  )

  return (
    <Flex justify={justify} align={align}>
      {props.removeForm
        ? internalSwitch
        : (
          <Form.Item name={itemName} valuePropName='checked'>
            {internalSwitch}
          </Form.Item>
        )}
      <Text>{props.text}</Text>
    </Flex>
  )
}

export const FormSwitchWithPopover = WithPopover(FormSwitch)

export type FormSwitchWithPopoverProps = ComponentProps<typeof FormSwitchWithPopover>
