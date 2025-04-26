import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import DB from 'lib/state/db'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Utils } from 'lib/utils/utils'
import { CharacterConditionalsController, LightConeConditionalsController } from 'types/conditionals'
import { Form } from 'types/form'

export function generateFullDefaultForm(
  characterId: string,
  lightCone: string,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teammate = false,
): Form {
  // @ts-ignore
  if (!characterId) return null

  const dbMetadata = DB.getMetadata()

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
    if (characterConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.teammateDefaults())
    if (lightConeConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.teammateDefaults())
  } else {
    if (characterConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.defaults())
    if (lightConeConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.defaults())
  }

  const simulationMetadata = DB.getMetadata().characters[characterId].scoringMetadata?.simulation
  if (simulationMetadata) {
    simulationForm.comboAbilities = [...simulationMetadata.comboAbilities]
    simulationForm.comboDot = simulationMetadata.comboDot
    simulationForm.comboBreak = simulationMetadata.comboBreak
  } else {
    // @ts-ignore
    simulationForm.comboAbilities = [null, 'BASIC']
    simulationForm.comboDot = 0
    simulationForm.comboBreak = 0
  }

  return simulationForm
}
