import { Flex, Table } from '@mantine/core'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { AKeyType, GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import {
  calculateStatUpgrades,
  OptimizerResultAnalysis,
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import {
  localeNumber_0,
  localeNumber_00,
} from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

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

export function DamageUpgrades(props: {
  analysis: OptimizerResultAnalysis,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.SubstatUpgrades' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })
  const analysis = props.analysis
  // @ts-ignore
  if (Object.values(analysis.newRelics).some((relic) => relic.set == -1 || relic.set == '')) {
    return <></>
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
        className='remove-table-bottom-border'
        key={group.key}
        style={{
          flex: '1 1 calc(30% - 10px)',
          border: '1px solid #354b7d',
          boxShadow: cardShadowNonInset,
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: 'center', width: 100 }}>{t('ColumnHeaders.Substat')}</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 110 }}>{t(`ColumnHeaders.${group.key}_P`)}</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 110 }}>{t(`ColumnHeaders.${group.key}`)}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {group.upgrades.map((item) => (
            <Table.Tr key={item.key}>
              <Table.Td style={{ textAlign: 'center' }}>
                <Flex>
                  <img src={Assets.getStatIcon(item.key)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }} />
                  {tCommon(item.key)}
                </Flex>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {item.percent == 0 ? '' : `${localeNumber_00(Utils.truncate100ths(item.percent * 100))}%`}
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {item.value == 0 ? '' : `${localeNumber_0(item.value)}`}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>,
    )
  }

  return (
    <Flex
      align='start'
      gap={10}
      justify='space-between'
      wrap="wrap"
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
