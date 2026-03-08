import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export function calculateBaseMultis(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const lightConeController = context.lightConeController
  const characterController = context.characterController

  // TODO
  if (lightConeController.finalizeCalculations) lightConeController.finalizeCalculations(x, action, context)
  if (characterController.finalizeCalculations) characterController.finalizeCalculations(x, action, context)
}
