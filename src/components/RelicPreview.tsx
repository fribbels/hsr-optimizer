import { Card, Divider, Flex } from 'antd'

import { Renderer } from 'lib/renderer'
import { Assets } from 'lib/assets'
import { iconSize } from 'lib/constantsUi'
import RelicStatText from 'components/relicPreview/RelicStatText'
import { GenerateStat } from 'components/relicPreview/GenerateStat'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Relic } from 'types/Relic'
import { RelicScoringResult } from 'lib/relicScorerPotential'

export function RelicPreview(props: {
  relic?: Relic
  source?: string
  characterId?: string
  score?: RelicScoringResult
  setEditModalOpen?: (open: boolean) => void
  setAddModelOpen?: (open: boolean) => void
  setSelectedRelic: (relic: Relic) => void
}) {
  const { t } = useTranslation('common')
  const {
    source,
    characterId,
    score,
    setEditModalOpen,
    setAddModelOpen,
    setSelectedRelic,
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
    if ((!relic.id && !characterId) || source === 'scorer' || source === 'builds') return

    if (!relic.id) {
      console.log(`Add new relic for characterId=${characterId}.`)
      relic.equippedBy = characterId
      relic.enhance = 15
      relic.grade = 5
      setSelectedRelic(relic)
      setAddModelOpen?.(true)
    } else {
      setSelectedRelic(relic)
      setEditModalOpen?.(true)
    }
  }

  return (
    <Card
      size='small'
      hoverable={source != 'scorer' && source != 'builds'}
      onClick={cardClicked}
      style={{ width: 200, height: 280 }}
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

        {GenerateStat(relic.main, true, relic)}

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
