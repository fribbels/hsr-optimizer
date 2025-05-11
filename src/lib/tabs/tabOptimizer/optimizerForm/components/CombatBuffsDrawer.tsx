import { Drawer, Flex, Form, Typography } from 'antd'
import { CombatBuffs } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { OpenCloseIDs, useOpenClose } from 'lib/hooks/useOpenClose'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export const CombatBuffsDrawer = () => {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)

  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  const combatBuffsList = useMemo(() => {
    return Object.values(CombatBuffs).map((x) => (
      // @ts-ignore
      <CombatBuff title={t(`${x.key}`)} name={x.key} key={x.key}/>
    ))
  }, [t])

  return (
    <Drawer
      title={t('Title')}// 'Extra combat buffs'
      placement='right'
      onClose={closeBuffsDrawer}
      open={isOpenBuffsDrawer}
      width={300}
      forceRender
    >
      <Flex vertical gap={defaultGap}>
        <Flex vertical gap={optimizerTabDefaultGap}>
          {combatBuffsList}
        </Flex>
      </Flex>
    </Drawer>
  )
}

function CombatBuff(props: { title: string; name: string }) {
  return (
    <Flex justify='space-between'>
      <Text>
        {props.title}
      </Text>
      <Form.Item name={['combatBuffs', props.name]}>
        <InputNumberStyled size='small' controls={false}/>
      </Form.Item>
    </Flex>
  )
}
