import { Flex, NumberInput, Slider } from '@mantine/core'
import { Constants } from 'lib/constants/constants'
import type { OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { Utils } from 'lib/utils/utils'
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

function WeightSlider({ stat }: { stat: string }) {
  const value = useOptimizerRequestStore((s) => s.weights[stat as keyof typeof s.weights])

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
      label={(val) => val.toFixed(1)}
      styles={{ label: { padding: '2px 6px' } }}
      value={value as number ?? 0}
      onChange={(val) => useOptimizerRequestStore.getState().setWeight(stat as keyof OptimizerRequestState['weights'], val)}
      onChangeEnd={() => recalculatePermutations()}
    />
  )
}

export function FormStatRollSliders() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })

  return (
    <Flex gap={10}>
      <Flex direction="column" w='max-content' gap={7}>
        {StatSliders.map((stat) => (
          <span style={{ textWrap: 'nowrap', height: 24, display: 'flex', alignItems: 'center' }} key={stat.name}>
            {t(stat.text)}
          </span>
        ))}
      </Flex>
      <Flex
        direction="column"
        gap={7}
        style={{
          width: '100%',
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        {StatSliders.map((stat) => (
          <div style={{ width: '100%', height: 24, display: 'flex', alignItems: 'center' }} key={stat.name}>
            <WeightSlider stat={stat.name} />
          </div>
        ))}
      </Flex>
    </Flex>
  )
}

const MAX_ROLLS = 5

export function FormStatRollSliderMinWeightedRolls() {
  const value = useOptimizerRequestStore((s) => s.weights.minWeightedRolls as number ?? 0)

  return (
    <Flex gap={5} align='center'>
      <Slider
        min={0}
        max={MAX_ROLLS}
        step={0.5}
        style={{ minWidth: 105, marginRight: 5 }}
        label={(value) => `${Utils.precisionRound(value)}`}
        value={value}
        onChange={(val) => {
          useOptimizerRequestStore.getState().setWeight('minWeightedRolls', val)
          recalculatePermutations()
        }}
      />

      <NumberInput
        className='center-input-text'
        style={{ width: 40 }}
        hideControls
        min={0}
        max={MAX_ROLLS}
        variant='unstyled'
        value={value}
        onChange={(x) => {
          if (x != null && typeof x === 'number') {
            useOptimizerRequestStore.getState().setWeight('minWeightedRolls', x)
          }
          recalculatePermutations()
        }}
      />
    </Flex>
  )
}
