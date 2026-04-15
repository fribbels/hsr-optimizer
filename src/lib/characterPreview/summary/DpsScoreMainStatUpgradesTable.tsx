import {
  Table,
  Tooltip,
} from '@mantine/core'
import type { TFunction } from 'i18next'
import type { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import {
  ScoringSelector,
  SimScoringContext,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import styles from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable.module.css'
import {
  type MainStatParts,
  type MainStats,
  Parts,
  PartsArray,
  type Sets,
  type StatsValues,
} from 'lib/constants/constants'
import { Stats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Assets } from 'lib/rendering/assets'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { setToId } from 'lib/sets/setConfigRegistry'
import type { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import {
  arrowColor,
  arrowDirection,
} from 'lib/utils/displayUtils'
import {
  localeNumber_0,
  localeNumber_00,
} from 'lib/utils/i18nUtils'
import {
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

type MainStatUpgradeItem = {
  key: string,
  stat: MainStats,
  part: Parts,
  setUpgradeRequest?: SimulationRequest,
  scorePercentUpgrade: number,
  scoreValueUpgrade: number,
  damagePercentUpgrade: number,
  damageValueUpgrade: number,
}

export const DpsScoreMainStatUpgradesTable = memo(function DpsScoreMainStatUpgradesTable({ meta, relics }: {
  meta: ShowcaseMetadata,
  relics: SingleRelicByPart,
}) {
  const { t: tCommon } = useTranslation(['common', 'charactersTab'])
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })
  const upgradesPromise = useContext(SimScoringContext).upgradePromise

  const sharedCols = useMemo(() => sharedScoreUpgradeColumns(t), [t])

  const initialRankMapping = useMemo(() => {
    const simMeta = meta.characterMetadata.scoringMetadata.simulation!
    const rankMapping: Record<MainStatParts, Partial<Record<MainStats, number>>> = {
      [Parts.Body]: {},
      [Parts.Feet]: {},
      [Parts.PlanarSphere]: {},
      [Parts.LinkRope]: {},
    }
    let upgradeCount = 0
    for (const part of PartsArray) {
      if (part === Parts.Head || part === Parts.Hands) continue
      if (relics[part]?.main.stat === Stats.SPD) continue

      if (
        simMeta.errRopeEidolon != undefined
        && meta.characterEidolon >= simMeta.errRopeEidolon
        && relics[part]?.main.stat === Stats.ERR
      ) continue
      ;(simMeta.parts[part] ?? []).forEach((mainstat) => {
        if (mainstat === relics[part]?.main.stat) return
        if (mainstat === Stats.SPD) return
        rankMapping[part][mainstat] = upgradeCount++
      })
    }
    return rankMapping
  }, [meta, relics])

  const [sortedRankMapping, setSortedRankMapping] = useState(initialRankMapping)
  const [resolvedScore, setResolvedScore] = useState<SimulationScore | null>(null)

  // need to resync when changing character
  useEffect(() => {
    setSortedRankMapping(initialRankMapping)
    setResolvedScore(null)
  }, [initialRankMapping])

  useEffect(() => {
    let cancelled = false
    upgradesPromise.then((score) => {
      if (cancelled) return
      setResolvedScore(score)
      if (score === null) return
      setSortedRankMapping(score.mainUpgrades.reduce((acc, cur, idx) => {
        if (cur.stat && cur.part) acc[cur.part][cur.stat as MainStats] = idx
        return acc
      }, {
        [Parts.Body]: {},
        [Parts.Feet]: {},
        [Parts.PlanarSphere]: {},
        [Parts.LinkRope]: {},
      } as Record<MainStatParts, Partial<Record<MainStats, number>>>))
    })
    return () => {
      cancelled = true
    }
  }, [upgradesPromise])

  const iterator: Array<[MainStatParts, MainStats]> = (Object.keys(initialRankMapping) as MainStatParts[])
    .flatMap((part) => {
      return (Object.keys(initialRankMapping[part]) as MainStats[]).map((mainstat) => {
        return [part, mainstat] as [MainStatParts, MainStats]
      })
    })

  return (
    <Table
      className={styles.table}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.headerCell}>{t('MainStatUpgrade')}</Table.Th>
          {sharedCols.map((col) => <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>)}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <SetUpgradeRow sharedCols={sharedCols} />
        {iterator.map(([part, stat]) => {
          return (
            <Table.Tr
              key={part + stat}
              style={{
                position: 'relative',
                top: calculateOffset(initialRankMapping, stat, part, sortedRankMapping),
                transition: 'top ease-in-out 0.5s',
              }}
            >
              <Table.Td className={styles.centeredCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <img src={Assets.getPart(part)} className={styles.partIcon} style={{ width: iconSize, height: iconSize }} />
                  <span>➔</span>
                  <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize }} />
                  <span>{`${tCommon(`ShortReadableStats.${stat}`)}`}</span>
                </div>
              </Table.Td>
              <SuspendedValues sharedCols={sharedCols} part={part} stat={stat} resolvedScore={resolvedScore} />
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
})

const SuspendedValues = memo(function({ sharedCols, part, stat, resolvedScore }: {
  sharedCols: SharedScoreColumn[],
  part: MainStatParts,
  stat: MainStats,
  resolvedScore: SimulationScore | null,
}) {
  const upgrade = resolvedScore?.mainUpgrades.find((u) => u.part === part && u.stat === stat)
  const data = upgrade
    ? { key: stat + part, stat, part, ...sharedSimResultComparator(resolvedScore!, upgrade) } as MainStatUpgradeItem
    : null

  return sharedCols.map((col) => (
    <Table.Td key={col.key} className={styles.centeredCell}>
      {data && col.render(data[col.dataIndex as keyof MainStatUpgradeItem] as number, stat)}
    </Table.Td>
  ))
})

const SetUpgradeRow = memo(function({ sharedCols }: { sharedCols: SharedScoreColumn[] }) {
  const result = useSimScoringContext(ScoringSelector.Upgrades)

  const setUpgrade = result?.setUpgrades[0]

  if (!result || !setUpgrade) return null
  if ((setUpgrade.percent ?? 0) - result.percent <= 0.001) return null

  const upgrade = {
    key: 'setUpgrade',
    request: setUpgrade.simulation.request,
    ...sharedSimResultComparator(result, setUpgrade),
  } as unknown as MainStatUpgradeItem

  const { simRelicSet1, simRelicSet2, simOrnamentSet } = setUpgrade.simulation.request

  return (
    <Table.Tr key='setUpgrade'>
      <Table.Td className={styles.centeredCell}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingLeft: 4 }}>
          {simRelicSet1 === simRelicSet2
            ? <RelicDoubleImageWithTooltip name={simRelicSet1} height={iconSize} width={iconSize} />
            : (
              <>
                <RelicImageWithTooltip name={simRelicSet1} height={iconSize} width={iconSize} />
                <RelicImageWithTooltip name={simRelicSet2} height={iconSize} width={iconSize} />
              </>
            )}
          <span></span>
          <RelicImageWithTooltip name={simOrnamentSet} height={iconSize} width={iconSize} />
        </div>
      </Table.Td>
      {sharedCols.map((col) => (
        <Table.Td key={col.key} className={styles.centeredCell}>
          {col.render(upgrade[col.dataIndex as keyof MainStatUpgradeItem] as number)}
        </Table.Td>
      ))}
    </Table.Tr>
  )
})

function RelicDoubleImageWithTooltip({ name, width, height }: { name: Sets, height: number, width: number }) {
  const id = setToId[name]
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return (
    <Tooltip label={t(`${id}.Name`)}>
      <div style={{ display: 'flex', gap: 3 }}>
        <img src={Assets.getSetImage(name)} style={{ width, height }} />
        <img src={Assets.getSetImage(name)} style={{ width, height }} />
      </div>
    </Tooltip>
  )
}

function RelicImageWithTooltip({ name, width, height }: { name: Sets, height: number, width: number }) {
  const id = setToId[name]
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return (
    <Tooltip label={t(`${id}.Name`)}>
      <img src={Assets.getSetImage(name)} style={{ width, height }} />
    </Tooltip>
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

export type SharedScoreColumn = {
  key: string,
  title: string,
  dataIndex: string,
  type: 'scoreUpgrade' | 'damageUpgrade',
  render: (value: number, stat?: StatsValues) => ReactNode,
}

export function sharedScoreUpgradeColumns(t: TFunction<'charactersTab', 'CharacterPreview.SubstatUpgradeComparisons'>): SharedScoreColumn[] {
  return [
    {
      key: 'scorePercentUpgrade',
      title: t('DpsScorePercentUpgrade'), // DPS Score Δ %
      dataIndex: 'scorePercentUpgrade',
      type: 'scoreUpgrade',
      render: (n: number, stat?: StatsValues) => (
        isStatWithoutScoreUpgrade(stat) ? <>-</> : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Arrow up={n >= 0} />
            {` ${localeNumber_00(n)}%`}
          </div>
        )
      ),
    },
    {
      key: 'damagePercentUpgrade',
      title: t('ComboDmgPercentUpgrade'), // Combo DMG Δ %
      dataIndex: 'damagePercentUpgrade',
      type: 'damageUpgrade',
      render: (n: number) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Arrow up={n >= 0} />
          {` ${localeNumber_00(n)}%`}
        </div>
      ),
    },
    {
      key: 'scoreValueUpgrade',
      title: t('UpgradedDpsScore'), // Upgraded DPS Score
      dataIndex: 'scoreValueUpgrade',
      type: 'scoreUpgrade',
      render: (n: number, stat?: StatsValues) => (
        isStatWithoutScoreUpgrade(stat) ? <>-</> : (
          <>
            {`${localeNumber_0(Math.max(0, n))}%`}
          </>
        )
      ),
    },
    {
      key: 'damageValueUpgrade',
      title: t('ComboDmgUpgrade'), // Combo DMG Δ
      dataIndex: 'damageValueUpgrade',
      type: 'damageUpgrade',
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
  boxShadow: 'var(--shadow-card)',
  borderRadius: 6,
  overflow: 'hidden',
}

function Arrow({ up }: { up: boolean }) {
  return (
    <span className={styles.arrowText} style={{ color: arrowColor(up) }}>
      {arrowDirection(up)}
    </span>
  )
}

export function isStatWithoutScoreUpgrade(stat?: StatsValues) {
  return stat === Stats.SPD
}

export function calculateOffset(
  initialRanks: Record<MainStatParts, Partial<Record<MainStats, number>>>,
  stat: MainStats,
  part: MainStatParts,
  actualRanks: Record<MainStatParts, Partial<Record<MainStats, number>>>,
) {
  return (actualRanks[part][stat]! - initialRanks[part][stat]!) * 37
}
