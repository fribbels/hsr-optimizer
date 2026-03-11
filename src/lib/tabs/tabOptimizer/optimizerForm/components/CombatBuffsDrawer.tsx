import { Drawer, Flex, Text } from '@mantine/core'
import { CombatBuffs } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const CombatBuffsDrawer = () => {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)

  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  const combatBuffsList = useMemo(() => {
    return Object.values(CombatBuffs).map((x) => (
      // @ts-ignore
      <CombatBuff title={t(`${x.key}`)} name={x.key} key={x.key} />
    ))
  }, [t])

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={300}
    >
      <Flex direction="column" gap={defaultGap}>
        <Flex direction="column" gap={optimizerTabDefaultGap}>
          {combatBuffsList}
        </Flex>
      </Flex>
    </Drawer>
  )
}

function CombatBuff(props: { title: string; name: string }) {
  const value = useOptimizerRequestStore((s) => s.combatBuffs[props.name])

  return (
    <Flex justify='space-between'>
      <Text>
        {props.title}
      </Text>
      <InputNumberStyled
        size='xs'
        hideControls
        value={value}
        onChange={(val) => useOptimizerRequestStore.getState().setCombatBuff(props.name, (val as number) ?? 0)}
      />
    </Flex>
  )
}
