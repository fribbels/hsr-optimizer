import { AbilityPreprocessorBase } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { AbilityKind, TurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export class AbilityTriggeredStackPreprocessor extends AbilityPreprocessorBase {
  id: string

  private triggerKinds: AbilityKind[]
  private consumeKinds: AbilityKind[]
  private stacksToAdd: number
  private maxStacks: number
  private activationFn: ((comboState: ComboState, key: string, index: number, value: boolean | number) => void)
  private key: string
  private isNumber: boolean
  private defaultActivationValue: boolean | number
  private disableFn: (comboState: ComboState) => boolean

  defaultState = { stacks: 0 }
  state = { ...this.defaultState }

  constructor(
    id: string,
    options: {
      key: string
      triggerKinds: AbilityKind[]
      consumeKinds: AbilityKind[]
      isNumber?: boolean
      stacksToAdd?: number
      maxStacks?: number
      defaultActivationValue?: boolean | number
      activationFn: ((comboState: ComboState, key: string, index: number, value: boolean) => void) | ((comboState: ComboState, key: string, index: number, value: number) => void)
      disableFn?: (comboState: ComboState) => boolean
    },
  ) {
    super()
    this.id = id

    this.key = options.key
    this.triggerKinds = options.triggerKinds
    this.consumeKinds = options.consumeKinds
    this.isNumber = options.isNumber ?? false
    this.stacksToAdd = options.stacksToAdd ?? 1
    this.maxStacks = options.maxStacks ?? 1
    this.defaultActivationValue = options.defaultActivationValue ?? (this.isNumber ? 0 : false)
    this.activationFn = options.activationFn as (comboState: ComboState, key: string, index: number, value: boolean | number) => void
    this.disableFn = options.disableFn ?? ((comboState: ComboState) => false)
  }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility

    if (this.disableFn(comboState)) return

    // Handle consume ability
    if (this.consumeKinds.includes(kind)) {
      const hasStacks = this.state.stacks > 0

      const activationValue = this.isNumber
        ? (hasStacks ? this.state.stacks : this.defaultActivationValue)
        : hasStacks

      // Use activation value
      this.activationFn(comboState, this.key, index, activationValue)

      if (hasStacks) this.state.stacks -= 1
    } else {
      // Use default value
      this.activationFn(comboState, this.key, index, this.defaultActivationValue)
    }

    // Handle trigger ability
    if (this.triggerKinds.includes(kind)) {
      this.state.stacks = Math.min(this.maxStacks, this.state.stacks + this.stacksToAdd)
    }
  }
}
