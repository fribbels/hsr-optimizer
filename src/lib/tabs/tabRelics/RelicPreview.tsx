import { Divider, Flex, Paper } from '@mantine/core'
import i18next from 'i18next'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { Parts } from 'lib/constants/constants'
import iconClasses from 'style/icons.module.css'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'

import { Renderer } from 'lib/rendering/renderer'
import { ScoreCategory } from 'lib/scoring/scoreComparison'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  GenerateStat,
  SubstatDetails,
} from 'lib/tabs/tabRelics/relicPreview/GenerateStat'
import { RelicStatText } from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import { showcaseTransition } from 'lib/utils/colorUtils'
import {
  Languages,
  localeNumberComma_0,
} from 'lib/utils/i18nUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { CharacterId } from 'types/character'
import {
  Relic,
  RelicSubstatMetadata,
} from 'types/relic'

export type ShowcaseTheme = {
  cardBackgroundColor: string,
  cardBorderColor: string,
}

export const RelicPreview = memo(function RelicPreview(props: {
  relic?: Relic | null,
  source?: ShowcaseSource,
  characterId?: CharacterId | null,
  score?: RelicScoringResult,
  scoringType?: ScoringType,
  setEditModalOpen?: (open: boolean, relic?: Relic) => void,
  setAddModalOpen?: (open: boolean, part: Parts, relic?: Relic) => void,
  setSelectedRelic?: (relic: Relic) => void,
  useShowcaseColors?: boolean,
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
    useShowcaseColors,
    unhoverable,
  } = props
  const placeholderRelic: Partial<Relic> = {
    enhance: 0,
    part: undefined,
    set: undefined,
    grade: 0,
    substats: [],
    previewSubstats: [],
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
    if ((!relic.id && !characterId) || source === ShowcaseSource.SHOWCASE_TAB || source === ShowcaseSource.BUILDS_MODAL) return

    if (!relic.id && characterId) {
      relic.equippedBy = characterId
      relic.enhance = 15
      relic.grade = 5
      relic.part = props.relic?.part ?? Parts.Head
      setSelectedRelic?.(relic)
      setAddModalOpen?.(true, relic.part, relic)
    } else {
      setSelectedRelic?.(relic)
      setEditModalOpen?.(true, relic)
    }
  }

  const STAT_GAP = scoringType === ScoringType.NONE ? 6 : 0
  const ICON_SIZE = scoringType === ScoringType.NONE ? 54 : 50
  const JUSTIFY = scoringType === ScoringType.NONE ? 'space-around' : 'space-between'

  const fillerStats = Array.from<RelicSubstatMetadata>({ length: 4 - relic.substats.length - relic.previewSubstats.length })

  return (
    <Paper
      withBorder={source != null}
      onClick={cardClicked}
      style={{
        width: 211,
        minWidth: 211,
        height: 280,
        padding: 12,
        backgroundColor: useShowcaseColors ? 'var(--showcase-card-bg)' : undefined,
        borderColor: useShowcaseColors ? 'var(--showcase-card-border)' : undefined,
        transition: showcaseTransition(),
        borderRadius: 6,
        boxShadow: source == null ? 'inset 0 0 0 1px var(--border-color)' : showcaseShadow + showcaseShadowInsetAddition,
        cursor: (source !== ShowcaseSource.SHOWCASE_TAB && source !== ShowcaseSource.BUILDS_MODAL && !unhoverable) ? 'pointer' : 'default',
      }}
    >
      <RelicStatText language={i18next.resolvedLanguage as Languages} style={{ height: '100%' }}>
        <Flex
          direction="column"
          justify={JUSTIFY}
          style={{
            height: '100%',
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

          <Flex direction="column" gap={STAT_GAP}>
            {relic.substats.map((s, idx) => <Fragment key={`substats-${idx}`}>{GenerateStat(s, false, relic)}</Fragment>)}
            {relic.previewSubstats.map((s, idx) => <Fragment key={`previews-${idx}`}>{GenerateStat(s, false, relic, true)}</Fragment>)}
            {fillerStats.map((x, idx) => <Fragment key={`fillers-${idx}`}>{GenerateStat(x, false, relic)}</Fragment>)}
          </Flex>

          {scoringType !== ScoringType.NONE && <ScoreFooter score={score} />}
        </Flex>
      </RelicStatText>
    </Paper>
  )
})

function ScoreFooter(props: { score?: RelicScoringResult }) {
  const { t } = useTranslation('common')
  const {
    score,
  } = props

  let icon: string = Assets.getBlank()
  let asterisk: boolean = false

  const scored = score !== undefined
  if (scored) {
    if (score?.meta?.category === ScoreCategory.DEFAULT_NO_SPEED) {
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
          <img src={icon} className={iconClasses.statIcon}></img>
          {scored ? `${t('Score')}${asterisk ? ' *' : ''}` : ''}
        </Flex>
        {scored ? `${localeNumberComma_0(Number(score.score))} (${score.rating})` : ''}
      </Flex>
    </>
  )
}
