import { Flex, Form, InputNumber, Slider, Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

let justify = 'flex-start'
let align = 'center'
let inputWidth = 75
let numberWidth = 65
let sliderWidth = 145

const Text = styled(Typography)`
  white-space: pre-line;
`
function precisionRound(number, precision = 8) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

export function FormSwitch(props) {
  return (
    <Flex justify={justify} align={align}>
      <div style={{minWidth: inputWidth, display: 'block'}}>
        <Form.Item name={[conditionalType(props), props.name]} valuePropName='checked'>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            disabled={props.disabled}
            defaultChecked={!props.disabled}
          />
        </Form.Item>
      </div>
      <Text>{props.text}</Text>
    </Flex>
  )
}
FormSwitch.propTypes = {
  disabled: PropTypes.bool,
  text: PropTypes.string,
  name: PropTypes.string,
}

export function FormSlider(props) {
  const [inputValue, setInputValue] = useState(1);
  const onChange = (newValue) => {
    setInputValue(newValue);
  };

  let multiplier = (props.percent ? 100 : 1)
  let step = props.percent ? 0.01 : 1
  let symbol = props.percent ? '%' : ''

  return (
    <Flex vertical gap={5} style={{marginBottom: 0}}>
      <Flex justify={justify} align={align}>
        <div style={{minWidth: inputWidth, display: 'block'}}>
          <Form.Item name={[conditionalType(props), props.name]}>
            <InputNumber
              min={props.min}
              max={props.max}
              controls={false}
              size='small'
              style={{
                width: numberWidth,
              }}
              parser={(value) => value == null || value == '' ? 0 : precisionRound(value / multiplier) }
              formatter={(value) => `${precisionRound(value * multiplier)}`}
              addonAfter={symbol}
              onChange={onChange}
              disabled={props.disabled}
            />
          </Form.Item>
        </div>
        <Text>{props.text}</Text>
      </Flex>
      <Flex align='center' justify='flex-start' gap={10} style={{height: 14}}>
        <Form.Item name={[conditionalType(props), props.name]}>
          <Slider
            min={props.min}
            max={props.max}
            step={step}
            value={typeof inputValue === 'number' ? inputValue : 0}
            style={{
              minWidth: sliderWidth,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 1
            }}
            tooltip={{
              formatter: (value) => `${precisionRound(value * multiplier)}${symbol}`
            }}
            onChange={onChange}
            disabled={props.disabled}
          />
        </Form.Item>
        <Text style={{minWidth: 20, marginBottom: 2, textAlign: 'center'}}>{`${precisionRound(props.max * multiplier)}${symbol}`}</Text>
      </Flex>
    </Flex>
  )
}
FormSlider.propTypes = {
  disabled: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  text: PropTypes.string,
  name: PropTypes.string,
  percent: PropTypes.bool,
}


function conditionalType(props) {
  if (props.lc) {
    return 'lightConeConditionals'
  }
  return 'characterConditionals'
}