import { Cascader, ConfigProvider, Form } from 'antd'
import { ALL_ABILITIES, createAbility, NULL_TURN_ABILITY, toVisual, TurnAbilityName, TurnMarker } from 'lib/optimization/rotation/abilityConfig'
import { updateAbilityRotation } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useMemo } from 'react'

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
    <Form.Item
      name={formName}
      getValueFromEvent={(value: [TurnMarker, TurnAbilityName]) => value?.[1] || null}
      getValueProps={(value: TurnAbilityName) => ({
        value: value ? [findMarkerForAbility(value), value] : undefined,
      })}
      noStyle
    >
      <Cascader
        options={options}
        displayRender={([, abilityType]) => abilityType}
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

// Helper function to find the marker for a given ability name
function findMarkerForAbility(abilityName: TurnAbilityName): TurnMarker {
  for (const marker of Object.values(TurnMarker)) {
    const ability = ALL_ABILITIES.find((a) => {
      const fullAbility = createAbility(a, marker)
      return fullAbility.name === abilityName
    })
    if (ability) return marker
  }
  return TurnMarker.DEFAULT
}

export function ControlledTurnAbilitySelector({ index, value }: { index: number; value: TurnAbilityName }) {
  const options = useMemo(() => generateOptions(), [])

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader
        options={options}
        displayRender={([, abilityType]) => abilityType}
        expandTrigger='hover'
        placeholder='Ability'
        showCheckedStrategy={SHOW_CHILD}
        size='small'
        allowClear
        style={{ width: '100%', height: 22 }}
        // @ts-ignore
        value={value}
        // @ts-ignore
        onChange={(value: [TurnMarker, TurnAbilityName]) => {
        // @ts-ignore
          updateAbilityRotation(index, value[1])
        }}
        onClear={() => updateAbilityRotation(index, NULL_TURN_ABILITY.name)}
      />
    </ConfigProvider>
  )
}
