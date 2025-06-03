import { Flex } from 'antd'
import { RightIcon } from 'icons/RightIcon'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { Renderer } from 'lib/rendering/renderer'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Relic,
  StatRolls,
} from 'types/relic'

export type SubstatDetails = {
  stat: SubStats,
  value: number,
  rolls?: StatRolls,
  addedRolls?: number,
}

export const GenerateStat = (stat: SubstatDetails, main: boolean, relic: Relic) => {
  const { t } = useTranslation('common')
  if (!stat?.stat || stat.value == null) {
    return (
      <img
        src={Assets.getBlank()}
        style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
      >
      </img>
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
        {t(`ReadableStats.${stat.stat}`)}
      </Flex>
      {!main
        ? (
          <Flex justify='space-between' style={{ width: '41.5%' }}>
            <Flex gap={0} align='center'>
              {stat.addedRolls != null && generateRolls(stat)}
            </Flex>
            {displayValue}
          </Flex>
        )
        : <>{displayValue}</>}
    </Flex>
  )
}

function generateRolls(stat: SubstatDetails) {
  const result: ReactElement[] = []
  for (let i = 0; i < stat.addedRolls!; i++) {
    result.push(<RightIcon key={i} style={{ marginRight: -5, opacity: 0.75 }} />)
  }
  if (stat.addedRolls == 0) {
    result.push(<div key={0}></div>)
  }
  return result
}
