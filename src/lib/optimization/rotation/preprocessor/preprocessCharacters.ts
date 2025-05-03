import { AbilityKind, TurnAbility } from 'lib/optimization/rotation/abilityConfig'
import { CASTORICE } from 'lib/simulations/tests/testMetadataConstants'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { AbilityPreprocessorBase, setComboBooleanCategoryCharacterActivation, setComboNumberCategoryCharacterActivation } from './preprocessUtils'

export class CastoricePreprocessor extends AbilityPreprocessorBase {
  id = CASTORICE
  defaultState = { memoSkillEnhances: 3, memoDmgStacks: 0, e2Activated: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility

    // E1
    let memoDmgStacks = this.state.memoDmgStacks
    if (kind == AbilityKind.MEMO_SKILL) {
      const value = memoDmgStacks + 1
      setComboNumberCategoryCharacterActivation(comboState, 'memoDmgStacks', index, value)
      setComboNumberCategoryCharacterActivation(comboState, 'memoSkillEnhances', index, Math.min(3, value))
      memoDmgStacks = Math.min(6, memoDmgStacks + 1)
    } else if (kind == AbilityKind.MEMO_TALENT) {
      setComboNumberCategoryCharacterActivation(comboState, 'memoDmgStacks', index, memoDmgStacks)
      setComboNumberCategoryCharacterActivation(comboState, 'memoSkillEnhances', index, 1)
    } else {
      memoDmgStacks = 0
      setComboNumberCategoryCharacterActivation(comboState, 'memoDmgStacks', index, memoDmgStacks)
      setComboNumberCategoryCharacterActivation(comboState, 'memoSkillEnhances', index, 1)
    }

    this.state.memoDmgStacks = memoDmgStacks

    // E2
    if (kind == AbilityKind.ULT) {
      this.state.e2Activated = true
    }

    if (kind == AbilityKind.MEMO_SKILL && this.state.e2Activated) {
      this.state.e2Activated = false
      setComboBooleanCategoryCharacterActivation(comboState, 'e2MemoSkillDmgBoost', index, true)
    } else {
      setComboBooleanCategoryCharacterActivation(comboState, 'e2MemoSkillDmgBoost', index, false)
    }
  }
}
