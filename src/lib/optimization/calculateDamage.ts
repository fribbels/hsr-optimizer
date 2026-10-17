import { evaluateTerminalSetConditionals } from 'lib/optimization/calculateStats'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export function calculateBaseMultis(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const lightConeController = context.lightConeController
  const characterController = context.characterController

  if (lightConeController.finalizeCalculations) lightConeController.finalizeCalculations(x, action, context)
  if (characterController.finalizeCalculations) characterController.finalizeCalculations(x, action, context)

  // Set requirements must include stat buffs applied during finalization.
  evaluateTerminalSetConditionals(x, x.a, x.c.setMatches, action, context)
}
