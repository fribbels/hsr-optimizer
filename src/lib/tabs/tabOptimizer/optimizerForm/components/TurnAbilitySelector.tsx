import { Cascader, ConfigProvider, Form } from 'antd'
import { AbilityKind, ALL_ABILITIES, createAbility, toTurnAbility, toVisual, TurnAbilityName, TurnMarker } from 'lib/optimization/rotation/turnAbilityConfig'
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
      dropdownHeight: 190,
      controlWidth: 100,
      optionPadding: '2px 12px',
      controlItemWidth: 150,
    },
  },
}

interface Option {
  value: string
  label: string
  children: Option[]
}

function generateOptions(): Option[] {
  return ALL_ABILITIES.map((kind) => ({
    value: `${kind}`,
    label: `${kind}`,
    children: Object.values(TurnMarker)
      .map((marker) => {
        const turnAbility = createAbility(kind, marker)
        return {
          value: turnAbility.name,
          label: toVisual(turnAbility),
          children: [],
        }
      }),
  }))
}

export function TurnAbilitySelector({ formName }: { formName: (string | number)[] }) {
  const options = useMemo(() => generateOptions(), [])

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Form.Item
        name={formName}
        getValueFromEvent={(value: [AbilityKind, TurnAbilityName]) => value?.[1] || null}
        getValueProps={(value: TurnAbilityName) => ({
          value: value ? [toTurnAbility(value).kind, value] : undefined,
        })}
        noStyle
      >
        <Cascader<Option>
          className='turn-ability-cascader-filter'
          options={options}
          displayRender={(labels: string[]) => {
            return `${formName[1]}.  ${labels[1]}`
          }}
          expandTrigger='hover'
          placeholder='Ability'
          showCheckedStrategy={SHOW_CHILD}
          size='small'
          allowClear
          style={{ width: '100%', height: 18 }}
          variant='borderless'
        />
      </Form.Item>
    </ConfigProvider>
  )
}

export function ControlledTurnAbilitySelector({
  index,
  value,
  style,
}: {
  index: number
  value: TurnAbilityName
  style?: React.CSSProperties
}) {
  const options = useMemo(() => generateOptions(), [])

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader
        style={style}
        className='turn-ability-cascader-drawer'
        options={options}
        displayRender={(labels: string[]) => {
          const turnAbilityName = labels[0] as TurnAbilityName
          const turnAbility = toTurnAbility(turnAbilityName)

          return toVisual(turnAbility)
        }}
        expandTrigger='hover'
        placeholder='Ability'
        showCheckedStrategy={SHOW_CHILD}
        size='small'
        allowClear
        value={[value]}
        onChange={(value) => {
          if (!value || !value.length) return
          updateAbilityRotation(index, value[1] as TurnAbilityName)
        }}
        onClear={() => {
          updateAbilityRotation(index, null)
        }}
      />
    </ConfigProvider>
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
