import { Flex, Table } from '@mantine/core'
import {
  sharedScoreUpgradeColumns,
  sharedSimResultComparator,
  tableStyle,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { useTranslation } from 'react-i18next'

export type SubstatUpgradeItem = {
  key: string,
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

  const sharedCols = sharedScoreUpgradeColumns(t)

  return (
    <Table
      className='remove-table-bottom-border'
      style={tableStyle}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ textAlign: 'center', width: 200 }}>{t('SubStatUpgrade')}</Table.Th>
          {sharedCols.map((col) => (
            <Table.Th key={col.key} style={{ textAlign: 'center' }}>{col.title}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {dataSource.map((upgrade) => (
          <Table.Tr key={upgrade.key}>
            <Table.Td style={{ textAlign: 'center' }}>
              <Flex>
                <img src={Assets.getStatIcon(upgrade.stat)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }} />
                <span style={{ marginRight: 10 }}>
                  {t('AddedRoll', { stat: tCommon(upgrade.stat) })}
                </span>
              </Flex>
            </Table.Td>
            {sharedCols.map((col) => (
              <Table.Td key={col.key} style={{ textAlign: 'center' }}>
                {col.render(upgrade[col.dataIndex as keyof SubstatUpgradeItem] as number, upgrade)}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
