import { ConditionalActivation } from 'lib/constants/constants'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  TeammateAction,
} from 'types/optimizer'

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
  let conditionalAction: OptimizerAction
  if (conditional.teammateIndex != null) {
    const teammate = getTeammateFromIndex(conditional, action)
    conditionalAction = {
      ...action,
      teammateCharacterConditionals: teammate.characterConditionals,
      teammateLightConeConditionals: teammate.lightConeConditionals,
    }
  } else {
    conditionalAction = action
  }

  if (conditional.activation == ConditionalActivation.SINGLE) {
    if (!action.conditionalState[conditional.id] && conditional.condition(x, conditionalAction, context)) {
      action.conditionalState[conditional.id] = 1
      conditional.effect(x, conditionalAction, context)
    }
  } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
    if (conditional.condition(x, conditionalAction, context)) {
      conditional.effect(x, conditionalAction, context)
    }
  } else {
    // No-op
  }
}

export function conditionalWgslWrapper(conditional: DynamicConditional, wgsl: string, context: OptimizerContext) {
  return `
fn evaluate${conditional.id}(p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>, p_sets: ptr<function, Sets>, p_state: ptr<function, ConditionalState>) {
  let x = *p_x;
${indent(wgsl.trim(), 1)}
}
  `
}

export function newConditionalWgslWrapper(conditional: DynamicConditional, action: OptimizerAction, context, wgsl: string) {
  return `
fn evaluate${conditional.id}${action.actionIdentifier}(p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>, p_sets: ptr<function, Sets>, p_state: ptr<function, ConditionalState>) {
  let container = *p_container;
${indent(wgsl.trim(), 1)}
}
  `
}
