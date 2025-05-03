import { toTurnAbility } from 'lib/optimization/rotation/abilityConfig'
import {
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form } from 'types/form'
import { CastoricePreprocessor } from './preprocessor/preprocessCharacters'
import { ScholarLostInEruditionPreprocessor, WavestriderCaptainPreprocessor } from './preprocessor/preprocessSets'
import { AbilityPreprocessorBase } from './preprocessor/preprocessUtils'
import { preprocessTurnAbilities } from './turnPreprocessor'

export const characterPreprocessors: AbilityPreprocessorBase[] = [
  new CastoricePreprocessor(),
]

export const setPreprocessors: AbilityPreprocessorBase[] = [
  new ScholarLostInEruditionPreprocessor(),
  new WavestriderCaptainPreprocessor(),
]

/**
 * Some passives such as Scholar Lost In Erudition set only activate after abilities trigger them.
 * Use the simulation ability rotation to precompute when their activations are active.
 */
export function precomputeConditionalActivations(comboState: ComboState, request: Form) {
  const filteredSetPreprocessors = setPreprocessors
  const filteredCharacterPreprocessors = characterPreprocessors.filter((x) => x.id == request.characterId)

  for (const pre of filteredSetPreprocessors) pre.reset()
  for (const pre of filteredCharacterPreprocessors) pre.reset()

  const comboAbilities = preprocessTurnAbilities(comboState.comboTurnAbilities.map(toTurnAbility))
  for (let i = 1; i < comboAbilities.length; i++) {
    const turnAbility = comboAbilities[i]
    for (const preprocessor of filteredSetPreprocessors) {
      preprocessor.processAbility(turnAbility, i, comboState)
    }
    for (const preprocessor of filteredCharacterPreprocessors) {
      preprocessor.processAbility(turnAbility, i, comboState)
    }
  }
}
