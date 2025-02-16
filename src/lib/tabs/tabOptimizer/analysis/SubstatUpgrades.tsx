import { Flex, Table, TableProps } from 'antd'
import { StatsToShort, SubStats } from 'lib/constants/constants'
import { ComputedStatKeys } from 'lib/optimization/config/computedStatsConfig'
import { calculateStatUpgrades, OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { Utils } from 'lib/utils/utils'
import React, { ReactElement } from 'react'

type StatUpgradeGroup = {
  key: ComputedStatKeys
  upgrades: StatUpgradeItem[]
}

type StatUpgradeItem = {
  stat: SubStats
  value: number
}

export function DamageUpgrades(props: {
  analysis: OptimizerResultAnalysis
}) {
  const analysis = props.analysis
  const statUpgrades = calculateStatUpgrades(analysis)
  const metrics: ComputedStatKeys[] = [
    'COMBO_DMG',
    'EHP',
    'HEAL_VALUE',
    'SHIELD_VALUE',
  ]
  const upgradeGroups: StatUpgradeGroup[] = []

  for (const metric of metrics) {
    let hasValue = false
    const group: StatUpgradeGroup = {
      key: metric,
      upgrades: [],
    }
    for (const statUpgrade of statUpgrades) {
      const baseValue = analysis.newX[metric].get()
      const upgradeValue = statUpgrade.simResult.tracedX![metric].get()
      const diff = upgradeValue - baseValue
      if (diff > 1) {
        const percent = diff / baseValue
        group.upgrades.push({
          stat: statUpgrade.stat,
          value: percent,
        })
        hasValue = true
      }
    }

    if (hasValue) {
      upgradeGroups.push(group)
    }
  }

  console.debug(upgradeGroups)

  const displays: ReactElement[] = []

  for (const group of upgradeGroups) {
    group.upgrades.sort((a, b) => b.value - a.value)

    const columns: TableProps<StatUpgradeItem>['columns'] = [
      {
        title: '+1x Stat',
        dataIndex: 'stat',
        align: 'center',
        width: 100,
        render: (text: SubStats) => <>{StatsToShort[text]}</>,
      },
      {
        title: group.key,
        dataIndex: 'value',
        align: 'center',
        width: 100,
        render: (n: number) => (
          <>
            {n == 0 ? '' : `${Utils.truncate100ths(n * 100).toFixed(2)}%`}
          </>
        ),
      },
    ]

    displays.push(
      <Table<StatUpgradeItem>
        style={{ width: 200 }}
        columns={columns}
        dataSource={group.upgrades}
        pagination={false}
        size='small'
      />,
    )
  }

  return (
    <Flex vertical align='center'>
      {displays}
    </Flex>
  )
}
