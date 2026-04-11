import { Skeleton } from '@mantine/core'
import styles from 'lib/characterPreview/summary/SubstatRollsSummary.module.css'
import { SubStats } from 'lib/constants/constants'
import { Stats } from 'lib/constants/constants'
import {
  diminishingReturnsFormula,
  type SimulationScore,
  spdDiminishingReturnsFormula,
} from 'lib/scoring/simScoringUtils'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import {
  memo,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

interface SubstatRollsSummaryCommonProps {
  precision: number
  diminish: boolean
  columns?: 1 | 2
}

interface SyncProps extends SubstatRollsSummaryCommonProps {
  simRequest: SimulationRequest
  promise?: never
  type?: never
}

interface AsyncProps extends SubstatRollsSummaryCommonProps {
  simRequest?: never
  promise: Promise<SimulationScore | null>
  type: 'Benchmark' | 'Perfect'
}

type SubstatRollsSummaryProps = SyncProps | AsyncProps

const orderedSubstats: Array<[SubStats, number | undefined]> = SubStats.map((stat) => {
  const precision = stat === Stats.SPD ? 2 : undefined
  return [stat, precision]
})

const substatCount = orderedSubstats.length / 2
const pairedStats: Array<[SubStats, number | undefined, SubStats, number | undefined]> = Array.from({ length: substatCount }).map((_, idx) => {
  return [...orderedSubstats[idx], ...orderedSubstats[idx + substatCount]]
})

export const SubstatRollsSummary = memo(function SubstatRollsSummary(props: SubstatRollsSummaryProps) {
  return props.promise ? <AsyncStatRollSummary {...props} /> : <SyncSubstatRollsSummary {...props} />
})

function SyncSubstatRollsSummary({ simRequest, precision, diminish, columns }: SyncProps) {
  const stats = simRequest.stats
  const diminishingReturns: Record<string, number> = {}
  if (diminish) {
    for (const [stat, rolls] of Object.entries(stats)) {
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

  return (
    <RenderStats
      stats={stats}
      diminishingReturns={diminishingReturns}
      columns={columns}
      precision={precision}
    />
  )
}

function ScoringNumberParens({ label, number, parens: parensValue, precision = 1, suspended = false }: {
  label: string,
  number?: number,
  parens?: number,
  precision?: number,
  suspended?: boolean,
}) {
  const value = precisionRound(number ?? 0)
  const parens = precisionRound(parensValue ?? 0)
  const show = value !== 0
  const showParens = parens > 0

  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'space-between' }}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {suspended
          ? <Skeleton width={70}>foo</Skeleton>
          : (
            <>
              {show && numberToLocaleString(value, precision)}
              {showParens && <span className={styles.parensSpacer}>-</span>}
              {showParens && numberToLocaleString(parens, 1)}
            </>
          )}
      </span>
    </div>
  )
}

function AsyncStatRollSummary({ promise, type, precision, diminish, columns }: AsyncProps) {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [diminishingReturns, setDiminishingReturns] = useState<Record<string, number>>({})
  const [suspended, setSuspended] = useState(true)

  useEffect(() => {
    let stale = false

    setSuspended(true)
    setDiminishingReturns({})
    setStats({})

    promise.then((result) => {
      if (result === null) return

      const request = type === 'Benchmark' ? result.benchmarkSim.request : result.maximumSim.request

      const stats = request.stats
      const diminishingReturns: Record<string, number> = {}

      if (diminish) {
        for (const [stat, rolls] of Object.entries(stats)) {
          const mainsCount = [
            request.simBody,
            request.simFeet,
            request.simPlanarSphere,
            request.simLinkRope,
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

      if (stale) return

      setSuspended(false)
      setStats(stats)
      setDiminishingReturns(diminishingReturns)
    })
    return () => {
      stale = true
    }
  }, [promise, type, diminish])
  return (
    <RenderStats
      stats={stats}
      diminishingReturns={diminishingReturns}
      precision={precision}
      columns={columns}
      suspended={suspended}
    />
  )
}

const RenderStats = memo(function({ stats, diminishingReturns, precision, columns = 2, suspended = false }: {
  stats: Record<string, number>,
  diminishingReturns: Record<string, number>,
  precision: number,
  columns?: 1 | 2,
  suspended?: boolean,
}) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortStats' })
  if (columns === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }} className={styles.zebraContainer}>
        {orderedSubstats.map(([stat, prec]) => (
          <ScoringNumberParens
            key={stat}
            label={t(stat)}
            number={stats[stat]}
            parens={diminishingReturns[stat]}
            precision={prec ?? precision}
            suspended={suspended}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} className={styles.zebraGrid}>
      {pairedStats.map(([leftStat, leftPrec, rightStat, rightPrec], i) => (
        <div key={i} className={styles.zebraRow}>
          <div className={styles.zebraCell}>
            <ScoringNumberParens
              label={t(leftStat)}
              number={stats[leftStat]}
              parens={diminishingReturns[leftStat]}
              precision={leftPrec ?? precision}
              suspended={suspended}
            />
          </div>
          <div className={styles.zebraCell}>
            <ScoringNumberParens
              label={t(rightStat)}
              number={stats[rightStat]}
              parens={diminishingReturns[rightStat]}
              precision={rightPrec ?? precision}
              suspended={suspended}
            />
          </div>
        </div>
      ))}
    </div>
  )
})
