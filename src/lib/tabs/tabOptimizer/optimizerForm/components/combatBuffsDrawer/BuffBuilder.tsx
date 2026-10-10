import {
  Button,
  Flex,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  type SegmentedControlItem,
  Stack,
} from '@mantine/core'
import { Message } from 'lib/interactions/message'
import {
  getAKeyConfig,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { DamageTagSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/DamageTagSelect'
import { StatSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/StatSelect'
import { TargetTagSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/TargetTagSelect'
import {
  type CombatBuffStoreState,
  useCombatBuffStore,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import { uuid } from 'lib/utils/miscUtils'
import {
  type CombatBuff,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'
import { ElementTagSelect } from './ElementTagSelect'

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

function StatBuffBuilder({
  addBuff,
  hidden,
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean,
}) {
  const {
    stat,
    setStat,
    value,
    setValue,
    targetTag,
    setTargetTag,
    damageTags,
    setDamageTags,
    elementTags,
    setElementTags,
  } = useCombatBuffStore(useShallow((s) => ({
    stat: s.stat,
    setStat: s.setStat,
    value: s.value,
    setValue: s.setValue,
    targetTag: s.targetTag,
    setTargetTag: s.setTargetTag,
    damageTags: s.damageTags,
    setDamageTags: s.setDamageTags,
    elementTags: s.elementTags,
    setElementTags: s.setElementTags,
  })))

  const suffix = getSuffix(stat)

  const hitTagsDisabled = stat !== null && !isHitAKey(stat)

  return (
    // TODO: add <Hint/> to the various selects
    <Stack gap={4} style={{ display: hidden ? 'none' : undefined }}>
      <Group gap={8}>
        <StatSelect value={stat} onChange={setStat} style={{ flex: 7 }} />
        <NumberInput
          flex={2}
          suffix={suffix}
          value={value}
          onChange={setValue}
          label='value'
          hideControls
        />
      </Group>
      <TargetTagSelect value={targetTag} onChange={setTargetTag} />
      <DamageTagSelect disabled={hitTagsDisabled} value={damageTags} onChange={setDamageTags} />
      <ElementTagSelect disabled={hitTagsDisabled} value={elementTags} onChange={setElementTags} />
      <Button
        onClick={() => {
          console.log(
            stat,
            value,
            targetTag,
            damageTags,
          )
          const buff = validateStatBuff(stat, value, damageTags, targetTag, elementTags)
          if (!buff) return
          addBuff(buff)
        }}
      >
        Apply buff
      </Button>
    </Stack>
  )
}

function validateStatBuff(
  statKey: CombatStatBuff['statKey'] | null,
  value: CombatStatBuff['value'] | string,
  damageTags: CombatStatBuff['damageTags'],
  targetTag: CombatStatBuff['targetTag'] | null,
  elementTags: CombatStatBuff['elementTags'],
): CombatStatBuff | null {
  if (statKey === null) {
    Message.error('stat is missing')
    return null
  }
  if (typeof value === 'string') {
    Message.error('invalid value')
    return null
  }
  if ((damageTags.length + elementTags.length) && !isHitAKey(statKey)) {
    // this shouldn't fire due to the special handling in setStat, but just to be safe
    Message.error('stat not compatible with damage type filtering')
    return null
  }
  const buff: CombatStatBuff = {
    statKey,
    value,
    damageTags,
    elementTags,
    targetTag: targetTag ?? TargetTag.FullTeam,
    type: CombatBuffType.StatBuff,
    disabled: false,
    id: uuid(),
  }
  console.log('adding buff', buff)
  return buff
}

function getSuffix(stat: CombatStatBuff['statKey'] | null): string | undefined {
  if (stat === null || getAKeyConfig(stat).flat) return
  return '%'
}

function ActionModifierBuilder({
  addBuff,
  hidden,
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean,
}) {
  return <Flex style={{ display: hidden ? 'none' : undefined }}></Flex>
}
