import {
  Flex,
  Table,
  Tooltip,
} from '@mantine/core'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import {
  type DataIndex,
  type SharedScoreColumn,
  sharedScoreUpgradeColumns,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import type { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import {
  memo,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'

import { iconSize } from 'lib/constants/constantsUi'
import { useToggle } from 'lib/hooks/useToggle'
import { Assets } from 'lib/rendering/assets'
import {
  getTeammateOption,
  isRelicOption,
} from 'lib/sets/setConfigRegistry'
import { Caret } from 'lib/ui/Caret'
import styles from './DpsScoreTeammateUpgradesTable.module.css'

const emptyGroupedUpgrade: GroupedUpgrade = {
  ids: new Set(),
  set: new Set(),
  data: {
    damagePercentUpgrade: null,
    damageValueUpgrade: null,
    scorePercentUpgrade: null,
    scoreValueUpgrade: null,
  },
}

const alwaysRowsLength = 4
const emptyRows = Array.from<GroupedUpgrade>({ length: alwaysRowsLength }).fill(emptyGroupedUpgrade)

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
  const result = useSimScoringContext(ScoringSelector.Upgrades)

  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })

  const [showOptionRows, toggleOptionRows] = useToggle()

  const sharedCols = useMemo(() => sharedScoreUpgradeColumns(t), [t])

  const tableHead = (
    <Table.Thead>
      <Table.Tr>
        <Table.Th
          className={styles.headerCell}
          onClick={() => {
            if (result) toggleOptionRows()
          }}
        >
          <Flex style={{ gap: 16, marginLeft: 8, cursor: result === null ? undefined : 'pointer' }}>
            <Caret active={showOptionRows} />
            <span>{t('TeammateUpgrade') /* Teammate Upgrade */}</span>
          </Flex>
        </Table.Th>
        {sharedCols.map((col) => <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>)}
      </Table.Tr>
    </Table.Thead>
  )

  if (!result) {
    return (
      <>
        <Table className={styles.table}>
          {tableHead}
          <Table.Tbody>
            {emptyRows.map((row, idx) => <Row key={idx} row={row} sharedCols={sharedCols} />)}
          </Table.Tbody>
        </Table>
      </>
    )
  }

  const form = result.simulationForm

  const groupedUpgrades = groupUpgrades(result.teammateOrnamentUpgradeResults, form, result.originalSimScore)

  const alwaysRows = groupedUpgrades.slice(0, alwaysRowsLength)
  const optionRows = groupedUpgrades.slice(alwaysRowsLength)

  return (
    <Table className={styles.table}>
      {tableHead}
      <Table.Tbody>
        {alwaysRows.map((row, idx) => <Row key={idx} row={row} sharedCols={sharedCols} />)}
        {showOptionRows && optionRows.map((row, idx) => <Row key={idx} row={row} sharedCols={sharedCols} />)}
      </Table.Tbody>
    </Table>
  )
})

function Row({ row, sharedCols }: { row: GroupedUpgrade, sharedCols: SharedScoreColumn[] }) {
  return (
    <Table.Tr>
      <Table.Td className={styles.centeredCell}>
        <Flex gap={8}>
          <span>
            {Array.from(row.ids).map((id) => <img src={Assets.getCharacterAvatarById(id)} key={id} height={iconSize} />)}
          </span>
          {row.oldSet && <TeammateSetImageWithTooltip value={row.oldSet} removed />}
          ➔
          <Flex>
            {Array.from(row.set).map((set) => <TeammateSetImageWithTooltip value={set} key={set} />)}
          </Flex>
        </Flex>
      </Table.Td>
      {sharedCols.map((col) => (
        <Table.Td key={col.key} className={styles.centeredCell}>
          {col.render(row.data[col.dataIndex])}
        </Table.Td>
      ))}
    </Table.Tr>
  )
}

interface GroupedUpgrade {
  ids: Set<CharacterId>
  set: Set<string>
  oldSet?: string
  data: Record<DataIndex, number | null>
}

interface PreGroupedUpgrade {
  id: CharacterId
  set: Set<string>
  oldSet?: string
  simScore: number
}

function groupUpgrades(upgrades: Array<SimulationStatUpgrade>, form: Form, originalSimScore: number): Array<GroupedUpgrade> {
  upgrades.sort((a, b) => {
    const indexDiff = a.teammate!.localeCompare(b.teammate!)
    return indexDiff || b.simulationResult.simScore - a.simulationResult.simScore
  })

  const preGroupedUpgrades: Array<PreGroupedUpgrade> = []
  upgrades.forEach((upgrade) => {
    const latestGroup = preGroupedUpgrades.at(-1)
    const id = form[upgrade.teammate!].characterId
    if (
      latestGroup
      && latestGroup.id === id
      && latestGroup.simScore === upgrade.simulationResult.simScore
    ) {
      latestGroup.set.add(upgrade.set!)
    } else {
      preGroupedUpgrades.push({
        id,
        set: new Set([upgrade.set!]),
        oldSet: form[upgrade.teammate!].teamOrnamentSet,
        simScore: upgrade.simulationResult.simScore,
      })
    }
  })

  preGroupedUpgrades.sort((a, b) => b.simScore - a.simScore)

  const groupedUpgrades: Array<GroupedUpgrade> = []
  preGroupedUpgrades.forEach((group) => {
    let latestGroup = groupedUpgrades.at(-1)
    if (
      latestGroup
      && latestGroup.oldSet === group.oldSet
      && latestGroup.set.symmetricDifference(group.set).size === 0
      && latestGroup.data.damageValueUpgrade === group.simScore - originalSimScore
    ) {
      latestGroup.ids.add(group.id)
      return
    } 
    // special case needed for the "no-op" set changes
    latestGroup = groupedUpgrades.at(-2)
    if (
      latestGroup
      && latestGroup.oldSet === group.oldSet
      && latestGroup.set.symmetricDifference(group.set).size === 0
      && latestGroup.data.damageValueUpgrade === group.simScore - originalSimScore
    ) {
      latestGroup.ids.add(group.id)
    } else {
      const { id, simScore, ...rest } = group
      groupedUpgrades.push({
        ...rest,
        ids: new Set([group.id]),
        data: {
          scorePercentUpgrade: null,
          scoreValueUpgrade: null,
          damageValueUpgrade: group.simScore - originalSimScore,
          damagePercentUpgrade: 100 * (group.simScore - originalSimScore) / originalSimScore,
        },
      })
    }
  })

  return groupedUpgrades
}

export function TeammateSetImageWithTooltip({ value, removed }: { value: string, removed?: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const height = iconSize
  const width = iconSize
  const option = getTeammateOption(value)
  if (!option) return null
  const desc = option.desc(t)
  return (
    <Tooltip label={desc}>
      <div style={{ display: 'flex', gap: 3, opacity: removed ? 0.5 : undefined }}>
        <img src={Assets.getSetImage(value)} style={{ width, height }} />
        {isRelicOption(value) && <img src={Assets.getSetImage(value)} style={{ width, height }} />}
      </div>
    </Tooltip>
  )
}
