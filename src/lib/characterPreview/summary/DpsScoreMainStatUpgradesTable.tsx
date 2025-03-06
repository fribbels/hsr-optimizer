import { Flex, Table, TableProps } from 'antd'
import { MainStats, Parts } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { arrowColor, arrowDirection } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { localeNumber_0, localeNumber_00 } from 'lib/utils/i18nUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

type MainStatUpgradeItem = {
  stat: MainStats
  part: Parts
  // rollValue: number
  scorePercentUpgrade: number
  scoreValueUpgrade: number
  damagePercentUpgrade: number
  damageValueUpgrade: number
}

export function DpsScoreMainStatUpgradesTable(props: {
  simScore: SimulationScore
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.SubstatUpgrades' })
  const { t: tCommon } = useTranslation(['common', 'charactersTab'])

  const { simScore } = props
  const upgrades = simScore.mainUpgrades

  console.log(simScore)
  console.log(simScore.mainUpgrades)
  const dataSource: MainStatUpgradeItem[] = upgrades.map((upgrade) => {
    const stat = upgrade.stat! as MainStats
    const part = upgrade.part! as Parts
    return {
      key: part + stat,
      stat: stat,
      part: part,
      scorePercentUpgrade: (upgrade.percent! - simScore.percent) * 100, // OK
      scoreValueUpgrade: upgrade.percent! * 100,
      damagePercentUpgrade: (upgrade.simulationResult.simScore - simScore.originalSimScore) / simScore.originalSimScore * 100,
      damageValueUpgrade: (upgrade.simulationResult.simScore - simScore.originalSimScore),
    }
  }).sort((a, b) => b.scorePercentUpgrade - a.scorePercentUpgrade)

  const columns: TableProps<MainStatUpgradeItem>['columns'] = [
    {
      title: 'Main Stat Upgrade',
      dataIndex: 'stat',
      align: 'center',
      width: 200,
      rowScope: 'row',
      render: (stat: MainStats, upgrade: MainStatUpgradeItem) => (
        <Flex align='center' gap={5}>
          <img src={Assets.getPart(upgrade.part)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }}/>
          <span>➔</span>
          <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize }}/>
          <span>{`${tCommon(`ShortReadableStats.${stat}`)}`}</span>
        </Flex>
      ),
    },
    {
      title: 'DPS Score Δ %',
      dataIndex: 'scorePercentUpgrade',
      align: 'center',
      render: (n: number) => (
        <Flex align='center' justify='center' gap={5}>
          <Arrow up={n >= 0}/>
          {` ${localeNumber_00(n)}%`}
        </Flex>
      ),
    },
    {
      title: 'Updated DPS Score',
      dataIndex: 'scoreValueUpgrade',
      align: 'center',
      render: (n: number) => (
        <>
          {`${localeNumber_0(Math.max(0, n))}%`}
        </>
      ),
    },
    {
      title: 'Combo DMG Δ %',
      dataIndex: 'damagePercentUpgrade',
      align: 'center',
      render: (n: number) => (
        <Flex align='center' justify='center' gap={5}>
          <Arrow up={n >= 0}/>
          {` ${localeNumber_00(n)}%`}
        </Flex>
      ),
    },
    {
      title: 'Combo DMG Δ',
      dataIndex: 'damageValueUpgrade',
      align: 'center',
      render: (n: number) => (
        <>
          {localeNumber_0(n)}
        </>
      ),
    },
  ]

  return (
    <Table<MainStatUpgradeItem>
      className='remove-table-bottom-border'
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size='small'
      style={tableStyle}
    />
  )
}

export const tableStyle = {
  width: '100%',
  border: '1px solid #354b7d',
  boxShadow: cardShadowNonInset,
  borderRadius: 5,
  overflow: 'hidden',
}

export function Arrow(props: { up: boolean }) {
  return (
    <span style={{ color: arrowColor(props.up), fontSize: 10 }}>
      {arrowDirection(props.up)}
    </span>
  )
}
