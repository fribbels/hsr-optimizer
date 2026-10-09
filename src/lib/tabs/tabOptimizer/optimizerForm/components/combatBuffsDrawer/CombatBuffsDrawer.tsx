import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
} from '@mantine/core'
import {
  IconClipboard,
  IconFolderPlus,
  IconTrash,
} from '@tabler/icons-react'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useScrollLock } from 'lib/layout/scrollController'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { BuffBuilder } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffBuilder'
import { loadBuffFromClipboard, useCombatBuffStore } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import { uuid } from 'lib/utils/miscUtils'
import { memo, } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CombatBuffType,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'
import { NestedDnD } from './nestedDnD/NestedDnD'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  useScrollLock(isOpenBuffsDrawer)

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

const CombatBuffsDrawerContent = memo(function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })
  const { t: tBuffPanel } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const {
    clearCombatBuffs,
    addCombatBuff,
  } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
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
        <ActionIcon
          onClick={() => {
            addCombatBuff({
              id: uuid(),
              type: CombatBuffType.Group,
              buffs: [],
              name: '',
              disabled: false,
            })
          }}
        >
          <IconFolderPlus />
        </ActionIcon>
        <ActionIcon onClick={loadBuffFromClipboard}>
          <IconClipboard />
        </ActionIcon>
      </Group>
      <Stack gap={defaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        <NestedDnD />
      </Stack>
    </Stack>
  )
})
