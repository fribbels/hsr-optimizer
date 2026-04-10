import { Table, Tooltip } from '@mantine/core'
import type { TFunction } from 'i18next'
import styles from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable.module.css'
import type { SubstatUpgradeItem } from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable'
import type {
  MainStats,
  Parts,
  Sets,
} from 'lib/constants/constants'
import { Stats } from 'lib/constants/constants'
import { setToId } from 'lib/sets/setConfigRegistry'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import {
  arrowColor,
  arrowDirection,
} from 'lib/utils/displayUtils'
import {
  localeNumber_0,
  localeNumber_00,
} from 'lib/utils/i18nUtils'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type MainStatUpgradeItem = {
  key: string,
  stat: MainStats,
  part: Parts,
  setUpgradeRequest?: SimulationRequest,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export function DpsScoreMainStatUpgradesTable({ simScore }: {
  simScore: SimulationScore
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const { t: tCommon } = useTranslation(['common', 'charactersTab'])
  const upgrades = simScore.mainUpgrades

  const dataSource: MainStatUpgradeItem[] = upgrades.map((upgrade: SimulationStatUpgrade) => {
    const stat = upgrade.stat! as MainStats
    const part = upgrade.part! as Parts
    return {
      key: part + stat,
      stat,
      part,
      ...sharedSimResultComparator(simScore, upgrade),
    }
  }).sort((a, b) => b.scorePercentUpgrade - a.scorePercentUpgrade)

  const setUpgrade = simScore.setUpgrades[0]
  if (setUpgrade && (setUpgrade.percent ?? 0) - simScore.percent > 0.001) {
    dataSource.unshift({
      key: 'setUpgrade',
      setUpgradeRequest: setUpgrade.simulation.request,
      ...sharedSimResultComparator(simScore, setUpgrade),
    } as unknown as MainStatUpgradeItem)
  }

  const sharedCols = sharedScoreUpgradeColumns(t)

  return (
    <Table
      className={styles.table}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.headerCell}>{t('MainStatUpgrade')}</Table.Th>
          {sharedCols.map((col) => (
            <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {dataSource.map((upgrade) => (
          <Table.Tr key={upgrade.key}>
            <Table.Td className={styles.centeredCell}>
              {upgrade.setUpgradeRequest
                ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingLeft: 4 }}>
                    {upgrade.setUpgradeRequest.simRelicSet1 === upgrade.setUpgradeRequest.simRelicSet2
                      ? (
                        <RelicDoubleImageWithTooltip name={upgrade.setUpgradeRequest.simRelicSet1} height={iconSize} width={iconSize} />
                      )
                      : (
                        <>
                          <RelicImageWithTooltip name={upgrade.setUpgradeRequest.simRelicSet1} height={iconSize} width={iconSize} />
                          <RelicImageWithTooltip name={upgrade.setUpgradeRequest.simRelicSet2} height={iconSize} width={iconSize} />
                        </>
                      )}
                    <span></span>
                    <RelicImageWithTooltip name={upgrade.setUpgradeRequest.simOrnamentSet} height={iconSize} width={iconSize} />
                  </div>
                )
                : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <img src={Assets.getPart(upgrade.part)} className={styles.partIcon} style={{ width: iconSize, height: iconSize }} />
                    <span>➔</span>
                    <img src={Assets.getStatIcon(upgrade.stat)} style={{ width: iconSize, height: iconSize }} />
                    <span>{`${tCommon(`ShortReadableStats.${upgrade.stat}`)}`}</span>
                  </div>
                )}
            </Table.Td>
            {sharedCols.map((col) => (
              <Table.Td key={col.key} className={styles.centeredCell}>
                {col.render(upgrade[col.dataIndex as keyof MainStatUpgradeItem] as number, upgrade)}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

function RelicDoubleImageWithTooltip({ name, width, height }: { name: Sets, height: number, width: number }) {
  const id = setToId[name]
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return (
    <Tooltip label={t(`${id}.Name`)}>
      <div style={{ display: 'flex', gap: 3 }}>
        <img src={Assets.getSetImage(name)} style={{ width, height }} />
        <img src={Assets.getSetImage(name)} style={{ width, height }} />
      </div>
    </Tooltip>
  )
}

function RelicImageWithTooltip({ name, width, height }: { name: Sets, height: number, width: number }) {
  const id = setToId[name]
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return (
    <Tooltip label={t(`${id}.Name`)}>
      <img src={Assets.getSetImage(name)} style={{ width, height }} />
    </Tooltip>
  )
}

export function sharedSimResultComparator(simScore: SimulationScore, upgrade: SimulationStatUpgrade) {
  // Cleans up floating point error ranges within 1.0f
  const scoreDiff = upgrade.simulationResult.simScore - simScore.originalSimScore
  const adjustedScoreDiff = Math.abs(scoreDiff) < 1 ? 0 : scoreDiff

  const percentDiff = upgrade.percent! - simScore.percent
  const adjustedPercentDiff = Math.abs(percentDiff) < 0.0001 ? 0 : percentDiff

  return {
    scorePercentUpgrade: adjustedPercentDiff * 100,
    scoreValueUpgrade: upgrade.percent! * 100,
    damagePercentUpgrade: adjustedScoreDiff / simScore.originalSimScore * 100,
    damageValueUpgrade: adjustedScoreDiff,
  }
}

export type SharedScoreColumn = {
  key: string
  title: string
  dataIndex: string
  render: (value: number, record: unknown) => ReactNode
}

export function sharedScoreUpgradeColumns(t: TFunction<'charactersTab', 'CharacterPreview.SubstatUpgradeComparisons'>): SharedScoreColumn[] {
  return [
    {
      key: 'scorePercentUpgrade',
      title: t('DpsScorePercentUpgrade'), // DPS Score Δ %
      dataIndex: 'scorePercentUpgrade',
      render: (n: number, record: unknown) => (
        (record as SubstatUpgradeItem)?.stat === Stats.SPD ? <>-</> : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Arrow up={n >= 0} />
            {` ${localeNumber_00(n)}%`}
          </div>
        )
      ),
    },
    {
      key: 'damagePercentUpgrade',
      title: t('ComboDmgPercentUpgrade'), // Combo DMG Δ %
      dataIndex: 'damagePercentUpgrade',
      render: (n: number) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Arrow up={n >= 0} />
          {` ${localeNumber_00(n)}%`}
        </div>
      ),
    },
    {
      key: 'scoreValueUpgrade',
      title: t('UpgradedDpsScore'), // Upgraded DPS Score
      dataIndex: 'scoreValueUpgrade',
      render: (n: number, record: unknown) => (
        (record as SubstatUpgradeItem)?.stat === Stats.SPD ? <>-</> : (
          <>
            {`${localeNumber_0(Math.max(0, n))}%`}
          </>
        )
      ),
    },
    {
      key: 'damageValueUpgrade',
      title: t('ComboDmgUpgrade'), // Combo DMG Δ
      dataIndex: 'damageValueUpgrade',
      render: (n: number) => (
        <>
          {localeNumber_0(n)}
        </>
      ),
    },
  ]
}

export const tableStyle = {
  width: '100%',
  boxShadow: 'var(--shadow-card)',
  borderRadius: 6,
  overflow: 'hidden',
}

function Arrow({ up }: { up: boolean }) {
  return (
    <span className={styles.arrowText} style={{ color: arrowColor(up) }}>
      {arrowDirection(up)}
    </span>
  )
}
