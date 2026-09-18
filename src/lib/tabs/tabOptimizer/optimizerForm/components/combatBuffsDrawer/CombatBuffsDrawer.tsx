import { PointerActivationConstraints } from '@dnd-kit/dom'
import {
  DragDropProvider,
  PointerSensor,
} from '@dnd-kit/react'
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
import {
  loadBuffFromClipboard,
  useCombatBuffStore,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type CombatBuff,
  CombatBuffType,
} from 'types/form'
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

const sensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 5 }),
    ],
  }),
]

const CombatBuffsDrawerContent = memo(function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })
  const { t: tBuffPanel } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const {
    clearCombatBuffs,
    addCombatBuff,
    removeCombatBuff,
    renameCombatBuff,
    toggleCombatBuff,
    combatBuffs,
  } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    renameCombatBuff: s.nameCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    toggleCombatBuff: s.toggleCombatBuff,
    combatBuffs: s.combatBuffs,
  })))

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
        <DragDropProvider sensors={sensors}>
          {combatBuffs
            .map((buff) => {
              switch (buff.type) {
                case CombatBuffType.Group:
                  const groupedBuffs = combatBuffs.reduce((acc, cur) => {
                    if (buff.buffs.includes(cur.id)) acc.set(cur.id, cur as CombatBuff)
                    return acc
                  }, new Map<string, CombatBuff>())
                  return (
                    <BuffGroupPanel
                      key={buff.id}
                      id={buff.id}
                      group={buff}
                      buffs={groupedBuffs}
                      removeBuff={removeCombatBuff}
                      renameBuff={renameCombatBuff}
                      t={tBuffPanel}
                      checked={!buff.disabled}
                      toggleSelection={toggleCombatBuff}
                    />
                  )
                case CombatBuffType.StatBuff:
                case CombatBuffType.ActionModifier:
                  return (
                    <BuffPanel
                      key={buff.id}
                      id={buff.id}
                      buff={buff}
                      removeBuff={removeCombatBuff}
                      renameBuff={renameCombatBuff}
                      t={tBuffPanel}
                      checked={!buff.disabled}
                      toggleSelection={toggleCombatBuff}
                    />
                  )
              }
            })}
        </DragDropProvider>
      </Stack>
    </Stack>
  )
})
