import { Flex, Form, Typography } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import React from 'react'
import { HeaderText } from 'components/HeaderText'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled'

const { Text } = Typography

export const ComboFilters = () => {
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText>Rotation COMBO formula</HeaderText>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <ComboRow title="Basic DMG" name="BASIC"/>
        <ComboRow title="Skill DMG" name="SKILL"/>
        <ComboRow title="Ult DMG" name="ULT"/>
        <ComboRow title="Fua DMG" name="FUA"/>
        <ComboRow title="Dot DMG" name="DOT"/>
        <ComboRow title="Break DMG" name="BREAK"/>
      </Flex>
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
