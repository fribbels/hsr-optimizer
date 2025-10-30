import { AbilityTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/abilityTriggeredStackPreprocessor'
import {
  AbilityPreprocessorBase,
  setComboBooleanCategoryCharacterActivation,
  setComboNumberCategoryCharacterActivation,
} from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import {
  AbilityKind,
  TurnAbility,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  ANAXA,
  ARCHER,
  CASTORICE,
  HOOK,
  HYSILENS,
  JINGLIU_B1,
  PHAINON,
  SABER,
  THE_HERTA,
  YUNLI,
} from 'lib/simulations/tests/testMetadataConstants'
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

export class PhainonPreprocessor extends AbilityPreprocessorBase {
  id = PHAINON
  defaultState = { transformedState: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility

    if (kind == AbilityKind.ULT) {
      if (this.state.transformedState == false) {
        setComboBooleanCategoryCharacterActivation(comboState, 'transformedState', index, false)
        this.state.transformedState = true
      } else {
        setComboBooleanCategoryCharacterActivation(comboState, 'transformedState', index, true)
        this.state.transformedState = false
      }
    } else {
      setComboBooleanCategoryCharacterActivation(comboState, 'transformedState', index, this.state.transformedState)
    }
  }
}

export class SaberPreprocessor extends AbilityPreprocessorBase {
  id = SABER
  defaultState = { enhancedSkill: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind } = turnAbility

    if (kind == AbilityKind.SKILL) {
      if (this.state.enhancedSkill == false) {
        setComboBooleanCategoryCharacterActivation(comboState, 'enhancedSkill', index, false)
        this.state.enhancedSkill = true
      } else {
        setComboBooleanCategoryCharacterActivation(comboState, 'enhancedSkill', index, true)
        this.state.enhancedSkill = false
      }
    } else {
      setComboBooleanCategoryCharacterActivation(comboState, 'enhancedSkill', index, this.state.enhancedSkill)
    }
  }
}

export class ArcherPreprocessor extends AbilityPreprocessorBase {
  id = ARCHER
  defaultState = { skillEnhances: 0 }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind, marker } = turnAbility

    const e = comboState.comboCharacter.metadata.characterEidolon

    if (kind == AbilityKind.SKILL && (marker == TurnMarker.START || marker == TurnMarker.WHOLE)) {
      setComboNumberCategoryCharacterActivation(comboState, 'skillEnhances', index, 0)
      this.state.skillEnhances++
    } else if (kind == AbilityKind.SKILL) {
      setComboNumberCategoryCharacterActivation(comboState, 'skillEnhances', index, Math.min(e >= 6 ? 3 : 2, this.state.skillEnhances))
      this.state.skillEnhances++
    }

    if (marker == TurnMarker.END || marker == TurnMarker.WHOLE) {
      this.state.skillEnhances = 0
    }
  }
}

export class JingliuB1E2Preprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      JINGLIU_B1,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.SKILL],
        activationFn: setComboBooleanCategoryCharacterActivation,
        key: 'e2SkillDmgBuff',
      },
    )
  }
}

export class JingliuB1DefPenPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      JINGLIU_B1,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.SKILL],
        activationFn: setComboBooleanCategoryCharacterActivation,
        key: 'maxSyzygyDefPen',
      },
    )
  }
}

export class HysilensE1Preprocessor extends AbilityPreprocessorBase {
  id = HYSILENS
  defaultState = { ultActivated: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind, marker } = turnAbility

    if (kind == AbilityKind.ULT) {
      this.state.ultActivated = true
    }

    if (kind == AbilityKind.DOT && this.state.ultActivated) {
      setComboBooleanCategoryCharacterActivation(comboState, 'dotDetonation', index, true)
      this.state.ultActivated = false
    } else {
      setComboBooleanCategoryCharacterActivation(comboState, 'dotDetonation', index, false)
    }

    if (marker == TurnMarker.END || marker == TurnMarker.WHOLE) {
      this.state.ultActivated = false
    }
  }
}

export class AnaxaCyreneEffectPreprocessor extends AbilityPreprocessorBase {
  id = ANAXA
  defaultState = { cyreneSpecialEffect: false }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind, marker } = turnAbility

    if (marker == TurnMarker.START || marker == TurnMarker.WHOLE) {
      if (this.state.cyreneSpecialEffect) {
        this.state.cyreneSpecialEffect = false
      } else {
        this.state.cyreneSpecialEffect = true
      }
    }
    setComboBooleanCategoryCharacterActivation(comboState, 'cyreneSpecialEffect', index, this.state.cyreneSpecialEffect)
  }
}
