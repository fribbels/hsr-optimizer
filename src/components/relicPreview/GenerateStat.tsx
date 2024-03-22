import { Flex, Tooltip } from 'antd'
import { Renderer } from 'lib/renderer'
import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import { Constants, SubStats } from 'lib/constants'
import { iconSize } from 'lib/constantsUi'
import RelicStatText from 'components/relicPreview/RelicStatText'
import { RelicRollGrader } from 'lib/relicRollGrader'
import { Relic, StatRolls } from 'types/Relic'
import { ReactElement } from 'react'
import { RightIcon } from 'icons/RightIcon.jsx'

type Substat = {
  stat: SubStats
  value: number
  rolls: StatRolls
}

export const GenerateStat = (stat: Substat, main: boolean, relic: Relic) => {
  if (!stat || !stat.stat || stat.value == null) {
    return (
      <Flex justify="space-between">
        <Flex>
          <img
            src={Assets.getBlank()}
            style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -2 }}
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
          style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -2 }}
        >
        </img>
        <RelicStatText>{Constants.StatsToReadable[stat.stat]}</RelicStatText>
      </Flex>
      {!main
        ? (
          <Flex justify="space-between" style={{ width: '41%' }}>
            <Tooltip title={`Roll Quality: ${RelicRollGrader.calculateStatSum(stat.rolls)}%`}>
              <Flex gap={0} align="center">
                {stat.rolls
                && generateRolls(stat)}
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

function generateRolls(stat) {
  const rolls = Math.min(5, Math.max(0, stat.rolls.high + stat.rolls.mid + stat.rolls.low - 1))
  const result: ReactElement[] = []
  for (let i = 0; i < rolls; i++) {
    result.push(<RightIcon key={i} style={{ fontSize: 10, marginRight: -7 }} />)
  }
  if (rolls == 0) {
    result.push(<div></div>)
  }
  return (
    result
  )
}
