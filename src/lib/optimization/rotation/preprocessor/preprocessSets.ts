import { Sets } from 'lib/constants/constants'
import { AbilityPreprocessorBase, setComboBooleanCategorySetActivation } from 'lib/optimization/rotation/preprocessor/preprocessUtils'
import { AbilityKind, TurnAbility, TurnMarker } from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export class ScholarLostInEruditionPreprocessor extends AbilityPreprocessorBase {
  id = Sets.ScholarLostInErudition
  defaultState = { scholarActivated: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility

    if (kind == AbilityKind.ULT) {
      this.state.scholarActivated = true
    }

    if (kind == AbilityKind.SKILL && this.state.scholarActivated) {
      this.state.scholarActivated = false
      setComboBooleanCategorySetActivation(comboState, Sets.ScholarLostInErudition, index, true)
    } else {
      setComboBooleanCategorySetActivation(comboState, Sets.ScholarLostInErudition, index, false)
    }
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
