import { Flex, Text } from '@mantine/core'
import {
  Drawer,
} from 'antd'
import { CombatBuffs } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
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
      placement='right'
      onClose={closeBuffsDrawer}
      open={isOpenBuffsDrawer}
      width={300}
      forceRender
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
  const value = useOptimizerFormStore((s) => s.combatBuffs[props.name])

  return (
    <Flex justify='space-between'>
      <Text>
        {props.title}
      </Text>
      <InputNumberStyled
        size='small'
        controls={false}
        value={value}
        onChange={(val) => useOptimizerFormStore.getState().setCombatBuff(props.name, (val as number) ?? 0)}
      />
    </Flex>
  )
}
