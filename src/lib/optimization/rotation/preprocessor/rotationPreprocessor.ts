import { ArcherPreprocessor, CastoricePreprocessor, HookPreprocessor, JingliuB1Preprocessor, PhainonPreprocessor, SaberPreprocessor, TheHertaPreprocessor, YunliPreprocessor } from 'lib/optimization/rotation/preprocessor/preprocessCharacters'
import { BandOfSizzlingThunderPreprocessor, FiresmithOfLavaForging as FiresmithOfLavaForgingPreprocessor, HunterOfGlacialForestPreprocessor, ScholarLostInEruditionPreprocessor, WavestriderCaptainPreprocessor } from 'lib/optimization/rotation/preprocessor/preprocessSets'
import { AbilityPreprocessorBase } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { toTurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { preprocessTurnAbilities } from 'lib/optimization/rotation/turnPreprocessor'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form } from 'types/form'
import { ThusBurnsTheDawnPreprocessor } from './preprocessLightCones'

export const characterPreprocessors: AbilityPreprocessorBase[] = [
  new CastoricePreprocessor(),
  new TheHertaPreprocessor(),
  new YunliPreprocessor(),
  new HookPreprocessor(),
  new PhainonPreprocessor(),
  new SaberPreprocessor(),
  new ArcherPreprocessor(),
  new JingliuB1Preprocessor(),
]

export const setPreprocessors: AbilityPreprocessorBase[] = [
  new ScholarLostInEruditionPreprocessor(),
  new WavestriderCaptainPreprocessor(),
  new FiresmithOfLavaForgingPreprocessor(),
  new HunterOfGlacialForestPreprocessor(),
  new BandOfSizzlingThunderPreprocessor(),
]

export const lightConePreprocessors: AbilityPreprocessorBase[] = [
  new ThusBurnsTheDawnPreprocessor(),
]

/**
 * Some passives such as Scholar Lost In Erudition set only activate after abilities trigger them.
 * Use the simulation ability rotation to precompute when their activations are active.
 */
export function precomputeConditionalActivations(comboState: ComboState, request: Form) {
  const filteredSetPreprocessors = setPreprocessors
  const filteredCharacterPreprocessors = characterPreprocessors.filter((x) => x.id == request.characterId)
  const filteredLightConePreprocessors = lightConePreprocessors.filter((x) => x.id == request.lightCone)

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

    for (const preprocessor of filteredLightConePreprocessors) {
      preprocessor.processAbility(turnAbility, i, comboState)
    }
  }
}
