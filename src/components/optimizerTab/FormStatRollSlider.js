import {Flex, Form, InputNumber, Slider, Switch, Typography} from "antd";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import styled from "styled-components";

let justify = 'flex-start'
let align = 'center'
let inputWidth = 75
let numberWidth = 65
let sliderWidth = 130
const Text = styled(Typography)`
  white-space: pre-line;
`

export function FormStatRollSlider(props) {
  return (
    <Flex gap={5} style={{marginBottom: 0}} align='center'>
      <Flex justify='flex-start' style={{width: 45, marginRight: 10}}>
        <Text>
          {props.text}
        </Text>
      </Flex>
      <Flex align='center' justify='flex-start' gap={10}>
        <Form.Item name={['weights', props.name]}>
          <Slider
            min={0}
            max={1}
            step={0.25}
            style={{
              minWidth: sliderWidth,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 0,
            }}
            onChangeComplete={(x) => onOptimizerFormValuesChange(x, optimizerForm.getFieldsValue(), true)}
          />
        </Form.Item>
      </Flex>
    </Flex>
  )
}

export function FormStatRollSliderTopPercent(props) {
  const [inputValue, setInputValue] = useState(1);
  const onChange = (newValue) => {
    setInputValue(newValue);
  };

  return (
    <Flex gap={5} style={{marginBottom: 0}} align='center'>
      <Form.Item name={['weights', 'topPercent']}>
        <InputNumber
          size='small'
          style={{width: 50, marginRight: 5}}
          controls={false}
          min={1}
          max={100}
          onChange={(x) => {
            onChange(x)
            onOptimizerFormValuesChange(x, optimizerForm.getFieldsValue(), true)
          }}
          parser={(value) => value == null || value == '' ? 0 : Utils.precisionRound(value) }
          formatter={(value) => `${Utils.precisionRound(value)}`}
        />
      </Form.Item>

      <Flex align='center' justify='flex-start' gap={10}>
        <Form.Item name={['weights', 'topPercent']}>
          <Slider
            min={1}
            max={100}
            step={1}
            style={{
              minWidth: sliderWidth,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 0,
            }}
            keyboard={false}
            tooltip={{
              formatter: (value) => `${Utils.precisionRound(value)}%`
            }}
            value={typeof inputValue === 'number' ? inputValue : 0}
            onChange={onChange}
            onChangeComplete={(x) => onOptimizerFormValuesChange(x, optimizerForm.getFieldsValue(), true)}
          />
        </Form.Item>
      </Flex>
    </Flex>
  )
}