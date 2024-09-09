import { Flex, Form, InputNumber, Slider, Typography } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Utils } from 'lib/utils'
import PropTypes from 'prop-types'
import { Parts } from 'lib/constants'

const sliderWidth = 140
const Text = styled(Typography)`
    white-space: pre-line;
`

export function FormStatRollSlider(props) {
  return (
    <Flex>
      <Flex justify="flex-start" style={{ width: 45, marginRight: 10 }}>
        <Text>
          {props.text}
        </Text>
      </Flex>
      <Flex align="center">
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
            onChangeComplete={(x) => window.onOptimizerFormValuesChange(x, window.optimizerForm.getFieldsValue(), true)}
          />
        </Form.Item>
      </Flex>
    </Flex>
  )
}

FormStatRollSlider.propTypes = {
  text: PropTypes.string,
  name: PropTypes.string,
}

const partsPerSlotIndex = {
  0: [Parts.Head, Parts.Hands],
  1: [Parts.Body, Parts.Feet],
  2: [Parts.PlanarSphere, Parts.LinkRope],
}

const formNamePerSlotIndex = {
  0: 'headHands',
  1: 'bodyFeet',
  2: 'sphereRope',
}

const MAX_ROLLS = 5

export function FormStatRollSliderTopPercent(props) {
  const { index } = props
  const parts = partsPerSlotIndex[index]
  const name = formNamePerSlotIndex[index]

  const [inputValue, setInputValue] = useState(1)
  const onChange = (newValue) => {
    setInputValue(newValue)
  }

  return (
    <Flex gap={5} style={{ marginBottom: 0 }} align="center">
      <Flex gap={5} justify="flex-start" style={{ minWidth: 50 }}>
        <img src={Assets.getPart(parts[0])} style={{ width: 18 }}/>
        <img src={Assets.getPart(parts[1])} style={{ width: 18 }}/>
      </Flex>

      <Flex align="center" justify="flex-start" gap={10}>
        <Form.Item name={['weights', name]}>
          <Slider
            min={0}
            max={MAX_ROLLS}
            step={0.5}
            style={{
              minWidth: 105,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 0,
              marginRight: 5,
            }}
            // marks={[1, 2, 3, 4, 5, 6, 7, 9]}
            keyboard={false}
            tooltip={{
              formatter: (value) => `${Utils.precisionRound(value)}`,
            }}
            value={typeof inputValue === 'number' ? inputValue : 0}
            onChange={onChange}
            onChangeComplete={(x) => window.onOptimizerFormValuesChange(x, window.optimizerForm.getFieldsValue(), true)}
          />
        </Form.Item>
      </Flex>

      <Form.Item name={['weights', name]}>
        <InputNumber
          size="small"
          className="center-input-text"
          style={{
            width: 40,
          }}
          controls={false}
          min={0}
          max={MAX_ROLLS}
          // variant="filled"
          variant="borderless"
          onChange={(x) => {
            onChange(x)
            window.onOptimizerFormValuesChange(x, window.optimizerForm.getFieldsValue(), true)
          }}
        />
      </Form.Item>
    </Flex>
  )
}
