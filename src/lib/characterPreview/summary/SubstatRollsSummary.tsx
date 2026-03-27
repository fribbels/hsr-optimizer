import styles from 'lib/characterPreview/summary/SubstatRollsSummary.module.css'
import type { SubStats } from 'lib/constants/constants'
import { Stats } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  diminishingReturnsFormula,
  spdDiminishingReturnsFormula,
} from 'lib/scoring/simScoringUtils'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import { VerticalDivider } from 'lib/ui/Dividers'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import { precisionRound } from 'lib/utils/mathUtils'

type SubstatRollsSummaryProps = {
  simRequest: SimulationRequest,
  precision: number,
  diminish: boolean,
  columns?: 1 | 2,
}

export function SubstatRollsSummary({ simRequest, precision, diminish, columns = 2 }: SubstatRollsSummaryProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  const stats = simRequest.stats
  const diminishingReturns: Record<string, number> = {}
  if (diminish) {
    for (const [stat, rolls] of Object.entries(simRequest.stats)) {
      const mainsCount = [
        simRequest.simBody,
        simRequest.simFeet,
        simRequest.simPlanarSphere,
        simRequest.simLinkRope,
        Stats.ATK,
        Stats.HP,
      ].filter((x) => x === stat).length
      if (stat === Stats.SPD) {
        diminishingReturns[stat] = rolls - spdDiminishingReturnsFormula(mainsCount, rolls)
      } else {
        diminishingReturns[stat] = rolls - diminishingReturnsFormula(mainsCount, rolls)
      }
    }
  }

  // Helper function to create a ScoringNumberParens component for a given stat
  const renderStatRow = (stat: SubStats, usePrecision: number = precision) => (
    <ScoringNumberParens
      label={t(`common:ShortStats.${stat}`) + ':'}
      number={stats[stat]}
      parens={diminishingReturns[stat]}
      precision={usePrecision}
    />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      {columns === 2
        ? (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={styles.leftColumn}>
              {renderStatRow(Stats.ATK_P)}
              {renderStatRow(Stats.ATK)}
              {renderStatRow(Stats.HP_P)}
              {renderStatRow(Stats.HP)}
              {renderStatRow(Stats.DEF_P)}
              {renderStatRow(Stats.DEF)}
            </div>
            <VerticalDivider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={styles.rightColumn}>
              {renderStatRow(Stats.SPD, 2)}
              {renderStatRow(Stats.CR)}
              {renderStatRow(Stats.CD)}
              {renderStatRow(Stats.EHR)}
              {renderStatRow(Stats.RES)}
              {renderStatRow(Stats.BE)}
            </div>
          </div>
        )
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={styles.singleColumn}>
            {renderStatRow(Stats.ATK_P)}
            {renderStatRow(Stats.ATK)}
            {renderStatRow(Stats.HP_P)}
            {renderStatRow(Stats.HP)}
            {renderStatRow(Stats.DEF_P)}
            {renderStatRow(Stats.DEF)}
            {renderStatRow(Stats.SPD, 2)}
            {renderStatRow(Stats.CR)}
            {renderStatRow(Stats.CD)}
            {renderStatRow(Stats.EHR)}
            {renderStatRow(Stats.RES)}
            {renderStatRow(Stats.BE)}
          </div>
        )}
    </div>
  )
}

function ScoringNumberParens({ label, number, parens: parensValue, precision = 1 }: {
  label: string
  number?: number
  parens?: number
  precision?: number
}) {
  const value = precisionRound(number ?? 0)
  const parens = precisionRound(parensValue ?? 0)
  const show = value !== 0
  const showParens = parens > 0

  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'space-between' }}>
      <pre className={styles.pre}>{label}</pre>
      <pre className={styles.preRight}>
        {show && numberToLocaleString(value, precision)}
        {showParens && <span className={styles.parensSpacer}>-</span>}
        {showParens && numberToLocaleString(parens, 1)}
      </pre>
    </div>
  )
}
