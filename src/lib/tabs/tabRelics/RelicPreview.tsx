import { Card, Divider, Flex } from 'antd'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { iconSize } from 'lib/constants/constantsUi'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'

import { Renderer } from 'lib/rendering/renderer'
import { GenerateStat, SubstatDetails } from 'lib/tabs/tabRelics/relicPreview/GenerateStat'
import RelicStatText from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

export type ShowcaseTheme = {
  cardBackgroundColor: string
  cardBorderColor: string
}

export function RelicPreview(props: {
  relic?: Relic
  source?: ShowcaseSource
  characterId?: string
  score?: RelicScoringResult
  setEditModalOpen?: (open: boolean) => void
  setAddModalOpen?: (open: boolean) => void
  setSelectedRelic: (relic: Relic) => void
  showcaseTheme?: ShowcaseTheme
}) {
  const { t } = useTranslation('common')
  const {
    source,
    characterId,
    score,
    setEditModalOpen,
    setAddModalOpen,
    setSelectedRelic,
    showcaseTheme,
  } = props
  const placeholderRelic: Partial<Relic> = {
    enhance: 0,
    part: undefined,
    set: undefined,
    grade: 0,
    substats: [],
    main: undefined,
    equippedBy: undefined,
  }
  const relic: Relic = {
    ...placeholderRelic,
    ...props.relic,
  } as Relic

  const relicSrc = relic.set ? Assets.getSetImage(relic.set, relic.part) : Assets.getBlank()
  const equippedBySrc = relic.equippedBy ? Assets.getCharacterAvatarById(relic.equippedBy) : Assets.getBlank()
  const scored = score !== undefined

  const cardClicked = () => {
    if ((!relic.id && !characterId) || source == ShowcaseSource.SHOWCASE_TAB || source == ShowcaseSource.BUILDS_MODAL) return

    if (!relic.id) {
      console.log(`Add new relic for characterId=${characterId}.`)
      relic.equippedBy = characterId
      relic.enhance = 15
      relic.grade = 5
      setSelectedRelic(relic)
      setAddModalOpen?.(true)
    } else {
      setSelectedRelic(relic)
      setEditModalOpen?.(true)
    }
  }

  return (
    <Card
      size='small'
      hoverable={source != ShowcaseSource.SHOWCASE_TAB && source != ShowcaseSource.BUILDS_MODAL}
      onClick={cardClicked}
      style={{
        width: 200,
        height: 280,
        backgroundColor: showcaseTheme?.cardBackgroundColor,
        borderColor: showcaseTheme?.cardBorderColor,
      }}
    >
      <Flex vertical justify='space-between' style={{ height: 255 }}>
        <Flex justify='space-between' align='center'>
          <img
            style={{ height: 50, width: 50 }}
            title={relic.set}
            src={relicSrc}
          />
          <Flex vertical align='center'>
            <Flex align='center' gap={5}>
              {Renderer.renderGrade(relic)}
              <Flex style={{ width: 30 }} justify='space-around'>
                <RelicStatText>
                  {relic.id != undefined ? `+${relic.enhance}` : ''}
                </RelicStatText>
              </Flex>
            </Flex>
          </Flex>
          <img
            style={{ height: 50, width: 50 }}
            src={equippedBySrc}
          />
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        {GenerateStat(relic.main as SubstatDetails, true, relic)}

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        <Flex vertical gap={0}>
          {GenerateStat(relic.substats[0], false, relic)}
          {GenerateStat(relic.substats[1], false, relic)}
          {GenerateStat(relic.substats[2], false, relic)}
          {GenerateStat(relic.substats[3], false, relic)}
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        <Flex justify='space-between'>
          <Flex>
            <img src={(scored) ? Assets.getStarBw() : Assets.getBlank()} style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}></img>
            <RelicStatText>
              {(scored) ? t('Score') : ''}
            </RelicStatText>
          </Flex>
          <RelicStatText>
            {(scored) ? `${score.score} (${score.rating})${score.meta?.modified ? ' *' : ''}` : ''}
          </RelicStatText>
        </Flex>
      </Flex>
    </Card>
  )
}
