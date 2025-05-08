import { AbilityKind, TurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
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
        activations: new Array(comboState.comboTurnAbilities.length).fill(false),
      }
      newPartition.activations[index] = true
      category.partitions.push(newPartition)
    }

    category.partitions = category.partitions.sort((a, b) => a.value - b.value)
  }
}

export class AbilityTriggeredStackPreprocessor extends AbilityPreprocessorBase {
  id: string

  private triggerKind: AbilityKind
  private consumeKind: AbilityKind
  private stacksToAdd: number
  private maxStacks: number
  private activationFn: ((comboState: ComboState, categoryId: string, index: number, value: boolean | number) => void)
  private categoryId: string
  private isBooleanActivation: boolean
  private defaultActivationValue: boolean | number

  defaultState = { stacks: 0 }
  state = { ...this.defaultState }

  constructor(
    id: string,
    options: {
      triggerKind: AbilityKind
      consumeKind: AbilityKind
      stacksToAdd?: number
      maxStacks?: number
      activationFn: ((comboState: ComboState, id: string, index: number, value: boolean) => void) | ((comboState: ComboState, id: string, index: number, value: number) => void)
      categoryId: string
      isBooleanActivation: boolean
      defaultActivationValue?: boolean | number
    },
  ) {
    super()
    this.id = id
    this.triggerKind = options.triggerKind
    this.consumeKind = options.consumeKind
    this.stacksToAdd = options.stacksToAdd ?? 1
    this.maxStacks = options.maxStacks ?? 1
    this.activationFn = options.activationFn as (comboState: ComboState, categoryId: string, index: number, value: boolean | number) => void
    this.categoryId = options.categoryId
    this.isBooleanActivation = options.isBooleanActivation
    this.defaultActivationValue = options.defaultActivationValue ?? (this.isBooleanActivation ? false : 0)
  }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility

    // Handle trigger ability
    if (kind === this.triggerKind) {
      this.state.stacks = Math.min(this.maxStacks, this.state.stacks + this.stacksToAdd)
    }

    // Handle consume ability
    if (kind === this.consumeKind) {
      const hasStacks = this.state.stacks > 0

      const activationValue = this.isBooleanActivation
        ? hasStacks
        : (hasStacks ? this.state.stacks : this.defaultActivationValue)

      // Use activation value
      this.activationFn(comboState, this.categoryId, index, activationValue)

      if (hasStacks) this.state.stacks -= 1
    } else {
      // Use default value
      this.activationFn(comboState, this.categoryId, index, this.defaultActivationValue)
    }
  }
}
