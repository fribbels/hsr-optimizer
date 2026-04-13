import { ScoringSelector, useSimScoringContext } from 'lib/characterPreview/SimScoringContext'
import { SimScoreGrades } from 'lib/scoring/dpsScore'
import type { Languages } from 'lib/utils/i18nUtils'
import { renderThousandsK } from 'lib/utils/i18nUtils'
import {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react'
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

// --- Pure helpers (module-scope, no allocations per render) ---

function calculateScaledPosition(gradeValue: number, minimum: number, benchmark: number, maximum: number): string {
  if (minimum === 0 && maximum === 0) return `${gradeValue / 2}%`
  const percentOfBenchmark = gradeValue / 100
  if (gradeValue <= 100) {
    return toPercent(minimum + (benchmark - minimum) * percentOfBenchmark, minimum, maximum)
  } else {
    const percentAboveBenchmark = (gradeValue - 100) / 100
    return toPercent(benchmark + (maximum - benchmark) * percentAboveBenchmark, minimum, maximum)
  }
}

function toPercent(value: number, minimum: number, maximum: number): string {
  return `${(value - minimum) / (maximum - minimum) * 100}%`
}

// --- Component ---

function getGradientStyleRule() {
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)) continue
      if (rule.selectorText.includes(styles.gradient)) {
        return rule
      }
    }
  }
}

const gradientStyleRule = getGradientStyleRule()

function resetGradient() {
  gradientStyleRule?.style.setProperty('--grad-point-1', 'calc(0 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-2', 'calc(1 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-3', 'calc(2 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-4', 'calc(3 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-5', 'calc(4 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-6', 'calc(5 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-7', 'calc(6 * 100% / 7)')
  gradientStyleRule?.style.setProperty('--grad-point-8', 'calc(7 * 100% / 7)')
}

function setGradient(minimum: number, benchmark: number, maximum: number) {
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
  for (let i = 0; i < 8; i++) {
    gradientStyleRule?.style.setProperty(`--grad-point-${i + 1}`, `${offsets[i]}%`)
  }
}

const smoothTransition = 'all 0.5s ease-in-out'
type RulerState = {
  transition: string | undefined
  minimum: number
  benchmark: number
  maximum: number
  barPercent: string
  scorePercent: string
  minPercent: string
  benchPercent: string
  maxPercent: string
}

const initialState: RulerState = {
  transition: smoothTransition,
  minimum: 0,
  benchmark: 0,
  maximum: 0,
  barPercent: '0%',
  scorePercent: '0%',
  minPercent: '0%',
  benchPercent: '50%',
  maxPercent: '100%',
}

const emptyState: RulerState = {
  transition: undefined,
  minimum: 0,
  benchmark: 0,
  maximum: 0,
  barPercent: '0%',
  scorePercent: '0%',
  minPercent: '0%',
  benchPercent: '50%',
  maxPercent: '100%',
}

export const DpsScoreGradeRuler = memo(function DpsScoreGradeRuler() {
  const { t, i18n } = useTranslation('common')

  const scoringResult = useSimScoringContext(ScoringSelector.Score)

  const [state, setState] = useState<RulerState>(initialState)

  const derivedState = useMemo<RulerState>(() => {
    if (!scoringResult) {
      return emptyState
    }

    const minimum = scoringResult.baselineSimScore
    const benchmark = scoringResult.benchmarkSimScore
    const maximum = scoringResult.maximumSimScore
    const score = Math.min(maximum, Math.max(scoringResult.originalSimScore, minimum))

    const scoreRatio = (score - minimum) / (maximum - minimum)
    const minBarRatio = 5 / CHART_AREA_WIDTH

    return {
      transition: smoothTransition,
      minimum,
      benchmark,
      maximum,
      barPercent: `${Math.max(scoreRatio, minBarRatio) * 100}%`,
      scorePercent: toPercent(score, minimum, maximum),
      minPercent: toPercent(minimum, minimum, maximum),
      benchPercent: toPercent(benchmark, minimum, maximum),
      maxPercent: toPercent(maximum, minimum, maximum),
    }
  }, [scoringResult])

  // Update gradient CSS vars
  useEffect(() => {
    if (!scoringResult) {
      resetGradient()
    } else {
      setGradient(derivedState.minimum, derivedState.benchmark, derivedState.maximum)
    }
    setState(derivedState)
  }, [derivedState, scoringResult])

  const { transition, minimum, benchmark, maximum, barPercent, scorePercent, minPercent, benchPercent, maxPercent } = state

  const dmgLabel = t('Damage')
  const reversedLabels = reversedLanguages[i18n.resolvedLanguage as Languages]
  const numberOffset = reversedLabels ? LOW : HIGH
  const dmgOffset = reversedLabels ? HIGH : LOW

  return (
    <div className={styles.ruler} style={{ width: RULER_WIDTH, height: CHART_HEIGHT }}>
      <div className={styles.chartArea} style={{ left: MARGIN_LR, right: MARGIN_LR }}>
        <BackgroundGradient transition={transition} />

        <ScoreFillBar barPercent={barPercent} transition={transition} />

        <ScoreInidcator scorePercent={scorePercent} transition={transition} />

        <MinimumTick
          percent={minPercent}
          dmgLabel={dmgLabel}
          value={minimum}
          numberOffset={numberOffset}
          dmgOffset={dmgOffset}
          transition={transition}
        />

        <BenchmarkTick
          percent={benchPercent}
          dmgLabel={dmgLabel}
          value={benchmark}
          numberOffset={numberOffset}
          dmgOffset={dmgOffset}
          transition={transition}
        />

        <MaximumTick
          percent={maxPercent}
          dmgLabel={dmgLabel}
          value={maximum}
          numberOffset={numberOffset}
          dmgOffset={dmgOffset}
          transition={transition}
        />

        <GradeTicks minimum={minimum} benchmark={benchmark} maximum={maximum} transition={transition} />
      </div>
    </div>
  )
})

const BackgroundGradient = memo(function({ transition }: { transition: string | undefined }) {
  return (
    <div
      className={styles.gradientBg}
      style={{ top: MARGIN_TOP, height: BAR_HEIGHT, transition }}
    />
  )
})

const ScoreFillBar = memo(function({ barPercent, transition }: { barPercent: string, transition: string | undefined }) {
  return (
    <div
      className={styles.scoreClip}
      style={{ top: MARGIN_TOP, height: BAR_HEIGHT, width: barPercent, transition }}
    >
      <div className={styles.scoreFill} style={{ width: CHART_AREA_WIDTH, transition }} />
    </div>
  )
})

const ScoreInidcator = memo(function({ scorePercent, transition }: { scorePercent: string, transition: string | undefined }) {
  return (
    <div
      className={styles.scoreMarker}
      style={{
        left: scorePercent,
        top: MARGIN_TOP,
        height: BAR_HEIGHT,
        width: 4,
        transition,
      }}
    />
  )
})

interface ReferenceTickProps {
  percent: string
  dmgOffset: number
  numberOffset: number
  dmgLabel: string
  value: number
  bottomLabel?: string
  transition: string | undefined
}

function ReferenceTick({ percent, dmgOffset, numberOffset, dmgLabel, value, bottomLabel, transition }: ReferenceTickProps) {
  return (
    <div className={styles.tick} style={{ left: percent, transition }}>
      <div className={styles.tickLine} style={{ top: MARGIN_TOP, height: BAR_HEIGHT }} />
      <span className={styles.topLabel} style={{ top: MARGIN_TOP - dmgOffset, fontSize: 12 }}>{dmgLabel}</span>
      <span className={styles.topLabel} style={{ top: MARGIN_TOP - numberOffset, fontSize: 12 }}>
        {renderThousandsK(value)}
      </span>
      {bottomLabel && (
        <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + LOW, fontSize: 12 }}>
          {bottomLabel}
        </span>
      )}
    </div>
  )
}

const MinimumTick = memo(function(props: ReferenceTickProps) {
  return <ReferenceTick {...props} bottomLabel='0%' />
})

const BenchmarkTick = memo(function(props: ReferenceTickProps) {
  return <ReferenceTick {...props} />
})

const MaximumTick = memo(function(props: ReferenceTickProps) {
  return <ReferenceTick {...props} bottomLabel='200%' />
})

const GradeTicks = memo(function({ minimum, benchmark, maximum, transition }: {
  minimum: number,
  benchmark: number,
  maximum: number,
  transition: string | undefined,
}) {
  return (
    <>
      {sortedGrades.map(([grade, gradeScore]) => {
        const scaledValue = calculateScaledPosition(gradeScore, minimum, benchmark, maximum)
        const base = liftedGrades[grade] ? LIFT : 0
        return (
          <div
            key={grade}
            className={styles.tick}
            style={{ left: scaledValue, transition }}
          >
            <div className={styles.tickLine} style={{ top: MARGIN_TOP, height: BAR_HEIGHT }} />
            <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + base + LOW, fontSize: 12 }}>{grade}</span>
            <span className={styles.bottomLabel} style={{ top: BOTTOM_Y + base + HIGH, fontSize: 11 }}>{gradeScore}%</span>
          </div>
        )
      })}
    </>
  )
})
