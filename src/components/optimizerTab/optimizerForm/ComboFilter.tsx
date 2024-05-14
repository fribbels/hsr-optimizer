import { Button, Flex, Form, Typography } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { SettingOutlined } from '@ant-design/icons'
import React, { useMemo } from 'react'

const {Text} = Typography

export const ComboFilters = () => {
  const setCombatBuffsDrawerOpen = window.store((s) => s.setCombatBuffsDrawerOpen)

  // Count the # of active buffs to display
  const formCombatBuffs = Form.useWatch((values) => values.combatBuffs, window.optimizerForm)
  const buffsActive = useMemo(() => {
    if (!formCombatBuffs) return 0

    return Object.values(formCombatBuffs).filter(x => x != null).length
  }, [formCombatBuffs])

  return (

    <Flex vertical gap={optimizerTabDefaultGap}>
      <Button
        onClick={() => setCombatBuffsDrawerOpen(true)}
        icon={<SettingOutlined/>}
      >
        {`Extra combat buffs${buffsActive ? ` (${buffsActive})` : ''}`}
      </Button>

      <Flex justify="center" align='center' style={{marginTop: 120}}>
        (Under construction)
      </Flex>
    </Flex>
  )
}
