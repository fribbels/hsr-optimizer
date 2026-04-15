import {
  Flex,
  NumberInput,
  Slider,
} from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  conditionalAlign,
  conditionalJustify,
  ConditionalText as Text,
} from 'lib/tabs/tabOptimizer/conditionals/ConditionalShared'
import {
  getItemName,
  resolveConditionalValue,
} from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { WithPopover } from 'lib/ui/WithPopover'
import { precisionRound } from 'lib/utils/mathUtils'
import type {
  ComponentProps,
  ComponentType,
} from 'react'
import {
  useEffect,
  useState,
} from 'react'

const inputWidth = 61
const numberWidth = 55
const sliderWidth = 155

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

export const FormSlider: ComponentType<FormSliderProps> = ({
  disabled,
  min,
  max,
  text,
  id,
  percent,
  lc,
  set,
  teammateIndex,
  removeForm,
  onChange,
  value,
}) => {
  const props = { disabled, min, max, text, id, percent, lc, set, teammateIndex, removeForm, onChange, value }
  const itemName = getItemName(props)

  const storeValue = useOptimizerRequestStore((s) => removeForm ? undefined : resolveConditionalValue(s, itemName as (string | number)[]) as number | undefined)

  const currentValue = removeForm ? value : storeValue
  const [dragState, setDragState] = useState<number | undefined>(undefined)

  const multiplier = percent ? 100 : 1
  const step = percent ? 0.01 : 1
  const symbol = percent ? '%' : ''

  // Clamp the store value when eidolons change the slider bounds.
  useEffect(() => {
    if (removeForm) return
    const fieldValue = (storeValue ?? min) as number
    const clamped = Math.min(Math.max(fieldValue, min), max)
    if (clamped !== fieldValue) {
      handleConditionalChange(itemName as (string | number)[], clamped)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-clamp when bounds change; storeValue read for current value, not as trigger
  }, [min, max])

  const displayValue = dragState ?? currentValue

  const handleChange = removeForm
    ? onChange
    : (val: number) => handleConditionalChange(itemName as (string | number)[], val)

  const internalInputNumber = (
    <NumberInput
      min={min * multiplier}
      max={max * multiplier}
      hideControls
      style={{ width: numberWidth }}
      styles={{ input: { height: 24, minHeight: 24 } }}
      disabled={disabled}
      onChange={(newValue) => {
        if (handleChange && newValue != null && typeof newValue === 'number') {
          handleChange(newValue / multiplier)
        }
      }}
      value={precisionRound((displayValue ?? 0) * multiplier)}
      suffix={symbol || undefined}
    />
  )

  const internalSlider = (
    <Slider
      min={min}
      max={max}
      step={step}
      style={{
        minWidth: sliderWidth,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 1,
      }}
      label={(val) => `${precisionRound((val ?? 0) * multiplier)}${symbol}`}
      disabled={disabled}
      onChange={(newValue) => {
        setDragState(newValue)
      }}
      onChangeEnd={(newValue) => {
        setDragState(undefined)
        if (handleChange) {
          handleChange(newValue)
        }
      }}
      value={(displayValue ?? min) as number}
    />
  )

  return (
    <Flex direction='column' style={{ marginBottom: 0 }}>
      <Flex justify={conditionalJustify} align={conditionalAlign}>
        <div style={{ minWidth: inputWidth, display: 'block' }}>
          {internalInputNumber}
        </div>
        <Text style={{ lineHeight: '16px' }}>
          {text}
        </Text>
      </Flex>

      <Flex align='center' gap={5} h={14}>
        {internalSlider}
        <Text
          style={{
            minWidth: 20,
            marginBottom: 2,
            textAlign: 'center',
          }}
        >
          {`${precisionRound(max * multiplier)}${symbol}`}
        </Text>
      </Flex>
    </Flex>
  )
}

export const FormSliderWithPopover = WithPopover(FormSlider)

export type FormSliderWithPopoverProps = ComponentProps<typeof FormSliderWithPopover>
