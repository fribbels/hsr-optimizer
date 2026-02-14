import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export function calculateBaseMultis(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  // TODO
  if (lightConeConditionalController.finalizeCalculations) lightConeConditionalController.finalizeCalculations(x, action, context)
  if (characterConditionalController.finalizeCalculations) characterConditionalController.finalizeCalculations(x, action, context)
}
