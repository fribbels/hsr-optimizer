import { Cascader, ConfigProvider } from 'antd'
import React from 'react'

export enum AbilityTurnVariants {
  START_TURN,
  END_TURN,
  FULL_TURN,
  NON_TURN,
}

export function AbilityCascader() {
  const BASIC = 'BASIC'
  const SKILL = 'SKILL'
  const ULT = 'ULT'
  const FUA = 'FUA'
  const MEMO_SKILL = 'MEMO_SKILL'
  const MEMO_TALENT = 'MEMO_TALENT'

  const options = [
    {
      value: AbilityTurnVariants.START_TURN,
      label: 'Start turn',
      children: [
        { value: `(BASIC`, label: '(BASIC' },
        { value: `(SKILL`, label: '(SKILL' },
        { value: `(ULT`, label: '(ULT' },
        { value: `(FUA`, label: '(FUA' },
        { value: `(MEMO_SKILL`, label: '(MEMO_SKILL' },
        { value: `(MEMO_TALENT`, label: '(MEMO_TALENT' },
      ],
    },
    {
      value: AbilityTurnVariants.END_TURN,
      label: 'End turn',
      children: [
        { value: `BASIC)`, label: 'BASIC)' },
        { value: `SKILL)`, label: 'SKILL)' },
        { value: `ULT)`, label: 'ULT)' },
        { value: `FUA)`, label: 'FUA)' },
        { value: `MEMO_SKILL)`, label: 'MEMO_SKILL)' },
        { value: `MEMO_TALENT)`, label: 'MEMO_TALENT)' },
      ],
    },
    {
      value: AbilityTurnVariants.FULL_TURN,
      label: 'Full turn',
      children: [
        { value: `(BASIC)`, label: '(BASIC)' },
        { value: `(SKILL)`, label: '(SKILL)' },
        { value: `(ULT)`, label: '(ULT)' },
        { value: `(FUA)`, label: '(FUA)' },
        { value: `(MEMO_SKILL)`, label: '(MEMO_SKILL)' },
        { value: `(MEMO_TALENT)`, label: '(MEMO_TALENT)' },
      ],
    },
    {
      value: AbilityTurnVariants.NON_TURN,
      label: 'Out of turn',
      children: [
        { value: BASIC, label: BASIC },
        { value: SKILL, label: SKILL },
        { value: ULT, label: ULT },
        { value: FUA, label: FUA },
        { value: MEMO_SKILL, label: MEMO_SKILL },
        { value: MEMO_TALENT, label: MEMO_TALENT },
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
      <Cascader
        options={options}
        displayRender={([category, abilityType]) => abilityType}
        expandTrigger='hover'
        placeholder='Ability'
        size='small'
        allowClear
        style={{
          width: '100%',
        }}
      />
    </ConfigProvider>
  )
}
