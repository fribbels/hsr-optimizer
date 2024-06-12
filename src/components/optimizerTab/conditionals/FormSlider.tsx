import { ComponentProps, ComponentType, useState } from 'react'
import { Flex, Form, InputNumber, Slider, Typography } from 'antd'
import styled from 'styled-components'
import WithPopover from 'components/common/WithPopover.tsx'

const justify = 'flex-start'
const align = 'center'
const inputWidth = 61
const numberWidth = 55
const sliderWidth = 155

const Text = styled(Typography)`
  white-space: pre-line;
`
function precisionRound(number: number, precision: number = 8) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

function conditionalType(props: FormSliderProps) {
  if (props.lc) {
    return 'lightConeConditionals'
  }
  return 'characterConditionals'
}

export interface FormSliderProps {
  disabled?: boolean
  min: number
  max: number
  text: string
  name: string
  percent?: boolean
  lc?: boolean
  teammateIndex?: number
}

export const FormSlider: ComponentType<FormSliderProps> = (props) => {
  const [inputValue, setInputValue] = useState<number | null>(1)

  const multiplier = (props.percent ? 100 : 1)
  const step = props.percent ? 0.01 : 1
  const symbol = props.percent ? '%' : ''

  const itemName = [conditionalType(props), props.name]
  if (props.teammateIndex != null) {
    itemName.unshift(`teammate${props.teammateIndex}`)
  }

  return (
    <Flex vertical gap={5} style={{ marginBottom: 0 }}>
      <Flex justify={justify} align={align}>
        <div style={{ minWidth: inputWidth, display: 'block' }}>
          <Form.Item name={itemName}>
            <InputNumber
              min={props.min}
              max={props.max}
              controls={false}
              size="small"
              style={{
                width: numberWidth,
              }}
              parser={(value) => value == null || value == '' ? 0 : precisionRound(parseFloat(value) / multiplier)}
              formatter={(value) => `${precisionRound((value ?? 0) * multiplier)}${symbol}`}
              onChange={setInputValue}
              disabled={props.disabled}
            />
          </Form.Item>
        </div>
        <Text>{props.text}</Text>
      </Flex>
      <Flex align="center" justify="flex-start" gap={5} style={{ height: 14 }}>
        <Form.Item name={itemName}>
          <Slider
            min={props.min}
            max={props.max}
            step={step}
            value={typeof inputValue === 'number' ? inputValue : 0}
            style={{
              minWidth: sliderWidth,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 1,
            }}
            tooltip={{
              formatter: (value) => `${precisionRound((value ?? 0) * multiplier)}${symbol}`,
            }}
            onChange={setInputValue}
            disabled={props.disabled}
          />
        </Form.Item>
        <Text style={{ minWidth: 20, marginBottom: 2, textAlign: 'center' }}>{`${precisionRound(props.max * multiplier)}${symbol}`}</Text>
      </Flex>
    </Flex>
  )
}

export const FormSliderWithPopover = WithPopover(FormSlider)

export type FormSliderWithPopoverProps = ComponentProps<typeof FormSliderWithPopover>
