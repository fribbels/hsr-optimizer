import type {
  PreviewRelics,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import {
  countRelicRolls,
  flatReduction,
} from 'lib/characterPreview/summary/statScoringSummaryController'
import { type SubStats } from 'lib/constants/constants'
import { relicCardH } from 'lib/constants/constantsUi'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import {
  type PotentialResult,
  ScoringCache,
} from 'lib/relics/scoring/relicScorer'
import { Assets } from 'lib/rendering/assets'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { DeferCreate } from 'lib/ui/DeferredRender'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
import {
  localeNumber_0,
  localeNumber_00,
  localeNumberComma,
} from 'lib/utils/i18nUtils'
import type { EstTbpWorkerOutput } from 'lib/worker/estTbpWorkerRunner'
import { handleWork } from 'lib/worker/estTbpWorkerRunner'
import {
  memo,
  useCallback,
} from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import { type CharacterId } from 'types/character'
import { type Nullable } from 'types/common'
import type { ReactElement } from 'types/components'
import { type ScoringMetadata } from 'types/metadata'
import type {
  Relic,
  RelicSubstatMetadata,
} from 'types/relic'
import styles from './EstimatedTbpRelicsDisplay.module.css'

export const EstimatedTbpRelicsDisplay = memo(function EstimatedTbpRelicsDisplay({
  displayRelics,
  showcaseMetadata,
}: {
  displayRelics: PreviewRelics,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const scoringMetadata = useScoringMetadata(showcaseMetadata.characterId)

  const scorer = new ScoringCache()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className={styles.fullWidth}>
      <div className={styles.grid}>
        <DeferCreate>
          <RelicContainer
            scorer={scorer}
            weights={scoringMetadata.stats}
            characterId={showcaseMetadata.characterId}
            relic={displayRelics.Head}
          />
          <RelicContainer
            scorer={scorer}
            weights={scoringMetadata.stats}
            characterId={showcaseMetadata.characterId}
            relic={displayRelics.Hands}
          />
        </DeferCreate>
        <DeferCreate>
          <RelicContainer
            scorer={scorer}
            weights={scoringMetadata.stats}
            characterId={showcaseMetadata.characterId}
            relic={displayRelics.Body}
          />
          <RelicContainer
            scorer={scorer}
            weights={scoringMetadata.stats}
            characterId={showcaseMetadata.characterId}
            relic={displayRelics.Feet}
          />
        </DeferCreate>
        <DeferCreate>
          <RelicContainer
            scorer={scorer}
            weights={scoringMetadata.stats}
            characterId={showcaseMetadata.characterId}
            relic={displayRelics.PlanarSphere}
          />
          <RelicContainer
            scorer={scorer}
            weights={scoringMetadata.stats}
            characterId={showcaseMetadata.characterId}
            relic={displayRelics.LinkRope}
          />
        </DeferCreate>
      </div>
    </div>
  )
})

export const RelicContainer = memo(function RelicContainer({ relic, weights, characterId, scorer, withoutPreview }: {
  relic: Relic | null,
  weights: Record<SubStats, number> | null,
  characterId: CharacterId | null,
  scorer?: ScoringCache,
  withoutPreview?: boolean,
}) {
  if (relic === null) return <div style={{ minHeight: relicCardH }} className={styles.card} />
  scorer ??= new ScoringCache()
  const score = characterId ? scorer.getCurrentRelicScore(relic, characterId) : undefined
  const potential = characterId ? scorer.scoreRelicPotential(relic, characterId) : null

  if (withoutPreview) {
    return (
      <div style={{ width: 320, minHeight: relicCardH }}>
        <RelicAnalysisCard relic={relic} weights={weights} potential={potential} />
      </div>
    )
  }

  return (
    <div
      className={styles.card}
      style={{ minHeight: 302, display: 'flex', gap: 10 }}
    >
      <RelicPreview relic={relic} unhoverable={true} score={score} />
      <RelicAnalysisCard relic={relic} weights={weights} potential={potential} />
    </div>
  )
})

function RelicAnalysisCard({ relic, weights, potential }: {
  relic: Relic,
  weights: Record<SubStats, number> | null,
  potential: PotentialResult | null,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: relicCardH }} className={styles.fullWidth}>
      <DeferCreate>
        <div style={{ display: 'flex', gap: 10 }} className={styles.metricRow}>
          <EstbpMetricCard relic={relic} weights={weights} />
          <ScoringMetricCard potential={potential} relic={relic} weights={weights} />
        </div>
      </DeferCreate>
      <DeferCreate>
        <div className={styles.rollsCard}>
          <RollsCard potential={potential} relic={relic} weights={weights} />
        </div>
      </DeferCreate>
    </div>
  )
}

function RollsCard({ relic, potential, weights }: {
  relic: Relic,
  potential: PotentialResult | null,
  weights: Record<SubStats, number> | null,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.RollsCard' })

  const percent = potential?.currentPct ?? 0
  const percentDisplay = potential !== null ? localeNumber_0(percent) : '-'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className={styles.fullWidth}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {relic.substats.concat(relic.previewSubstats).map((s, idx) => <RollLine key={idx} substat={s} weights={weights} />)}
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

const ScoringMetricCard = memo(function ScoringMetric({ potential, relic, weights }: {
  potential: PotentialResult | null,
  relic: Relic,
  weights: ScoringMetadata['stats'] | null,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.MetricsCard' })
  const rolls = weights ? countRelicRolls(relic, weights) : null
  return (
    <div
      className={styles.metricCard}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className={styles.metricLabel}>
          {t('Rolls')}
        </span>
        <span className={styles.metricValue}>
          {rolls === null ? '-' : localeNumber_0(rolls)}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className={styles.metricLabel}>
          {t('Potential')}
        </span>
        <span className={styles.metricValue}>
          {potential !== null ? localeNumber_0(potential.rerollAvgPct === 0 ? 0 : potential.rerollAvgPct - potential.currentPct) + '%' : '-'}
        </span>
      </div>
    </div>
  )
})

const EstbpMetricCard = memo(function EstbpMetricCard({ relic, weights }: {
  relic: Relic,
  weights: ScoringMetadata['stats'] | null,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.MetricsCard' })
  const estbpPromise = weights === null ? null : handleWork(relic, weights)
  const daysSelector = useCallback((output: EstTbpWorkerOutput) => {
    return localeNumberComma(Math.ceil(output.days))
    // localeNumberComma has an implicit dependancy on selected language
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [t])
  const estbpSelector = useCallback((output: EstTbpWorkerOutput) => {
    return localeNumberComma(Math.ceil(output.days * 240 / 40) * 40)
    // localeNumberComma has an implicit dependancy on selected language
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [t])
  return (
    <div
      className={styles.metricCard}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className={styles.metricLabel}>
          {t('Days')}
        </span>
        {estbpPromise !== null
          ? (
            <SuspenseNode
              width={'60%'}
              height={27.9}
              textSpanClassName={styles.metricValue}
              promise={estbpPromise}
              selector={daysSelector}
            />
          )
          : '-'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className={styles.metricLabel}>
          {t('TBP')}
        </span>
        {estbpPromise !== null
          ? (
            <SuspenseNode
              width={'60%'}
              height={27.9}
              textSpanClassName={styles.metricValue}
              promise={estbpPromise}
              selector={estbpSelector}
            />
          )
          : '-'}
      </div>
    </div>
  )
})

const highRollColor = '#0e7eff'
const midRollColor = '#63a9ff'
const lowRollColor = '#a5bcd9'

function HighRoll() {
  return <div className={styles.rollHigh} />
}

function MidRoll() {
  return <div className={styles.rollMid} />
}

function LowRoll() {
  return <div className={styles.rollLow} />
}

function RollLine({ substat, weights }: { substat: RelicSubstatMetadata | null, weights: ScoringMetadata['stats'] | null }) {
  if (substat == null) {
    return <div className={styles.rollLinePlaceholder} />
  }

  const weight = weights?.[substat.stat] ?? 0
  const weightDisplay = `⨯ ${localeNumber_00(weight * flatReduction(substat.stat))}`
  const rolls = substat.rolls ?? { high: 0, mid: 0, low: 0 }
  const display: ReactElement[] = []

  let key = 0
  for (let i = 0; i < rolls.high; i++) display.push(<HighRoll key={key++} />)
  for (let i = 0; i < rolls.mid; i++) display.push(<MidRoll key={key++} />)
  for (let i = 0; i < rolls.low; i++) display.push(<LowRoll key={key++} />)

  return (
    <div className={styles.rollLine} style={(weight || weights === null) ? undefined : { opacity: 0.05 }}>
      <div className={styles.rollLineInner}>
        <img
          className={iconClasses.statIconWide}
          src={Assets.getStatIcon(substat.stat)}
        />
        {display}
      </div>
      <div>
        {weights === null ? '-' : weightDisplay}
      </div>
    </div>
  )
}
