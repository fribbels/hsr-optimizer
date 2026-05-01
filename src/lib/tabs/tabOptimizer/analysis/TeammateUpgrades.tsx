import { Flex, Table } from '@mantine/core'
import { TeammateSetImageWithTooltip } from 'lib/characterPreview/summary/DpsScoreTeammateUpgradesTable'
import { iconSize } from 'lib/constants/constantsUi'
import { useToggle } from 'lib/hooks/useToggle'
import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import { Assets } from 'lib/rendering/assets'
import { getTeammateOption } from 'lib/sets/setConfigRegistry'
import {
  calculateTeammateUpgrades,
  type OptimizerResultAnalysis,
  type TeammateSetUpgrade,
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { Caret } from 'lib/ui/Caret'
import { localeNumber_0, localeNumber_00 } from 'lib/utils/i18nUtils'
import { truncate100ths } from 'lib/utils/mathUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './SubstatUpgrades.module.css'
import styles from './TeammateUpgrades.module.css'

const avatarSize = iconSize

type SetCentricRow = {
  setValue: string
  percent: number
  delta: number
}

export const TeammateUpgrades = memo(function TeammateUpgrades({ analysis }: { analysis: OptimizerResultAnalysis }) {
  const groupedUpgrades = calculateTeammateUpgrades(analysis)
  const [showSwaps, toggleSwaps] = useToggle()
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.TeammateUpgrades.ColumnHeaders' })

  const baseSimScore = analysis.newX.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)

  const setMap = new Map<string, number>()
  for (const group of groupedUpgrades) {
    for (const setValue of group.set) {
      const existing = setMap.get(setValue)
      if (existing === undefined || group.simScore > existing) {
        setMap.set(setValue, group.simScore)
      }
    }
  }

  const setRows: SetCentricRow[] = []
  for (const [setValue, simScore] of setMap) {
    const delta = simScore - baseSimScore
    if (delta <= 0) continue
    if (!getTeammateOption(setValue)) continue
    const percent = (delta / baseSimScore) * 100
    setRows.push({ setValue, percent, delta })
  }

  setRows.sort((a, b) => b.percent - a.percent)

  if (setRows.length === 0) return null

  const swapRows = groupedUpgrades.filter((g) => g.simScore - baseSimScore > 0)

  return (
    <Table className={classes.upgradeTable}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={classes.substatHeader}>{t('Ornaments')}</Table.Th>
          <Table.Th className={classes.columnHeader}>{t('COMBO_DMG_P')}</Table.Th>
          <Table.Th className={classes.columnHeader}>{t('COMBO_DMG')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {setRows.map((row) => <SetRow key={row.setValue} row={row} />)}
        {swapRows.length > 0 && (
          <Table.Tr className={styles.expandRow} onClick={toggleSwaps}>
            <Table.Td colSpan={3}>
              <Flex align="center" justify="center" gap={8}>
                <Caret active={showSwaps} inactiveAngle={90} activeAngle={270} />
              </Flex>
            </Table.Td>
          </Table.Tr>
        )}
        {showSwaps && swapRows.map((group, idx) => <SwapRow key={idx} group={group} baseSimScore={baseSimScore} />)}
      </Table.Tbody>
    </Table>
  )
})

function SetRow({ row }: { row: SetCentricRow }) {
  return (
    <Table.Tr>
      <Table.Td>
        <Flex align="center">
          <TeammateSetImageWithTooltip value={row.setValue} />
        </Flex>
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        {`${localeNumber_00(truncate100ths(row.percent))}%`}
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        {localeNumber_0(row.delta)}
      </Table.Td>
    </Table.Tr>
  )
}

function SwapRow({ group, baseSimScore }: { group: TeammateSetUpgrade, baseSimScore: number }) {
  const delta = group.simScore - baseSimScore
  const percent = (delta / baseSimScore) * 100

  return (
    <Table.Tr>
      <Table.Td>
        <Flex gap={4} align="center">
          {Array.from(group.set).map((set) => (
            <TeammateSetImageWithTooltip value={set} key={set} />
          ))}
          <span className={styles.overlappingAvatars} style={{ marginLeft: 4 }}>
            {Array.from(group.ids).map((id) => (
              <img src={Assets.getCharacterAvatarById(id)} key={id} height={avatarSize} />
            ))}
          </span>
        </Flex>
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        {`${localeNumber_00(truncate100ths(percent))}%`}
      </Table.Td>
      <Table.Td className={classes.centeredCell}>
        {localeNumber_0(delta)}
      </Table.Td>
    </Table.Tr>
  )
}
