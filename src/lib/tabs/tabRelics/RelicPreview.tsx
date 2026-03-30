import { Divider, Paper } from '@mantine/core'
import i18next from 'i18next'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  showcaseTransition,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { Parts } from 'lib/constants/constants'
import { relicCardH, relicCardW } from 'lib/constants/constantsUi'
import iconClasses from 'style/icons.module.css'
import { type RelicScoringResult } from 'lib/relics/scoring/relicScorer'
import { Assets } from 'lib/rendering/assets'

import { Renderer } from 'lib/rendering/renderer'
import { ScoreCategory } from 'lib/scoring/scoreComparison'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  RelicStatRow,
  type SubstatDetails,
} from 'lib/tabs/tabRelics/relicPreview/RelicStatRow'
import { RelicStatText } from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import {
  type Languages,
  localeNumberComma_0,
} from 'lib/utils/i18nUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type {
  Relic,
  RelicSubstatMetadata,
} from 'types/relic'

export type ShowcaseTheme = {
  cardBackgroundColor: string,
  cardBorderColor: string,
}

const PLACEHOLDER_RELIC: Partial<Relic> = {
  enhance: 0,
  part: undefined,
  set: undefined,
  grade: 0,
  substats: [],
  previewSubstats: [],
  main: undefined,
  equippedBy: undefined,
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
  fill?: boolean,
}) {
  const { t } = useTranslation('common')
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
    fill,
  } = props
  const relic: Relic = {
    ...PLACEHOLDER_RELIC,
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
  const DIVIDER_MARGIN = '6px 0px 6px 0px'

  const fillerStats = Array.from<RelicSubstatMetadata>({ length: 4 - relic.substats.length - relic.previewSubstats.length })

  return (
    <Paper
      data-testid="relic-preview"
      withBorder={source != null}
      onClick={cardClicked}
      style={{
        flex: fill ? 1 : undefined,
        width: fill ? undefined : relicCardW,
        minWidth: fill ? 0 : relicCardW,
        height: relicCardH,
        padding: 12,
        backgroundColor: useShowcaseColors ? 'var(--showcase-card-bg)' : 'var(--layer-2)',
        borderColor: useShowcaseColors ? 'var(--showcase-card-border)' : undefined,
        transition: showcaseTransition,
        borderRadius: 6,
        boxShadow: source == null ? 'inset 0 0 0 1px var(--border-default)' : showcaseShadow + showcaseShadowInsetAddition,
        cursor: (source !== ShowcaseSource.SHOWCASE_TAB && source !== ShowcaseSource.BUILDS_MODAL && !unhoverable) ? 'pointer' : 'default',
      }}
    >
      <RelicStatText language={i18next.resolvedLanguage as Languages} style={{ height: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: JUSTIFY,
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img
              style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
              }}
              title={relic.set}
              src={relicSrc}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{Renderer.renderGrade(relic)}</span>
              <span>{relic.id != undefined ? `+${relic.enhance}` : ''}</span>
            </div>
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
          </div>

          <Divider style={{ margin: DIVIDER_MARGIN }} />

          <RelicStatRow stat={relic.main as SubstatDetails} main={true} relic={relic} t={t} />

          <Divider style={{ margin: DIVIDER_MARGIN }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: STAT_GAP }}>
            {relic.substats.map((s, idx) => <RelicStatRow key={`substats-${idx}`} stat={s} main={false} relic={relic} t={t} />)}
            {relic.previewSubstats.map((s, idx) => <RelicStatRow key={`previews-${idx}`} stat={s} main={false} relic={relic} isPreview={true} t={t} />)}
            {fillerStats.map((x, idx) => <RelicStatRow key={`fillers-${idx}`} stat={x} main={false} relic={relic} t={t} />)}
          </div>

          {scoringType !== ScoringType.NONE && <ScoreFooter score={score} dividerMargin={DIVIDER_MARGIN} />}
        </div>
      </RelicStatText>
    </Paper>
  )
})

function ScoreFooter(props: { score?: RelicScoringResult; dividerMargin: string }) {
  const { t } = useTranslation('common')
  const {
    score,
    dividerMargin,
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
      <Divider style={{ margin: dividerMargin }} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          <img src={icon} className={iconClasses.statIcon}></img>
          {scored ? `${t('Score')}${asterisk ? ' *' : ''}` : ''}
        </div>
        {scored ? `${localeNumberComma_0(Number(score.score))} (${score.rating})` : ''}
      </div>
    </>
  )
}
