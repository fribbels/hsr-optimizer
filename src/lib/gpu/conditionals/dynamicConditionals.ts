import { ConditionalActivation } from 'lib/constants/constants'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext, TeammateAction } from 'types/optimizer'

export type DynamicConditional = {
  id: string
  type: number
  activation: number
  dependsOn: string[]
  condition: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => boolean | number
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void
  gpu: (action: OptimizerAction, context: OptimizerContext) => string
  ratioConversion?: boolean
  teammateIndex?: number
}

function getTeammateFromIndex(conditional: DynamicConditional, action: OptimizerAction): TeammateAction {
  if (conditional.teammateIndex === 0) return action.teammate0
  else if (conditional.teammateIndex === 1) return action.teammate1
  else return action.teammate2
}

export function evaluateConditional(conditional: DynamicConditional, x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  if (conditional.teammateIndex != null) {
    const teammate = getTeammateFromIndex(conditional, action)
    const teammateAction = {
      ...action,
      characterConditionals: teammate.characterConditionals,
      lightConeConditionals: teammate.lightConeConditionals,
    }
    if (conditional.activation == ConditionalActivation.SINGLE) {
      if (!action.conditionalState[conditional.id] && conditional.condition(x, teammateAction, context)) {
        action.conditionalState[conditional.id] = 1
        conditional.effect(x, teammateAction, context)
      }
    } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
      if (conditional.condition(x, teammateAction, context)) {
        conditional.effect(x, teammateAction, context)
      }
    } else {
      //
    }
  } else {
    const primaryAction = context.actions[action.actionIndex]
    if (conditional.activation == ConditionalActivation.SINGLE) {
      if (!primaryAction.conditionalState[conditional.id] && conditional.condition(x, primaryAction, context)) {
        primaryAction.conditionalState[conditional.id] = 1
        conditional.effect(x, primaryAction, context)
      }
    } else if (conditional.activation == ConditionalActivation.CONTINUOUS) {
      if (conditional.condition(x, primaryAction, context)) {
        conditional.effect(x, primaryAction, context)
      }
    } else {
      //
    }
  }
}

export function conditionalWgslWrapper(conditional: DynamicConditional, wgsl: string) {
  return `
fn evaluate${conditional.id}(p_x: ptr<function, ComputedStats>, p_m: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
  let x = *p_x;
${indent(wgsl.trim(), 1)}
}
  `
}
