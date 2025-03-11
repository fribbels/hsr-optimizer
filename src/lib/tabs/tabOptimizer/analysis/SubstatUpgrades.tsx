import { Flex, Table, TableProps } from 'antd'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { ComputedStatKeys } from 'lib/optimization/config/computedStatsConfig'
import { Assets } from 'lib/rendering/assets'
import { calculateStatUpgrades, OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { localeNumber_0, localeNumber_00 } from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

type StatUpgradeGroup = {
  key: ComputedStatKeys
  upgrades: StatUpgradeItem[]
}

type StatUpgradeItem = {
  key: SubStats
  value: number
  percent: number
}

type Metrics = 'COMBO_DMG' | 'EHP' | 'HEAL_VALUE' | 'SHIELD_VALUE'

export function DamageUpgrades(props: {
  analysis: OptimizerResultAnalysis
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.SubstatUpgrades' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })
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

    const columns: TableProps<StatUpgradeItem>['columns'] = [
      {
        title: t('ColumnHeaders.Substat'),
        dataIndex: 'key',
        align: 'center',
        width: 100,
        render: (text: SubStats) => (
          <Flex>
            <img src={Assets.getStatIcon(text)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }}/>
            {tCommon(text)}
          </Flex>
        ),
      },
      {
        title: t(`ColumnHeaders.${group.key as Metrics}_P`),
        dataIndex: 'percent',
        align: 'center',
        width: 110,
        render: (n: number) => (
          <>
            {n == 0 ? '' : `${localeNumber_00(Utils.truncate100ths(n * 100))}%`}
          </>
        ),
      },
      {
        title: t(`ColumnHeaders.${group.key as Metrics}`),
        dataIndex: 'value',
        align: 'center',
        width: 110,
        render: (n: number) => (
          <>
            {n == 0 ? '' : `${localeNumber_0(n)}`}
          </>
        ),
      },
    ]

    displays.push(
      <Table<StatUpgradeItem>
        className='remove-table-bottom-border'
        key={group.key}
        columns={columns}
        dataSource={group.upgrades}
        pagination={false}
        size='small'
        style={{
          flex: '1 1 calc(30% - 10px)',
          border: '1px solid #354b7d',
          boxShadow: cardShadowNonInset,
          borderRadius: 5,
          overflow: 'hidden',
        }}
      />,
    )
  }

  return (
    <Flex
      align='start'
      gap={10}
      justify='space-between'
      wrap={true}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '10px',
      }}
    >
      {displays}
    </Flex>
  )
}
