import { AbilityPreprocessorBase } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { AbilityKind, TurnAbility, TurnMarker } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export type ActivationFunction = ((comboState: ComboState, key: string, index: number, value: boolean) => void) |
  ((comboState: ComboState, key: string, index: number, value: number) => void)

export class TurnTriggeredStackPreprocessor extends AbilityPreprocessorBase {
  id: string

  private triggerKinds: AbilityKind[]
  private activationFn: ((comboState: ComboState, key: string, index: number, value: boolean | number) => void)
  private key: string
  private isNumber: boolean
  private defaultActivationValue: boolean | number
  private activationValue: boolean | number
  private activeTurns: number

  defaultState = {
    buffActive: false, // Is the buff currently active?
    turnCounter: 0, // Current turn counter (incremented at each START)
    activationTurn: -1, // The turn when the buff was activated
    inTurn: false, // Are we currently in a turn?
  }

  state = { ...this.defaultState }

  constructor(
    id: string,
    options: {
      key: string
      triggerKinds: AbilityKind[]
      activeTurns: number
      isNumber?: boolean
      activationValue?: boolean | number
      defaultActivationValue?: boolean | number
      activationFn: ActivationFunction
    },
  ) {
    super()
    this.id = id

    this.key = options.key
    this.triggerKinds = options.triggerKinds
    this.isNumber = options.isNumber ?? false
    this.activeTurns = options.activeTurns
    this.activationValue = options.activationValue ?? (this.isNumber ? 1 : true)
    this.defaultActivationValue = options.defaultActivationValue ?? (this.isNumber ? 0 : false)
    this.activationFn = options.activationFn as (comboState: ComboState, key: string, index: number, value: boolean | number) => void
  }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind, marker } = turnAbility

    // Handle start turn
    if (marker === TurnMarker.START || marker === TurnMarker.WHOLE) {
      this.state.turnCounter++
      this.state.inTurn = true
    }

    // Handle trigger abilities
    if (this.triggerKinds.includes(kind)) {
      this.state.buffActive = true
      this.state.activationTurn = this.state.turnCounter
    }

    // Check if the buff should expire
    if (this.state.buffActive) {
      const turnsPassed = this.state.turnCounter - this.state.activationTurn
      if (turnsPassed > this.activeTurns) {
        this.state.buffActive = false
      }
    }

    this.activationFn(
      comboState,
      this.key,
      index,
      this.state.buffActive ? this.activationValue : this.defaultActivationValue,
    )

    // Handle turn end
    if (marker === TurnMarker.END || marker === TurnMarker.WHOLE) {
      this.state.inTurn = false
    }
  }
}
