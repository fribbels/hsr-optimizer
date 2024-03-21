import { Flex, Tooltip } from 'antd'
import { Renderer } from 'lib/renderer'
import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import { Constants, SubStats } from 'lib/constants'
import { iconSize } from 'lib/constantsUi'
import RelicStatText from 'components/relicPreview/RelicStatText'
import { RightOutlined } from '@ant-design/icons'
import { RelicRollGrader } from 'lib/relicRollGrader'
import { Relic, StatRolls } from 'types/Relic'

type Substat = {
  stat: SubStats
  value: number
  rolls: StatRolls
}

const GenerateStat = (stat: Substat, main: boolean, relic: Relic) => {
  if (!stat || !stat.stat || stat.value == null) {
    return (
      <Flex justify="space-between">
        <Flex>
          <img
            src={Assets.getBlank()}
            style={{ width: iconSize, height: iconSize, marginRight: 3 }}
          >
          </img>
        </Flex>
      </Flex>
    )
  }

  let displayValue
  if (main) {
    displayValue = Renderer.renderMainStatNumber(stat)
  } else {
    displayValue = Renderer.renderSubstatNumber(stat, relic)
  }
  displayValue += Utils.isFlat(stat.stat) ? '' : '%'

  return (
    <Flex justify="space-between" align="center">
      <Flex>
        <img
          src={Assets.getStatIcon(stat.stat)}
          style={{ width: iconSize, height: iconSize, marginRight: 3 }}
        >
        </img>
        <RelicStatText>{Constants.StatsToReadable[stat.stat]}</RelicStatText>
      </Flex>
      {!main
        ? (
          <Flex justify="space-between" style={{ width: '40%' }}>
            <Tooltip title={`Roll Quality: ${RelicRollGrader.calculateStatSum(stat.rolls)}%`}>
              <Flex gap={0} align="center">
                {Object.entries(stat.rolls).map(([key, count]) => (
                  <Flex key={key || 'none'} style={{ alignItems: 'center' }}>
                    {Array(count).fill(<RightOutlined style={{ marginRight: -3, marginLeft: -3 }} />)}
                  </Flex>
                ))}
              </Flex>
            </Tooltip>
            <RelicStatText>{displayValue}</RelicStatText>
          </Flex>
        )
        : (
          <RelicStatText>{displayValue}</RelicStatText>
        )}
    </Flex>
  )
}

export default GenerateStat
