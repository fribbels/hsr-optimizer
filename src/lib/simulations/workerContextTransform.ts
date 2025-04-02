import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { OptimizerContext } from 'types/optimizer'

export function transformWorkerContext(context: OptimizerContext) {
  context.characterConditionalController = CharacterConditionalsResolver.get(context)
  context.lightConeConditionalController = LightConeConditionalsResolver.get(context)

  for (const action of context.actions) {
    // Reconstruct arrays after transfer
    action.precomputedX.a = new Float32Array(Object.values(action.precomputedX.a))
    action.precomputedM.a = new Float32Array(Object.values(action.precomputedM.a))
  }
}
