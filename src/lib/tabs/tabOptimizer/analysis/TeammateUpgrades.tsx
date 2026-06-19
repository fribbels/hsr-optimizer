import {
  Flex,
  Table,
} from '@mantine/core'
import { useToggle } from '@mantine/hooks'
import { IconChevronRight } from '@tabler/icons-react'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import {
  getTeammateOption,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  TEAMMATE_UPGRADE_PRECISION,
  type TeammateSetUpgrade,
} from 'lib/simulations/teammateUpgradeGrouping'
import styles from 'lib/tabs/tabOptimizer/analysis/TeammateUpgrades.module.css'
import classes from 'lib/tabs/tabOptimizer/analysis/UpgradeTable.module.css'
import { TeammateSetImageWithTooltip } from 'lib/ui/TeammateSetImage'
import {
  arrowColor,
  arrowDirection,
} from 'lib/utils/displayUtils'
import {
  localeNumber_0,
  localeNumber_00,
} from 'lib/utils/i18nUtils'
import {
  precisionRound,
  truncate100ths,
} from 'lib/utils/mathUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function PercentCell({ percent, showArrow }: { percent: number, showArrow?: boolean }) {
  const text = `${localeNumber_00(truncate100ths(percent))}%`
  if (!showArrow) return <>{text}</>
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <span style={{ color: arrowColor(percent >= 0), fontSize: 10 }}>{arrowDirection(percent >= 0)}</span>
      {` ${text}`}
    </div>
  )
}

type SetCentricRow = {
  setValue: string,
  percent: number,
  delta: number,
}

export const TeammateUpgrades = memo(function TeammateUpgrades({ groupedUpgrades, baseSimScore, variant = 'optimizer' }: {
  groupedUpgrades: TeammateSetUpgrade[],
  baseSimScore: number,
  variant?: 'optimizer' | 'characters',
}) {
  const allSlotsFilled = groupedUpgrades.length > 0 && groupedUpgrades.every((g) => !!g.oldSet)
  const [showSwaps, toggleSwaps] = useToggle([allSlotsFilled, !allSlotsFilled])
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.TeammateUpgrades.ColumnHeaders' })

  const setMap = new Map<string, number>()
  for (const group of groupedUpgrades) {
    if (group.oldSet) continue
    for (const setValue of group.set) {
      const existing = setMap.get(setValue)
      if (existing === undefined || group.simScore > existing) {
        setMap.set(setValue, group.simScore)
      }
    }
  }

  const setRows: SetCentricRow[] = []
  for (const [setValue, simScore] of setMap) {
    const delta = precisionRound(simScore - baseSimScore, TEAMMATE_UPGRADE_PRECISION)
    if (delta === 0) continue
    if (!getTeammateOption(setValue)) continue
    const percent = (delta / baseSimScore) * 100
    setRows.push({ setValue, percent, delta })
  }

  setRows.sort((a, b) => b.percent - a.percent)

  const swapRows = groupedUpgrades.filter((g) => precisionRound(g.simScore - baseSimScore, TEAMMATE_UPGRADE_PRECISION) !== 0)

  if (setRows.length === 0 && swapRows.length === 0) return null

  const isCharactersTab = variant === 'characters'

  return (
    <Table
      className={classes.upgradeTable}
      style={isCharactersTab ? { tableLayout: 'fixed' } : undefined}
    >
      {isCharactersTab && (
        <colgroup>
          <col style={{ width: 200 }} />
          <col style={{ width: 450 }} />
          <col style={{ width: 450 }} />
        </colgroup>
      )}
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={classes.substatHeader}>{t('Ornaments')}</Table.Th>
          <Table.Th className={classes.columnHeader}>{t('COMBO_DMG_P')}</Table.Th>
          <Table.Th className={classes.columnHeader}>{t('COMBO_DMG')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {setRows.map((row) => <SetRow key={row.setValue} row={row} showName={isCharactersTab} showArrow={isCharactersTab} />)}
        {swapRows.length > 0 && (
          <Table.Tr className={styles.expandRow} onClick={() => toggleSwaps()}>
            <Table.Td colSpan={3}>
              <Flex align='center' justify='center' gap={8}>
                <IconChevronRight size={16} style={{ rotate: showSwaps ? '270deg' : '90deg', transition: 'rotate 0.2s ease' }} />
              </Flex>
            </Table.Td>
          </Table.Tr>
        )}
        {showSwaps && swapRows.map((group, idx) => <SwapRow key={idx} group={group} baseSimScore={baseSimScore} showArrow={isCharactersTab} />)}
      </Table.Tbody>
    </Table>
  )
})

function SetRow({ row, showName, showArrow }: { row: SetCentricRow, showName?: boolean, showArrow?: boolean }) {
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  const setId = setToId[row.setValue as keyof typeof setToId]
  const setName = setId ? t(`${setId}.Name`) : ''

  return (
    <Table.Tr>
      <Table.Td>
        <Flex align='center' ml={3} gap={6} style={{ overflow: 'hidden' }}>
          <TeammateSetImageWithTooltip value={row.setValue} />
          {showName && (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4, marginRight: 4 }}>
              {setName}
            </span>
          )}
        </Flex>
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        <PercentCell percent={row.percent} showArrow={showArrow} />
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        {localeNumber_0(row.delta)}
      </Table.Td>
    </Table.Tr>
  )
}

function SwapRow({ group, baseSimScore, showArrow }: { group: TeammateSetUpgrade, baseSimScore: number, showArrow?: boolean }) {
  const delta = precisionRound(group.simScore - baseSimScore, TEAMMATE_UPGRADE_PRECISION)
  const percent = (delta / baseSimScore) * 100

  return (
    <Table.Tr>
      <Table.Td>
        <Flex gap={2} align='center' ml={3}>
          {showArrow && group.oldSet && getTeammateOption(group.oldSet) && (
            <>
              <TeammateSetImageWithTooltip value={group.oldSet} removed />
              ➔
            </>
          )}
          {Array.from(group.set).map((set) => <TeammateSetImageWithTooltip value={set} key={set} />)}
          <span className={styles.overlappingAvatars} style={{ marginLeft: 4 }}>
            {Array.from(group.ids).map((id) => <img src={Assets.getCharacterAvatarById(id)} key={id} width={iconSize} height={iconSize} />)}
          </span>
        </Flex>
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        <PercentCell percent={percent} showArrow={showArrow} />
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        {localeNumber_0(delta)}
      </Table.Td>
    </Table.Tr>
  )
}
