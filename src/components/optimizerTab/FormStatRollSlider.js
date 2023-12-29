import {Flex, Form, InputNumber, Slider, Switch, Typography} from "antd";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import styled from "styled-components";

export function FormSlider(props) {
    const [inputValue, setInputValue] = useState(0);
    const onChange = (newValue) => {
      setInputValue(newValue);
    };
  
    return (
      <Flex vertical gap={5} style={{marginBottom: 0}}>
        <Flex justify={justify} align={align}>
          <div style={{minWidth: inputWidth, display: 'block'}}>
            <Form.Item name='Test'>
              <InputNumber
                min={props.min}
                max={props.max}
                controls={false}
                size='small'
                style={{
                  width: numberWidth,
                }}
                parser={(value) => value == null || value == '' ? 0 : precisionRound(value) }
                formatter={(value) => `${precisionRound(value)}`}
                onChange={onChange}
              />
            </Form.Item>
          </div>
          <Text>{props.text}</Text>
        </Flex>
        <Flex align='center' justify='flex-start' gap={10}>
          <Form.Item name='Test'>
            <Slider
              min={props.min}
              max={props.max}
              step={0.25}
              value={typeof inputValue === 'number' ? inputValue : 0}
              style={{
                minWidth: sliderWidth,
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 1
              }}
              onChange={onChange}
            />
          </Form.Item>
        </Flex>
      </Flex>
    )
  }