import { Cascader, ConfigProvider, Form } from 'antd'
import { ALL_ABILITIES, createAbility, NULL_TURN_ABILITY, toTurnAbility, toVisual, TurnAbility, TurnAbilityName, TurnMarker } from 'lib/optimization/rotation/abilityConfig'
import { updateAbilityRotation } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import React, { useMemo } from 'react'

const { SHOW_CHILD } = Cascader

const MARKER_LABELS: Record<TurnMarker, string> = {
  [TurnMarker.DEFAULT]: 'Default',
  [TurnMarker.START]: 'Start turn',
  [TurnMarker.END]: 'End turn',
  [TurnMarker.WHOLE]: 'Whole turn',
}

const cascaderTheme = {
  components: {
    Cascader: {
      dropdownHeight: 170,
      controlWidth: 100,
      optionPadding: '2px 12px',
      controlItemWidth: 150,
    },
  },
}

function generateOptions() {
  return Object.values(TurnMarker)
    .map((marker) => ({
      value: marker,
      label: MARKER_LABELS[marker],
      children: ALL_ABILITIES.map((kind) => {
        const ability = createAbility(kind, marker)
        return {
          value: ability.name,
          label: toVisual(ability),
        }
      }),
    }))
}

export function TurnAbilitySelector({ formName }: { formName: (string | number)[] }) {
  const options = useMemo(() => generateOptions(), [])

  return (
    <Form.Item name={formName} noStyle>
      <Cascader
        options={options}
        displayRender={([category, abilityType]) => abilityType}
        expandTrigger='hover'
        placeholder='Ability'
        showCheckedStrategy={SHOW_CHILD}
        size='small'
        allowClear
        style={{ width: '100%', height: 22 }}
      />
    </Form.Item>
  )
}

export function ControlledTurnAbilitySelector({ index, value }: { index: number; value: TurnAbility }) {
  const options = useMemo(() => generateOptions(), [])

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader
        options={options}
        displayRender={([category, abilityType]) => abilityType}
        expandTrigger='hover'
        placeholder='Ability'
        showCheckedStrategy={SHOW_CHILD}
        size='small'
        allowClear
        style={{ width: '100%', height: 22 }}
        // @ts-ignore
        value={value.name}
        // @ts-ignore
        onChange={(value: [TurnMarker, TurnAbilityName]) => {
          updateAbilityRotation(index, toTurnAbility(value[1]))
        }}
        onClear={() => {
          updateAbilityRotation(index, NULL_TURN_ABILITY)
        }}
      />
    </ConfigProvider>
  )
}
