import { Button, Flex, Form } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { SettingOutlined } from '@ant-design/icons'
import React, { useMemo } from 'react'
import { HeaderText } from 'components/HeaderText'

export const AdvancedOptionsPanel = () => {
  const setCombatBuffsDrawerOpen = window.store((s) => s.setCombatBuffsDrawerOpen)
  const setEnemyConfigurationsDrawerOpen = window.store((s) => s.setEnemyConfigurationsDrawerOpen)

  // Count the # of active buffs to display
  const formCombatBuffs = Form.useWatch((values) => values.combatBuffs, window.optimizerForm)
  const buffsActive = useMemo(() => {
    if (!formCombatBuffs) return 0

    return Object.values(formCombatBuffs).filter((x) => x != null).length
  }, [formCombatBuffs])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText style={{ marginTop: 25 }}>Advanced options</HeaderText>
      <Button
        onClick={() => setCombatBuffsDrawerOpen(true)}
        icon={<SettingOutlined />}
      >
        {`Extra combat buffs${buffsActive ? ` (${buffsActive})` : ''}`}
      </Button>
      <Button
        onClick={() => setEnemyConfigurationsDrawerOpen(true)}
        icon={<SettingOutlined />}
      >
        Enemy configurations
      </Button>
    </Flex>
  )
}
