import { ConditionalActivation } from 'lib/constants/constants'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { ConditionalValueMap } from 'types/conditionals'
import { OptimizerAction, OptimizerContext, TeammateAction, } from 'types/optimizer'

export type DynamicConditional = {
  id: string,
  type: number,
  activation: number,
  dependsOn: string[],
  chainsTo: string[],
  supplementalState?: string[],
  condition: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => boolean | number,
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => void,
  gpu: (action: OptimizerAction, context: OptimizerContext) => string,
  teammateIndex?: number,
}

function getTeammateFromIndex(conditional: DynamicConditional, action: OptimizerAction): TeammateAction {
  if (conditional.teammateIndex === 0) return action.teammate0
  else if (conditional.teammateIndex === 1) return action.teammate1
  else return action.teammate2
}

export function evaluateConditional(conditional: DynamicConditional, x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  let savedCharConds: ConditionalValueMap | undefined
  let savedLcConds: ConditionalValueMap | undefined

  if (conditional.teammateIndex != null) {
    const teammate = getTeammateFromIndex(conditional, action)
    savedCharConds = action.teammateCharacterConditionals
    savedLcConds = action.teammateLightConeConditionals
    action.teammateCharacterConditionals = teammate.characterConditionals
    action.teammateLightConeConditionals = teammate.lightConeConditionals
  }

  if (conditional.activation == ConditionalActivation.SINGLE) {
    if (!action.conditionalState[conditional.id] && conditional.condition(x, action, context)) {
      action.conditionalState[conditional.id] = 1
      conditional.effect(x, action, context)
    }
  } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
    if (conditional.condition(x, action, context)) {
      conditional.effect(x, action, context)
    }
  }

  if (conditional.teammateIndex != null) {
    action.teammateCharacterConditionals = savedCharConds!
    action.teammateLightConeConditionals = savedLcConds!
  }
}

export function newConditionalWgslWrapper(conditional: DynamicConditional, action: OptimizerAction, context: OptimizerContext, wgsl: string) {
  return `
fn evaluate${conditional.id}${action.actionIdentifier}(p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>, p_sets: ptr<function, Sets>, p_state: ptr<function, ConditionalState>) {
${indent(wgsl.trim(), 1)}
}
  `
}
