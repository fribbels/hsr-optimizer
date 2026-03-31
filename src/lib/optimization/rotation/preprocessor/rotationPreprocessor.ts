import {
  AnaxaCyreneEffectPreprocessor,
  ArcherPreprocessor,
  AshveilPreprocessor,
  CastoricePreprocessor,
  CyrenePreprocessor,
  HookPreprocessor,
  HysilensE1Preprocessor,
  JingliuB1DefPenPreprocessor,
  JingliuB1E2Preprocessor,
  PhainonPreprocessor,
  SaberPreprocessor,
  TheHertaPreprocessor,
  YunliPreprocessor,
} from 'lib/optimization/rotation/preprocessor/preprocessCharacters'
import {
  BandOfSizzlingThunderPreprocessor,
  FiresmithOfLavaForging as FiresmithOfLavaForgingPreprocessor,
  HunterOfGlacialForestPreprocessor,
  ScholarLostInEruditionPreprocessor,
  WavestriderCaptainPreprocessor,
} from 'lib/optimization/rotation/preprocessor/preprocessSets'
import { Sets } from 'lib/constants/constants'
import { ComboBooleanConditional, ComboState } from 'lib/optimization/combo/comboTypes'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { type AbilityPreprocessorBase } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { toTurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { preprocessTurnAbilities } from 'lib/optimization/rotation/turnPreprocessor'
import { type Form } from 'types/form'
import { ThusBurnsTheDawnPreprocessor } from 'lib/optimization/rotation/preprocessor/preprocessLightCones'

const characterPreprocessors: AbilityPreprocessorBase[] = [
  new AshveilPreprocessor(),
  new CastoricePreprocessor(),
  new TheHertaPreprocessor(),
  new YunliPreprocessor(),
  new HookPreprocessor(),
  new PhainonPreprocessor(),
  new SaberPreprocessor(),
  new ArcherPreprocessor(),
  new JingliuB1E2Preprocessor(),
  new JingliuB1DefPenPreprocessor(),
  new HysilensE1Preprocessor(),
  new AnaxaCyreneEffectPreprocessor(),
  new CyrenePreprocessor(),
]

const setPreprocessors: AbilityPreprocessorBase[] = [
  new ScholarLostInEruditionPreprocessor(),
  new WavestriderCaptainPreprocessor(),
  new FiresmithOfLavaForgingPreprocessor(),
  new HunterOfGlacialForestPreprocessor(),
  new BandOfSizzlingThunderPreprocessor(),
]

const lightConePreprocessors: AbilityPreprocessorBase[] = [
  new ThusBurnsTheDawnPreprocessor(),
]

/**
 * Skip the preprocessor when a default-ON set is explicitly toggled OFF (character can't use it).
 * Default-OFF sets with activations[0]=false are in their natural state — preprocessor still runs.
 */
function isSetPreprocessorEnabled(preprocessor: AbilityPreprocessorBase, comboState: ComboState): boolean {
  const category = comboState.comboCharacter.setConditionals[preprocessor.id] as ComboBooleanConditional
  if (!category) return true

  const defaultValue = defaultSetConditionals[preprocessor.id as Sets]?.[1]
  const userToggle = category.activations[0]

  return userToggle || !defaultValue
}

/**
 * Some passives such as Scholar Lost In Erudition set only activate after abilities trigger them.
 * Use the simulation ability rotation to precompute when their activations are active.
 */
export function precomputeConditionalActivations(comboState: ComboState, request: Form) {
  const filteredSetPreprocessors = setPreprocessors.filter((x) => {
    return isSetPreprocessorEnabled(x, comboState)
  })
  const filteredCharacterPreprocessors = characterPreprocessors.filter((x) => x.id == request.characterId)
  const filteredLightConePreprocessors = lightConePreprocessors.filter((x) => x.id == request.lightCone)

  for (const preprocessor of filteredSetPreprocessors) preprocessor.reset()
  for (const preprocessor of filteredCharacterPreprocessors) preprocessor.reset()
  for (const preprocessor of filteredLightConePreprocessors) preprocessor.reset()

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
