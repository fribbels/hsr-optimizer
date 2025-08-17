import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { OptimizerForm } from 'types/form'
import { HitAction } from 'types/hitConditionalTypes'
import { OptimizerContext } from 'types/optimizer'

export function calculateActions(request: OptimizerForm, context: OptimizerContext) {
  const actions = context.actions

  const characterConditionalController = CharacterConditionalsResolver.get(context)
  const actionDefinitions = characterConditionalController.actionDefinition?.() ?? []
  const actionMapping: Record<string, HitAction> = {}

  for (const actionDefinition of actionDefinitions) {
    actionMapping[actionDefinition.name] = actionDefinition
  }

  const teammates = [
    context.teammate0Metadata,
    context.teammate1Metadata,
    context.teammate2Metadata,
  ].filter((x) => !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate)

    // const teammateActionDefinitions = teammateCharacterConditionals.actionDefinition?.()
  }

  const refinedActions = actions.map((action) => actionMapping[action.actionType])
  for (let i = 1; i < actions.length; i++) {
    const action = actions[i]
    action.hits = refinedActions[i].hits
  }
  context.hitActions = refinedActions

  console.log(refinedActions)
}
