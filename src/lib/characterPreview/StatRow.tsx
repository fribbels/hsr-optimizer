import { type BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  Constants,
  type ElementName,
  type PathName,
  PathNames,
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import { type ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import iconClasses from 'style/icons.module.css'

import {
  type i18n,
  type TFunction,
} from 'i18next'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { Assets } from 'lib/rendering/assets'
import {
  getElementalDmgFromContainer,
  type SimulationScore,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import { usePromise } from 'hooks/usePromise'
import { Skeleton } from '@mantine/core'
import {
  localeNumber,
  localeNumber_0,
  localeNumber_000,
} from 'lib/utils/i18nUtils'
import {
  precisionRound,
  truncate1000ths,
  truncate10ths,
} from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import {
  memo,
  type ReactNode,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

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

function StatRowDivider() {
  return <span role="separator" style={{ margin: 'auto 10px', flexGrow: 1, borderBottom: '1px dashed rgba(255, 255, 255, 0.10)' }} />
}

export const StatRow = memo(function StatRow({
  stat,
  finalStats,
  value: customValue,
  edits,
  preciseSpd,
}: {
  stat: string,
  finalStats: BasicStatsObject | ComputedStatsObjectExternal,
  value?: number,
  edits?: Record<string, boolean>,
  preciseSpd?: boolean,
}): ReactNode {
  const value = precisionRound(finalStats[stat as keyof typeof finalStats])

  const { t, i18n } = useTranslation('common')

  const readableStat: string = statToLabel(stat, t, i18n)

  const { valueDisplay, value1000thsPrecision } = getStatRenderValues(value, customValue ?? 0, stat, preciseSpd)

  if (!finalStats) {
    return null
  }

  const valueText = `${valueDisplay}${isFlat(stat) || stat === 'CV' || stat === 'simScore' ? '' : '%'}${stat === 'simScore' ? t('ThousandsSuffix') : ''}`

  return (
    <div
      title={value1000thsPrecision}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}
    >
      <img src={Assets.getStatIcon(stat)} className={iconClasses.statIconSpaced} />
      {`${readableStat}${edits?.[stat] ? ' *' : ''}`}
      <StatRowDivider />
      {valueText}
    </div>
  )
})

export const AsyncStatRow = memo(function({ promise, type, subType, stat, element, path, elementalDmgValue, edits, preciseSpd }: {
  promise: Promise<SimulationScore | null>,
  type: 'Character' | 'Benchmark' | 'Perfect',
  subType: 'Basic' | 'Combat',
  stat: string,
  element: ElementName,
  path: PathName,
  elementalDmgValue: string,
  edits?: Record<string, boolean>,
  preciseSpd?: boolean,
}) {
  const { t, i18n } = useTranslation('common')

  const readableStat: string = (displayTextMap[stat] || stat === 'CV')
    ? (i18n.exists(`ReadableStats.${stat}`)
      ? t(`ReadableStats.${stat as StatsValues}`)
      : t(`DMGTypes.${stat}` as never))
    : t(`Stats.${stat as StatsValues}`)

  const output = usePromise(promise)

  const transformed = useMemo(() => {
    if (!output) return null
    const simResult = output[type === 'Benchmark' ? 'benchmarkSim' : 'maximumSim'].result
    if (!simResult) return null
    const stats = subType === 'Basic'
      ? toBasicStatsObject(simResult.ca)
      : (() => {
        const combatStats = simResult.x.toComputedStatsObject()
        ;(combatStats as Record<string, number>)[elementalDmgValue] = getElementalDmgFromContainer(simResult.x, element)
        if (path === PathNames.Elation) {
          combatStats![Stats.Elation] = simResult.x.getSelfValue(StatsToStatKey[Stats.Elation])
        }
        return combatStats
      })()

    const value = precisionRound(stats[stat as keyof typeof stats])
    return getStatRenderValues(value, 0, stat, preciseSpd)
  }, [output, type, subType, stat, preciseSpd, elementalDmgValue, element, path])

  const valueNode = transformed
    ? <span>{`${transformed.valueDisplay}${isFlat(stat) || stat === 'CV' || stat === 'simScore' ? '' : '%'}${stat === 'simScore' ? t('ThousandsSuffix') : ''}`}</span>
    : <Skeleton width={70} />

  return (
    <div
      title={transformed?.value1000thsPrecision}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}
    >
      <img src={Assets.getStatIcon(stat)} className={iconClasses.statIconSpaced} />
      {`${readableStat}${edits?.[stat] ? ' *' : ''}`}
      <StatRowDivider />
      {valueNode}
    </div>
  )
})

export function getStatRenderValues(statValue: number, customValue: number, stat: string, preciseSpd?: boolean) {
  let valueDisplay: string
  let value1000thsPrecision: string

  if (stat === 'simScore' || stat === 'COMBO_DMG') {
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

function statToLabel(stat: string, t: TFunction<'common'>, i18n: i18n) {
  return (displayTextMap[stat] || stat === 'CV')
    ? (i18n.exists(`ReadableStats.${stat}`)
      ? t(`ReadableStats.${stat as StatsValues}`)
      : t(`DMGTypes.${stat}` as never))
    : t(`Stats.${stat as StatsValues}`)
}
