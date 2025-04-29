import { Cascader, ConfigProvider, Form } from 'antd'
import {
  BASIC,
  END_BASIC,
  END_FUA,
  END_MEMO_SKILL,
  END_MEMO_TALENT,
  END_SKILL,
  END_ULT,
  FUA,
  MEMO_SKILL,
  MEMO_TALENT,
  SKILL,
  START_BASIC,
  START_FUA,
  START_MEMO_SKILL,
  START_MEMO_TALENT,
  START_SKILL,
  START_ULT,
  TurnMarker,
  ULT,
  WHOLE_BASIC,
  WHOLE_FUA,
  WHOLE_MEMO_SKILL,
  WHOLE_MEMO_TALENT,
  WHOLE_SKILL,
  WHOLE_ULT,
} from 'lib/optimization/rotation/abilityConfig'
import React from 'react'

const { SHOW_CHILD } = Cascader

export function AbilityCascader({ formName }: { formName: (string | number)[] }) {
  const options = [
    {
      value: TurnMarker.START,
      label: 'Start turn',
      children: [
        { value: START_BASIC.toString(), label: START_BASIC.toVisual() },
        { value: START_SKILL.toString(), label: START_SKILL.toVisual() },
        { value: START_ULT.toString(), label: START_ULT.toVisual() },
        { value: START_FUA.toString(), label: START_FUA.toVisual() },
        { value: START_MEMO_SKILL.toString(), label: START_MEMO_SKILL.toVisual() },
        { value: START_MEMO_TALENT.toString(), label: START_MEMO_TALENT.toVisual() },
      ],
    },
    {
      value: TurnMarker.END,
      label: 'End turn',
      children: [
        { value: END_BASIC.toString(), label: END_BASIC.toVisual() },
        { value: END_SKILL.toString(), label: END_SKILL.toVisual() },
        { value: END_ULT.toString(), label: END_ULT.toVisual() },
        { value: END_FUA.toString(), label: END_FUA.toVisual() },
        { value: END_MEMO_SKILL.toString(), label: END_MEMO_SKILL.toVisual() },
        { value: END_MEMO_TALENT.toString(), label: END_MEMO_TALENT.toVisual() },
      ],
    },
    {
      value: TurnMarker.WHOLE,
      label: 'Whole turn',
      children: [
        { value: WHOLE_BASIC.toString(), label: WHOLE_BASIC.toVisual() },
        { value: WHOLE_SKILL.toString(), label: WHOLE_SKILL.toVisual() },
        { value: WHOLE_ULT.toString(), label: WHOLE_ULT.toVisual() },
        { value: WHOLE_FUA.toString(), label: WHOLE_FUA.toVisual() },
        { value: WHOLE_MEMO_SKILL.toString(), label: WHOLE_MEMO_SKILL.toVisual() },
        { value: WHOLE_MEMO_TALENT.toString(), label: WHOLE_MEMO_TALENT.toVisual() },
      ],
    },
    {
      value: TurnMarker.DEFAULT,
      label: 'Normal',
      children: [
        { value: BASIC.toString(), label: BASIC.toVisual() },
        { value: SKILL.toString(), label: SKILL.toVisual() },
        { value: ULT.toString(), label: ULT.toVisual() },
        { value: FUA.toString(), label: FUA.toVisual() },
        { value: MEMO_SKILL.toString(), label: MEMO_SKILL.toVisual() },
        { value: MEMO_TALENT.toString(), label: MEMO_TALENT.toVisual() },
      ],
    },
  ]

  return (
    <ConfigProvider
      theme={{
        components: {
          Cascader: {
            dropdownHeight: 170,
            controlWidth: 100,
            optionPadding: '2px 12px',
            controlItemWidth: 150,
          },
        },
      }}
    >
      <Form.Item
        name={formName}
        noStyle
      >
        <Cascader
          options={options}
          displayRender={([category, abilityType]) => abilityType}
          expandTrigger='hover'
          placeholder='Ability'
          showCheckedStrategy={SHOW_CHILD}
          size='small'
          allowClear
          style={{
            width: '100%',
            height: 22,
          }}
        />
      </Form.Item>
    </ConfigProvider>
  )
}

// select-no-padding select-20
