import {
  Cascader,
  ConfigProvider,
} from 'antd'
import { TFunction } from 'i18next'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { CharacterId } from 'types/character'
import {
  AbilityKind,
  ALL_ABILITIES,
  ComboOptionsLabelMapping,
  createAbility,
  NULL_TURN_ABILITY,
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
  TurnAbility,
  TurnAbilityName,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { updateAbilityRotation } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterConditionalsController } from 'types/conditionals'

const { SHOW_CHILD } = Cascader

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

export interface AbilityOption {
  value: string
  label: string
  children: AbilityOption[]
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

export function generateAbilityOptions(t: TFunction<'optimizerTab', 'ComboFilter'>, characterId?: string, characterEidolon?: number): AbilityOption[] {
  if (characterId && characterEidolon != null) {
    const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get({
      characterId: characterId as CharacterId,
      characterEidolon: characterEidolon,
    })
    const actions = characterConditionals.actionDeclaration ? characterConditionals.actionDeclaration() : []

    return actions.map((x) => ({
      label: x,
      value: x,
      children: Object.values(TurnMarker)
        .map((marker) => {
          const turnAbility = createAbility(x, marker)
          return {
            value: turnAbility.name,
            label: toI18NVisual(turnAbility, t),
            children: [],
          }
        }),
    }))
  }

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

export function TurnAbilitySelector({ index, disabled }: { index: number; disabled: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
  const value = useOptimizerFormStore((s) => s.comboTurnAbilities[index])
  const options = useMemo(() => generateAbilityOptions(t, characterId, characterEidolon), [t, characterId, characterEidolon])

  // Convert value to cascader format: [kind, name]
  const cascaderValue = value ? [toTurnAbility(value).kind, value] : undefined

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader<AbilityOption>
        className='turn-ability-cascader-filter'
        options={options}
        value={cascaderValue as string[] | undefined}
        displayRender={(labels: string[]) => {
          return `${index}.  ${labels[1]}`
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
        onChange={(selectedValue: string[]) => {
          if (!selectedValue) return
          const store = useOptimizerFormStore.getState()
          const abilities = [...store.comboTurnAbilities]
          if (selectedValue.length == 1) {
            abilities[index] = createAbility(selectedValue[0] as AbilityKind, TurnMarker.DEFAULT).name
          } else {
            abilities[index] = selectedValue[1] as TurnAbilityName
          }
          store.setComboTurnAbilities(abilities)
        }}
      />
    </ConfigProvider>
  )
}

export function TurnAbilitySelectorSimple({ value, index }: { value: TurnAbilityName; index: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const options = useMemo(() => generateAbilityOptions(t), [t])

  if (value == null) {
    return <></>
  }

  return (
    <ConfigProvider theme={cascaderTheme}>
      <Cascader<AbilityOption>
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
  index: number;
  value: TurnAbilityName;
  style?: React.CSSProperties;
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
  const options = useMemo(() => generateAbilityOptions(t, characterId, characterEidolon), [t, characterId, characterEidolon])

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
