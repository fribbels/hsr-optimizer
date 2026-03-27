import { Table } from '@mantine/core'
import type { SubStats } from 'lib/constants/constants'
import { type AKeyType, GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import { calculateStatUpgrades } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import {
  localeNumber_0,
  localeNumber_00,
} from 'lib/utils/i18nUtils'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './SubstatUpgrades.module.css'
import { truncate100ths } from 'lib/utils/mathUtils'

type Metrics = 'COMBO_DMG' | 'EHP'

type StatUpgradeGroup = {
  key: Metrics,
  upgrades: StatUpgradeItem[],
}

type StatUpgradeItem = {
  key: SubStats,
  value: number,
  percent: number,
}

export function DamageUpgrades({ analysis }: {
  analysis: OptimizerResultAnalysis
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.SubstatUpgrades' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })
  // @ts-expect-error - relic.set may be -1 or empty string from optimizer results
  if (Object.values(analysis.newRelics).some((relic) => relic.set === -1 || relic.set === '')) {
    return null
  }

  const statUpgrades = calculateStatUpgrades(analysis)
  const metrics: Metrics[] = [
    'COMBO_DMG',
    'EHP',
  ]
  const upgradeGroups: StatUpgradeGroup[] = []

  for (const metric of metrics) {
    let hasValue = false
    const group: StatUpgradeGroup = {
      key: metric,
      upgrades: [],
    }
    const getValue = metric in GlobalRegister
      ? (x: ComputedStatsContainer) => x.getGlobalRegisterValue(GlobalRegister[metric as keyof typeof GlobalRegister])
      : (x: ComputedStatsContainer) => x.getSelfValue(StatKey[metric as AKeyType])
    for (const statUpgrade of statUpgrades) {
      const baseValue = getValue(analysis.newX)
      const upgradeValue = getValue(statUpgrade.x)
      const diff = upgradeValue - baseValue
      if (diff > 1) {
        const percent = diff / baseValue
        group.upgrades.push({
          key: statUpgrade.stat,
          value: diff,
          percent: percent,
        })
        hasValue = true
      }
    }

    if (hasValue) {
      upgradeGroups.push(group)
    }
  }

  const displays: ReactElement[] = []

  for (const group of upgradeGroups) {
    group.upgrades.sort((a, b) => b.value - a.value)

    displays.push(
      <Table
        key={group.key}
        className={classes.upgradeTable}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={classes.substatHeader}>{t('ColumnHeaders.Substat')}</Table.Th>
            <Table.Th className={classes.columnHeader}>{t(`ColumnHeaders.${group.key}_P`)}</Table.Th>
            <Table.Th className={classes.columnHeader}>{t(`ColumnHeaders.${group.key}`)}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {group.upgrades.map((item) => (
            <Table.Tr key={item.key}>
              <Table.Td className={classes.centeredCell}>
                <div style={{ display: 'flex' }}>
                  <img src={Assets.getStatIcon(item.key)} className={classes.statIcon} />
                  {tCommon(item.key)}
                </div>
              </Table.Td>
              <Table.Td className={classes.centeredCell}>
                {item.percent === 0 ? '' : `${localeNumber_00(truncate100ths(item.percent * 100))}%`}
              </Table.Td>
              <Table.Td className={classes.centeredCell}>
                {item.value === 0 ? '' : `${localeNumber_0(item.value)}`}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>,
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
      className={classes.upgradesGrid}
    >
      {displays}
    </div>
  )
}
