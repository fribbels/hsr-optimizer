import { Loader } from '@mantine/core'
import { relicCardH } from 'lib/constants/constantsUi'
import { DeferCreate, useDeferredSlot } from 'lib/ui/DeferredRender'
import type { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import type {
  EnrichedRelics,
  RelicAnalysis,
} from 'lib/characterPreview/summary/statScoringSummaryController'
import {
  enrichRelicAnalysis,
  flatReduction,
  hashEstTbpRun,
} from 'lib/characterPreview/summary/statScoringSummaryController'
import iconClasses from 'style/icons.module.css'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import type { ScoringType } from 'lib/scoring/simScoringUtils'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { HorizontalDivider } from 'lib/ui/Dividers'
import {
  localeNumber_0,
  localeNumber_00,
  localeNumberComma,
} from 'lib/utils/i18nUtils'
import type {
  EstTbpRunnerInput,
  EstTbpRunnerOutput,
} from 'lib/worker/estTbpWorkerRunner'
import { runEstTbpWorker } from 'lib/worker/estTbpWorkerRunner'
import {
  memo,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'types/components'
import type { RelicSubstatMetadata } from 'types/relic'
import styles from './EstimatedTbpRelicsDisplay.module.css'

const cachedRelics: Record<string, EnrichedRelics> = {}
const IN_PROGRESS = {} as EnrichedRelics
let cachedId = ''

export function EstimatedTbpRelicsDisplay({
  scoringType,
  displayRelics,
  showcaseMetadata,
}: {
  scoringType: ScoringType
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
}) {
  const [enrichedRelics, setEnrichedRelics] = useState<EnrichedRelics | null>(null)
  const [loading, setLoading] = useState(false)
  const scoringMetadata = useScoringMetadata(showcaseMetadata.characterId)

  useEffect(() => {
    const characterId = showcaseMetadata.characterId

    const input: EstTbpRunnerInput = {
      displayRelics,
      weights: scoringMetadata.stats,
    }

    cachedId = characterId
    const cacheKey = hashEstTbpRun(displayRelics, characterId, scoringType, scoringMetadata)
    const cached = cachedRelics[cacheKey]
    if (cached) {
      // Deduplicate any requests against the static IN_PROGRESS object
      if (cached !== IN_PROGRESS) {
        setEnrichedRelics(cached)
      }
      return
    }

    setLoading(true)

    cachedRelics[cacheKey] = IN_PROGRESS
    void runEstTbpWorker(input, (output: EstTbpRunnerOutput) => {
      const enrichedRelics = enrichRelicAnalysis(displayRelics, output, scoringMetadata, characterId)
      cachedRelics[cacheKey] = enrichedRelics

      if (cachedId !== characterId) return

      setEnrichedRelics(enrichedRelics)
      setLoading(false)
    })
  }, [displayRelics, showcaseMetadata, scoringMetadata, scoringType])

  const ready = !(loading || !enrichedRelics)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className={styles.fullWidth}>
      <div className={styles.grid}>
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Head} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Hands} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Body} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Feet} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.PlanarSphere} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.LinkRope} />
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className={styles.spinnerContainer}>
      <Loader size="lg" />
    </div>
  )
}

export const RelicContainer = memo(function RelicContainer({ ready, relicAnalysis, withoutPreview }: {
  ready: boolean
  relicAnalysis?: RelicAnalysis
  withoutPreview?: boolean
}) {
  const slotVisible = useDeferredSlot()

  if (withoutPreview) {
    if (!ready || !slotVisible) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: 320, minHeight: relicCardH }}>
          <LoadingSpinner />
        </div>
      )
    }

    if (!relicAnalysis) {
      return <div style={{ width: 320, minHeight: relicCardH }} />
    }

    return (
      <div style={{ width: 320 }}>
        <RelicAnalysisCard relicAnalysis={relicAnalysis} />
      </div>
    )
  }

  const dynamicStyle = { minHeight: 302 }

  if (!ready || !slotVisible) {
    return (
      <div className={styles.card} style={dynamicStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} className={styles.fullSize}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!relicAnalysis) {
    return <div className={styles.card} style={dynamicStyle} />
  }

  return (
    <div
      className={styles.card}
      style={{ ...dynamicStyle, display: 'flex', gap: 10 }}
    >
      <RelicPreview relic={relicAnalysis.relic} unhoverable={true} score={relicAnalysis.scoringResult} />
      <RelicAnalysisCard relicAnalysis={relicAnalysis} />
    </div>
  )
})

function RelicAnalysisCard({ relicAnalysis }: { relicAnalysis?: RelicAnalysis }) {
  if (!relicAnalysis) {
    return <div className={styles.innerCard} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: relicCardH }} className={styles.fullWidth}>
      <DeferCreate>
        <div style={{ display: 'flex', gap: 10 }} className={styles.metricRow}>
          <MetricCard relicAnalysis={relicAnalysis} index={0} />
          <MetricCard relicAnalysis={relicAnalysis} index={1} />
        </div>
      </DeferCreate>
      <DeferCreate>
        <div className={styles.rollsCard}>
          <RollsCard relicAnalysis={relicAnalysis} />
        </div>
      </DeferCreate>
    </div>
  )
}

function RollsCard({ relicAnalysis }: { relicAnalysis: RelicAnalysis }) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.RollsCard' })

  const percent = relicAnalysis?.currentPotential ?? 0
  const percentDisplay = localeNumber_0(percent)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className={styles.fullWidth}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {relicAnalysis.relic.substats.concat(relicAnalysis.relic.previewSubstats).map((s, idx) => (
          <RollLine key={idx} substat={s} weights={relicAnalysis.weights} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 4 }} className={styles.perfectionSection}>
        <HorizontalDivider style={{ margin: 0, marginBlock: 0, marginTop: 13, marginBottom: 0, paddingBottom: 2 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className={styles.label}>{t('Perfection') /* Perfection */}</span>
          <span>{percentDisplay}%</span>
        </div>
        <div className={styles.progressBarOuter}>
          <div
            className={styles.progressBarInner}
            style={{
              width: `${percent}%`,
              background: `linear-gradient(
              to right,
              ${lowRollColor} 0%,
              ${midRollColor} 40%,
              ${highRollColor} 80%
            )`,
              backgroundSize: `${100 / (percent || 1) * 100}% 100%`,
            }}
          >
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ relicAnalysis, index }: { relicAnalysis: RelicAnalysis, index: number }) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.MetricsCard' })

  const textTop = index === 0 ? t('Days') : t('Rolls')
  const textBottom = index === 0 ? t('TBP') : t('Potential')

  const valueTop = index === 0
    ? localeNumberComma(Math.ceil(relicAnalysis.estDays))
    : localeNumber_0(relicAnalysis.weightedRolls)
  const valueBottom = index === 0
    ? localeNumberComma(Math.ceil(relicAnalysis.estTbp / 40) * 40)
    : localeNumber_0(relicAnalysis.rerollPotential === 0 ? 0 : relicAnalysis.rerollDelta) + '%'

  return (
    <div
      className={styles.metricCard}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className={styles.metricLabel}>
          {textTop}
        </span>
        <span className={styles.metricValue}>
          {valueTop}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className={styles.metricLabel}>
          {textBottom}
        </span>
        <span className={styles.metricValue}>
          {valueBottom}
        </span>
      </div>
    </div>
  )
}

const highRollColor = '#0e7eff'
const midRollColor = '#63a9ff'
const lowRollColor = '#a5bcd9'

function HighRoll() {
  return (
    <div className={styles.rollHigh} />
  )
}

function MidRoll() {
  return (
    <div className={styles.rollMid} />
  )
}

function LowRoll() {
  return (
    <div className={styles.rollLow} />
  )
}

function RollLine({ substat, weights }: { substat: RelicSubstatMetadata | null, weights: RelicAnalysis['weights'] }) {
  if (substat == null) {
    return <div className={styles.rollLinePlaceholder} />
  }

  const weight = weights[substat.stat] ?? 0
  const weightDisplay = localeNumber_00(weights[substat.stat] * flatReduction(substat.stat))
  const rolls = substat.rolls ?? { high: 0, mid: 0, low: 0 }
  const display: ReactElement[] = []

  let key = 0
  for (let i = 0; i < rolls.high; i++) display.push(<HighRoll key={key++} />)
  for (let i = 0; i < rolls.mid; i++) display.push(<MidRoll key={key++} />)
  for (let i = 0; i < rolls.low; i++) display.push(<LowRoll key={key++} />)

  return (
    <div className={styles.rollLine} style={weight ? undefined : { opacity: 0.05 }}>
      <div className={styles.rollLineInner}>
        <img
          className={iconClasses.statIconWide}
          src={Assets.getStatIcon(substat.stat)}
        />
        {display}
      </div>
      <div>
        ⨯ {weightDisplay}
      </div>
    </div>
  )
}
