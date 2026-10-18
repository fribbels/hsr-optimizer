import { findTeamAction } from 'lib/conditionals/conditionalUtils'
import { type OptimizerAction } from 'types/optimizer'

// Keep this id available to every Elation consumer without importing Aha's controller.
export const AEON_AHA_ID = '1511'

export enum AhaAscension {
  None = 0,
  AhaE0 = 1,
  AhaE2 = 2,
}

// Read Aha's Faces of Elation state from the primary action and its teammates.
export function getAhaAscension(action: OptimizerAction): AhaAscension {
  const ahaAction = findTeamAction(action, AEON_AHA_ID)
  if (!ahaAction?.characterConditionals.facesOfElation) return AhaAscension.None

  return (ahaAction.actorEidolon >= 2) ? AhaAscension.AhaE2 : AhaAscension.AhaE0
}
