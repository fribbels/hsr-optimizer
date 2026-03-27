import {
  getStatRenderValues,
  StatRow,
} from 'lib/characterPreview/StatRow'
import { StatText } from 'lib/characterPreview/StatText'
import { Stats } from 'lib/constants/constants'
import type { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import { GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { CharacterPreviewInternalImage } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import { useTranslation } from 'react-i18next'
import classes from './StatsDiffCard.module.css'
import { arrowColor, arrowDirection } from 'lib/utils/displayUtils'
import { isFlat } from 'lib/utils/statUtils'
import { precisionRound, truncate10ths, truncate1000ths } from 'lib/utils/mathUtils'

const baseCardHeight = 429
const basePortraitHeight = 400
const extraRowHeight = 27

export function StatsDiffCard({ analysis }: {
  analysis: OptimizerResultAnalysis,
}) {
  const extraHeight = analysis.extraRows.length * extraRowHeight
  const cardHeight = baseCardHeight + extraHeight
  const portraitHeight = basePortraitHeight + extraHeight

  return (
    <div
      className={classes.outerCard}
      style={{ display: 'flex', height: cardHeight, gap: 10 }}
    >
      <CardImage analysis={analysis} portraitHeight={portraitHeight} />

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
  ;(oldStats as Record<string, number>).COMBO_DMG = oldCombo
  ;(newStats as Record<string, number>).COMBO_DMG = newCombo
  // @ts-expect-error simScore used for compatibility with StatRow
  oldStats.simScore = oldCombo
  // @ts-expect-error simScore used for compatibility with StatRow
  newStats.simScore = newCombo

  return (
    <StatText style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <DiffRow oldStats={oldStats} newStats={newStats} stat='COMBO_DMG' />
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
        {analysis.extraRows.map((stat) => (
          <DiffRow key={stat} oldStats={oldStats} newStats={newStats} stat={stat} />
        ))}
      </div>
    </StatText>
  )
}

function DiffRow({ oldStats, newStats, stat }: {
  oldStats: ComputedStatsObjectExternal,
  newStats: ComputedStatsObjectExternal,
  stat: keyof ComputedStatsObjectExternal | 'COMBO_DMG',
}) {
  const oldValue = precisionRound((oldStats as Record<string, number>)[stat])
  const newValue = precisionRound((newStats as Record<string, number>)[stat])

  const { valueDisplay } = getStatRenderValues(
    newValue,
    newValue,
    stat,
    false,
  )

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className={classes.oldStatColumn}>
        <StatRow finalStats={oldStats} stat={stat === 'COMBO_DMG' ? 'simScore' : stat} value={stat === 'COMBO_DMG' ? oldValue : undefined} />
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

function RenderValue({ value, stat, comboDiff }: { value: string | number, stat: string, comboDiff?: boolean }) {
  const { t } = useTranslation('common')
  if (stat === 'COMBO_DMG') {
    return value + (comboDiff ? '%' : t('ThousandsSuffix'))
  } else if (isFlat(stat)) {
    return value
  }
  return value + '%'
}

function DiffRender({ oldValue, newValue, stat }: { oldValue: number, newValue: number, stat: string }) {
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

function getStatDiffRenderValues(statValue: number, customValue: number, stat: string) {
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

function visualDiff(n1: number, n2: number, stat: string) {
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

function CardImage({ analysis, portraitHeight }: { analysis: OptimizerResultAnalysis, portraitHeight: number }) {
  return (
    <div className={classes.cardImageContainer}>
      <CharacterPreviewInternalImage id={analysis.request.characterId} disableClick={true} parentH={portraitHeight} />
    </div>
  )
}
