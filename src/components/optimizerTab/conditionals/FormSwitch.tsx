import styled from 'styled-components'
import { Flex, Form, Switch, Typography } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import WithPopover from 'components/common/WithPopover.tsx'
import { ComponentProps, ComponentType } from 'react'

const justify = 'flex-start'
const align = 'center'

const Text = styled(Typography)`
  white-space: pre-line;
`

function conditionalType(props: FormSwitchProps) {
  if (props.lc) {
    return 'lightConeConditionals'
  }
  return 'characterConditionals'
}

export interface FormSwitchProps {
  disabled?: boolean
  name: string
  text: string
  lc?: boolean
  teammateIndex?: number
}

export const FormSwitch: ComponentType<FormSwitchProps> = (props) => {
  const itemName = [conditionalType(props), props.name]
  if (props.teammateIndex != null) {
    itemName.unshift(`teammate${props.teammateIndex}`)
  }

  return (
    <Flex justify={justify} align={align}>
      <Form.Item name={itemName} valuePropName="checked">
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          disabled={props.disabled}
          defaultChecked={false}
          style={{ width: 45, marginRight: 5 }}
        />
      </Form.Item>
      <Text>{props.text}</Text>
    </Flex>
  )
}

export const FormSwitchWithPopover = WithPopover(FormSwitch)

export type FormSwitchWithPopoverProps = ComponentProps<typeof FormSwitchWithPopover>
