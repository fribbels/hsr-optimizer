import {
  Flex,
  Table,
  TableProps,
} from 'antd'
import {
  sharedScoreUpgradeColumns,
  sharedSimResultComparator,
  tableStyle,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

type SubstatUpgradeItem = {
  stat: SubStats,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export function DpsScoreSubstatUpgradesTable(props: {
  simScore: SimulationScore,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortSpacedStats' })

  const { simScore } = props
  const upgrades = simScore.substatUpgrades
  const dataSource: SubstatUpgradeItem[] = upgrades.map((upgrade) => {
    const stat = upgrade.stat! as SubStats
    return {
      key: stat,
      stat: stat,
      ...sharedSimResultComparator(simScore, upgrade),
    }
  })

  const columns: TableProps<SubstatUpgradeItem>['columns'] = [
    {
      title: t('SubStatUpgrade'), // Substat Upgrade
      dataIndex: 'stat',
      align: 'center',
      width: 200,
      rowScope: 'row',
      render: (text: SubStats, upgrade: SubstatUpgradeItem) => (
        <Flex>
          <img src={Assets.getStatIcon(text)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }} />
          <span style={{ marginRight: 10 }}>
            {t('AddedRoll', { stat: tCommon(text) }) /* +1x roll {{stat}} */}
          </span>
        </Flex>
      ),
    },
    // @ts-ignore
    ...sharedScoreUpgradeColumns(t),
  ]

  return (
    <Table<SubstatUpgradeItem>
      className='remove-table-bottom-border'
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size='small'
      style={tableStyle}
      locale={{ emptyText: '' }}
    />
  )
}
