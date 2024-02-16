import { Divider, Flex } from 'antd'
import PropTypes from 'prop-types'

import { Assets } from 'lib/assets'
import { Constants } from 'lib/constants'
import { iconSize } from 'lib/constantsUi'
import { Utils } from 'lib/utils'

import StatText from 'components/characterPreview/StatText'

const StatRow = (props: { stat: string; finalStats: any }): JSX.Element => {
  const { stat, finalStats } = props
  const readableStat = stat.replace('DMG Boost', 'DMG')
  let value = finalStats[stat]

  if (stat == 'CV') {
    value = Utils.truncate10ths(value).toFixed(1)
  } else if (stat == Constants.Stats.SPD) {
    value = Utils.truncate10ths(value).toFixed(1)
  } else if (Utils.isFlat(stat)) {
    value = Math.floor(value)
  } else {
    value = Utils.truncate10ths(value * 100).toFixed(1)
  }

  if (!finalStats) {
    console.log('No final stats')
    return (<div></div>)
  }
  return (
    <Flex justify="space-between" align="center">
      <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
      <StatText>{readableStat}</StatText>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
      <StatText>{`${value}${Utils.isFlat(stat) || stat == 'CV' ? '' : '%'}`}</StatText>
    </Flex>
  )
}
StatRow.propTypes = {
  finalStats: PropTypes.object,
  stat: PropTypes.string,
}

export default StatRow
