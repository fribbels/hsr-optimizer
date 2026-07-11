import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { RollStripeBar } from 'lib/characterPreview/scoring/RollStripeBar'
import classes from 'lib/characterPreview/scoring/ShowcaseSubstatRolls.module.css'
import { computeTierColors } from 'lib/characterPreview/scoring/substatRollColors'
import {
  aggregateSubstatRolls,
} from 'lib/characterPreview/scoring/substatRollsAggregator'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  memo,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import type { CharacterId } from 'types/character'

export const ShowcaseSubstatRolls = memo(function ShowcaseSubstatRolls({
  displayRelics,
  characterId,
  seedColor,
}: {
  displayRelics: PreviewRelics,
  characterId: CharacterId,
  seedColor: string,
}) {
  const { t } = useTranslation('common')
  const scoringMetadata = useScoringMetadata(characterId)

  const tierColors = useMemo(() => computeTierColors(seedColor), [seedColor])

  const aggregated = useMemo(
    () => aggregateSubstatRolls(displayRelics, scoringMetadata.stats),
    [displayRelics, scoringMetadata.stats],
  )

  if (aggregated.length === 0) return null

  const maxRolls = Math.max(...aggregated.map((e) => e.total))

  return (
    <div className={classes.container}>
      <HeaderText style={{ fontSize: 16, textDecoration: 'none', marginBottom: 4 }}>
        Substat Rolls
      </HeaderText>
      {aggregated.map((entry) => (
        <div key={entry.stat} className={classes.statGroup}>
          <div className={classes.statLine}>
            <div className={classes.statLabel}>
              <img src={Assets.getStatIcon(entry.stat)} className={iconClasses.statIcon} />
              <StatTextSm>{t(`Stats.${entry.stat}`)}</StatTextSm>
            </div>
            <StatTextSm className={classes.rollCount}>
              {entry.effective.toFixed(1)}
            </StatTextSm>
          </div>
          <RollStripeBar entry={entry} colors={tierColors} maxRolls={maxRolls} />
        </div>
      ))}
    </div>
  )
})
