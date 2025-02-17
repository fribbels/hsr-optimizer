import { Flex, Table, TableProps } from 'antd'
import { StatsToShort, SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { ComputedStatKeys } from 'lib/optimization/config/computedStatsConfig'
import { Assets } from 'lib/rendering/assets'
import { calculateStatUpgrades, OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { Utils } from 'lib/utils/utils'
import React, { ReactElement } from 'react'

type StatUpgradeGroup = {
  key: ComputedStatKeys
  upgrades: StatUpgradeItem[]
}

type StatUpgradeItem = {
  key: SubStats
  value: number
}

export function DamageUpgrades(props: {
  analysis: OptimizerResultAnalysis
}) {
  const analysis = props.analysis
  // @ts-ignore
  if (Object.values(analysis.newRelics).some((relic) => relic.set == -1)) {
    return <></>
  }

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
          key: statUpgrade.stat,
          value: percent,
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

    const columns: TableProps<StatUpgradeItem>['columns'] = [
      {
        title: '+1x Substat',
        dataIndex: 'key',
        align: 'center',
        width: 110,
        render: (text: SubStats) => (
          <Flex>
            <img src={Assets.getStatIcon(text)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }}/>
            {StatsToShort[text]}
          </Flex>
        ),
      },
      {
        title: `Δ ${metricToColumnTitle[group.key as keyof typeof metricToColumnTitle]}`,
        dataIndex: 'value',
        align: 'center',
        width: 110,
        render: (n: number) => (
          <>
            {n == 0 ? '' : `${Utils.truncate100ths(n * 100).toFixed(2)}%`}
          </>
        ),
      },
    ]

    displays.push(
      <Table<StatUpgradeItem>
        key={group.key}
        columns={columns}
        dataSource={group.upgrades}
        pagination={false}
        size='small'
      />,
    )
  }

  return (
    <Flex align='start' gap={10} justify='start'>
      {displays}
    </Flex>
  )
}

const metricToColumnTitle = {
  COMBO_DMG: 'Combo DMG',
  EHP: 'EHP',
  HEAL_VALUE: 'Heal',
  SHIELD_VALUE: 'Shield',
}
