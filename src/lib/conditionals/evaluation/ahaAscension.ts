import { findTeamAction } from 'lib/conditionals/conditionalUtils'
import { type OptimizerAction } from 'types/optimizer'

// Aeon ★ Aha is not registered in game_data.json yet, so consumers key on the raw id
export const AEON_AHA_ID = '1511'

export enum AhaAscension {
  NONE = 0,
  BASE = 1,
  ENHANCED = 2,
}

// Faces of Elation (Aha's Ult state) ascends the Path of Elation: ally Elation characters activate their Innate
// Traces at the BASE tier, and Aha's E2 upgrades them to ENHANCED. Reads Aha's facesOfElation toggle from
// whichever panel she is on. Pass the primary action (originalCharacterAction inside teammate-role containers).
export function getAhaAscension(action: OptimizerAction): AhaAscension {
  const ahaAction = findTeamAction(action, AEON_AHA_ID)
  if (!ahaAction?.characterConditionals.facesOfElation) return AhaAscension.NONE

  return (ahaAction.actorEidolon >= 2) ? AhaAscension.ENHANCED : AhaAscension.BASE
}
