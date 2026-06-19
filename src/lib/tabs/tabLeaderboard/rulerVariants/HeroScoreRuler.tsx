import chroma from 'chroma-js'
import type { TierColors } from 'lib/characterPreview/scoring/substatRollColors'
import { SimScoreGrades } from 'lib/scoring/dpsScore'
import { useMemo } from 'react'
import classes from './HeroScoreRuler.module.css'

const GRADE_KEYS = ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'WTF', 'AEON'] as const
const SHADE_COUNT = 11

function linScale(start: number, count: number): number[] {
  const step = (1.0 - start) / (count - 1)
  return Array.from({ length: count }, (_, i) => start + step * i)
}

const DARK_ALPHA = 0.70
const DARK_CHROMA = 0.75
const DARKEN_AMT = 1.0

function buildHeat(tierColors: TierColors): string[] {
  const high = chroma(tierColors.high).alpha(1).darken(DARKEN_AMT)
  const mid = chroma(tierColors.mid).alpha(1)
  const low = chroma(tierColors.low).alpha(1)
  const anchors = [high, mid, low]
  const colors = chroma.scale(anchors).domain([0, 0.75, 1]).mode('lab').colors(SHADE_COUNT, null)
  const chromas = linScale(DARK_CHROMA, SHADE_COUNT)
  const alphas = linScale(DARK_ALPHA, SHADE_COUNT)
  return colors.map((c, i) => {
    const [l, cr, h] = c.oklch()
    return chroma.oklch(l, (cr || 0) * chromas[i], h || 0).alpha(alphas[i]).css()
  })
}

function gPos(value: number): number {
  return Math.max(0, Math.min(100, value / 2))
}

interface Segment {
  grade: string
  value: number
  left: number
  width: number
}

function buildSegments(): Segment[] {
  const segments: Segment[] = [
    { grade: '', value: 0, left: 0, width: gPos(SimScoreGrades.F) },
  ]
  for (let i = 0; i < GRADE_KEYS.length; i++) {
    const grade = GRADE_KEYS[i]
    const left = gPos(SimScoreGrades[grade])
    const nextLeft = i < GRADE_KEYS.length - 1 ? gPos(SimScoreGrades[GRADE_KEYS[i + 1]]) : 100
    segments.push({ grade, value: SimScoreGrades[grade], left, width: nextLeft - left })
  }
  return segments
}

const SEGMENTS = buildSegments()
const THRESHOLDS = SEGMENTS.filter((s) => s.grade !== '')

interface HeroScoreRulerProps {
  score?: number
  tierColors: TierColors
}

export function HeroScoreRuler({ score, tierColors }: HeroScoreRulerProps) {
  const hasScore = score != null
  const fillPct = hasScore ? gPos(score) : 0
  const flagPct = Math.max(7, Math.min(93, fillPct))
  const valueText = hasScore ? `${score.toFixed(1)}%` : ''

  const heat = useMemo(() => buildHeat(tierColors), [tierColors])

  return (
    <div className={classes.ruler}>
      <div className={classes.barWrap}>
        <div className={classes.bar}>
          {SEGMENTS.map((seg, i) => (
            <div
              key={seg.grade || `pre-${i}`}
              className={i === SEGMENTS.length - 1 ? `${classes.segment} ${classes.segmentEnd}` : classes.segment}
              style={{ flexBasis: `${seg.width}%`, background: heat[i] }}
            />
          ))}
          {hasScore && <div className={classes.remain} style={{ left: `${fillPct}%` }} />}
        </div>

        {THRESHOLDS.map((t) => <span key={`tick-${t.grade}`} className={classes.tick} style={{ left: `${t.left}%` }} />)}

        {hasScore && <div className={classes.marker} style={{ left: `${fillPct}%` }} />}
      </div>

      {hasScore && (
        <div className={classes.flagZone}>
          <div className={classes.flag} style={{ left: `${flagPct}%` }}>
            <span className={classes.flagPill}>{valueText}</span>
          </div>
        </div>
      )}

      <div className={classes.labelRow}>
        {THRESHOLDS.map((t) => (
          <div key={`label-${t.grade}`} className={classes.gradeLabel} style={{ left: `${t.left}%` }}>
            <span className={classes.gradeLetter}>{t.grade}</span>
            <span className={classes.gradePct}>{t.value}%</span>
          </div>
        ))}
        <div className={classes.zeroLabel}>0%</div>
        <div className={classes.perfLabel}>200%</div>
      </div>
    </div>
  )
}
