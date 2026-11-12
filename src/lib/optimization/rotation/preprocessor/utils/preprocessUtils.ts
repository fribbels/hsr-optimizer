import { ABILITY_LIMIT } from 'lib/constants/constants'
import type {
  ComboBooleanConditional,
  ComboNumberConditional,
  ComboSelectConditional,
  ComboState,
} from 'lib/optimization/combo/comboTypes'
import type { TurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import type { EntityKey } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'

export abstract class AbilityPreprocessorBase {
  abstract id: string
  abstract reset(): void
  abstract processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState): void
}

// The value a slider or select has at one rotation slot. Falls back to the default value.
// The optimizer and preprocessors both use this, so they always agree.
export function getComboPartitionValue(category: ComboNumberConditional | ComboSelectConditional | undefined, index: number): number {
  return category?.partitions.find((p) => p.activations[index])?.value ?? category?.partitions[0]?.value ?? 0
}

export function setComboBooleanCategorySetActivation(comboState: ComboState, set: string, index: number, value: boolean) {
  const category = comboState.comboCharacter.setConditionals[set] as ComboBooleanConditional | undefined
  if (category) category.activations[index] = value
}

export function setComboBooleanCategoryCharacterActivation(
  comboState: ComboState,
  conditional: string,
  index: number,
  value: boolean,
  entityKey: EntityKey = 'comboCharacter',
) {
  const category = comboState[entityKey]?.characterConditionals[conditional] as ComboBooleanConditional | undefined
  if (category) {
    category.activations[index] = value
  }
}
export function setComboBooleanCategoryLightConeActivation(
  comboState: ComboState,
  conditional: string,
  index: number,
  value: boolean,
  entityKey: EntityKey = 'comboCharacter',
) {
  const category = comboState[entityKey]?.lightConeConditionals[conditional] as ComboBooleanConditional | undefined
  if (category) {
    category.activations[index] = value
  }
}

export function setComboNumberCategoryCharacterActivation(
  comboState: ComboState,
  conditional: string,
  index: number,
  value: number,
  entityKey: EntityKey = 'comboCharacter',
) {
  const category = comboState[entityKey]?.characterConditionals[conditional] as ComboNumberConditional | undefined

  if (category) {
    const partition = category.partitions.find((x) => x.value == value)

    if (partition) {
      category.partitions.forEach((x) => x.activations[index] = false)
      partition.activations[index] = true
    } else {
      category.partitions.forEach((x) => x.activations[index] = false)
      const newPartition = {
        value,
        activations: Array.from({ length: ABILITY_LIMIT + 1 }, () => false),
      }
      newPartition.activations[index] = true
      category.partitions.push(newPartition)
    }

    category.partitions = category.partitions.sort((a, b) => a.value - b.value)
  }
}
