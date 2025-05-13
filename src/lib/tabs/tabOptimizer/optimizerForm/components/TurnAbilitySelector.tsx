import { Cascader, ConfigProvider, Form } from 'antd'
import { TFunction } from 'i18next'
import { AbilityKind, ALL_ABILITIES, ComboOptionsLabelMapping, createAbility, NULL_TURN_ABILITY, NULL_TURN_ABILITY_NAME, toTurnAbility, TurnAbility, TurnAbilityName, TurnMarker } from 'lib/optimization/rotation/turnAbilityConfig'
import { updateAbilityRotation } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { OptimizerForm } from 'types/form'

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
      dropdownHeight: 220,
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

const start = '['
const end = ']'

export function toI18NVisual(ability: TurnAbility, t: TFunction<'optimizerTab', 'ComboFilter'>): string {
  if (!ability || ability == NULL_TURN_ABILITY) return ''
  const abilityKindVisual: string = t(`ComboOptions.${ComboOptionsLabelMapping[ability.kind]}`)

  switch (ability.marker) {
    case TurnMarker.START:
      return `${start} ${abilityKindVisual}`
    case TurnMarker.END:
      return `${abilityKindVisual} ${end}`
    case TurnMarker.WHOLE:
      return `${start} ${abilityKindVisual} ${end}`
    default:
      return abilityKindVisual
  }
}

function generateOptions(t: TFunction<'optimizerTab', 'ComboFilter'>): Option[] {
  // const t = i18next.getFixedT(null, 'optimizerTab', 'ComboFilter')
  return ALL_ABILITIES.map((kind) => ({
    value: `${kind}`,
    label: t(`ComboOptions.${ComboOptionsLabelMapping[kind]}`),
    children: Object.values(TurnMarker)
      .map((marker) => {
        const turnAbility = createAbility(kind, marker)
        return {
          value: turnAbility.name,
          label: toI18NVisual(turnAbility, t),
          children: [],
        }
      }),
  }))
}

export function TurnAbilitySelector({ formName, disabled }: { formName: (string | number)[]; disabled: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const form = Form.useFormInstance<OptimizerForm>()
  const options = useMemo(() => generateOptions(t), [t])

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
          style={{ width: '100%', height: 18 }}
          variant='borderless'
          allowClear={false}
          changeOnSelect={true}
          disabled={disabled}
          onChange={(value: string[]) => {
            if (value && value.length == 1) {
              form.setFieldValue(
                // @ts-ignore Using formName as path
                formName,
                createAbility(value[0] as AbilityKind, TurnMarker.DEFAULT).name,
              )
            }
          }}
        />
      </Form.Item>
    </ConfigProvider>
  )
}

export function TurnAbilitySelectorSimple({ value, index }: { value: TurnAbilityName; index: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const options = useMemo(() => generateOptions(t), [t])

  if (value == null) {
    return <></>
  }

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader<Option>
        className='turn-ability-cascader-filter'
        options={options}
        // @ts-ignore
        value={value}
        displayRender={(labels: string[]) => {
          const turnAbility = toTurnAbility(value)

          return `${index}. ${toI18NVisual(turnAbility, t)}`
        }}
        expandTrigger='hover'
        placeholder='Ability'
        showCheckedStrategy={SHOW_CHILD}
        size='small'
        style={{ width: '100%', height: 18 }}
        variant='borderless'
        disabled={true}
      />
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
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const options = useMemo(() => generateOptions(t), [t])

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader
        style={style}
        className='turn-ability-cascader-drawer'
        options={options}
        displayRender={(labels: string[]) => {
          const turnAbilityName = labels[0] as TurnAbilityName
          const turnAbility = toTurnAbility(turnAbilityName)

          return toI18NVisual(turnAbility, t)
        }}
        expandTrigger='hover'
        placeholder='Ability'
        showCheckedStrategy={SHOW_CHILD}
        size='small'
        allowClear
        value={[value]}
        changeOnSelect={true}
        onChange={(value) => {
          if (!value || !value.length) return
          if (value.length == 1) {
            updateAbilityRotation(index, createAbility(value[0] as AbilityKind, TurnMarker.DEFAULT).name)
            return
          }

          updateAbilityRotation(index, value[1] as TurnAbilityName)
        }}
        onClear={() => {
          updateAbilityRotation(index, NULL_TURN_ABILITY_NAME)
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
