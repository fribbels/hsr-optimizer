import { Divider, Flex } from 'antd'
import PropTypes from 'prop-types'

import { Assets } from 'lib/assets'
import { Constants } from 'lib/constants'
import { iconSize } from 'lib/constantsUi'
import { Utils } from 'lib/utils'

import StatText from 'components/characterPreview/StatText'

const checkSpeedInBreakpoint = (speedValue: number) : boolean => {
  const breakpointPresets = [
    [111.1, 111.2],
    [114.2, 114.3],
    [133.3, 133.4],
    [142.8, 142.9],
    [155.5, 155.6],
    [171.4, 171.5],
    [177.7, 177.8]
  ]

  return breakpointPresets.some(([min, max]) => {
    return speedValue >= min && speedValue < max;
  });
}

const StatRow = (props: { stat: string; finalStats: any }): JSX.Element => {
  const { stat, finalStats } = props
  const readableStat = stat.replace('DMG Boost', 'DMG')
  const value = Utils.precisionRound(finalStats[stat])

  let valueDisplay
  let value1000thsPrecision

  if (stat == 'CV') {
    valueDisplay = Utils.truncate10ths(value).toFixed(1)
    value1000thsPrecision = Utils.truncate1000ths(value).toFixed(3)
  } else if (stat == Constants.Stats.SPD) {
    const is1000thSpeed = checkSpeedInBreakpoint(value)
    valueDisplay = is1000thSpeed ? Utils.truncate1000ths(value).toFixed(3) : valueDisplay = Utils.truncate10ths(value).toFixed(1)
    value1000thsPrecision = Utils.truncate1000ths(value).toFixed(3)
  } else if (Utils.isFlat(stat)) {
    valueDisplay = Math.floor(value)
    value1000thsPrecision = Utils.truncate1000ths(value).toFixed(3)
  } else {
    valueDisplay = Utils.truncate10ths(value * 100).toFixed(1)
    value1000thsPrecision = Utils.truncate1000ths(value * 100).toFixed(3)
  }

  if (!finalStats) {
    console.log('No final stats')
    return (<div></div>)
  }
  return (
    <Flex justify="space-between" align="center" title={value1000thsPrecision}>
      <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
      <StatText>{readableStat}</StatText>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
      <StatText>{`${valueDisplay}${Utils.isFlat(stat) || stat == 'CV' ? '' : '%'}`}</StatText>
    </Flex>
  )
}
StatRow.propTypes = {
  finalStats: PropTypes.object,
  stat: PropTypes.string,
}

export default StatRow
