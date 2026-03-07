import {
  Flex,
  InputNumber,
  Slider,
  Typography,
} from 'antd'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { getItemName, resolveConditionalValue } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import WithPopover from 'lib/ui/WithPopover'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  ComponentProps,
  ComponentType,
  useEffect,
  useRef,
  useState,
} from 'react'
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
  const itemName = getItemName(props)

  const storeValue = useOptimizerFormStore((s) =>
    props.removeForm ? undefined : resolveConditionalValue(s, itemName as (string | number)[]) as number | undefined,
  )

  const currentValue = props.removeForm ? props.value : storeValue
  const [dragState, setDragState] = useState<number | undefined>(undefined)

  const multiplier = props.percent ? 100 : 1
  const step = props.percent ? 0.01 : 1
  const symbol = props.percent ? '%' : ''

  const minRef = useRef(props.min)
  const maxRef = useRef(props.max)

  // Update the value if eidolons change the slider bounds.
  useEffect(() => {
    if (props.removeForm) return
    const fieldValue = (storeValue ?? props.min) as number
    if (fieldValue >= props.max || fieldValue == maxRef.current) {
      handleConditionalChange(itemName as (string | number)[], props.max)
    }
    if (fieldValue <= props.min || fieldValue == minRef.current) {
      handleConditionalChange(itemName as (string | number)[], props.min)
    }

    minRef.current = props.min
    maxRef.current = props.max
  }, [props.min, props.max])

  const displayValue = dragState ?? currentValue

  const handleChange = props.removeForm
    ? props.onChange
    : (val: number) => handleConditionalChange(itemName as (string | number)[], val)

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
        if (handleChange && newValue != null) {
          handleChange(newValue)
        }
      }}
      value={displayValue}
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
        setDragState(newValue)
      }}
      onChangeComplete={(newValue) => {
        setDragState(undefined)
        if (handleChange) {
          handleChange(newValue)
        }
      }}
      value={displayValue}
    />
  )

  return (
    <Flex vertical gap={0} style={{ marginBottom: 0 }}>
      <Flex justify={justify} align={align}>
        <div style={{ minWidth: inputWidth, display: 'block' }}>
          {internalInputNumber}
        </div>
        <Text style={{ lineHeight: '16px' }}>
          {props.text}
        </Text>
      </Flex>

      <Flex align='center' justify='flex-start' gap={5} style={{ height: 14 }}>
        {internalSlider}
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
