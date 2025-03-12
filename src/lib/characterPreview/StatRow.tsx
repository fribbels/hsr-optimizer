import { Divider, Flex } from 'antd'
import { Constants, StatsValues } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'

import { Assets } from 'lib/rendering/assets'
import { localeNumber, localeNumber_0, localeNumber_000 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { useTranslation } from 'react-i18next'

// FIXME HIGH

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
}

export const displayTextMap = {
  'simScore': 'Combo DMG',
  'Fire DMG Boost': 'Fire DMG',
  'Ice DMG Boost': 'Ice DMG',
  'Imaginary DMG Boost': 'Imaginary DMG',
  'Lightning DMG Boost': 'Lightning DMG',
  'Physical DMG Boost': 'Physical DMG',
  'Quantum DMG Boost': 'Quantum DMG',
  'Wind DMG Boost': 'Wind DMG',
  'Outgoing Healing Boost': 'Healing Boost',
  'Energy Regeneration Rate': 'Energy Regen',
  'BASIC': 'Basic Damage',
  'ULT': 'Ult Damage',
  'SKILL': 'Skill Damage',
  'FUA': 'FUA Damage',
  'DOT': 'DoT Damage',
}

export function StatRow(props: {
  stat: string
  finalStats: object
  value?: number
  edits?: Record<string, boolean>
  preciseSpd?: boolean
}): JSX.Element {
  const { stat, finalStats, edits } = props
  const value = TsUtils.precisionRound(finalStats[stat])

  const { t, i18n } = useTranslation('common')

  const readableStat = (displayTextMap[stat] || stat == 'CV')
    ? (i18n.exists(`ReadableStats.${stat}`)
      ? t(`ReadableStats.${stat as StatsValues}`)
      : t(`DMGTypes.${stat}`))
    : t(`Stats.${stat as StatsValues}`)

  const { valueDisplay, value1000thsPrecision } = getStatRenderValues(value, props.value!, props.stat, props.preciseSpd)

  if (!finalStats) {
    console.log('No final stats')
    return (<div></div>)
  }
  return (
    <Flex justify='space-between' align='center' title={value1000thsPrecision}>
      <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
      {`${readableStat}${edits?.[stat] ? ' *' : ''}`}
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
      {`${valueDisplay}${Utils.isFlat(stat) || stat == 'CV' || stat == 'simScore' ? '' : '%'}${stat == 'simScore' ? t('ThousandsSuffix') : ''}`}
    </Flex>
  )
}

export function getStatRenderValues(statValue: number, customValue: number, stat: string, preciseSpd?: boolean) {
  let valueDisplay: string
  let value1000thsPrecision: string

  if (stat == 'CV') {
    valueDisplay = localeNumber_0(Utils.precisionRound(customValue))
    value1000thsPrecision = localeNumber_000(Utils.precisionRound(customValue))
  } else if (stat == 'simScore' || stat == 'COMBO_DMG') {
    valueDisplay = localeNumber_0(Utils.truncate10ths(Utils.precisionRound((customValue ?? 0) / 1000)))
    value1000thsPrecision = localeNumber_000(Utils.precisionRound(customValue))
  } else if (stat == Constants.Stats.SPD) {
    const is1000thSpeed = checkSpeedInBreakpoint(statValue)
    valueDisplay = is1000thSpeed || preciseSpd
      ? localeNumber_000(Utils.precisionRound(statValue, 3))
      : localeNumber_0(Utils.truncate10ths(Utils.precisionRound(statValue, 3)))
    value1000thsPrecision = localeNumber_000(Utils.precisionRound(statValue))
  } else if (Utils.isFlat(stat)) {
    valueDisplay = localeNumber(Math.floor(statValue))
    value1000thsPrecision = localeNumber_000(Utils.precisionRound(statValue))
  } else {
    valueDisplay = localeNumber_0(Utils.truncate10ths(Utils.precisionRound(statValue * 100)))
    value1000thsPrecision = localeNumber_000(Utils.truncate1000ths(Utils.precisionRound(statValue * 100)))
  }

  return { valueDisplay, value1000thsPrecision }
}
