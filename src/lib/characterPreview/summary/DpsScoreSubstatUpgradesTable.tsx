import {
  Skeleton,
  Table,
} from '@mantine/core'
import type { TFunction } from 'i18next'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import {
  type SharedScoreColumn,
  sharedScoreUpgradeColumns,
  sharedSimResultComparator,
  tableStyle,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import styles from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable.module.css'
import type { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import {
  memo,
  Suspense,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { SimulationMetadata } from 'types/metadata'

export type SubstatUpgradeItem = {
  key: string,
  stat: SubStats,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export const DpsScoreSubstatUpgradesTable = memo(function({ meta }: {
  meta: SimulationMetadata,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const sharedCols = sharedScoreUpgradeColumns(t)
  return (
    <Suspense fallback={<DpsScoreSubstatUpgradesShimmer meta={meta} t={t} sharedCols={sharedCols} />}>
      <DpsScoreSubstatUpgradesTableReady t={t} sharedCols={sharedCols} />
    </Suspense>
  )
})

function DpsScoreSubstatUpgradesShimmer({ meta, t, sharedCols }: {
  meta: SimulationMetadata,
  t: TFunction<'charactersTab', 'CharacterPreview.SubstatUpgradeComparisons'>,
  sharedCols: SharedScoreColumn[],
}) {
  return (
    <Table className={styles.table} style={tableStyle}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.headerCell}>{t('SubStatUpgrade')}</Table.Th>
          {sharedCols.map((col) => <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>)}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {(meta.substats as SubStats[]).map((stat) => (
          <Table.Tr key={stat}>
            <Table.Td className={styles.centeredCell}>
              <Skeleton width='60%' height='100%' style={{ margin: 'auto' }}>foo</Skeleton>
            </Table.Td>
            {sharedCols.map((col) => (
              <Table.Td key={col.key} className={styles.centeredCell}>
                <Skeleton width='60%' height='100%' style={{ margin: 'auto' }}>foo</Skeleton>
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

const DpsScoreSubstatUpgradesTableReady = memo(function({ t, sharedCols }: {
  t: TFunction<'charactersTab', 'CharacterPreview.SubstatUpgradeComparisons'>,
  sharedCols: SharedScoreColumn[],
}) {
  const simScore = useSimScoringContext(ScoringSelector.Upgrades)
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })

  if (simScore === null) return null

  const upgrades = simScore.substatUpgrades
  const dataSource: SubstatUpgradeItem[] = upgrades.map((upgrade) => {
    const stat = upgrade.stat! as SubStats
    return {
      key: stat,
      stat,
      ...sharedSimResultComparator(simScore, upgrade),
    }
  })

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
})
