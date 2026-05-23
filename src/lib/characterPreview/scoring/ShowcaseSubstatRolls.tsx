import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import { HeaderText } from 'lib/ui/HeaderText'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import type { CharacterId } from 'types/character'
import { aggregateSubstatRolls, type AggregatedStatRolls } from './substatRollsAggregator'
import classes from './ShowcaseSubstatRolls.module.css'

const HIGH_COLOR = '#0e7eff'
const MID_COLOR = '#63a9ff'
const LOW_COLOR = '#a5bcd9'

// ─── Viz Components ──────────────────────────────────────────

// Three tier blocks with gaps
function TiersViz({ entry }: { entry: AggregatedStatRolls }) {
  if (entry.total === 0) return null
  return (
    <div className={classes.row3}>
      {entry.high > 0 && <div className={classes.bar4} style={{ width: entry.high * 12, backgroundColor: HIGH_COLOR }} />}
      {entry.mid > 0 && <div className={classes.bar4} style={{ width: entry.mid * 12, backgroundColor: MID_COLOR }} />}
      {entry.low > 0 && <div className={classes.bar4} style={{ width: entry.low * 12, backgroundColor: LOW_COLOR }} />}
    </div>
  )
}

// Stepped cells — 8px wide, height varies by tier
function StepsViz({ entry }: { entry: AggregatedStatRolls }) {
  if (entry.total === 0) return null
  return (
    <div className={classes.stepsRow}>
      {Array.from({ length: entry.high }, (_, i) => <div key={`h${i}`} className={classes.stepHigh} />)}
      {Array.from({ length: entry.mid }, (_, i) => <div key={`m${i}`} className={classes.stepMid} />)}
      {Array.from({ length: entry.low }, (_, i) => <div key={`l${i}`} className={classes.stepLow} />)}
    </div>
  )
}

// Chunky — large 10×8px blocks
function ChunkyViz({ entry }: { entry: AggregatedStatRolls }) {
  if (entry.total === 0) return null
  return <div className={classes.row2}>{renderColoredElements(entry, classes.chunky)}</div>
}

// Steps with ground line and drop shadows for 2.5D depth
function SkylineViz({ entry }: { entry: AggregatedStatRolls }) {
  if (entry.total === 0) return null
  return (
    <div className={classes.skylineRow}>
      {Array.from({ length: entry.high }, (_, i) => <div key={`h${i}`} className={classes.skyHigh} />)}
      {Array.from({ length: entry.mid }, (_, i) => <div key={`m${i}`} className={classes.skyMid} />)}
      {Array.from({ length: entry.low }, (_, i) => <div key={`l${i}`} className={classes.skyLow} />)}
    </div>
  )
}

// Continuous bar with tick dividers between each roll
function StripeViz({ entry }: { entry: AggregatedStatRolls }) {
  if (entry.total === 0) return null
  const segments = [
    ...Array.from({ length: entry.high }, () => HIGH_COLOR),
    ...Array.from({ length: entry.mid }, () => MID_COLOR),
    ...Array.from({ length: entry.low }, () => LOW_COLOR),
  ]
  return (
    <div className={classes.stripeRow}>
      {segments.map((color, i) => (
        <div key={i} className={classes.stripeSegment} style={{ backgroundColor: color }} />
      ))}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────

function renderColoredElements(entry: AggregatedStatRolls, className: string) {
  return (
    <>
      {Array.from({ length: entry.high }, (_, i) => <div key={`h${i}`} className={className} style={{ backgroundColor: HIGH_COLOR }} />)}
      {Array.from({ length: entry.mid }, (_, i) => <div key={`m${i}`} className={className} style={{ backgroundColor: MID_COLOR }} />)}
      {Array.from({ length: entry.low }, (_, i) => <div key={`l${i}`} className={className} style={{ backgroundColor: LOW_COLOR }} />)}
    </>
  )
}

// ─── Mode definitions ────────────────────────────────────────

const VIZ_MODES = ['s1', 's2', 's3', 's4', 's5'] as const
type VizMode = typeof VIZ_MODES[number]

const VIZ_CONFIG: Record<VizMode, { label: string; component: React.ComponentType<{ entry: AggregatedStatRolls }> }> = {
  s1: { label: 'Tiers', component: TiersViz },
  s2: { label: 'Steps', component: StepsViz },
  s3: { label: 'Chunky', component: ChunkyViz },
  s4: { label: 'Skyline', component: SkylineViz },
  s5: { label: 'Stripe', component: StripeViz },
}

// ─── Main Component ─────────────────────────────────────────

export const ShowcaseSubstatRolls = memo(function ShowcaseSubstatRolls({
  displayRelics,
  characterId,
}: {
  displayRelics: PreviewRelics
  characterId: CharacterId
}) {
  const { t } = useTranslation('common')
  const scoringMetadata = useScoringMetadata(characterId)
  const [vizMode, setVizMode] = useState<VizMode>('s1')

  const aggregated = useMemo(
    () => aggregateSubstatRolls(displayRelics, scoringMetadata.stats),
    [displayRelics, scoringMetadata.stats],
  )

  if (aggregated.length === 0) return null

  const { component: VizComponent } = VIZ_CONFIG[vizMode]

  return (
    <div className={classes.container}>
      <div className={classes.debugPills}>
        {VIZ_MODES.map((mode) => (
          <button
            key={mode}
            className={`${classes.pill} ${vizMode === mode ? classes.pillActive : ''}`}
            onClick={() => setVizMode(mode)}
          >
            {VIZ_CONFIG[mode].label}
          </button>
        ))}
      </div>
      <HeaderText style={{ fontSize: 16, textDecoration: 'none' }}>
        Substat Rolls
      </HeaderText>
      {aggregated.map((entry) => (
        <div key={entry.stat} className={classes.statGroup}>
          <div className={classes.statLine}>
            <div className={classes.statLabel}>
              <img src={Assets.getStatIcon(entry.stat)} className={iconClasses.statIcon} />
              <StatTextSm>{t(`ReadableStats.${entry.stat}`)}</StatTextSm>
            </div>
            <StatTextSm className={classes.rollCount}>
              {entry.effective.toFixed(1)}
            </StatTextSm>
          </div>
          <VizComponent entry={entry} />
        </div>
      ))}
    </div>
  )
})
