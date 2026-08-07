import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { calculateContextConditionalRegistry } from 'lib/optimization/calculateConditionals'
import { rebuildEntityRegistry } from 'lib/optimization/engine/container/computedStatsContainer'
import type { OptimizerContext } from 'types/optimizer'

export function initializeContextConditionals(context: OptimizerContext) {
  context.characterController = CharacterConditionalsResolver.get(context)
  context.lightConeController = LightConeConditionalsResolver.get(context)

  for (const action of [...context.rotationActions, ...context.defaultActions]) {
    // Reconstruct arrays after transfer
    action.precomputedStats.a = new Float64Array(Object.values(action.precomputedStats.a))

    // Rebuild entityRegistry from entitiesArray after serialization
    if (action.config) {
      rebuildEntityRegistry(action.config)
    }

    calculateContextConditionalRegistry(action, context, context.characterController, context.lightConeController)
  }
}
