import { Cascader, ConfigProvider, Form } from 'antd'
import { ALL_ABILITIES, createAbility, toVisual, TurnMarker } from 'lib/optimization/rotation/abilityConfig'
import React, { useMemo } from 'react'

const { SHOW_CHILD } = Cascader

const MARKER_LABELS: Record<TurnMarker, string> = {
  [TurnMarker.DEFAULT]: 'Default',
  [TurnMarker.START]: 'Start turn',
  [TurnMarker.END]: 'End turn',
  [TurnMarker.WHOLE]: 'Whole turn',
}

export function AbilityCascader({ formName }: { formName: (string | number)[] }) {
  const options = useMemo(() => {
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
  }, [])

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
    </ConfigProvider>
  )
}
