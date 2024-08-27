import { Flex } from 'antd'
import { Renderer } from 'lib/renderer'
import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import { Constants, SubStats } from 'lib/constants'
import { iconSize } from 'lib/constantsUi'
import RelicStatText from 'components/relicPreview/RelicStatText'
import { Relic, StatRolls } from 'types/Relic'
import { ReactElement } from 'react'
import { RightIcon } from 'icons/RightIcon.jsx'

type Substat = {
  stat: SubStats
  value: number
  rolls: StatRolls
  addedRolls: number
}

export const GenerateStat = (stat: Substat, main: boolean, relic: Relic) => {
  if (!stat?.stat || stat.value == null) {
    return (
      <Flex justify="space-between">
        <Flex>
          <img
            src={Assets.getBlank()}
            style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
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
          style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
        >
        </img>
        <RelicStatText>{Constants.StatsToReadable[stat.stat]}</RelicStatText>
      </Flex>
      {!main
        ? (
          // <Tooltip title={`Roll quality: ${RelicRollGrader.calculateStatSum(stat.rolls)}%`}>
          <Flex justify="space-between" style={{ width: '41.5%' }}>
            <Flex gap={0} align="center">
              {stat.addedRolls != null
              && generateRolls(stat)}
            </Flex>
            <RelicStatText>{displayValue}</RelicStatText>
          </Flex>
          // </Tooltip>
        )
        : (
          <RelicStatText>{displayValue}</RelicStatText>
        )}
    </Flex>
  )
}

function generateRolls(stat) {
  const result: ReactElement[] = []
  for (let i = 0; i < stat.addedRolls; i++) {
    result.push(<RightIcon key={i} style={{ marginRight: -5, opacity: 0.75 }}/>)
  }
  if (stat.addedRolls == 0) {
    result.push(<div key={0}></div>)
  }
  return (
    result
  )
}
