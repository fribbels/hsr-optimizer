import {
  Paper,
  SegmentedControl,
  type SegmentedControlItem,
  Stack,
} from '@mantine/core'
import {
  type CombatBuffStoreState,
  useCombatBuffStore,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import {
  type CombatBuff,
  CombatBuffType,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'
import { StatBuffBuilder } from './StatBuffBuilder/StatBuffBuilder'
import { ActionModifierBuilder } from './ActionModifierBuilder/ActionModifierBuilder'

export function BuffBuilder({
  addBuff,
}: {
  addBuff: (buff: CombatBuff) => void,
}) {
  const options: Array<SegmentedControlItem<CombatBuffStoreState['buffBuilderMode']>> = [
    { value: CombatBuffType.StatBuff, label: 'Stat buff' },
    { value: CombatBuffType.ActionModifier, label: 'Action modifier', disabled: true },
  ]

  const { mode, setMode } = useCombatBuffStore(useShallow((s) => ({
    mode: s.buffBuilderMode,
    setMode: s.setBuffBuilderMode,
  })))

  return (
    <Paper withBorder radius='sm' p={4} shadow='xs'>
      <SegmentedControl fullWidth value={mode} onChange={setMode} data={options} data-autofocus />
      <StatBuffBuilder addBuff={addBuff} hidden={mode !== CombatBuffType.StatBuff} />
      <ActionModifierBuilder addBuff={addBuff} hidden={mode !== CombatBuffType.ActionModifier} />
    </Paper>
  )
}