import {
  Flex,
  Table,
  TableProps,
} from 'antd'
import { AnyObject } from 'antd/es/_util/type'
import { TFunction } from 'i18next'
import { SubstatUpgradeItem } from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable'
import {
  MainStats,
  Parts,
  Stats,
} from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import {
  arrowColor,
  arrowDirection,
} from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import {
  localeNumber_0,
  localeNumber_00,
} from 'lib/utils/i18nUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

type MainStatUpgradeItem = {
  stat: MainStats,
  part: Parts,
  setUpgradeRequest?: SimulationRequest,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export function DpsScoreMainStatUpgradesTable(props: {
  simScore: SimulationScore,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const { t: tCommon } = useTranslation(['common', 'charactersTab'])

  const { simScore } = props
  const upgrades = simScore.mainUpgrades

  const dataSource: MainStatUpgradeItem[] = upgrades.map((upgrade: SimulationStatUpgrade) => {
    const stat = upgrade.stat! as MainStats
    const part = upgrade.part! as Parts
    return {
      key: part + stat,
      stat: stat,
      part: part,
      ...sharedSimResultComparator(simScore, upgrade),
    }
  }).sort((a, b) => b.scorePercentUpgrade - a.scorePercentUpgrade)

  const setUpgrade = simScore.setUpgrades[0]
  if ((setUpgrade.percent ?? 0) - simScore.percent > 0.001) {
    dataSource.unshift({
      key: 'setUpgrade',
      setUpgradeRequest: setUpgrade.simulation.request,
      ...sharedSimResultComparator(simScore, setUpgrade),
    } as unknown as MainStatUpgradeItem)
  }

  const columns: TableProps<MainStatUpgradeItem>['columns'] = [
    {
      title: t('MainStatUpgrade'), // Main Stat Upgrade
      dataIndex: 'stat',
      align: 'center',
      width: 200,
      rowScope: 'row',
      render: (stat: MainStats, upgrade: MainStatUpgradeItem) => (
        upgrade.setUpgradeRequest
          ? (
            <Flex align='center' gap={3}>
              <img src={Assets.getSetImage(upgrade.setUpgradeRequest.simRelicSet1)} style={{ width: iconSize, height: iconSize }} />
              <img src={Assets.getSetImage(upgrade.setUpgradeRequest.simRelicSet2)} style={{ width: iconSize, height: iconSize }} />
              <span></span>
              <img src={Assets.getSetImage(upgrade.setUpgradeRequest.simOrnamentSet)} style={{ width: iconSize, height: iconSize, marginLeft: 3 }} />
            </Flex>
          )
          : (
            <Flex align='center' gap={5}>
              <img src={Assets.getPart(upgrade.part)} style={{ width: iconSize, height: iconSize, marginLeft: 3, marginRight: 3 }} />
              <span>➔</span>
              <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize }} />
              <span>{`${tCommon(`ShortReadableStats.${stat}`)}`}</span>
            </Flex>
          )
      ),
    },
    // @ts-ignore
    ...sharedScoreUpgradeColumns(t),
  ]

  return (
    <Table<MainStatUpgradeItem>
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

export function sharedScoreUpgradeColumns(t: TFunction<'charactersTab', 'CharacterPreview.SubstatUpgradeComparisons'>): TableProps['columns'] {
  return [
    {
      title: t('DpsScorePercentUpgrade'), // DPS Score Δ %
      dataIndex: 'scorePercentUpgrade',
      align: 'center',
      render: (n: number, record: AnyObject) => (
        (record as SubstatUpgradeItem)?.stat == Stats.SPD ? <>-</> : (
          <Flex align='center' justify='center' gap={5}>
            <Arrow up={n >= 0} />
            {` ${localeNumber_00(n)}%`}
          </Flex>
        )
      ),
    },
    {
      title: t('ComboDmgPercentUpgrade'), // Combo DMG Δ %
      dataIndex: 'damagePercentUpgrade',
      align: 'center',
      render: (n: number) => (
        <Flex align='center' justify='center' gap={5}>
          <Arrow up={n >= 0} />
          {` ${localeNumber_00(n)}%`}
        </Flex>
      ),
    },
    {
      title: t('UpgradedDpsScore'), // Upgraded DPS Score
      dataIndex: 'scoreValueUpgrade',
      align: 'center',
      render: (n: number, record: AnyObject) => (
        (record as SubstatUpgradeItem)?.stat == Stats.SPD ? <>-</> : (
          <>
            {`${localeNumber_0(Math.max(0, n))}%`}
          </>
        )
      ),
    },
    {
      title: t('ComboDmgUpgrade'), // Combo DMG Δ
      dataIndex: 'damageValueUpgrade',
      align: 'center',
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
