import { CastoricePreprocessor, TheHertaPreprocessor, YunliPreprocessor } from 'lib/optimization/rotation/preprocessor/preprocessCharacters'
import { ScholarLostInEruditionPreprocessor, WavestriderCaptainPreprocessor } from 'lib/optimization/rotation/preprocessor/preprocessSets'
import { AbilityPreprocessorBase } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { toTurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { preprocessTurnAbilities } from 'lib/optimization/rotation/turnPreprocessor'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form } from 'types/form'

export const characterPreprocessors: AbilityPreprocessorBase[] = [
  new CastoricePreprocessor(),
  new TheHertaPreprocessor(),
  new YunliPreprocessor(),
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

  for (const preprocessor of filteredSetPreprocessors) preprocessor.reset()
  for (const preprocessor of filteredCharacterPreprocessors) preprocessor.reset()

  const comboTurnAbilities = preprocessTurnAbilities(comboState.comboTurnAbilities.map(toTurnAbility))

  for (let i = 1; i < comboTurnAbilities.length; i++) {
    const turnAbility = comboTurnAbilities[i]

    for (const preprocessor of filteredSetPreprocessors) {
      preprocessor.processAbility(turnAbility, i, comboState)
    }

    for (const preprocessor of filteredCharacterPreprocessors) {
      preprocessor.processAbility(turnAbility, i, comboState)
    }
  }
}
