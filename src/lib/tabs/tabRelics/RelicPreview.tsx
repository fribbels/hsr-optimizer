import { Card, Divider, Flex } from 'antd'
import { showcaseShadow, ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { NONE_SCORE } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'

import { Renderer } from 'lib/rendering/renderer'
import { ScoreCategory } from 'lib/scoring/scoreComparison'
import { GenerateStat, SubstatDetails } from 'lib/tabs/tabRelics/relicPreview/GenerateStat'
import RelicStatText from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import { showcaseTransition } from 'lib/utils/colorUtils'
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
  scoringType?: string
  setEditModalOpen?: (open: boolean) => void
  setAddModalOpen?: (open: boolean) => void
  setSelectedRelic: (relic: Relic) => void
  showcaseTheme?: ShowcaseTheme
}) {
  const {
    source,
    characterId,
    score,
    scoringType,
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

  const STAT_GAP = scoringType == NONE_SCORE ? 6 : 0
  const ICON_SIZE = scoringType == NONE_SCORE ? 54 : 50
  const JUSTIFY = scoringType == NONE_SCORE ? 'space-around' : 'space-between'

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
        transition: showcaseTransition(),
        boxShadow: source == null ? undefined : showcaseShadow,
      }}
    >
      <Flex
        vertical
        justify={JUSTIFY}
        style={{
          height: 255,
        }}
      >
        <Flex justify='space-between' align='center'>
          <img
            style={{
              height: ICON_SIZE,
              width: ICON_SIZE,
            }}
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
            style={{
              height: ICON_SIZE,
              width: ICON_SIZE,
              borderRadius: ICON_SIZE / 2,
              outline: relic.equippedBy ? '1px solid rgba(150, 150, 150, 0.25)' : undefined,
              backgroundColor: relic.equippedBy ? 'rgba(0, 0, 0, 0.1)' : undefined,
            }}
            src={equippedBySrc}
          />
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        {GenerateStat(relic.main as SubstatDetails, true, relic)}

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        <Flex vertical gap={STAT_GAP}>
          {GenerateStat(relic.substats[0], false, relic)}
          {GenerateStat(relic.substats[1], false, relic)}
          {GenerateStat(relic.substats[2], false, relic)}
          {GenerateStat(relic.substats[3], false, relic)}
        </Flex>

        {scoringType != NONE_SCORE && <ScoreFooter score={score}/>}
      </Flex>
    </Card>
  )
}

function ScoreFooter(props: { score?: RelicScoringResult }) {
  const { t } = useTranslation('common')
  const {
    score,
  } = props

  let icon: string = Assets.getBlank()
  let asterisk: boolean = false

  const scored = score !== undefined
  if (scored) {
    if (score?.meta?.category == ScoreCategory.DEFAULT_NO_SPEED) {
      icon = Assets.getScoreNoSpeed()
    } else {
      icon = Assets.getScore()
    }

    if (score?.meta?.modified) {
      asterisk = true
    }
  }

  return (
    <>
      <Divider style={{ margin: '6px 0px 6px 0px' }}/>

      <Flex justify='space-between'>
        <Flex>
          <img src={icon} style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}></img>
          <RelicStatText>
            {(scored) ? `${t('Score')}${asterisk ? ' *' : ''}` : ''}
          </RelicStatText>
        </Flex>
        <RelicStatText>
          {(scored) ? `${score.score} (${score.rating})` : ''}
        </RelicStatText>
      </Flex>
    </>
  )
}
