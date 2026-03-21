import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import {
  DEFAULT_BASIC,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerInitializers'
import type { CharacterId } from 'types/character'
import type {
  CharacterConditionalsController,
  LightConeConditionalsController,
} from 'types/conditionals'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import { mergeUndefinedValues } from 'lib/utils/objectUtils'

export function generateFullDefaultForm(
  characterId: CharacterId,
  lightCone: LightConeId,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teammate = false,
): Form {
  // @ts-expect-error - Legacy pattern: returns null typed as Form for missing characterId
  if (!characterId) return null

  const dbMetadata = getGameMetadata()

  const simulationForm: Form = getDefaultForm({ id: characterId })

  simulationForm.characterId = characterId
  simulationForm.characterEidolon = characterEidolon
  simulationForm.lightCone = lightCone
  simulationForm.lightConeSuperimposition = lightConeSuperimposition

  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}

  const characterConditionalsRequest = { characterId: characterId, characterEidolon: characterEidolon }
  const lightConeConditionalsRequest = generateConditionalResolverMetadata(simulationForm, dbMetadata)

  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(characterConditionalsRequest)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(lightConeConditionalsRequest)

  if (teammate) {
    if (characterConditionals.teammateDefaults) mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.teammateDefaults())
    if (lightConeConditionals.teammateDefaults) mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.teammateDefaults())
  } else {
    if (characterConditionals.defaults) mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.defaults())
    if (lightConeConditionals.defaults) mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.defaults())
  }

  const simulationMetadata = getGameMetadata().characters[characterId].scoringMetadata?.simulation
  if (simulationMetadata) {
    simulationForm.comboTurnAbilities = [...simulationMetadata.comboTurnAbilities]
  } else {
    simulationForm.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC]
  }

  return simulationForm
}
