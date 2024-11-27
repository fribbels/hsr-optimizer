import { Flex } from 'antd'
import i18next from 'i18next'
import { RightIcon } from 'icons/RightIcon'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { Renderer } from 'lib/rendering/renderer'
import RelicStatText from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Relic, StatRolls } from 'types/relic'

export type SubstatDetails = {
  stat: SubStats
  value: number
  rolls?: StatRolls
  addedRolls?: number
}

export const GenerateStat = (stat: SubstatDetails, main: boolean, relic: Relic) => {
  const { t } = useTranslation('common')
  if (!stat?.stat || stat.value == null) {
    return (
      <Flex justify='space-between'>
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
    <Flex justify='space-between' align='center'>
      <Flex>
        <img
          src={Assets.getStatIcon(stat.stat)}
          style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
        >
        </img>
        <RelicStatText language={i18next.resolvedLanguage}>{t(`ReadableStats.${stat.stat}`)}</RelicStatText>
      </Flex>
      {!main
        ? (
          // <Tooltip title={`Roll quality: ${RelicRollGrader.calculateStatSum(stat.rolls)}%`}>
          <Flex justify='space-between' style={{ width: '41.5%' }}>
            <Flex gap={0} align='center'>
              {stat.addedRolls != null && generateRolls(stat)}
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

function generateRolls(stat: SubstatDetails) {
  const result: ReactElement[] = []
  for (let i = 0; i < stat.addedRolls!; i++) {
    result.push(<RightIcon key={i} style={{ marginRight: -5, opacity: 0.75 }}/>)
  }
  if (stat.addedRolls == 0) {
    result.push(<div key={0}></div>)
  }
  return (
    result
  )
}
