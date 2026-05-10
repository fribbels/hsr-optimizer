import { showcaseOutlineLight } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getStatRenderValues,
  StatRow,
  StatRowDivider,
} from 'lib/characterPreview/StatRow'
import { StatText } from 'lib/characterPreview/StatText'
import type { StatsValues } from 'lib/constants/constants'
import { Stats } from 'lib/constants/constants'
import {
  GlobalRegister,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import type { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import { DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import { formatSimScore } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { CharacterPreviewInternalImage } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import { CenteredImage } from 'lib/ui/CenteredImage'
import {
  arrowColor,
  arrowDirection,
} from 'lib/utils/displayUtils'
import {
  precisionRound,
  truncate1000ths,
  truncate10ths,
} from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import classes from './StatsDiffCard.module.css'

const baseCardHeight = 429
const extraRowHeight = 27

const lcCardH = 90
const cardGap = 10
const lcZoom = 1.15
const containerW = 233

export function StatsDiffCard({ analysis }: {
  analysis: OptimizerResultAnalysis,
}) {
  const extraHeight = analysis.extraRows.length * extraRowHeight
  const cardHeight = baseCardHeight + extraHeight

  return (
    <div
      className={classes.outerCard}
      style={{ display: 'flex', height: cardHeight, gap: 10 }}
    >
      <CardImage analysis={analysis} cardHeight={cardHeight} />

      <div className={classes.statsPanel}>
        <StatDiffSummary analysis={analysis} />
      </div>
    </div>
  )
}

function StatDiffSummary({ analysis }: { analysis: OptimizerResultAnalysis }) {
  const oldStats = analysis.oldX.toComputedStatsObject()
  const newStats = analysis.newX.toComputedStatsObject()

  // Elemental DMG = element-specific boost (already mapped) + generic DMG_BOOST
  oldStats[analysis.elementalDmgValue] += analysis.oldX.getSelfValue(StatKey.DMG_BOOST)
  newStats[analysis.elementalDmgValue] += analysis.newX.getSelfValue(StatKey.DMG_BOOST)

  // COMBO_DMG is stored in global registers, inject for display
  const oldCombo = analysis.oldX.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)
  const newCombo = analysis.newX.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)

  return (
    <StatText style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <ComboDiffRow oldValue={oldCombo} newValue={newCombo} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.HP} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.ATK} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.DEF} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.SPD} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.CR} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.CD} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.EHR} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.RES} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.BE} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.OHB} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.ERR} />
        <DiffRow oldStats={oldStats} newStats={newStats} stat={analysis.elementalDmgValue} />
        {analysis.extraRows.map((stat) => <DiffRow key={stat} oldStats={oldStats} newStats={newStats} stat={stat} />)}
      </div>
    </StatText>
  )
}

function ComboDiffRow({ oldValue, newValue }: {
  oldValue: number
  newValue: number
}) {
  const { t } = useTranslation('common')
  const oldDisplay = formatSimScore(oldValue, undefined, 1, false)
  const { valueDisplay: newDisplay } = getStatRenderValues(newValue, newValue, 'COMBO_DMG', false)

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className={classes.oldStatColumn}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}>
          <img src={Assets.getStatIcon('simScore')} className={iconClasses.statIconSpaced} />
          {t('ReadableStats.simScore')}
          <StatRowDivider />
          {oldDisplay}
        </div>
      </div>

      <span className={classes.arrow}>
        ➤
      </span>

      <div className={classes.newValueColumn} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <RenderValue value={newDisplay} stat='COMBO_DMG' />
      </div>

      <DiffRender oldValue={oldValue} newValue={newValue} stat='COMBO_DMG' />
    </div>
  )
}

function DiffRow({ oldStats, newStats, stat }: {
  oldStats: ComputedStatsObjectExternal
  newStats: ComputedStatsObjectExternal
  stat: StatsValues
}) {
  const oldValue = precisionRound(oldStats[stat])
  const newValue = precisionRound(newStats[stat])

  const { valueDisplay } = getStatRenderValues(
    newValue,
    newValue,
    stat,
    false,
  )

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className={classes.oldStatColumn}>
        <StatRow finalStats={oldStats} stat={stat} />
      </div>

      <span className={classes.arrow}>
        ➤
      </span>

      <div className={classes.newValueColumn} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <RenderValue value={valueDisplay} stat={stat} />
      </div>

      <DiffRender oldValue={oldValue} newValue={newValue} stat={stat} />
    </div>
  )
}

function RenderValue({ value, stat, comboDiff }: { value: string | number, stat: StatsValues | 'COMBO_DMG', comboDiff?: boolean }) {
  const { t } = useTranslation('common')
  if (stat === 'COMBO_DMG') {
    return value + (comboDiff ? '%' : t('ThousandsSuffix'))
  } else if (isFlat(stat)) {
    return value
  }
  return value + '%'
}

function DiffRender({ oldValue, newValue, stat }: { oldValue: number, newValue: number, stat: StatsValues | 'COMBO_DMG' }) {
  if (visualDiff(newValue, oldValue, stat) === 0) return null

  const increase = newValue > oldValue
  const diff = increase ? visualDiff(newValue, oldValue, stat) : -visualDiff(newValue, oldValue, stat)
  const icon = arrowDirection(increase)
  const color = arrowColor(increase)
  const { valueDisplay } = getStatDiffRenderValues(diff, diff, stat)

  return (
    <div style={{ display: 'flex', color: color, width: 90, gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
      <RenderValue value={valueDisplay} stat={stat} comboDiff={true} />
      <span className={classes.arrowIcon}>
        {icon}
      </span>
    </div>
  )
}

function getStatDiffRenderValues(statValue: number, customValue: number, stat: StatsValues | 'COMBO_DMG') {
  if (stat === 'COMBO_DMG') {
    const valueDisplay = `${truncate10ths(precisionRound(customValue ?? 0)).toFixed(1)}`
    const value1000thsPrecision = precisionRound(customValue).toFixed(3)
    return {
      valueDisplay,
      value1000thsPrecision,
    }
  }
  return getStatRenderValues(statValue, customValue, stat)
}

function visualDiff(n1: number, n2: number, stat: StatsValues | 'COMBO_DMG') {
  if (stat === Stats.SPD) {
    return precisionRound(truncate10ths(n1) - truncate10ths(n2))
  } else if (isFlat(stat)) {
    return precisionRound(Math.floor(n1) - Math.floor(n2))
  } else if (stat === 'COMBO_DMG') {
    return precisionRound((n1 / n2 - 1) * 100)
  } else {
    return precisionRound(truncate1000ths(n1) - truncate1000ths(n2))
  }
}

function CardImage({ analysis, cardHeight }: { analysis: OptimizerResultAnalysis, cardHeight: number }) {
  const lightCone = analysis.request.lightCone
  const lightConeMetadata = lightCone ? getGameMetadata().lightCones[lightCone] : null
  const lcOffset = lightConeMetadata?.imageOffset ?? DEFAULT_LC_IMAGE_OFFSET

  const charCardH = cardHeight - lcCardH - cardGap

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: cardGap, height: '100%' }}>
      <div className={classes.cardImageContainer} style={{ flex: 1 }}>
        <CharacterPreviewInternalImage id={analysis.request.characterId} disableClick={true} parentH={charCardH} parentW={containerW} />
      </div>
      <div
        style={{
          width: containerW,
          height: lcCardH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 6,
          backgroundColor: 'var(--layer-2)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          border: showcaseOutlineLight,
        }}
      >
        <div style={{ transform: `scale(${lcZoom})`, overflow: 'hidden', filter: 'brightness(0.95) saturate(0.95)' }}>
          <CenteredImage
            src={lightCone ? Assets.getLightConePortraitById(lightCone) : Assets.getBlank()}
            containerW={containerW}
            containerH={lcCardH}
            imageOffset={lcOffset}
          />
        </div>
      </div>
    </div>
  )
}
