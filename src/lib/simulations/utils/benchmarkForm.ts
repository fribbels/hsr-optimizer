import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { generateConditionalResolverMetadata } from 'lib/optimization/combo/comboInitializers'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import {
  DEFAULT_BASIC,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'
import type {
  CharacterConditionalsController,
  LightConeConditionalsController,
} from 'types/conditionals'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'

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

  const characterConditionalsRequest = { characterId: characterId, characterEidolon: characterEidolon }
  const lightConeConditionalsRequest = generateConditionalResolverMetadata(simulationForm, dbMetadata)

  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(characterConditionalsRequest)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(lightConeConditionalsRequest)

  if (teammate) {
    simulationForm.characterConditionals = characterConditionals.teammateDefaults ? { ...characterConditionals.teammateDefaults() } : {}
    simulationForm.lightConeConditionals = lightConeConditionals.teammateDefaults ? { ...lightConeConditionals.teammateDefaults() } : {}
  } else {
    simulationForm.characterConditionals = characterConditionals.defaults ? { ...characterConditionals.defaults() } : {}
    simulationForm.lightConeConditionals = lightConeConditionals.defaults ? { ...lightConeConditionals.defaults() } : {}
  }

  const simulationMetadata = dbMetadata.characters[characterId].scoringMetadata?.simulation
  if (simulationMetadata) {
    simulationForm.comboTurnAbilities = [...simulationMetadata.comboTurnAbilities]
  } else {
    simulationForm.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC]
  }

  return simulationForm
}
