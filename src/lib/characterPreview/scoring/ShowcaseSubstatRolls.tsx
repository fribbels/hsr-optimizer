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
  // Vivid — saturated across all tiers, low still has color
  c2: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.55, s * 0.95, hue).css(),
      mid: chroma.oklch(0.68, s * 0.70, hue).css(),
      low: chroma.oklch(0.80, s * 0.25, hue).css(),
    }
  },
  // Soft — muted, gentle, compressed range
  c3: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.62, s * 0.86, hue).css(),
      mid: chroma.oklch(0.71, s * 0.52, hue).css(),
      low: chroma.oklch(0.80, 0.02, hue).css(),
    }
  },
  // Softer — lighter high, less saturated
  c3a: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.66, s * 0.70, hue).css(),
      mid: chroma.oklch(0.74, s * 0.42, hue).css(),
      low: chroma.oklch(0.82, 0.02, hue).css(),
    }
  },
  // Whisper — very light high, gentle steps
  c3b: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.68, s * 0.60, hue).css(),
      mid: chroma.oklch(0.75, s * 0.35, hue).css(),
      low: chroma.oklch(0.82, 0.02, hue).css(),
    }
  },
  // Pastel — high still colorful but lifted in lightness
  c3c: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.67, s * 0.75, hue).css(),
      mid: chroma.oklch(0.78, s * 0.38, hue).css(),
      low: chroma.oklch(0.93, 0.005, hue).css(),
    }
  },
  // Ghost — barely there, very subtle tinting
  c3d: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.70, s * 0.50, hue).css(),
      mid: chroma.oklch(0.76, s * 0.28, hue).css(),
      low: chroma.oklch(0.82, 0.02, hue).css(),
    }
  },
  // Spread — wider lightness gap, same subtle sat
  c6: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.57, s * 0.80, hue).css(),
      mid: chroma.oklch(0.71, s * 0.45, hue).css(),
      low: chroma.oklch(0.84, 0.02, hue).css(),
    }
  },
  // Tinted — low keeps a hint of color instead of going grey
  c9: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.61, s * 0.82, hue).css(),
      mid: chroma.oklch(0.72, s * 0.48, hue).css(),
      low: chroma.oklch(0.82, s * 0.15, hue).css(),
    }
  },
  // Steep — high close to Soft but mid drops off fast
  c10: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.62, s * 0.85, hue).css(),
      mid: chroma.oklch(0.74, s * 0.35, hue).css(),
      low: chroma.oklch(0.83, 0.02, hue).css(),
    }
  },
  // Shift — mid stays saturated (closer to high), low is distinct
  c11: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.60, s * 0.82, hue).css(),
      mid: chroma.oklch(0.68, s * 0.65, hue).css(),
      low: chroma.oklch(0.82, 0.02, hue).css(),
    }
  },
  // Fade — even chroma steps from high to zero
  c12: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.60, s * 0.75, hue).css(),
      mid: chroma.oklch(0.71, s * 0.40, hue).css(),
      low: chroma.oklch(0.81, s * 0.08, hue).css(),
    }
  },
  // Mono — achromatic, pure lightness steps
  c7: (seed) => {
    const { hue } = seedHueChroma(seed)
    return {
      high: chroma.oklch(0.55, 0.03, hue).css(),
      mid: chroma.oklch(0.68, 0.02, hue).css(),
      low: chroma.oklch(0.82, 0.01, hue).css(),
    }
  },
  // Punch — high is very saturated, mid/low drop off sharply
  c8: (seed) => {
    const { hue, c } = seedHueChroma(seed)
    const s = Math.max(c, 0.12)
    return {
      high: chroma.oklch(0.58, s * 1.00, hue).css(),
      mid: chroma.oklch(0.72, s * 0.35, hue).css(),
      low: chroma.oklch(0.84, 0.02, hue).css(),
    }
  },
}

// ─── Viz Props ──────────────────────────────────────────────

type VizProps = { entry: AggregatedStatRolls; colors: TierColors }

function EmptyGhost() {
  return <div className={classes.emptyGhost} />
}

// ─── Viz Components ──────────────────────────────────────────

function TierSegments({ count, color }: { count: number; color: string }) {
  if (count === 0) return null
  return (
    <div className={classes.tierGroup}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={classes.tierSeg}
          style={{
            backgroundColor: color,
            borderRight: i < count - 1 ? SEGMENT_BORDER : 'none',
          }}
        />
      ))}
    </div>
  )
}

function TiersViz({ entry, colors }: VizProps) {
  return (
    <div className={classes.track}>
      <TierSegments count={entry.high} color={colors.high} />
      <TierSegments count={entry.mid} color={colors.mid} />
      <TierSegments count={entry.low} color={colors.low} />
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

function buildSegments(entry: AggregatedStatRolls, colors: TierColors) {
  return [
    ...Array.from({ length: entry.high }, () => colors.high),
    ...Array.from({ length: entry.mid }, () => colors.mid),
    ...Array.from({ length: entry.low }, () => colors.low),
  ]
}

function StripeViz({ entry, colors }: VizProps) {
  const segments = buildSegments(entry, colors)
  return (
    <div className={classes.stripeTrack}>
      {segments.map((color, i) => (
        <div
          key={i}
          className={classes.stripeSegment}
          style={{
            backgroundColor: color,
            borderRight: i < segments.length - 1 ? SEGMENT_BORDER : 'none',
          }}
        />
      ))}
    </div>
  )
}


// ─── Mode definitions ────────────────────────────────────────

const SEGMENT_BORDER = '1px solid rgba(0,0,0,0.50)'

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
  const colorAlpha = useShowcaseDebugVizStore((s) => s.colorAlpha)

  const tierColors = useMemo(() => {
    const algo = COLOR_ALGORITHMS[colorMode] ?? COLOR_ALGORITHMS.c1
    const colors = algo(seedColor)
    const lowAlpha = colorAlpha * 0.90
    return {
      high: chroma(colors.high).alpha(colorAlpha).css(),
      mid: chroma(colors.mid).alpha(colorAlpha).css(),
      low: chroma(colors.low).alpha(lowAlpha).css(),
    }
  }, [seedColor, colorMode, colorAlpha])

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
              <StatTextSm>{t(`Stats.${entry.stat}`)}</StatTextSm>
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
