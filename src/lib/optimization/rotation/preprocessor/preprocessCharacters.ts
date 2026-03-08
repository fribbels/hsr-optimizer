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
import { Archer } from 'lib/conditionals/character/1000/Archer'
import { Saber } from 'lib/conditionals/character/1000/Saber'
import { Hook } from 'lib/conditionals/character/1100/Hook'
import { JingliuB1 } from 'lib/conditionals/character/1200/JingliuB1'
import { Yunli } from 'lib/conditionals/character/1200/Yunli'
import { TheHerta } from 'lib/conditionals/character/1400/TheHerta'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { Cyrene } from 'lib/conditionals/character/1400/Cyrene'
import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import { Phainon } from 'lib/conditionals/character/1400/Phainon'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export class CastoricePreprocessor extends AbilityPreprocessorBase {
  id = Castorice.id
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
  id = TheHerta.id
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
      Yunli.id,
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
      Hook.id,
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
  id = Phainon.id
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
  id = Saber.id
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
  id = Archer.id
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
      JingliuB1.id,
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
      JingliuB1.id,
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
  id = Hysilens.id
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
  id = Anaxa.id
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

export class AshveilPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      Ashveil.id,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.FUA],
        activationFn: setComboBooleanCategoryCharacterActivation,
        key: 'enhancedFua',
      },
    )
  }
}

export class CyrenePreprocessor extends AbilityPreprocessorBase {
  id = Cyrene.id
  defaultState = { memoSkillCounter: 3 }
  state = { ...this.defaultState }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState) {
    const { kind, marker } = turnAbility

    if (kind == AbilityKind.MEMO_SKILL && this.state.memoSkillCounter >= 3) {
      this.state.memoSkillCounter = 0
      setComboBooleanCategoryCharacterActivation(comboState, 'enhancedMemoSkill', index, true)
    } else {
      setComboBooleanCategoryCharacterActivation(comboState, 'enhancedMemoSkill', index, false)
    }

    if (kind == AbilityKind.MEMO_SKILL) {
      this.state.memoSkillCounter++
    }
  }
}
