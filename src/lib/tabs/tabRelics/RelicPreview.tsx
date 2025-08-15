import {
  Card,
  Divider,
  Flex,
} from 'antd'
import i18next from 'i18next'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { Parts } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'

import { Renderer } from 'lib/rendering/renderer'
import { ScoreCategory } from 'lib/scoring/scoreComparison'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  GenerateStat,
  SubstatDetails,
} from 'lib/tabs/tabRelics/relicPreview/GenerateStat'
import RelicStatText from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import { showcaseTransition } from 'lib/utils/colorUtils'
import {
  Languages,
  localeNumberComma_0,
} from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'

export type ShowcaseTheme = {
  cardBackgroundColor: string,
  cardBorderColor: string,
}

export function RelicPreview(props: {
  relic?: Relic | null,
  source?: ShowcaseSource,
  characterId?: CharacterId | null,
  score?: RelicScoringResult,
  scoringType?: ScoringType,
  setEditModalOpen?: (open: boolean) => void,
  setAddModalOpen?: (open: boolean, part: Parts) => void,
  setSelectedRelic?: (relic: Relic) => void,
  showcaseTheme?: ShowcaseTheme,
  unhoverable?: boolean,
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
    unhoverable,
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

    if (!relic.id && characterId) {
      console.log(`Add new relic for characterId=${characterId}.`)
      relic.equippedBy = characterId
      relic.enhance = 15
      relic.grade = 5
      relic.part = props.relic?.part ?? Parts.Head
      setSelectedRelic?.(relic)
      setAddModalOpen?.(true, relic.part)
    } else {
      setSelectedRelic?.(relic)
      setEditModalOpen?.(true)
    }
  }

  const STAT_GAP = scoringType == ScoringType.NONE ? 6 : 0
  const ICON_SIZE = scoringType == ScoringType.NONE ? 54 : 50
  const JUSTIFY = scoringType == ScoringType.NONE ? 'space-around' : 'space-between'

  return (
    <Card
      size='small'
      hoverable={source != ShowcaseSource.SHOWCASE_TAB && source != ShowcaseSource.BUILDS_MODAL && !unhoverable}
      onClick={cardClicked}
      style={{
        width: 200,
        minWidth: 200,
        height: 280,
        backgroundColor: showcaseTheme?.cardBackgroundColor,
        borderColor: showcaseTheme?.cardBorderColor,
        transition: showcaseTransition(),
        borderRadius: 6,
        boxShadow: source == null ? undefined : showcaseShadow + showcaseShadowInsetAddition,
      }}
    >
      <RelicStatText language={i18next.resolvedLanguage as Languages}>
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
            <Flex align='center' gap={8}>
              <span>{Renderer.renderGrade(relic)}</span>
              <span>{relic.id != undefined ? `+${relic.enhance}` : ''}</span>
            </Flex>
            <img
              style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
                borderRadius: ICON_SIZE / 2,
                border: relic.equippedBy ? '1px solid rgba(150, 150, 150, 0.25)' : undefined,
                backgroundColor: relic.equippedBy ? 'rgba(0, 0, 0, 0.1)' : undefined,
              }}
              src={equippedBySrc}
            />
          </Flex>

          <Divider style={{ margin: '6px 0px 6px 0px' }} />

          {GenerateStat(relic.main as SubstatDetails, true, relic)}

          <Divider style={{ margin: '6px 0px 6px 0px' }} />

          <Flex vertical gap={STAT_GAP}>
            {GenerateStat(relic.substats[0], false, relic)}
            {GenerateStat(relic.substats[1], false, relic)}
            {GenerateStat(relic.substats[2], false, relic)}
            {GenerateStat(relic.substats[3], false, relic)}
          </Flex>

          {scoringType != ScoringType.NONE && <ScoreFooter score={score} />}
        </Flex>
      </RelicStatText>
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
      <Divider style={{ margin: '6px 0px 6px 0px' }} />

      <Flex justify='space-between'>
        <Flex>
          <img src={icon} style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}></img>
          {scored ? `${t('Score')}${asterisk ? ' *' : ''}` : ''}
        </Flex>
        {scored ? `${localeNumberComma_0(Number(score.score))} (${score.rating})` : ''}
      </Flex>
    </>
  )
}
