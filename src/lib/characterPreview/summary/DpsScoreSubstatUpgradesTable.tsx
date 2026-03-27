import { Table } from '@mantine/core'
import {
  sharedScoreUpgradeColumns,
  sharedSimResultComparator,
  tableStyle,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import styles from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable.module.css'
import type { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { useTranslation } from 'react-i18next'

export type SubstatUpgradeItem = {
  key: string,
  stat: SubStats,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export function DpsScoreSubstatUpgradesTable({ simScore }: {
  simScore: SimulationScore
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })

  const upgrades = simScore.substatUpgrades
  const dataSource: SubstatUpgradeItem[] = upgrades.map((upgrade) => {
    const stat = upgrade.stat! as SubStats
    return {
      key: stat,
      stat,
      ...sharedSimResultComparator(simScore, upgrade),
    }
  })

  const sharedCols = sharedScoreUpgradeColumns(t)

  return (
    <Table
      className={styles.table}
      style={tableStyle}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.headerCell}>{t('SubStatUpgrade')}</Table.Th>
          {sharedCols.map((col) => (
            <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {dataSource.map((upgrade) => (
          <Table.Tr key={upgrade.key}>
            <Table.Td className={styles.centeredCell}>
              <div style={{ display: 'flex' }}>
                <img src={Assets.getStatIcon(upgrade.stat)} className={styles.statIcon} style={{ width: iconSize, height: iconSize }} />
                <span className={styles.statLabel}>
                  {t('AddedRoll', { stat: tCommon(upgrade.stat) })}
                </span>
              </div>
            </Table.Td>
            {sharedCols.map((col) => (
              <Table.Td key={col.key} className={styles.centeredCell}>
                {col.render(upgrade[col.dataIndex as keyof SubstatUpgradeItem] as number, upgrade)}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
