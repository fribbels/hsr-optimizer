import { Sets } from 'lib/constants/constants'
import { AbilityTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/abilityTriggeredStackPreprocessor'
import { AbilityPreprocessorBase, setComboBooleanCategorySetActivation } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { AbilityKind, TurnAbility, TurnMarker } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export class ScholarLostInEruditionPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.ScholarLostInErudition,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.SKILL],
        activationFn: setComboBooleanCategorySetActivation,
        key: Sets.ScholarLostInErudition,
      },
    )
  }
}

export class FiresmithOfLavaForging extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.FiresmithOfLavaForging,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.BASIC, AbilityKind.SKILL, AbilityKind.ULT, AbilityKind.FUA],
        activationFn: setComboBooleanCategorySetActivation,
        key: Sets.FiresmithOfLavaForging,
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
