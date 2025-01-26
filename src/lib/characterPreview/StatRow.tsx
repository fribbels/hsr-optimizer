import { Divider, Flex } from 'antd'

import StatText from 'lib/characterPreview/StatText'
import { Constants, StatsValues } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'

import { Assets } from 'lib/rendering/assets'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { useTranslation } from 'react-i18next'

// FIXME HIGH

const checkSpeedInBreakpoint = (speedValue: number): boolean => {
  const breakpointPresets = [
    [111.1, 111.2],
    [114.2, 114.3],
    [133.3, 133.4],
    [142.8, 142.9],
    [155.5, 155.6],
    [171.4, 171.5],
    [177.7, 177.8],
  ]

  return breakpointPresets.some(([min, max]) => {
    return speedValue >= min && speedValue < max
  })
}

export const damageStats = {
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

const StatRow = (props: {
  stat: string
  finalStats: object
  value?: number
  edits?: Record<string, boolean>
  preciseSpd?: boolean
}): JSX.Element => {
  const { stat, finalStats, edits } = props
  const value = TsUtils.precisionRound(finalStats[stat])

  const { t, i18n } = useTranslation('common')

  const readableStat = (displayTextMap[stat] || stat == 'CV')
    ? (i18n.exists(`ReadableStats.${stat}`)
      ? t(`ReadableStats.${stat as StatsValues}`)
      : t(`DMGTypes.${stat}`))
    : t(`Stats.${stat}`)

  let valueDisplay
  let value1000thsPrecision

  if (stat == 'CV') {
    valueDisplay = Utils.precisionRound(props.value).toFixed(1)
    value1000thsPrecision = Utils.precisionRound(props.value).toFixed(3)
  } else if (stat == 'simScore') {
    valueDisplay = `${Utils.truncate10ths(Utils.precisionRound((props.value ?? 0) / 1000)).toFixed(1)}${t('ThousandsSuffix')}`
    value1000thsPrecision = Utils.precisionRound(props.value).toFixed(3)
  } else if (stat == Constants.Stats.SPD) {
    const is1000thSpeed = checkSpeedInBreakpoint(value)
    valueDisplay = (is1000thSpeed || props.preciseSpd) ? Utils.precisionRound(value, 4).toFixed(3) : Utils.truncate10ths(Utils.precisionRound(value, 4)).toFixed(1)
    value1000thsPrecision = Utils.precisionRound(value).toFixed(3)
  } else if (Utils.isFlat(stat)) {
    valueDisplay = Math.floor(value)
    value1000thsPrecision = Utils.precisionRound(value).toFixed(3)
  } else {
    valueDisplay = Utils.truncate10ths(Utils.precisionRound(value * 100)).toFixed(1)
    value1000thsPrecision = Utils.truncate1000ths(Utils.precisionRound(value * 100)).toFixed(3)
  }

  if (!finalStats) {
    console.log('No final stats')
    return (<div></div>)
  }
  return (
    <Flex justify='space-between' align='center' title={value1000thsPrecision}>
      <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
      <StatText>{`${readableStat}${edits && edits[stat] ? ' *' : ''}`}</StatText>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
      <StatText>{`${valueDisplay}${Utils.isFlat(stat) || stat == 'CV' || stat == 'simScore' ? '' : '%'}`}</StatText>
    </Flex>
  )
}

export default StatRow
