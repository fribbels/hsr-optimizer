import { ComboboxItem, Select } from '@mantine/core'
import { TFunction } from 'i18next'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { CharacterId } from 'types/character'
import {
  ALL_ABILITIES,
  ComboOptionsLabelMapping,
  createAbility,
  NULL_TURN_ABILITY,
  NULL_TURN_ABILITY_NAME,
  TurnAbility,
  TurnAbilityName,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState, updateAbilityRotation } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterConditionalsController } from 'types/conditionals'

const start = '['
const end = ']'

const compactInputStyles = {
  input: {
    height: 18,
    minHeight: 18,
    fontSize: 12,
  },
}

function IndexLabel({ index }: { index: number }) {
  return <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{`${index}.`}</span>
}

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

export type AbilityGroupedData = {
  group: string
  items: ComboboxItem[]
}

function mapKindToGroup(kind: string, group: string, t: TFunction<'optimizerTab', 'ComboFilter'>): AbilityGroupedData {
  return {
    group: group,
    items: Object.values(TurnMarker).map((marker) => {
      const turnAbility = createAbility(kind, marker)
      return {
        value: turnAbility.name,
        label: toI18NVisual(turnAbility, t),
      }
    }),
  }
}

export function generateAbilityGroupedOptions(t: TFunction<'optimizerTab', 'ComboFilter'>, characterId?: string, characterEidolon?: number): AbilityGroupedData[] {
  if (characterId && characterEidolon != null) {
    const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get({
      characterId: characterId as CharacterId,
      characterEidolon: characterEidolon,
    })
    const actions = characterConditionals.actionDeclaration ? characterConditionals.actionDeclaration() : []
    return actions.map((kind) => mapKindToGroup(kind, kind, t))
  }

  return ALL_ABILITIES.map((kind) => mapKindToGroup(kind, t(`ComboOptions.${ComboOptionsLabelMapping[kind]}`), t))
}

export function TurnAbilitySelector({ index, disabled }: { index: number; disabled: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const characterId = useOptimizerRequestStore((s) => s.characterId)
  const characterEidolon = useOptimizerRequestStore((s) => s.characterEidolon)
  const value = useOptimizerRequestStore((s) => s.comboTurnAbilities[index])
  const options = useMemo(() => generateAbilityGroupedOptions(t, characterId, characterEidolon), [t, characterId, characterEidolon])

  function handleChange(selectedValue: string | null) {
    if (!selectedValue) return
    const store = useOptimizerRequestStore.getState()
    const abilities = [...store.comboTurnAbilities]
    abilities[index] = selectedValue as TurnAbilityName
    store.setComboTurnAbilities(abilities)
  }

  return (
    <Select
      data={options}
      value={value || null}
      placeholder='Ability'
      size='xs'
      variant='unstyled'
      leftSection={<IndexLabel index={index} />}
      leftSectionWidth={24}
      styles={compactInputStyles}
      allowDeselect={false}
      disabled={disabled}
      onChange={handleChange}
    />
  )
}

export function TurnAbilitySelectorSimple({ value, index }: { value: TurnAbilityName; index: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const options = useMemo(() => generateAbilityGroupedOptions(t), [t])

  if (value == null) {
    return null
  }

  return (
    <Select
      data={options}
      value={value}
      placeholder='Ability'
      size='xs'
      variant='unstyled'
      leftSection={<IndexLabel index={index} />}
      leftSectionWidth={24}
      styles={compactInputStyles}
      disabled={true}
    />
  )
}

export function ControlledTurnAbilitySelector({
  index,
  value,
  style,
  comboState,
  onComboStateChange,
}: {
  index: number
  value: TurnAbilityName
  style?: React.CSSProperties
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const characterId = useOptimizerRequestStore((s) => s.characterId)
  const characterEidolon = useOptimizerRequestStore((s) => s.characterEidolon)
  const options = useMemo(() => generateAbilityGroupedOptions(t, characterId, characterEidolon), [t, characterId, characterEidolon])

  function handleChange(selectedValue: string | null) {
    if (!selectedValue) return
    const newState = updateAbilityRotation(comboState, index, selectedValue as TurnAbilityName)
    if (newState) onComboStateChange(newState)
  }

  function handleClear() {
    const newState = updateAbilityRotation(comboState, index, NULL_TURN_ABILITY_NAME)
    if (newState) onComboStateChange(newState)
  }

  return (
    <Select
      style={style}
      data={options}
      value={value || null}
      placeholder='Ability'
      size='xs'
      styles={{
        input: {
          fontSize: 12,
        },
      }}
      clearable
      onChange={handleChange}
      onClear={handleClear}
    />
  )
}
