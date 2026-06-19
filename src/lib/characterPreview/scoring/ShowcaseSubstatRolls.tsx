import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
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
import classes from './ShowcaseSubstatRolls.module.css'
import {
  computeTierColors,
  type TierColors,
} from './substatRollColors'
import {
  type AggregatedStatRolls,
  aggregateSubstatRolls,
} from './substatRollsAggregator'

const TRACK_WIDTH = 222

function getScale(maxRolls: number): number {
  const cap = Math.max(Math.min(Math.floor(maxRolls / 3) * 3 + 6, 36), 18)
  return (TRACK_WIDTH + 1 - cap) / cap
}

function StripeGroup({ count, color, segWidth }: { count: number, color: string, segWidth: number }) {
  if (count === 0) return null
  return (
    <div className={classes.stripeGroup}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={classes.stripeSegment}
          style={{ width: segWidth, backgroundColor: color }}
        />
      ))}
    </div>
  )
}

function RollCounterStripe({ entry, colors, scale }: { entry: AggregatedStatRolls, colors: TierColors, scale: number }) {
  const hw = Math.round(1.0 * scale)
  const mw = Math.round(0.9 * scale)
  const lw = Math.round(0.8 * scale)
  return (
    <div className={classes.stripeTrack} style={{ width: TRACK_WIDTH }}>
      <StripeGroup count={entry.high} color={colors.high} segWidth={hw} />
      <StripeGroup count={entry.mid} color={colors.mid} segWidth={mw} />
      <StripeGroup count={entry.low} color={colors.low} segWidth={lw} />
    </div>
  )
}

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
  const scale = getScale(maxRolls)

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
          <RollCounterStripe entry={entry} colors={tierColors} scale={scale} />
        </div>
      ))}
    </div>
  )
})
