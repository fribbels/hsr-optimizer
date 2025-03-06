import { Flex, Table, TableProps } from 'antd'
import { Arrow, tableStyle } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { localeNumber_0, localeNumber_00 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

type SubstatUpgradeItem = {
  stat: SubStats
  rollValue: number
  scorePercentUpgrade: number
  scoreValueUpgrade: number
  damagePercentUpgrade: number
  damageValueUpgrade: number
}

export function DpsScoreSubstatUpgradesTable(props: {
  simScore: SimulationScore
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.SubstatUpgrades' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })

  const { simScore } = props
  const upgrades = simScore.substatUpgrades
  const dataSource: SubstatUpgradeItem[] = upgrades.map((upgrade) => {
    const stat = upgrade.stat! as SubStats
    return {
      key: stat,
      stat: stat,
      rollValue: TsUtils.precisionRound(StatCalculator.getMaxedSubstatValue(stat, 1.0)),
      scorePercentUpgrade: (upgrade.percent! - simScore.percent) * 100, // OK
      scoreValueUpgrade: upgrade.percent! * 100,
      damagePercentUpgrade: (upgrade.simulationResult.simScore - simScore.originalSimScore) / simScore.originalSimScore * 100,
      damageValueUpgrade: (upgrade.simulationResult.simScore - simScore.originalSimScore),
    }
  })

  const columns: TableProps<SubstatUpgradeItem>['columns'] = [
    {
      title: 'Substat Upgrade',
      dataIndex: 'stat',
      align: 'center',
      width: 200,
      rowScope: 'row',
      render: (text: SubStats, upgrade: SubstatUpgradeItem) => (
        <Flex>
          <img src={Assets.getStatIcon(text)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }}/>
          <span style={{ marginRight: 10 }}>
            {`+1x roll ${tCommon(text)} `}
          </span>
        </Flex>
      ),
    },
    {
      title: 'DPS Score Δ %',
      dataIndex: 'scorePercentUpgrade',
      align: 'center',
      render: (n: number) => (
        <Flex align='center' justify='center' gap={5}>
          <Arrow up/>
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
          <Arrow up/>
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
    <Table<SubstatUpgradeItem>
      className='remove-table-bottom-border'
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size='small'
      style={tableStyle}
    />
  )
}
