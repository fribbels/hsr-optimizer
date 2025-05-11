import { ABILITY_LIMIT } from 'lib/constants/constants'
import { TurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboBooleanConditional, ComboNumberConditional, ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export abstract class AbilityPreprocessorBase {
  abstract id: string
  abstract reset(): void
  abstract processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState): void
}

export function setComboBooleanCategorySetActivation(comboState: ComboState, set: string, index: number, value: boolean) {
  const category = comboState.comboCharacter.setConditionals[set] as ComboBooleanConditional
  category.activations[index] = value
}

export function setComboBooleanCategoryCharacterActivation(comboState: ComboState, conditional: string, index: number, value: boolean) {
  const category = comboState.comboCharacter.characterConditionals[conditional] as ComboBooleanConditional
  if (category) {
    category.activations[index] = value
  }
}

export function setComboNumberCategoryCharacterActivation(comboState: ComboState, conditional: string, index: number, value: number) {
  const category = comboState.comboCharacter.characterConditionals[conditional] as ComboNumberConditional

  if (category) {
    const partition = category.partitions.find((x) => x.value == value)

    if (partition) {
      category.partitions.forEach((x) => x.activations[index] = false)
      partition.activations[index] = true
    } else {
      category.partitions.forEach((x) => x.activations[index] = false)
      const newPartition = {
        value: value,
        activations: new Array(ABILITY_LIMIT + 1).fill(false),
      }
      newPartition.activations[index] = true
      category.partitions.push(newPartition)
    }

    category.partitions = category.partitions.sort((a, b) => a.value - b.value)
  }
}
