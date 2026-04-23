import {
  Drawer,
  Flex,
} from '@mantine/core'
import { CombatBuffs } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={300}
    >
      {isOpenBuffsDrawer && <CombatBuffsDrawerContent />}
    </Drawer>
  )
}

function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  const combatBuffsList = useMemo(() => {
    return Object.values(CombatBuffs).map((x) => <CombatBuff title={t(`${x.key}` as never)} name={x.key} key={x.key} />)
  }, [t])

  return (
    <Flex direction='column' gap={defaultGap}>
      <Flex direction='column' gap={optimizerTabDefaultGap}>
        {combatBuffsList}
      </Flex>
    </Flex>
  )
}

function CombatBuff({ title, name }: { title: string, name: string }) {
  const value = useOptimizerRequestStore((s) => s.combatBuffs[name])

  return (
    <Flex justify='space-between'>
      <div>
        {title}
      </div>
      <InputNumberStyled
        hideControls
        // Coerce undefined → 0 to keep Mantine's useUncontrolled in controlled mode.
        // combatBuffs is seeded to 0 for all known keys, but a new buff key on an old save
        // state could slip through as undefined. See `.claude/react-guidelines.md` → "Mantine Controlled Inputs".
        value={value ?? 0}
        onChange={(val: number | string) => useOptimizerRequestStore.getState().setCombatBuff(name, typeof val === 'number' ? val : 0)}
      />
    </Flex>
  )
}
