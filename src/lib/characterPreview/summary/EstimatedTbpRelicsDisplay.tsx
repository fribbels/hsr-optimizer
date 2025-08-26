import {
  Flex,
  Spin,
} from 'antd'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import {
  EnrichedRelics,
  enrichRelicAnalysis,
  flatReduction,
  hashEstTbpRun,
  RelicAnalysis,
} from 'lib/characterPreview/summary/statScoringSummaryController'
import { iconSize } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
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

const cachedRelics: Record<string, EnrichedRelics> = {}
const IN_PROGRESS = {} as EnrichedRelics
let cachedId = ''

export const EstimatedTbpRelicsDisplay = (props: {
  scoringType: ScoringType,
  displayRelics: SingleRelicByPart,
  showcaseMetadata: ShowcaseMetadata,
}) => {
  const [enrichedRelics, setEnrichedRelics] = useState<EnrichedRelics | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    scoringType,
    displayRelics,
    showcaseMetadata,
  } = props

  useEffect(() => {
    const characterId = showcaseMetadata.characterId
    const scoringMetadata = DB.getScoringMetadata(characterId)

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
  }, [displayRelics, showcaseMetadata])

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns
    gridTemplateRows: 'repeat(3, auto)', // 3 rows
    gap: '10px',
    width: '100%',
  }

  const ready = !(loading || !enrichedRelics)

  return (
    <Flex vertical align='center' style={{ width: '100%' }}>
      <Flex vertical gap={35} style={gridStyle}>
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
    <Flex justify='center' align='center' style={{ height: '100px' }}>
      <Spin size='large' />
    </Flex>
  )
}

function RelicContainer(props: { ready: boolean, relicAnalysis?: RelicAnalysis }) {
  const { ready, relicAnalysis } = props

  const cardStyle = {
    width: '100%',
    flex: 1,
    borderRadius: 5,
    overflow: 'hidden',
    padding: 10,
    background: 'rgb(29 42 81 / 73%)',
    boxShadow: cardShadowNonInset,
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    WebkitBackdropFilter: 'blur(5px)',
    minHeight: 302,
  }

  if (!ready) {
    return (
      <div style={cardStyle}>
        <Flex style={{ width: '100%', height: '100%' }} align='center' justify='space-around'>
          <LoadingSpinner />
        </Flex>
      </div>
    )
  }

  if (!relicAnalysis) {
    return <div style={cardStyle} />
  }

  return (
    <Flex
      style={cardStyle}
      gap={10}
    >
      <RelicPreview relic={relicAnalysis.relic} unhoverable={true} score={relicAnalysis.scoringResult} />
      <RelicAnalysisCard relicAnalysis={relicAnalysis} />
    </Flex>
  )
}

const cardStyle = {
  flex: 1,
  borderRadius: 6,
  overflow: 'hidden',
  padding: 10,
  background: '#243356',
  border: '1px solid #354b7d',
}
const textStyle = {
  fontSize: 14,
  color: 'rgb(159, 175, 207)',
}

function RelicAnalysisCard(props: { relicAnalysis?: RelicAnalysis }) {
  const { relicAnalysis } = props

  if (!relicAnalysis) {
    return <div style={cardStyle} />
  }

  return (
    <Flex vertical style={{ width: '100%' }} gap={10}>
      <Flex style={{ height: 111 }} gap={10}>
        <MetricCard relicAnalysis={relicAnalysis} index={0} />
        <MetricCard relicAnalysis={relicAnalysis} index={1} />
      </Flex>
      <Flex style={{ ...cardStyle, padding: '12px 14px 0px 14px', paddingLeft: 15 }} gap={10}>
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
    <Flex vertical justify='space-between' style={{ width: '100%' }}>
      <Flex vertical>
        <RollLine index={0} relicAnalysis={relicAnalysis} />
        <RollLine index={1} relicAnalysis={relicAnalysis} />
        <RollLine index={2} relicAnalysis={relicAnalysis} />
        <RollLine index={3} relicAnalysis={relicAnalysis} />
      </Flex>
      <Flex vertical style={{ height: 46, paddingBottom: 10 }} justify='space-between' gap={4}>
        <HorizontalDivider style={{ margin: 0, paddingBottom: 2 }} />
        <Flex justify='space-between'>
          <span style={textStyle}>{t('Perfection') /* Perfection */}</span>
          <span>{percentDisplay}%</span>
        </Flex>
        <div
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#304878',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              background: `linear-gradient(
              to right,
              ${lowRollColor} 0%,
              ${midRollColor} 40%,
              ${highRollColor} 80%
            )`,
              backgroundSize: `${100 / (percent || 1) * 100}% 100%`,
              borderRadius: '4px 0 0 4px',
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
    : localeNumber_0(relicAnalysis.rerollDelta) + '%'

  return (
    <Flex
      style={{
        ...cardStyle,
        padding: '6px 10px',
        backgroundColor: '#334f87',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgb(73 98 153)',
      }}
      vertical
      flex={1}
      justify='space-between'
    >
      <Flex vertical gap={2}>
        <span style={{ fontSize: '13px', color: '#9FAFCF' }}>
          {textTop}
        </span>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#E0E6F2' }}>
          {valueTop}
        </span>
      </Flex>
      <Flex vertical gap={2}>
        <span style={{ fontSize: '13px', color: '#9FAFCF' }}>
          {textBottom}
        </span>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#E0E6F2' }}>
          {valueBottom}
        </span>
      </Flex>
    </Flex>
  )
}

const rollStyle = {
  width: '16px',
  height: '16px',
  marginRight: '5px',
  borderRadius: '2px',
  marginBottom: 3,
}

const highRollColor = '#0e7eff'
const midRollColor = '#63a9ff'
const lowRollColor = '#a5bcd9'

function HighRoll() {
  return (
    <div
      style={{ ...rollStyle, backgroundColor: highRollColor }}
    />
  )
}

function MidRoll() {
  return (
    <div
      style={{ ...rollStyle, backgroundColor: midRollColor }}
    />
  )
}

function LowRoll() {
  return (
    <div
      style={{ ...rollStyle, backgroundColor: lowRollColor }}
    />
  )
}

function RollLine(props: { index: number, relicAnalysis: RelicAnalysis }) {
  const { index, relicAnalysis } = props
  const substat = relicAnalysis.relic.substats[index]
  if (substat == null) {
    return <div style={{ height: 22, width: '100%' }} />
  }

  const weight = relicAnalysis.weights[substat.stat] ?? 0
  const weightDisplay = localeNumber_00(relicAnalysis.weights[substat.stat] * flatReduction(substat.stat))
  const rolls = substat.rolls!
  const display: ReactElement[] = []

  let key = 0
  for (let i = 0; i < rolls.high; i++) display.push(<HighRoll key={key++} />)
  for (let i = 0; i < rolls.mid; i++) display.push(<MidRoll key={key++} />)
  for (let i = 0; i < rolls.low; i++) display.push(<LowRoll key={key++} />)

  return (
    <Flex style={{ height: 22, width: '100%', opacity: (weight ? 1 : 0.05) }} justify='space-between'>
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
