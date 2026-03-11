import { Flex, Loader } from '@mantine/core'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import {
  EnrichedRelics,
  enrichRelicAnalysis,
  flatReduction,
  hashEstTbpRun,
  RelicAnalysis,
} from 'lib/characterPreview/summary/statScoringSummaryController'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { HorizontalDivider } from 'lib/ui/Dividers'
import {
  localeNumber_0,
  localeNumber_00,
  localeNumberComma,
} from 'lib/utils/i18nUtils'
import {
  EstTbpRunnerInput,
  EstTbpRunnerOutput,
  runEstTbpWorker,
} from 'lib/worker/estTbpWorkerRunner'
import React, {
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'
import { RelicSubstatMetadata } from 'types/relic'
import styles from './EstimatedTbpRelicsDisplay.module.css'

const cachedRelics: Record<string, EnrichedRelics> = {}
const IN_PROGRESS = {} as EnrichedRelics
let cachedId = ''

export const EstimatedTbpRelicsDisplay = (props: {
  scoringType: ScoringType,
  displayRelics: SingleRelicByPart,
  showcaseMetadata: ShowcaseMetadata,
}) => {
  const {
    scoringType,
    displayRelics,
    showcaseMetadata,
  } = props
  const [enrichedRelics, setEnrichedRelics] = useState<EnrichedRelics | null>(null)
  const [loading, setLoading] = useState(false)
  const scoringMetadata = useScoringMetadata(showcaseMetadata.characterId)

  useEffect(() => {
    const characterId = showcaseMetadata.characterId

    const input: EstTbpRunnerInput = {
      displayRelics: displayRelics,
      weights: scoringMetadata.stats,
    }

    cachedId = characterId
    const cacheKey = hashEstTbpRun(displayRelics, characterId, scoringType, scoringMetadata)
    const cached = cachedRelics[cacheKey]
    if (cached) {
      // Deduplicate any requests against the static IN_PROGRESS object
      if (cached != IN_PROGRESS) {
        setEnrichedRelics(cached)
      }
      return
    }

    setLoading(true)

    cachedRelics[cacheKey] = IN_PROGRESS
    void runEstTbpWorker(input, (output: EstTbpRunnerOutput) => {
      const enrichedRelics = enrichRelicAnalysis(displayRelics, output, scoringMetadata, characterId)
      cachedRelics[cacheKey] = enrichedRelics

      if (cachedId != characterId) return

      setEnrichedRelics(enrichedRelics)
      setLoading(false)
    })
  }, [displayRelics, showcaseMetadata, scoringMetadata])

  const ready = !(loading || !enrichedRelics)

  return (
    <Flex direction="column" align='center' className={styles.fullWidth}>
      <Flex direction="column" gap={35} className={styles.grid}>
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Head} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Hands} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Body} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.Feet} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.PlanarSphere} />
        <RelicContainer ready={ready} relicAnalysis={enrichedRelics?.LinkRope} />
      </Flex>
    </Flex>
  )
}

function LoadingSpinner() {
  return (
    <Flex justify='center' align='center' className={styles.spinnerContainer}>
      <Loader size="lg" />
    </Flex>
  )
}

export function RelicContainer(props: { ready: boolean, relicAnalysis?: RelicAnalysis, withoutPreview?: boolean }) {
  const { ready, relicAnalysis, withoutPreview } = props

  const dynamicStyle = withoutPreview ? undefined : { minHeight: 302 }

  if (!ready) {
    return (
      <div className={styles.card} style={dynamicStyle}>
        <Flex className={styles.fullSize} align='center' justify='space-around'>
          <LoadingSpinner />
        </Flex>
      </div>
    )
  }

  if (!relicAnalysis) {
    return <div className={styles.card} style={dynamicStyle} />
  }

  if (withoutPreview) return <RelicAnalysisCard relicAnalysis={relicAnalysis} />

  return (
    <Flex
      className={styles.card}
      style={dynamicStyle}
      gap={10}
    >
      <RelicPreview relic={relicAnalysis.relic} unhoverable={true} score={relicAnalysis.scoringResult} />
      <RelicAnalysisCard relicAnalysis={relicAnalysis} />
    </Flex>
  )
}

function RelicAnalysisCard(props: { relicAnalysis?: RelicAnalysis }) {
  const { relicAnalysis } = props

  if (!relicAnalysis) {
    return <div className={styles.innerCard} />
  }

  return (
    <Flex direction="column" className={styles.fullWidth} gap={10}>
      <Flex className={styles.metricRow} gap={10}>
        <MetricCard relicAnalysis={relicAnalysis} index={0} />
        <MetricCard relicAnalysis={relicAnalysis} index={1} />
      </Flex>
      <Flex className={styles.rollsCard} gap={10}>
        <RollsCard relicAnalysis={relicAnalysis} />
      </Flex>
    </Flex>
  )
}

function RollsCard(props: { relicAnalysis: RelicAnalysis }) {
  const { relicAnalysis } = props

  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.RollsCard' })

  const percent = relicAnalysis?.currentPotential ?? 0
  const percentDisplay = localeNumber_0(percent)

  return (
    <Flex direction="column" justify='space-between' className={styles.fullWidth}>
      <Flex direction="column">
        {relicAnalysis.relic.substats.concat(relicAnalysis.relic.previewSubstats).map((s, idx) => (
          <RollLine key={idx} substat={s} weights={relicAnalysis.weights} />
        ))}
      </Flex>
      <Flex direction="column" className={styles.perfectionSection} justify='space-between' gap={4}>
        <HorizontalDivider style={{ margin: 0, paddingBottom: 2 }} />
        <Flex justify='space-between'>
          <span className={styles.label}>{t('Perfection') /* Perfection */}</span>
          <span>{percentDisplay}%</span>
        </Flex>
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
      </Flex>
    </Flex>
  )
}

function MetricCard(props: { relicAnalysis: RelicAnalysis, index: number }) {
  const { relicAnalysis, index } = props

  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP.MetricsCard' })

  const textTop = index == 0 ? t('Days') : t('Rolls')
  const textBottom = index == 0 ? t('TBP') : t('Potential')

  const valueTop = index == 0
    ? localeNumberComma(Math.ceil(relicAnalysis.estDays))
    : localeNumber_0(relicAnalysis.weightedRolls)
  const valueBottom = index == 0
    ? localeNumberComma(Math.ceil(relicAnalysis.estTbp / 40) * 40)
    : localeNumber_0(relicAnalysis.rerollPotential == 0 ? 0 : relicAnalysis.rerollDelta) + '%'

  return (
    <Flex
      className={styles.metricCard}
      direction="column"
      flex={1}
      justify='space-between'
    >
      <Flex direction="column" gap={2}>
        <span className={styles.metricLabel}>
          {textTop}
        </span>
        <span className={styles.metricValue}>
          {valueTop}
        </span>
      </Flex>
      <Flex direction="column" gap={2}>
        <span className={styles.metricLabel}>
          {textBottom}
        </span>
        <span className={styles.metricValue}>
          {valueBottom}
        </span>
      </Flex>
    </Flex>
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

function RollLine(props: { substat: RelicSubstatMetadata | null, weights: RelicAnalysis['weights'] }) {
  const { substat, weights } = props
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
    <Flex className={styles.rollLine} style={{ opacity: (weight ? 1 : 0.05) }} justify='space-between'>
      <Flex align='flex-end'>
        <img
          style={{ width: iconSize, height: iconSize, marginRight: 5, marginLeft: -3 }}
          src={Assets.getStatIcon(substat.stat)}
        />
        {display}
      </Flex>
      <div>
        ⨯ {weightDisplay}
      </div>
    </Flex>
  )
}
