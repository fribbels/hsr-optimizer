import { AbilityTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/abilityTriggeredStackPreprocessor'
import { AbilityPreprocessorBase, setComboBooleanCategoryCharacterActivation, setComboNumberCategoryCharacterActivation } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { AbilityKind, TurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { CASTORICE, HOOK, THE_HERTA, YUNLI } from 'lib/simulations/tests/testMetadataConstants'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

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

export class TheHertaPreprocessor extends AbilityPreprocessorBase {
  id = THE_HERTA
  defaultState = { enhancedSkillCount: 0, postUltEnhancement: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility
    const e = comboState.comboCharacter.metadata.characterEidolon

    if (kind == AbilityKind.ULT) {
      this.state.enhancedSkillCount += e >= 2 ? 2 : 1
      this.state.postUltEnhancement = true
    }

    if (kind == AbilityKind.SKILL) {
      if (this.state.enhancedSkillCount > 0) {
        this.state.enhancedSkillCount -= 1
        setComboBooleanCategoryCharacterActivation(comboState, 'enhancedSkill', index, true)
      } else {
        setComboBooleanCategoryCharacterActivation(comboState, 'enhancedSkill', index, false)
      }

      if (this.state.postUltEnhancement == true) {
        setComboNumberCategoryCharacterActivation(comboState, 'interpretationStacks', index, 42)
        this.state.postUltEnhancement = false
      } else {
        setComboNumberCategoryCharacterActivation(comboState, 'interpretationStacks', index, e >= 1 ? 35 : 21)
      }
    }
  }
}

export class YunliPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      YUNLI,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.FUA],
        activationFn: setComboBooleanCategoryCharacterActivation,
        key: 'blockActive',
      },
    )
  }
}

export class HookPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      HOOK,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.SKILL],
        activationFn: setComboBooleanCategoryCharacterActivation,
        key: 'enhancedSkill',
      },
    )
  }
}
