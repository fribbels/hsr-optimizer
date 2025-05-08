import { AbilityPreprocessorBase } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { AbilityKind, TurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export class AbilityTriggeredStackPreprocessor extends AbilityPreprocessorBase {
  id: string

  private triggerKind: AbilityKind
  private consumeKind: AbilityKind
  private stacksToAdd: number
  private maxStacks: number
  private activationFn: ((comboState: ComboState, key: string, index: number, value: boolean | number) => void)
  private key: string
  private isBoolean: boolean
  private defaultActivationValue: boolean | number

  defaultState = { stacks: 0 }
  state = { ...this.defaultState }

  constructor(
    id: string,
    options: {
      key: string
      isBoolean: boolean
      triggerKind: AbilityKind
      consumeKind: AbilityKind
      stacksToAdd?: number
      maxStacks?: number
      defaultActivationValue?: boolean | number
      activationFn: ((comboState: ComboState, key: string, index: number, value: boolean) => void) | ((comboState: ComboState, key: string, index: number, value: number) => void)
    },
  ) {
    super()
    this.id = id

    this.key = options.key
    this.isBoolean = options.isBoolean
    this.triggerKind = options.triggerKind
    this.consumeKind = options.consumeKind
    this.stacksToAdd = options.stacksToAdd ?? 1
    this.maxStacks = options.maxStacks ?? 1
    this.defaultActivationValue = options.defaultActivationValue ?? (this.isBoolean ? false : 0)
    this.activationFn = options.activationFn as (comboState: ComboState, key: string, index: number, value: boolean | number) => void
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

      const activationValue = this.isBoolean
        ? hasStacks
        : (hasStacks ? this.state.stacks : this.defaultActivationValue)

      // Use activation value
      this.activationFn(comboState, this.key, index, activationValue)

      if (hasStacks) this.state.stacks -= 1
    } else {
      // Use default value
      this.activationFn(comboState, this.key, index, this.defaultActivationValue)
    }
  }
}
