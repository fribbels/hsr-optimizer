import {
  Flex,
  Slider,
} from '@mantine/core'
import { Constants } from 'lib/constants/constants'
import type { OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'

import { HeaderText } from 'lib/ui/HeaderText'
import {
  Fragment,
  type ReactNode,
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

const labelStyle = { textWrap: 'nowrap', height: 24, display: 'flex', alignItems: 'center' } as const
const sliderRowStyle = { width: '100%', height: 24, display: 'flex', alignItems: 'center' } as const
const sliderStyle = { width: '100%', marginTop: 0, marginBottom: 0, marginLeft: 'auto', marginRight: 'auto' } as const
const sliderStyles = { label: { padding: '2px 6px' } } as const

function WeightSlider({ stat }: { stat: string }) {
  const value = useOptimizerRequestStore((s) => s.weights[stat as keyof typeof s.weights])

  return (
    <Slider
      min={0}
      max={1}
      step={0.25}
      style={sliderStyle}
      label={(val) => val.toFixed(2)}
      styles={sliderStyles}
      value={value as number ?? 0}
      onChange={(val) => useOptimizerRequestStore.getState().setWeight(stat as keyof OptimizerRequestState['weights'], val)}
    />
  )
}

const MAX_ROLLS = 5

function MinWeightedRollsSlider() {
  const value = useOptimizerRequestStore((s) => s.weights.minWeightedRolls as number ?? 0)

  return (
    <Slider
      min={0}
      max={MAX_ROLLS}
      step={0.5}
      style={sliderStyle}
      label={(val) => val.toFixed(1)}
      styles={sliderStyles}
      value={value}
      onChange={(val) => useOptimizerRequestStore.getState().setWeight('minWeightedRolls', val)}
    />
  )
}

export function FormStatRollSliders({ rollsHeader }: { rollsHeader?: ReactNode }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 20, rowGap: 7 }}>
      {StatSliders.map((stat) => (
        <Fragment key={stat.name}>
          <span style={labelStyle}>{t(stat.text)}</span>
          <div style={sliderRowStyle}>
            <WeightSlider stat={stat.name} />
          </div>
        </Fragment>
      ))}
      {rollsHeader && (
        <>
          <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
            <HeaderText>{rollsHeader}</HeaderText>
          </div>
          <span style={labelStyle}>#</span>
          <div style={sliderRowStyle}>
            <MinWeightedRollsSlider />
          </div>
        </>
      )}
    </div>
  )
}
