import { Flex } from '@mantine/core'
import { RightIcon } from 'icons/RightIcon'
import { SubStats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
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

export const GenerateStat = (stat: SubstatDetails, main: boolean, relic: Relic, isPreview = false) => {
  const { t } = useTranslation('common')
  if (!stat?.stat || stat.value == null) {
    return (
      <img
        src={Assets.getBlank()}
        className={iconClasses.statIcon}
      />
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
    <Flex justify='space-between' align='center' style={{ opacity: isPreview ? 0.4 : 1 }}>
      <Flex>
        <img
          src={Assets.getStatIcon(stat.stat)}
          className={iconClasses.statIcon}
        />
        {t(`ReadableStats.${stat.stat}`)}
      </Flex>
      {!main
        ? (
          <Flex justify='space-between' w='41.5%'>
            <Flex align='center'>
              {generateRolls(stat)}
            </Flex>
            {displayValue}
          </Flex>
        )
        : <>{displayValue}</>}
    </Flex>
  )
}

function generateRolls(stat: SubstatDetails) {
  if (!stat.addedRolls) {
    return <div></div>
  }
  const result: ReactElement[] = []
  for (let i = 0; i < stat.addedRolls; i++) {
    result.push(<RightIcon key={i} style={{ marginRight: -5, opacity: 0.75 }} />)
  }
  return result
}
