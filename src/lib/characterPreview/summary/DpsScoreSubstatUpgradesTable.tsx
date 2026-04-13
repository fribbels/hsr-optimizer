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
import {
  memo,
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

  const initialRanks = useMemo(() =>
    meta.substats.reduce((acc, stat, idx) => {
      acc[stat] = idx
      return acc
    }, {} as Record<SubStats, number>), [meta])

  const [statToRank, setStatToRank] = useState(initialRanks)

  const [resolvedScore, setResolvedScore] = useState<SimulationScore | null>(null)

  // need to resync when changing character
  useEffect(() => {
    setStatToRank(initialRanks)
    setResolvedScore(null)
  }, [initialRanks])

  useEffect(() => {
    let cancelled = false
    upgradePromise.then((score) => {
      if (cancelled) return
      setResolvedScore(score)
      if (score === null) return
      setStatToRank(
        score.substatUpgrades.reduce((acc, cur, idx) => {
          if (cur.stat) acc[cur.stat as SubStats] = idx
          return acc
        }, {} as Record<SubStats, number>),
      )
    })
    return () => { cancelled = true }
  }, [upgradePromise])

  const upgradeByStatMap = useMemo(() => {
    if (!resolvedScore) return null
    const map = new Map<SubStats, typeof resolvedScore.substatUpgrades[0]>()
    for (const upgrade of resolvedScore.substatUpgrades) {
      if (upgrade.stat) map.set(upgrade.stat as SubStats, upgrade)
    }
    return map
  }, [resolvedScore])

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
              top: calculateOffset(stat, initialRanks, statToRank),
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
            <SuspendedValues stat={stat} resolvedScore={resolvedScore} upgradeByStatMap={upgradeByStatMap} sharedCols={sharedCols} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
})

const SuspendedValues = memo(function({ stat, resolvedScore, upgradeByStatMap, sharedCols }: {
  stat: SubStats,
  resolvedScore: SimulationScore | null,
  upgradeByStatMap: Map<SubStats, SimulationScore['substatUpgrades'][0]> | null,
  sharedCols: SharedScoreColumn[],
}) {
  return sharedCols.map((col) => {
    if (isStatWithoutScoreUpgrade(stat) && col.type === 'scoreUpgrade') {
      return (
        <Table.Td key={col.key} className={styles.centeredCell}>
          <>-</>
        </Table.Td>
      )
    }

    const content = resolvedScore && upgradeByStatMap
      ? renderCell(stat, col, resolvedScore, upgradeByStatMap)
      : null

    return (
      <Table.Td key={col.key} className={styles.centeredCell}>
        {content}
      </Table.Td>
    )
  })
})

function renderCell(
  stat: SubStats,
  col: SharedScoreColumn,
  score: SimulationScore,
  upgradeMap: Map<SubStats, SimulationScore['substatUpgrades'][0]>,
) {
  const upgrade = upgradeMap.get(stat)
  if (!upgrade) return null
  const data = { key: stat, stat, ...sharedSimResultComparator(score, upgrade) }
  return col.render(data[col.dataIndex as keyof SubstatUpgradeItem] as number, stat)
}

export function calculateOffset(
  stat: SubStats,
  initialRanks: Record<SubStats, number>,
  actualRanks: Record<SubStats, number>,
) {
  return (actualRanks[stat] - initialRanks[stat]) * 37
}
