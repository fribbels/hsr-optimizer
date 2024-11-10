import { Sets } from 'lib/constants/constants'
import { ComboBooleanConditional, ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form } from 'types/form'

/**
 * Some passives such as Scholar Lost In Erudition set only activate after abilities trigger them.
 * Use the simulation ability rotation to precompute when their activations are active.
 */
export function precomputeConditionalActivations(comboState: ComboState, request: Form) {
  const setPreprocessors = [
    scholarLostInEruditionPreprocessor(comboState, request),
    // Hunter of Glacial Forest
    // Firesmith of Lava-Forging
    // Band of Sizzling Thunder
  ]

  for (let i = 1; i < comboState.comboAbilities.length; i++) {
    const ability = comboState.comboAbilities[i]

    for (const preprocessor of setPreprocessors) {
      preprocessor.processAbility(ability, i)
    }
  }
}

type AbilityPreprocessor = {
  state: Record<string, boolean>
  processAbility: (ability: string, index: number) => void
}

function scholarLostInEruditionPreprocessor(comboState: ComboState, request: Form): AbilityPreprocessor {
  return {
    state: {
      scholarActivated: false,
    },
    processAbility: function (ability: string, index: number) {
      if (ability == 'ULT') {
        this.state.scholarActivated = true
      }

      if (ability == 'SKILL' && this.state.scholarActivated) {
        this.state.scholarActivated = false
        setComboBooleanCategoryActivation(comboState, index, true)
      } else {
        setComboBooleanCategoryActivation(comboState, index, false)
      }
    },
  }
}

function setComboBooleanCategoryActivation(comboState: ComboState, index: number, value: boolean) {
  const category = comboState.comboCharacter.setConditionals[Sets.ScholarLostInErudition] as ComboBooleanConditional
  category.activations[index] = value
}
