import chroma from 'chroma-js'
import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import { HeaderText } from 'lib/ui/HeaderText'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import type { CharacterId } from 'types/character'
import { aggregateSubstatRolls, type AggregatedStatRolls } from './substatRollsAggregator'
import classes from './ShowcaseSubstatRolls.module.css'
import { useShowcaseDebugVizStore } from './showcaseDebugVizStore'

type TierColors = { high: string; mid: string; low: string }

function seedHueChroma(seed: string) {
  const [, c, h] = chroma(seed).oklch()
  return { hue: Number.isNaN(h) ? 240 : h, c }
}

const COLOR_ALGORITHMS: Record<string, (seedColor: string) => TierColors> = {
  c1: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.60, s * 0.90, hue).css(),
      mid: chroma.oklch(0.70, s * 0.55, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c2: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.61, s * 0.88, hue).css(),
      mid: chroma.oklch(0.70, s * 0.53, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c3: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.62, s * 0.86, hue).css(),
      mid: chroma.oklch(0.71, s * 0.52, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c4: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.63, s * 0.84, hue).css(),
      mid: chroma.oklch(0.71, s * 0.50, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c5: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.64, s * 0.82, hue).css(),
      mid: chroma.oklch(0.72, s * 0.48, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c6: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.65, s * 0.80, hue).css(),
      mid: chroma.oklch(0.72, s * 0.48, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c7: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.62, s * 0.90, hue).css(),
      mid: chroma.oklch(0.70, s * 0.55, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c8: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.63, s * 0.88, hue).css(),
      mid: chroma.oklch(0.72, s * 0.52, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c9: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.64, s * 0.86, hue).css(),
      mid: chroma.oklch(0.71, s * 0.50, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c10: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.65, s * 0.84, hue).css(),
      mid: chroma.oklch(0.73, s * 0.48, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  c11: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.61, s * 0.85, hue).css(),
      mid: chroma.oklch(0.72, s * 0.50, hue).css(),
      low: chroma.oklch(0.82, 0.02, hue).css(),
    }
  },
  c12: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.63, s * 0.82, hue).css(),
      mid: chroma.oklch(0.70, s * 0.55, hue).css(),
      low: chroma.oklch(0.78, 0.02, hue).css(),
    }
  },
}

// ─── Viz Props ──────────────────────────────────────────────

type VizProps = { entry: AggregatedStatRolls; colors: TierColors }

function EmptyGhost() {
  return <div className={classes.emptyGhost} />
}

// ─── Viz Components ──────────────────────────────────────────

function TiersViz({ entry, colors }: VizProps) {
  return (
    <div className={classes.track}>
      {entry.high > 0 && <div className={classes.bar4} style={{ width: entry.high * 12, backgroundColor: colors.high }} />}
      {entry.mid > 0 && <div className={classes.bar4} style={{ width: entry.mid * 12, backgroundColor: colors.mid }} />}
      {entry.low > 0 && <div className={classes.bar4} style={{ width: entry.low * 12, backgroundColor: colors.low }} />}
    </div>
  )
}

function StepsViz({ entry, colors }: VizProps) {
  if (entry.total === 0) return <EmptyGhost />
  return (
    <div className={classes.stepsRow}>
      {Array.from({ length: entry.high }, (_, i) => <div key={`h${i}`} className={classes.step} style={{ height: 10, backgroundColor: colors.high }} />)}
      {Array.from({ length: entry.mid }, (_, i) => <div key={`m${i}`} className={classes.step} style={{ height: 7, backgroundColor: colors.mid }} />)}
      {Array.from({ length: entry.low }, (_, i) => <div key={`l${i}`} className={classes.step} style={{ height: 4, backgroundColor: colors.low }} />)}
    </div>
  )
}

function ChunkyViz({ entry, colors }: VizProps) {
  if (entry.total === 0) return <EmptyGhost />
  return (
    <div className={classes.row2}>
      {Array.from({ length: entry.high }, (_, i) => <div key={`h${i}`} className={classes.chunky} style={{ backgroundColor: colors.high }} />)}
      {Array.from({ length: entry.mid }, (_, i) => <div key={`m${i}`} className={classes.chunky} style={{ backgroundColor: colors.mid }} />)}
      {Array.from({ length: entry.low }, (_, i) => <div key={`l${i}`} className={classes.chunky} style={{ backgroundColor: colors.low }} />)}
    </div>
  )
}

function SkylineViz({ entry, colors }: VizProps) {
  if (entry.total === 0) return <EmptyGhost />
  return (
    <div className={classes.skylineRow}>
      {Array.from({ length: entry.high }, (_, i) => <div key={`h${i}`} className={classes.sky} style={{ height: 12, backgroundColor: colors.high }} />)}
      {Array.from({ length: entry.mid }, (_, i) => <div key={`m${i}`} className={classes.sky} style={{ height: 8, backgroundColor: colors.mid }} />)}
      {Array.from({ length: entry.low }, (_, i) => <div key={`l${i}`} className={classes.sky} style={{ height: 4, backgroundColor: colors.low }} />)}
    </div>
  )
}

function ZonesViz({ entry, colors }: VizProps) {
  if (entry.total === 0) return <EmptyGhost />
  const unit = 10
  return (
    <div className={classes.zonesRow}>
      <div className={`${classes.zone} ${entry.high > 0 ? '' : classes.zoneGhost}`} style={{ width: entry.high > 0 ? entry.high * unit : 6 }}>
        {entry.high > 0 && <div className={classes.zoneBar} style={{ backgroundColor: colors.high }} />}
      </div>
      <div className={`${classes.zone} ${entry.mid > 0 ? '' : classes.zoneGhost}`} style={{ width: entry.mid > 0 ? entry.mid * unit : 6 }}>
        {entry.mid > 0 && <div className={classes.zoneBar} style={{ backgroundColor: colors.mid }} />}
      </div>
      <div className={`${classes.zone} ${entry.low > 0 ? '' : classes.zoneGhost}`} style={{ width: entry.low > 0 ? entry.low * unit : 6 }}>
        {entry.low > 0 && <div className={classes.zoneBar} style={{ backgroundColor: colors.low }} />}
      </div>
    </div>
  )
}

function StripeViz({ entry, colors }: VizProps) {
  if (entry.total === 0) return <EmptyGhost />
  const segments = [
    ...Array.from({ length: entry.high }, () => colors.high),
    ...Array.from({ length: entry.mid }, () => colors.mid),
    ...Array.from({ length: entry.low }, () => colors.low),
  ]
  return (
    <div className={classes.stripeRow}>
      {segments.map((color, i) => (
        <div key={i} className={classes.stripeSegment} style={{ backgroundColor: color }} />
      ))}
    </div>
  )
}

// ─── Mode definitions ────────────────────────────────────────

const VIZ_CONFIG: Record<string, { component: React.ComponentType<VizProps> }> = {
  s1: { component: TiersViz },
  s2: { component: StepsViz },
  s3: { component: ChunkyViz },
  s4: { component: SkylineViz },
  s5: { component: StripeViz },
  s6: { component: ZonesViz },
}

// ─── Main Component ─────────────────────────────────────────

export const ShowcaseSubstatRolls = memo(function ShowcaseSubstatRolls({
  displayRelics,
  characterId,
  seedColor,
}: {
  displayRelics: PreviewRelics
  characterId: CharacterId
  seedColor: string
}) {
  const { t } = useTranslation('common')
  const scoringMetadata = useScoringMetadata(characterId)
  const vizMode = useShowcaseDebugVizStore((s) => s.substatRollsMode)
  const colorMode = useShowcaseDebugVizStore((s) => s.colorMode)

  const tierColors = useMemo(() => {
    const algo = COLOR_ALGORITHMS[colorMode] ?? COLOR_ALGORITHMS.c1
    return algo(seedColor)
  }, [seedColor, colorMode])

  const aggregated = useMemo(
    () => aggregateSubstatRolls(displayRelics, scoringMetadata.stats),
    [displayRelics, scoringMetadata.stats],
  )

  if (aggregated.length === 0) return null

  const { component: VizComponent } = VIZ_CONFIG[vizMode] ?? VIZ_CONFIG.s1

  return (
    <div className={classes.container}>
      <HeaderText style={{ fontSize: 16, textDecoration: 'none', marginBottom: 6 }}>
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
          <VizComponent entry={entry} colors={tierColors} />
        </div>
      ))}
    </div>
  )
})
