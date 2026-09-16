import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
} from '@mantine/core'
import {
  IconClipboard,
  IconTrash,
} from '@tabler/icons-react'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { BuffBuilder } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffBuilder'
import { BuffGroupPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffGroupPanel'
import { BuffPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffPanel'
import { useCombatBuffStore } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={400}
    >
      <CombatBuffsDrawerContent />
    </Drawer>
  )
}

function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })
  const { t: tBuffPanel } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const {
    clearCombatBuffs,
    addCombatBuff,
    removeCombatBuff,
    renameCombatBuff,
    toggleCombatBuff,
  } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    renameCombatBuff: s.nameCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    toggleCombatBuff: s.toggleCombatBuff,
  })))

  const {
    loadBuffFromClipboard,
    buffs,
    groups,
    groupedBuffs,
  } = useCombatBuffStore(
    useShallow((s) => ({
      loadBuffFromClipboard: s.loadBuffFromClipboard,
      buffs: s.buffs,
      groups: s.groups,
      groupedBuffs: s.groupedBuffs,
    })),
  )

  return (
    <Stack gap={defaultGap}>
      <Group>
        <Button
          flex={1}
          onClick={clearCombatBuffs}
          variant='default'
          leftSection={<IconTrash />}
        >
          {t('Clear')}
        </Button>
        <ActionIcon onClick={loadBuffFromClipboard}>
          <IconClipboard />
        </ActionIcon>
      </Group>
      <Stack gap={defaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        {groups.entries()
          .map(([id, group]) => (
            <BuffGroupPanel
              key={id}
              id={id}
              group={group}
              buffs={groupedBuffs}
              removeBuff={removeCombatBuff}
              renameBuff={renameCombatBuff}
              t={tBuffPanel}
              checked={!group.disabled}
              toggleSelection={toggleCombatBuff}
            />
          ))}
        {buffs.entries()
          .map(([id, buff]) => (
            <BuffPanel
              key={id}
              id={id}
              buff={buff}
              removeBuff={removeCombatBuff}
              renameBuff={renameCombatBuff}
              t={tBuffPanel}
              checked={!buff.disabled}
              toggleSelection={toggleCombatBuff}
            />
          ))}
      </Stack>
    </Stack>
  )
}
