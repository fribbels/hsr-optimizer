import { Table } from '@mantine/core'
import { SimScoringContext } from 'lib/characterPreview/SimScoringContext'
import {
  isStatWithoutScoreUpgrade,
  type SharedScoreColumn,
  sharedScoreUpgradeColumns,
  sharedSimResultComparator,
  tableStyle,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import styles from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable.module.css'
import type { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { type SimulationScore } from 'lib/scoring/simScoringUtils'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { SimulationMetadata } from 'types/metadata'

export type SubstatUpgradeItem = {
  key: SubStats,
  stat: SubStats,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export const DpsScoreSubstatUpgradesTable = memo(function({ meta }: {
  meta: SimulationMetadata,
}) {
  const upgradePromise = useContext(SimScoringContext).upgradePromise
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const sharedCols = useMemo(() => sharedScoreUpgradeColumns(t), [t])
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })

  const initialRanks = meta.substats.reduce((acc, stat, idx) => {
    acc[stat] = idx
    return acc
  }, {} as Record<SubStats, number>)

  const [statToRank, setStatToRank] = useState(initialRanks)

  useEffect(() => {
    upgradePromise.then((score) => {
      if (score === null) return
      setStatToRank(
        score.substatUpgrades.reduce((acc, cur, idx) => {
          if (cur.stat) acc[cur.stat as SubStats] = idx
          return acc
        }, {} as Record<SubStats, number>),
      )
    })
  }, [upgradePromise])

  const rankFromStat = useCallback((
    stat: SubStats,
    initialRanks: Record<SubStats, number>,
    actualRanks: Record<SubStats, number>,
  ) => calculateOffset(stat, initialRanks, actualRanks), [])

  return (
    <Table
      className={styles.table}
      style={tableStyle}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.headerCell}>{t('SubStatUpgrade')}</Table.Th>
          {sharedCols.map((col) => <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>)}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {meta.substats.map((stat) => (
          <Table.Tr
            key={stat}
            style={{
              position: 'relative',
              top: rankFromStat(stat, initialRanks, statToRank),
              transition: 'top ease-in-out 0.5s',
            }}
          >
            <Table.Td className={styles.centeredCell}>
              <div style={{ display: 'flex' }}>
                <img src={Assets.getStatIcon(stat)} className={styles.statIcon} style={{ width: iconSize, height: iconSize }} />
                <span className={styles.statLabel}>
                  {t('AddedRoll', { stat: tCommon(stat) })}
                </span>
              </div>
            </Table.Td>
            <SuspendedValues stat={stat} promise={upgradePromise} sharedCols={sharedCols} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
})

const SuspendedValues = memo(function({ stat, promise, sharedCols }: {
  stat: SubStats,
  promise: Promise<SimulationScore | null>,
  sharedCols: SharedScoreColumn[],
}) {
  return sharedCols.map((col) => {
    if (isStatWithoutScoreUpgrade(stat) && col.type === 'scoreUpgrade') {
      return (
        <Table.Td key={col.key} className={styles.centeredCell}>
          <>-</>
        </Table.Td>
      )
    } else {
      return (
        <Table.Td key={col.key} className={styles.centeredCell}>
          <SuspenseNode
            promise={promise}
            selector={(score) => selector(stat, col, score)}
          />
        </Table.Td>
      )
    }
  })
})

const selector = (stat: SubStats, col: SharedScoreColumn, arg: SimulationScore | null) => {
  if (!arg) return null
  const upgrade = arg.substatUpgrades.find((upgrade) => upgrade.stat === stat)
  if (!upgrade) return null
  const foo = { key: stat, stat, ...sharedSimResultComparator(arg, upgrade) }
  return (
    col.render(foo[col.dataIndex as keyof SubstatUpgradeItem] as number, stat)
  )
}

export function calculateOffset(
  stat: SubStats,
  initialRanks: Record<SubStats, number>,
  actualRanks: Record<SubStats, number>,
) {
  return (actualRanks[stat] - initialRanks[stat]) * 37
}
