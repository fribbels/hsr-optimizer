import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Flex, Form, Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import WithPopover from "components/common/WithPopover";

const justify = 'flex-start'
const align = 'center'

const Text = styled(Typography)`
  white-space: pre-line;
`

function conditionalType(props) {
  if (props.lc) {
    return 'lightConeConditionals'
  }
  return 'characterConditionals'
}

export function FormSwitch(props) {
  return (

    <Flex justify={justify} align={align}>
      <Form.Item name={[conditionalType(props), props.name]} valuePropName='checked'>
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
};

export const FormSwitchWithPopover = WithPopover(FormSwitch);
FormSwitchWithPopover.propTypes = {
  ...FormSwitch.propTypes,
  ...WithPopover.propTypes
};

export type FormSwitchWithPopoverProps = PropTypes.InferProps<typeof FormSwitchWithPopover.propTypes>;