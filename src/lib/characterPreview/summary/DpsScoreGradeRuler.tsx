import { SimScoreGrades } from 'lib/scoring/dpsScore'
import type { Languages } from 'lib/utils/i18nUtils'
import { renderThousandsK } from 'lib/utils/i18nUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DpsScoreGradeRuler.module.css'

// --- Static data ---

const liftedGrades: Record<string, boolean> = {
  'WTF+': true,
  'SSS+': true,
  'SS+': true,
  'S+': true,
  'A+': true,
  'B+': true,
  'C+': true,
  'D+': true,
  'F+': true,
}

const reversedLanguages: Partial<Record<Languages, boolean>> = {}

const sortedGrades = Object.entries(SimScoreGrades).sort((a, b) => b[1] - a[1])

// --- Layout dimensions ---

const RULER_WIDTH = 1092
const CHART_HEIGHT = 150
const MARGIN_TOP = 45
const MARGIN_LR = 20
const CHART_AREA_WIDTH = RULER_WIDTH - 2 * MARGIN_LR // 1052
const CHART_AREA_HEIGHT = 50 // CHART_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM(55)
const BAR_HEIGHT = 20

// Label vertical spacing (matching original Recharts offsets)
const LOW = 10
const HIGH = 28
const LIFT = 36

// Bottom label Y = bottom of bar + offset
const BOTTOM_Y = MARGIN_TOP + BAR_HEIGHT

// Gradient color stops
const GRADIENT_COLORS = [
  '#FF6355dd', '#faf742dd', '#b0fa42dd', '#75ec46dd',
  '#17D553dd', '#23BBFFdd', '#9F50FFdd', '#BC38FFdD',
] as const

// --- Pure helpers (module-scope, no allocations per render) ---

function calculateScaledPosition(gradeValue: number, minimum: number, benchmark: number, maximum: number): number {
  const percentOfBenchmark = gradeValue / 100
  if (gradeValue <= 100) {
    return minimum + (benchmark - minimum) * percentOfBenchmark
  } else {
    const percentAboveBenchmark = (gradeValue - 100) / 100
    return benchmark + (maximum - benchmark) * percentAboveBenchmark
  }
}

function toPercent(value: number, minimum: number, maximum: number): string {
  return `${(value - minimum) / (maximum - minimum) * 100}%`
}

function buildGradient(minimum: number, benchmark: number, maximum: number): string {
  const range = maximum - minimum
  const benchRatio = (benchmark - minimum) / range
  const maxRatio = (maximum - benchmark) / range
  const offsets = [
    0,
    benchRatio / 2 * 100,
    benchRatio * 0.75 * 100,
    benchRatio * 100,
    (maxRatio / 4 + benchRatio) * 100,
    (maxRatio / 2 + benchRatio) * 100,
    (maxRatio * 0.75 + benchRatio) * 100,
    100,
  ]
  const stops = GRADIENT_COLORS.map((color, i) => `${color} ${offsets[i]}%`).join(', ')
  return `linear-gradient(to right, ${stops})`
}

// --- Component ---

export const DpsScoreGradeRuler = memo(function DpsScoreGradeRuler({ score: rawScore, maximum, benchmark, minimum }: {
  score: number
  maximum: number
  benchmark: number
  minimum: number
}) {
  const { t, i18n } = useTranslation('common')
  const score = Math.min(maximum, Math.max(rawScore, minimum))

  const dmgLabel = t('Damage')
  const reversedLabels = reversedLanguages[i18n.resolvedLanguage as Languages]
  const numberOffset = reversedLabels ? LOW : HIGH
  const dmgOffset = reversedLabels ? HIGH : LOW

  const scorePercent = toPercent(score, minimum, maximum)
  const gradient = buildGradient(minimum, benchmark, maximum)

  // Min bar width = 5px equivalent (matching Recharts minPointSize={5})
  const scoreRatio = (score - minimum) / (maximum - minimum)
  const minBarRatio = 5 / CHART_AREA_WIDTH
  const barPercent = `${Math.max(scoreRatio, minBarRatio) * 100}%`

  const minPercent = toPercent(minimum, minimum, maximum) // '0%'
  const benchPercent = toPercent(benchmark, minimum, maximum)
  const maxPercent = toPercent(maximum, minimum, maximum) // '100%'

  return (
    <div className={styles.ruler} style={{ width: RULER_WIDTH, height: CHART_HEIGHT }}>
      <div className={styles.chartArea} style={{ left: MARGIN_LR, right: MARGIN_LR }}>
        {/* Gradient background track */}
        <div className={styles.gradientBg} style={{ top: MARGIN_TOP, height: BAR_HEIGHT, background: gradient }} />

        {/* Score fill bar — full-width gradient inside a clipping container */}
        <div className={styles.scoreClip} style={{ top: MARGIN_TOP, height: BAR_HEIGHT, width: barPercent }}>
          <div className={styles.scoreFill} style={{ width: CHART_AREA_WIDTH, background: gradient }} />
        </div>

        {/* Score indicator (white line) */}
        <div className={styles.scoreMarker} style={{ left: scorePercent, top: MARGIN_TOP, height: BAR_HEIGHT, width: 4 }} />

        {/* Minimum tick */}
        <div className={styles.tick} style={{ left: minPercent }}>
          <div className={styles.tickLine} style={{ top: MARGIN_TOP, height: BAR_HEIGHT }} />
          <span className={styles.topLabel} style={{ top: MARGIN_TOP - dmgOffset, fontSize: 12 }}>{dmgLabel}</span>
          <span className={styles.topLabel} style={{ top: MARGIN_TOP - numberOffset, fontSize: 12 }}>{renderThousandsK(minimum)}</span>
          <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + LOW, fontSize: 12 }}>0%</span>
        </div>

        {/* Benchmark tick */}
        <div className={styles.tick} style={{ left: benchPercent }}>
          <div className={styles.tickLine} style={{ top: MARGIN_TOP, height: BAR_HEIGHT }} />
          <span className={styles.topLabel} style={{ top: MARGIN_TOP - dmgOffset, fontSize: 12 }}>{dmgLabel}</span>
          <span className={styles.topLabel} style={{ top: MARGIN_TOP - numberOffset, fontSize: 12 }}>{renderThousandsK(benchmark)}</span>
        </div>

        {/* Maximum tick */}
        <div className={styles.tick} style={{ left: maxPercent }}>
          <div className={styles.tickLine} style={{ top: MARGIN_TOP, height: BAR_HEIGHT }} />
          <span className={styles.topLabel} style={{ top: MARGIN_TOP - dmgOffset, fontSize: 12 }}>{dmgLabel}</span>
          <span className={styles.topLabel} style={{ top: MARGIN_TOP - numberOffset, fontSize: 12 }}>{renderThousandsK(maximum)}</span>
          <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + LOW, fontSize: 12 }}>200%</span>
        </div>

        {/* Grade ticks */}
        {sortedGrades.map(([grade, gradeScore]) => {
          const scaledValue = calculateScaledPosition(gradeScore, minimum, benchmark, maximum)
          const base = liftedGrades[grade] ? LIFT : 0
          return (
            <div key={grade} className={styles.tick} style={{ left: toPercent(scaledValue, minimum, maximum) }}>
              <div className={styles.tickLine} style={{ top: MARGIN_TOP, height: BAR_HEIGHT }} />
              <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + base + LOW, fontSize: 12 }}>{grade}</span>
              <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + base + HIGH, fontSize: 11 }}>{gradeScore}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
