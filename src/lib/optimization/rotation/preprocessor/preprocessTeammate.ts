import { Cerydra } from 'lib/conditionals/character/1400/Cerydra'
import type { ComboState } from 'lib/optimization/combo/comboTypes'
import {
  AbilityPreprocessorBase,
  setComboBooleanCategoryCharacterActivation,
} from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import {
  AbilityKind,
  type TurnAbility,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { TeammateKey } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import type {
  Form,
  TeammateProperty,
} from 'types/form'

abstract class TeammateAbilityPreprocessorBase extends AbilityPreprocessorBase {
  teammateKey: TeammateKey
  constructor(slot: TeammateProperty) {
    super()
    switch (slot) {
      case 'teammate0':
        this.teammateKey = 'comboTeammate0'
        break
      case 'teammate1':
        this.teammateKey = 'comboTeammate1'
        break
      case 'teammate2':
        this.teammateKey = 'comboTeammate2'
        break
    }
  }
}

export function getTeammateAbilityPreprocessors(request: Form, slot: TeammateProperty): Array<AbilityPreprocessorBase> {
  switch (request[slot].characterId) {
    case Cerydra.id:
      return [new CerydraPeeragePreprocessor(slot)]
    default:
      return []
  }
}

interface CerydraPeerageState {
  peerageActive: boolean
  stacks: number
}
class CerydraPeeragePreprocessor extends TeammateAbilityPreprocessorBase {
  id = Cerydra.id

  private defaultState = {
    peerageActive: true,
    stacks: 6,
  }
  private state: CerydraPeerageState = { ...this.defaultState }

  private incrementStacks() {
    this.state.stacks = Math.min(8, this.state.stacks + 1)
  }

  private resetStacks() {
    this.state.stacks = Math.max(0, this.state.stacks - 6)
  }

  reset() {
    this.state = { ...this.defaultState }
  }

  processAbility(turnAbility: TurnAbility, index: number, comboState: ComboState): void {
    const { kind, marker } = turnAbility

    setComboBooleanCategoryCharacterActivation(comboState, 'peerage', index, this.state.peerageActive, this.teammateKey)

    if (kind === AbilityKind.BASIC) {
      this.incrementStacks()
    }

    if (kind === AbilityKind.SKILL) {
      // stagger the resets to ensure that peerage is active for 2 skills
      if (this.state.peerageActive && this.state.stacks >= 6) {
        this.resetStacks()
      } else if (this.state.peerageActive) {
        this.state.peerageActive = false
      } else {
        this.incrementStacks()
      }
    }

    if (marker === TurnMarker.END && this.state.peerageActive) {
      this.resetStacks()
      this.state.peerageActive = false
    }
  }
}
