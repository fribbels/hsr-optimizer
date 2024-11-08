import { Flex, Form, InputNumber, Slider, Typography } from 'antd'
import { Assets } from 'lib/assets'
import { Constants, Parts } from 'lib/constants'
import { Utils } from 'lib/utils'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Text = styled(Typography)`
    white-space: pre-line;
`

const StatSliders = [
  { text: 'HPFilterText', name: Constants.Stats.HP_P },
  { text: 'ATKFilterText', name: Constants.Stats.ATK_P },
  { text: 'DEFFilterText', name: Constants.Stats.DEF_P },
  { text: 'SPDFilterText', name: Constants.Stats.SPD },
  { text: 'CRFilterText', name: Constants.Stats.CR },
  { text: 'CDFilterText', name: Constants.Stats.CD },
  { text: 'EHRFilterText', name: Constants.Stats.EHR },
  { text: 'RESFilterText', name: Constants.Stats.RES },
  { text: 'BEFilterText', name: Constants.Stats.BE },
] as const

export function FormStatRollSliders() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })
  const labels: ReactElement[] = []
  const sliders: ReactElement[] = []
  for (const stat of StatSliders) {
    labels.push(
      <Text style={{ textWrap: 'nowrap' }} key={stat.name}>
        {t(stat.text)}
      </Text>,
    )
    sliders.push(
      <Form.Item name={['weights', stat.name]} style={{ width: '100%', alignContent: 'end', alignSelf: 'end' }} key={stat.name}>
        <Slider
          min={0}
          max={1}
          step={0.25}
          style={{
            width: '100%',
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
          onChangeComplete={(x) => window.onOptimizerFormValuesChange(x, window.optimizerForm.getFieldsValue(), true)}
        />
      </Form.Item>,
    )
  }
  return (
    <Flex gap={10}>
      <Flex vertical style={{ width: 'max-content' }}>
        {labels}
      </Flex>
      <Flex
        vertical
        style={{
          width: '100%',
          marginLeft: 10,
          marginRight: 10,
        }}
        align='flex-end'
      >
        {sliders}
      </Flex>
    </Flex>
  )
}

const partsPerSlotIndex: Record<number, string[]> = {
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

export function FormStatRollSliderTopPercent(props: { index: number }) {
  const { index } = props
  const parts = partsPerSlotIndex[index]
  const name = formNamePerSlotIndex[index]

  const [inputValue, setInputValue] = useState<number | null>(1)
  const onChange = (newValue: number | null) => {
    setInputValue(newValue)
  }

  return (
    <Flex gap={5} style={{ marginBottom: 0 }} align='center'>
      <Flex gap={5} justify='flex-start' style={{ minWidth: 50 }}>
        <img src={Assets.getPart(parts[0])} style={{ width: 18 }}/>
        <img src={Assets.getPart(parts[1])} style={{ width: 18 }}/>
      </Flex>

      <Flex align='center' justify='flex-start' gap={10}>
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
          size='small'
          className='center-input-text'
          style={{
            width: 40,
          }}
          controls={false}
          min={0}
          max={MAX_ROLLS}
          // variant="filled"
          variant='borderless'
          onChange={(x: number | null) => {
            onChange(x)
            window.onOptimizerFormValuesChange(x, window.optimizerForm.getFieldsValue(), true)
          }}
        />
      </Form.Item>
    </Flex>
  )
}
