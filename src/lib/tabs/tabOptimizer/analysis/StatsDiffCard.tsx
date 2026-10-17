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
  type AKeyValue,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import type { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { Assets } from 'lib/rendering/assets'
import { DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import {
  resolveComboLabel,
  SCORING_CONFIG_REGISTRY,
} from 'lib/scoring/scoringConfig'
import { formatSimScore } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import classes from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard.module.css'
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
import { ScoringConfigType } from 'types/metadata'

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
  oldStats[analysis.elementalDmgValue] += analysis.oldX.getSelfValue(StatKey.BOOST)
  newStats[analysis.elementalDmgValue] += analysis.newX.getSelfValue(StatKey.BOOST)

  const comboConfigType = getComboConfigType(analysis)
  const comboConfig = SCORING_CONFIG_REGISTRY[comboConfigType]
  const oldCombo = analysis.oldX.getGlobalRegisterValue(comboConfig.comboRegister)
  const newCombo = analysis.newX.getGlobalRegisterValue(comboConfig.comboRegister)
  const buffStat = comboConfigType === ScoringConfigType.BUFFER
    ? analysis.context.rotationActions.find((action) => action.buffStat != null)?.buffStat
      ?? analysis.context.defaultActions.find((action) => action.buffStat != null)?.buffStat
    : undefined

  return (
    <StatText style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <ComboDiffRow
          oldValue={oldCombo}
          newValue={newCombo}
          configType={comboConfigType}
          buffStat={buffStat}
        />
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

function getComboConfigType(analysis: OptimizerResultAnalysis): ScoringConfigType {
  switch (analysis.request.resultSort) {
    case SortOption.COMBO_BUFF.key:
      return ScoringConfigType.BUFFER
    case SortOption.COMBO_HEAL.key:
      return ScoringConfigType.HEAL
    case SortOption.COMBO_SHIELD.key:
      return ScoringConfigType.SHIELD
  }

  const activeConfig = [
    ScoringConfigType.DPS,
    ScoringConfigType.BUFFER,
    ScoringConfigType.HEAL,
    ScoringConfigType.SHIELD,
  ].find((configType) => {
    const register = SCORING_CONFIG_REGISTRY[configType].comboRegister
    return analysis.oldX.getGlobalRegisterValue(register) !== 0
      || analysis.newX.getGlobalRegisterValue(register) !== 0
  })

  return activeConfig ?? ScoringConfigType.DPS
}

function ComboDiffRow({ oldValue, newValue, configType, buffStat }: {
  oldValue: number,
  newValue: number,
  configType: ScoringConfigType,
  buffStat?: AKeyValue,
}) {
  useTranslation()
  const config = SCORING_CONFIG_REGISTRY[configType]
  const label = resolveComboLabel(config, buffStat)
  const oldDisplay = formatSimScore(oldValue, buffStat, 1, config.thousands)
  const newDisplay = formatSimScore(newValue, buffStat, 1, config.thousands)

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className={classes.oldStatColumn}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}>
          <img src={Assets.getStatIcon('simScore')} className={iconClasses.statIconSpaced} />
          {label}
          <StatRowDivider />
          {oldDisplay}
        </div>
      </div>

      <span className={classes.arrow}>
        ➤
      </span>

      <div className={classes.newValueColumn} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {newDisplay}
      </div>

      <ComboDiffRender
        oldValue={oldValue}
        newValue={newValue}
        configType={configType}
        buffStat={buffStat}
      />
    </div>
  )
}

function DiffRow({ oldStats, newStats, stat }: {
  oldStats: ComputedStatsObjectExternal,
  newStats: ComputedStatsObjectExternal,
  stat: StatsValues,
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

function RenderValue({ value, stat }: { value: string | number, stat: StatsValues }) {
  if (isFlat(stat)) {
    return value
  }
  return value + '%'
}

function ComboDiffRender({ oldValue, newValue, configType, buffStat }: {
  oldValue: number,
  newValue: number,
  configType: ScoringConfigType,
  buffStat?: AKeyValue,
}) {
  if (oldValue === newValue) return null

  const config = SCORING_CONFIG_REGISTRY[configType]
  const increase = newValue > oldValue
  const absoluteDiff = Math.abs(newValue - oldValue)
  const valueDisplay = configType === ScoringConfigType.DPS
    ? oldValue === 0 ? null : `${precisionRound(Math.abs(newValue / oldValue - 1) * 100, 1)}%`
    : formatSimScore(absoluteDiff, buffStat, 1, config.thousands)

  if (valueDisplay == null) return null

  return (
    <div style={{ display: 'flex', color: arrowColor(increase), width: 90, gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
      {valueDisplay}
      <span className={classes.arrowIcon}>
        {arrowDirection(increase)}
      </span>
    </div>
  )
}

function DiffRender({ oldValue, newValue, stat }: { oldValue: number, newValue: number, stat: StatsValues }) {
  if (visualDiff(newValue, oldValue, stat) === 0) return null

  const increase = newValue > oldValue
  const diff = increase ? visualDiff(newValue, oldValue, stat) : -visualDiff(newValue, oldValue, stat)
  const icon = arrowDirection(increase)
  const color = arrowColor(increase)
  const { valueDisplay } = getStatRenderValues(diff, diff, stat)

  return (
    <div style={{ display: 'flex', color: color, width: 90, gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
      <RenderValue value={valueDisplay} stat={stat} />
      <span className={classes.arrowIcon}>
        {icon}
      </span>
    </div>
  )
}

function visualDiff(n1: number, n2: number, stat: StatsValues) {
  if (stat === Stats.SPD) {
    return precisionRound(truncate10ths(n1) - truncate10ths(n2))
  } else if (isFlat(stat)) {
    return precisionRound(Math.floor(n1) - Math.floor(n2))
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
