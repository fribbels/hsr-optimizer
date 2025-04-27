import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { calculateContextConditionalRegistry, wrapTeammateDynamicConditional } from 'lib/optimization/calculateConditionals'
import { CharacterMetadata, OptimizerAction, OptimizerContext } from 'types/optimizer'

export function initializeContextConditionals(context: OptimizerContext) {
  context.characterConditionalController = CharacterConditionalsResolver.get(context)
  context.lightConeConditionalController = LightConeConditionalsResolver.get(context)

  for (const action of context.actions) {
    action.teammateDynamicConditionals = []
    if (context.teammate0Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate0Metadata, 0)
    if (context.teammate1Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate1Metadata, 1)
    if (context.teammate2Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate2Metadata, 2)

    // Reconstruct arrays after transfer
    action.precomputedX.a = new Float32Array(Object.values(action.precomputedX.a))
    action.precomputedM.a = new Float32Array(Object.values(action.precomputedM.a))

    calculateContextConditionalRegistry(action, context, context.characterConditionalController, context.lightConeConditionalController)
  }
}

// For Sunday E6 / etc
function calculateTeammateDynamicConditionals(action: OptimizerAction, teammateMetadata: CharacterMetadata, index: number) {
  if (teammateMetadata?.characterId) {
    const teammateCharacterConditionalController = CharacterConditionalsResolver.get(teammateMetadata)
    const dynamicConditionals = (teammateCharacterConditionalController.teammateDynamicConditionals ?? [])
      .map((dynamicConditional: DynamicConditional) => {
        const wrapped = wrapTeammateDynamicConditional(dynamicConditional, index)
        action.teammateDynamicConditionals.push(wrapped)
        return wrapped
      })
  }
}
