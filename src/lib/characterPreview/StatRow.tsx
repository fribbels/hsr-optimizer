import { Divider } from '@mantine/core'
import { type BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  Constants,
  type StatsValues,
} from 'lib/constants/constants'
import iconClasses from 'style/icons.module.css'
import { type ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'

import { Assets } from 'lib/rendering/assets'
import {
  localeNumber,
  localeNumber_0,
  localeNumber_000,
} from 'lib/utils/i18nUtils'
import { memo, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { isFlat } from 'lib/utils/statUtils'
import { truncate10ths, truncate1000ths, precisionRound } from 'lib/utils/mathUtils'

const breakpointPresets = [
  [111.1, 111.2],
  [114.2, 114.3],
  [133.3, 133.4],
  [142.8, 142.9],
  [155.5, 155.6],
  [171.4, 171.5],
  [177.7, 177.8],
]

const checkSpeedInBreakpoint = (speedValue: number): boolean => {
  return breakpointPresets.some(([min, max]) => {
    return speedValue >= min && speedValue < max
  })
}

export const damageStats: Record<string, string> = {
  'Fire DMG Boost': 'Fire DMG',
  'Ice DMG Boost': 'Ice DMG',
  'Imaginary DMG Boost': 'Imaginary DMG',
  'Lightning DMG Boost': 'Lightning DMG',
  'Physical DMG Boost': 'Physical DMG',
  'Quantum DMG Boost': 'Quantum DMG',
  'Wind DMG Boost': 'Wind DMG',
  'Elation': 'Elation',
}

const displayTextMap: Record<string, string> = {
  'simScore': 'Combo DMG',
  'Fire DMG Boost': 'Fire DMG',
  'Ice DMG Boost': 'Ice DMG',
  'Imaginary DMG Boost': 'Imaginary DMG',
  'Lightning DMG Boost': 'Lightning DMG',
  'Physical DMG Boost': 'Physical DMG',
  'Quantum DMG Boost': 'Quantum DMG',
  'Wind DMG Boost': 'Wind DMG',
  'Elation': 'Elation',
  'Outgoing Healing Boost': 'Healing Boost',
  'Energy Regeneration Rate': 'Energy Regen',
  'BASIC': 'Basic Damage',
  'ULT': 'Ult Damage',
  'SKILL': 'Skill Damage',
  'FUA': 'FUA Damage',
  'DOT': 'DoT Damage',
}

export const StatRow = memo(function StatRow({
  stat,
  finalStats,
  value: customValue,
  edits,
  preciseSpd,
  loading,
}: {
  stat: string
  finalStats: BasicStatsObject | ComputedStatsObjectExternal
  value?: number
  edits?: Record<string, boolean>
  preciseSpd?: boolean
  loading?: boolean
}): ReactElement {
  const value = precisionRound(finalStats[stat as keyof typeof finalStats])

  const { t, i18n } = useTranslation('common')

  const readableStat: string = (displayTextMap[stat] || stat === 'CV')
    ? (i18n.exists(`ReadableStats.${stat}`)
      ? t(`ReadableStats.${stat as StatsValues}`)
      : t(`DMGTypes.${stat}` as never))
    : t(`Stats.${stat as StatsValues}`)

  const { valueDisplay, value1000thsPrecision } = getStatRenderValues(value, customValue ?? 0, stat, preciseSpd)

  if (!finalStats) {
    return null as unknown as ReactElement
  }

  const divider = <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} variant="dashed" />

  const valueText = loading
    ? '...'
    : `${valueDisplay}${isFlat(stat) || stat === 'CV' || stat === 'simScore' ? '' : '%'}${stat === 'simScore' ? t('ThousandsSuffix') : ''}`

  return (
    <div title={value1000thsPrecision} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, filter: loading ? 'blur(2px)' : 'none' }}>
      <img src={Assets.getStatIcon(stat)} className={iconClasses.statIconSpaced} />
      {`${readableStat}${edits?.[stat] ? ' *' : ''}`}
      {divider}
      {valueText}
    </div>
  )
})

export function getStatRenderValues(statValue: number, customValue: number, stat: string, preciseSpd?: boolean) {
  let valueDisplay: string
  let value1000thsPrecision: string

  if (stat === 'CV') {
    valueDisplay = localeNumber_0(precisionRound(customValue))
    value1000thsPrecision = localeNumber_000(precisionRound(customValue))
  } else if (stat === 'simScore' || stat === 'COMBO_DMG') {
    valueDisplay = localeNumber_0(truncate10ths(precisionRound((customValue ?? 0) / 1000)))
    value1000thsPrecision = localeNumber_000(precisionRound(customValue))
  } else if (stat === Constants.Stats.SPD) {
    const is1000thSpeed = checkSpeedInBreakpoint(statValue)
    valueDisplay = is1000thSpeed || preciseSpd
      ? localeNumber_000(precisionRound(statValue, 3))
      : localeNumber_0(truncate10ths(precisionRound(statValue, 3)))
    value1000thsPrecision = localeNumber_000(precisionRound(statValue))
  } else if (isFlat(stat)) {
    valueDisplay = localeNumber(Math.floor(statValue))
    value1000thsPrecision = localeNumber_000(precisionRound(statValue))
  } else {
    valueDisplay = localeNumber_0(truncate10ths(precisionRound(statValue * 100)))
    value1000thsPrecision = localeNumber_000(truncate1000ths(precisionRound(statValue * 100)))
  }

  return { valueDisplay, value1000thsPrecision }
}
