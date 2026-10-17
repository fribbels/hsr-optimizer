import { findTeamAction } from 'lib/conditionals/conditionalUtils'
import { type OptimizerAction } from 'types/optimizer'

// Keep this id available to every Elation consumer without importing Aha's controller.
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

export function getAhaE6Punchline(action: OptimizerAction): number {
  const ahaAction = findTeamAction(action, AEON_AHA_ID)
  return (ahaAction && ahaAction.actorEidolon >= 6 && ahaAction.characterConditionals.e6FirstUltimatePunchline) ? 100 : 0
}

export function isAhaTrueDmgEnabled(action: OptimizerAction): boolean {
  const ahaAction = findTeamAction(action, AEON_AHA_ID)
  return !!ahaAction?.characterConditionals.elationSkillTrueDmg
}
