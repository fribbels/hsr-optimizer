import { Flex, Form, InputNumber, Slider, Typography } from 'antd'
import { getItemName } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import WithPopover from 'lib/ui/WithPopover'
import { TsUtils } from 'lib/utils/TsUtils'
import { ComponentProps, ComponentType, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const justify = 'flex-start'
const align = 'center'
const inputWidth = 61
const numberWidth = 55
const sliderWidth = 155

const Text = styled(Typography)`
    white-space: pre-line;
`

export interface FormSliderProps {
  disabled?: boolean
  min: number
  max: number
  text: string
  id: string
  percent?: boolean
  lc?: boolean
  set?: boolean
  teammateIndex?: number
  removeForm?: boolean
  onChange?: (value: number) => void
  value?: number
}

export const FormSlider: ComponentType<FormSliderProps> = (props) => {
  const [state, setState] = useState(props?.value ?? undefined)

  const multiplier = (props.percent ? 100 : 1)
  const step = props.percent ? 0.01 : 1
  const symbol = props.percent ? '%' : ''

  const minRef = useRef(props.min)
  const maxRef = useRef(props.max)

  const itemName = getItemName(props)

  // Update the min and max values of the slider if eidolons change their bounds.
  useEffect(() => {
    const fieldValue = window.optimizerForm.getFieldValue(itemName)
    if (fieldValue >= props.max || fieldValue == maxRef.current) {
      window.optimizerForm.setFieldValue(itemName, props.max)
    }
    if (fieldValue <= props.min || fieldValue == minRef.current) {
      window.optimizerForm.setFieldValue(itemName, props.min)
    }

    minRef.current = props.min
    maxRef.current = props.max
  }, [props.min, props.max])

  const internalInputNumber = (
    <InputNumber
      min={props.min}
      max={props.max}
      controls={false}
      size='small'
      style={{
        width: numberWidth,
      }}
      parser={(value) => value == null || value == '' ? 0 : TsUtils.precisionRound(parseFloat(value) / multiplier)}
      formatter={(value) => `${TsUtils.precisionRound((value ?? 0) * multiplier)}${symbol}`}
      disabled={props.disabled}
      onChange={(newValue) => {
        if (props.onChange) {
          props.onChange(state ?? 0)
        }
      }}
      onBlur={() => {
        if (props.onChange) {
          props.onChange(state ?? 0)
        }
      }}
      value={props.value == null ? undefined : state}
    />
  )

  const internalSlider = (
    <Slider
      min={props.min}
      max={props.max}
      step={step}
      style={{
        minWidth: sliderWidth,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 1,
      }}
      tooltip={{
        formatter: (value) => `${TsUtils.precisionRound((value ?? 0) * multiplier)}${symbol}`,
      }}
      disabled={props.disabled}
      onChange={(newValue) => {
        if (props.onChange) {
          setState(newValue)
        }
      }}
      onChangeComplete={(newValue) => {
        if (props.onChange) {
          props.onChange(newValue)
        }
      }}
      value={props.value == null ? undefined : state}
    />
  )

  return (
    <Flex vertical gap={0} style={{ marginBottom: 0 }}>
      <Flex justify={justify} align={align}>
        <div style={{ minWidth: inputWidth, display: 'block' }}>
          {
            props.removeForm
              ? internalInputNumber
              : (
                <Form.Item name={itemName}>
                  {internalInputNumber}
                </Form.Item>
              )
          }
        </div>
        <Text style={{ lineHeight: '16px' }}>
          {props.text}
        </Text>
      </Flex>

      <Flex align='center' justify='flex-start' gap={5} style={{ height: 14 }}>
        {
          props.removeForm
            ? internalSlider
            : (
              <Form.Item name={itemName}>
                {internalSlider}
              </Form.Item>
            )
        }
        <Text
          style={{
            minWidth: 20,
            marginBottom: 2,
            textAlign: 'center',
          }}
        >
          {`${TsUtils.precisionRound(props.max * multiplier)}${symbol}`}
        </Text>
      </Flex>
    </Flex>
  )
}

export const FormSliderWithPopover = WithPopover(FormSlider)

export type FormSliderWithPopoverProps = ComponentProps<typeof FormSliderWithPopover>
