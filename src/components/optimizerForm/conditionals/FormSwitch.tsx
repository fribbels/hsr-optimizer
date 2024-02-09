import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Flex, Form, Switch, Typography } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import WithPopover from 'components/common/WithPopover'
import {ComponentProps, ComponentType} from 'react'

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
}

export const FormSwitch: ComponentType<FormSwitchProps> = (props) => {
  return (
    <Flex justify={justify} align={align}>
      <Form.Item name={[conditionalType(props), props.name]} valuePropName="checked">
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          disabled={props.disabled}
          defaultChecked={!props.disabled}
          style={{ width: 45, marginRight: 10 }}
        />
      </Form.Item>
      <Text>{props.text}</Text>
    </Flex>
  )
}

FormSwitch.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  lc: PropTypes.bool,
}

export const FormSwitchWithPopover = WithPopover(FormSwitch)

export type FormSwitchWithPopoverProps = ComponentProps<typeof FormSwitchWithPopover>
