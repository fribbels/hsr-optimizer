import { Flex, NumberInput, Slider } from '@mantine/core'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { OptimizerFormState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { Utils } from 'lib/utils/utils'
import React, {
  ReactElement,
} from 'react'
import { useTranslation } from 'react-i18next'
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

function WeightSlider(props: { stat: string }) {
  const value = useOptimizerFormStore((s) => s.weights[props.stat as keyof typeof s.weights])

  return (
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
      value={value as number ?? 0}
      onChange={(val) => useOptimizerFormStore.getState().setWeight(props.stat as keyof OptimizerFormState['weights'], val)}
      onChangeEnd={() => recalculatePermutations()}
    />
  )
}

export function FormStatRollSliders() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })
  const labels: ReactElement[] = []
  const sliders: ReactElement[] = []
  for (const stat of StatSliders) {
    labels.push(
      <span style={{ textWrap: 'nowrap' }} key={stat.name}>
        {t(stat.text)}
      </span>,
    )
    sliders.push(
      <div style={{ width: '100%', alignContent: 'end', alignSelf: 'end' }} key={stat.name}>
        <WeightSlider stat={stat.name} />
      </div>,
    )
  }
  return (
    <Flex gap={10}>
      <Flex direction="column" style={{ width: 'max-content' }} gap={3}>
        {labels}
      </Flex>
      <Flex
        direction="column"
        gap={3}
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

const formNamePerSlotIndex: Record<number, string> = {
  0: 'headHands',
  1: 'bodyFeet',
  2: 'sphereRope',
} as const

const MAX_ROLLS = 5

export function FormStatRollSliderTopPercent(props: { index: number }) {
  const { index } = props
  const parts = partsPerSlotIndex[index]
  const name = formNamePerSlotIndex[index]

  const value = useOptimizerFormStore((s) => s.weights[name as keyof typeof s.weights] as number ?? 0)

  return (
    <Flex gap={5} style={{ marginBottom: 0 }} align='center'>
      <Flex gap={5} justify='flex-start' style={{ minWidth: 50 }}>
        <img src={Assets.getPart(parts[0])} style={{ width: 18 }} />
        <img src={Assets.getPart(parts[1])} style={{ width: 18 }} />
      </Flex>

      <Flex align='center' justify='flex-start' gap={10}>
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
          label={(value) => `${Utils.precisionRound(value)}`}
          value={value}
          onChange={(val) => useOptimizerFormStore.getState().setWeight(name as keyof OptimizerFormState['weights'], val)}
          onChangeEnd={() => recalculatePermutations()}
        />
      </Flex>

      <NumberInput
        size='sm'
        className='center-input-text'
        style={{
          width: 40,
        }}
        hideControls
        min={0}
        max={MAX_ROLLS}
        variant='unstyled'
        value={value}
        onChange={(x) => {
          if (x != null && typeof x === 'number') {
            useOptimizerFormStore.getState().setWeight(name as keyof OptimizerFormState['weights'], x)
          }
          recalculatePermutations()
        }}
      />
    </Flex>
  )
}
