import type { TFunction } from 'i18next'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import {
  AbilityKind,
  ALL_ABILITIES,
  ComboOptionsLabelMapping,
  createAbility,
  NULL_TURN_ABILITY_NAME,
  type TurnAbility,
  type TurnAbilityName,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import {
  type CascaderData,
  type CascaderGroup,
  CascaderSelect,
} from 'lib/ui/CascaderSelect'
import { toI18NVisual } from 'lib/utils/displayUtils'
import {
  type CSSProperties,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { type CharacterId } from 'types/character'
import type { CharacterConditionalsController } from 'types/conditionals'

const compactInputStyles = {
  input: {
    height: 18,
    minHeight: 18,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    paddingBlock: 0,
  },
}

function IndexLabel({ index }: { index: number }) {
  return <span style={{ fontSize: 12, whiteSpace: 'nowrap', width: '100%', textAlign: 'left' }}>{`${index}.`}</span>
}

function mapKindToGroup(kind: string, groupLabel: string, t: TFunction<'optimizerTab', 'ComboFilter'>): CascaderGroup {
  return {
    label: groupLabel,
    options: Object.values(TurnMarker).map((marker) => {
      const turnAbility = createAbility(kind, marker)
      return {
        value: turnAbility.name,
        label: toI18NVisual(turnAbility, t),
      }
    }),
  }
}

// SKILL and ULT are always included in rotation options because rotations represent
// full character turns (including buff skills / transformation ults) — not just damage actions.
const ALWAYS_INCLUDED_KINDS: AbilityKind[] = [AbilityKind.SKILL, AbilityKind.ULT]

function generateAbilityGroupedOptions(t: TFunction<'optimizerTab', 'ComboFilter'>, characterId?: string, characterEidolon?: number): CascaderData {
  if (characterId && characterEidolon != null) {
    const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get({
      characterId: characterId as CharacterId,
      characterEidolon: characterEidolon,
    })
    const declared = characterConditionals.actionDeclaration ? characterConditionals.actionDeclaration() : []
    const actions = [...new Set([...declared, ...ALWAYS_INCLUDED_KINDS])]
    return actions.map((kind) => mapKindToGroup(kind, kind, t))
  }

  return ALL_ABILITIES.map((kind) => mapKindToGroup(kind, t(`ComboOptions.${ComboOptionsLabelMapping[kind]}`), t))
}

export function TurnAbilitySelector({ index, disabled }: { index: number, disabled: boolean }) {
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
    <CascaderSelect
      data={options}
      value={value || null}
      placeholder='Ability'
      variant='unstyled'
      leftSection={<IndexLabel index={index} />}
      leftSectionWidth={24}
      styles={compactInputStyles}
      disabled={disabled}
      onChange={handleChange}
    />
  )
}

export function TurnAbilitySelectorSimple({ value, index }: { value: TurnAbilityName, index: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const options = useMemo(() => generateAbilityGroupedOptions(t), [t])

  if (value == null) {
    return null
  }

  return (
    <CascaderSelect
      data={options}
      value={value}
      placeholder='Ability'
      variant='unstyled'
      leftSection={<IndexLabel index={index} />}
      leftSectionWidth={24}
      styles={compactInputStyles}
      disabled={true}
      onChange={() => {}}
    />
  )
}

export function ControlledTurnAbilitySelector({
  index,
  value,
  style,
}: {
  index: number,
  value: TurnAbilityName,
  style?: CSSProperties,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const characterId = useOptimizerRequestStore((s) => s.characterId)
  const characterEidolon = useOptimizerRequestStore((s) => s.characterEidolon)
  const options = useMemo(() => generateAbilityGroupedOptions(t, characterId, characterEidolon), [t, characterId, characterEidolon])

  function handleChange(selectedValue: string | null) {
    if (!selectedValue) return
    useComboDrawerStore.getState().setAbilityRotation(index, selectedValue as TurnAbilityName)
  }

  function handleClear() {
    useComboDrawerStore.getState().setAbilityRotation(index, NULL_TURN_ABILITY_NAME)
  }

  return (
    <CascaderSelect
      style={style}
      data={options}
      value={value || null}
      placeholder='Ability'
      styles={{ input: { fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
      clearable
      onClear={handleClear}
      onChange={handleChange}
    />
  )
}
