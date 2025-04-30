import { Cascader, ConfigProvider, Form } from 'antd'
import {
  DEFAULT_BASIC,
  DEFAULT_FUA,
  DEFAULT_MEMO_SKILL,
  DEFAULT_MEMO_TALENT,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  END_BASIC,
  END_FUA,
  END_MEMO_SKILL,
  END_MEMO_TALENT,
  END_SKILL,
  END_ULT,
  START_BASIC,
  START_FUA,
  START_MEMO_SKILL,
  START_MEMO_TALENT,
  START_SKILL,
  START_ULT,
  toVisual,
  TurnMarker,
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
        { value: START_BASIC.name, label: toVisual(START_BASIC) },
        { value: START_SKILL.name, label: toVisual(START_SKILL) },
        { value: START_ULT.name, label: toVisual(START_ULT) },
        { value: START_FUA.name, label: toVisual(START_FUA) },
        { value: START_MEMO_SKILL.name, label: toVisual(START_MEMO_SKILL) },
        { value: START_MEMO_TALENT.name, label: toVisual(START_MEMO_TALENT) },
      ],
    },
    {
      value: TurnMarker.END,
      label: 'End turn',
      children: [
        { value: END_BASIC.name, label: toVisual(END_BASIC) },
        { value: END_SKILL.name, label: toVisual(END_SKILL) },
        { value: END_ULT.name, label: toVisual(END_ULT) },
        { value: END_FUA.name, label: toVisual(END_FUA) },
        { value: END_MEMO_SKILL.name, label: toVisual(END_MEMO_SKILL) },
        { value: END_MEMO_TALENT.name, label: toVisual(END_MEMO_TALENT) },
      ],
    },
    {
      value: TurnMarker.WHOLE,
      label: 'Whole turn',
      children: [
        { value: WHOLE_BASIC.name, label: toVisual(WHOLE_BASIC) },
        { value: WHOLE_SKILL.name, label: toVisual(WHOLE_SKILL) },
        { value: WHOLE_ULT.name, label: toVisual(WHOLE_ULT) },
        { value: WHOLE_FUA.name, label: toVisual(WHOLE_FUA) },
        { value: WHOLE_MEMO_SKILL.name, label: toVisual(WHOLE_MEMO_SKILL) },
        { value: WHOLE_MEMO_TALENT.name, label: toVisual(WHOLE_MEMO_TALENT) },
      ],
    },
    {
      value: TurnMarker.DEFAULT,
      label: 'Normal',
      children: [
        { value: DEFAULT_BASIC.name, label: toVisual(DEFAULT_BASIC) },
        { value: DEFAULT_SKILL.name, label: toVisual(DEFAULT_SKILL) },
        { value: DEFAULT_ULT.name, label: toVisual(DEFAULT_ULT) },
        { value: DEFAULT_FUA.name, label: toVisual(DEFAULT_FUA) },
        { value: DEFAULT_MEMO_SKILL.name, label: toVisual(DEFAULT_MEMO_SKILL) },
        { value: DEFAULT_MEMO_TALENT.name, label: toVisual(DEFAULT_MEMO_TALENT) },
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
