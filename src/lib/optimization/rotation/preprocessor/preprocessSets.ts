import { Sets } from 'lib/constants/constants'
import { AbilityPreprocessorBase, setComboBooleanCategorySetActivation } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { AbilityKind, TurnAbility, TurnMarker } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { AbilityTriggeredStackPreprocessor } from './utils/abilityTriggeredStackPreprocessor'

export class ScholarLostInEruditionPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.ScholarLostInErudition,
      {
        triggerKind: AbilityKind.ULT,
        consumeKind: AbilityKind.SKILL,
        activationFn: setComboBooleanCategorySetActivation,
        key: Sets.ScholarLostInErudition,
        isBoolean: true,
      },
    )
  }
}

export class WavestriderCaptainPreprocessor extends AbilityPreprocessorBase {
  id = Sets.WavestriderCaptain
  defaultState = { buffTurnsLeft: 0 }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind, marker } = turnAbility

    if (kind === AbilityKind.ULT) {
      this.state.buffTurnsLeft = 2
    }

    setComboBooleanCategorySetActivation(comboState, Sets.WavestriderCaptain, index, this.state.buffTurnsLeft > 0)

    if (marker === TurnMarker.END || marker === TurnMarker.WHOLE) {
      this.state.buffTurnsLeft = Math.max(this.state.buffTurnsLeft - 1, 0)
    }
  }
}
