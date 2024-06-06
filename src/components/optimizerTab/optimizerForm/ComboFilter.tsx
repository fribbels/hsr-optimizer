import { Button, Flex, Form, Typography } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { SettingOutlined } from '@ant-design/icons'
import React, { useMemo } from 'react'
import { HeaderText } from 'components/HeaderText'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled'

const { Text } = Typography

export const ComboFilters = () => {
  const setCombatBuffsDrawerOpen = window.store((s) => s.setCombatBuffsDrawerOpen)

  // Count the # of active buffs to display
  const formCombatBuffs = Form.useWatch((values) => values.combatBuffs, window.optimizerForm)
  const buffsActive = useMemo(() => {
    if (!formCombatBuffs) return 0

    return Object.values(formCombatBuffs).filter((x) => x != null).length
  }, [formCombatBuffs])

  return (

    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText>Rotation COMBO formula</HeaderText>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <ComboRow title="Basic DMG" name="BASIC" />
        <ComboRow title="Skill DMG" name="SKILL" />
        <ComboRow title="Ult DMG" name="ULT" />
        <ComboRow title="Fua DMG" name="FUA" />
        <ComboRow title="Dot DMG" name="DOT" />
        <ComboRow title="Break DMG" name="BREAK" />
      </Flex>

      <HeaderText style={{ marginTop: 60 }}>Additional options</HeaderText>
      <Button
        onClick={() => setCombatBuffsDrawerOpen(true)}
        icon={<SettingOutlined />}
      >
        {`Extra combat buffs${buffsActive ? ` (${buffsActive})` : ''}`}
      </Button>
    </Flex>
  )
}

function ComboRow(props: { title: string; name: string }) {
  return (
    <Flex justify="space-between">
      <Text>
        {props.title}
      </Text>
      <Form.Item name={['combo', props.name]}>
        <InputNumberStyled
          addonBefore="⨯"
          size="small"
          controls={true}
          style={{ width: 90 }}
          rootClassName="comboInputNumber"
        />
      </Form.Item>
    </Flex>
  )
}
