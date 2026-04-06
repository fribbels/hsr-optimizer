import styles from 'lib/characterPreview/summary/SubstatRollsSummary.module.css'
import type { SubStats } from 'lib/constants/constants'
import { Stats } from 'lib/constants/constants'
import {
  diminishingReturnsFormula,
  spdDiminishingReturnsFormula,
} from 'lib/scoring/simScoringUtils'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import { precisionRound } from 'lib/utils/mathUtils'

type SubstatRollsSummaryProps = {
  simRequest: SimulationRequest
  precision: number
  diminish: boolean
  columns?: 1 | 2
}

const pairedStats: [SubStats, number | undefined, SubStats, number | undefined][] = [
  [Stats.ATK_P, undefined, Stats.SPD, 2],
  [Stats.ATK, undefined, Stats.CR, undefined],
  [Stats.HP_P, undefined, Stats.CD, undefined],
  [Stats.HP, undefined, Stats.EHR, undefined],
  [Stats.DEF_P, undefined, Stats.RES, undefined],
  [Stats.DEF, undefined, Stats.BE, undefined],
]

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

  const renderStatRow = (stat: SubStats, usePrecision: number = precision) => (
    <ScoringNumberParens
      label={t(`common:ShortStats.${stat}`)}
      number={stats[stat]}
      parens={diminishingReturns[stat]}
      precision={usePrecision}
    />
  )

  if (columns === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }} className={styles.zebraContainer}>
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
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} className={styles.zebraGrid}>
      {pairedStats.map(([leftStat, leftPrec, rightStat, rightPrec], i) => (
        <div key={i} className={styles.zebraRow}>
          <div className={styles.zebraCell}>
            {renderStatRow(leftStat, leftPrec ?? precision)}
          </div>
          <div className={styles.zebraCell}>
            {renderStatRow(rightStat, rightPrec ?? precision)}
          </div>
        </div>
      ))}
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
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {show && numberToLocaleString(value, precision)}
        {showParens && <span className={styles.parensSpacer}>-</span>}
        {showParens && numberToLocaleString(parens, 1)}
      </span>
    </div>
  )
}
