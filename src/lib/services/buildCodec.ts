import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import type { OptimizerRequestState, TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import {
  BuildSource,
  type Build,
  type OptimizerSavedBuild,
  type SavedTeammateWithConditionals,
  type TeamTuple,
} from 'types/savedBuild'

export function resolveFlexibleLC(
  savedLC: LightConeId,
  savedSI: number,
  currentLC: LightConeId,
  currentSI: number,
): { lightCone: LightConeId; lightConeSuperimposition: number } {
  if (savedLC === currentLC) {
    return { lightCone: savedLC, lightConeSuperimposition: Math.max(savedSI, currentSI) }
  }
  return { lightCone: savedLC, lightConeSuperimposition: savedSI }
}

export function resolveEidolon(savedEidolon: number, currentEidolon: number): number {
  return Math.max(savedEidolon, currentEidolon)
}

// Precondition: state.lightCone must be defined. Service validates before calling.
export function serializeFromOptimizer(
  name: string,
  characterId: CharacterId,
  state: OptimizerRequestState & { lightCone: LightConeId },
  equipped: Build,
): OptimizerSavedBuild {
  function serializeTeammate(tm: TeammateState): SavedTeammateWithConditionals | null {
    if (!tm.characterId || !tm.lightCone) return null
    return {
      characterId: tm.characterId,
      characterEidolon: tm.characterEidolon,
      lightCone: tm.lightCone,
      lightConeSuperimposition: tm.lightConeSuperimposition,
      teamRelicSet: tm.teamRelicSet,
      teamOrnamentSet: tm.teamOrnamentSet,
      characterConditionals: { ...tm.characterConditionals },
      lightConeConditionals: { ...tm.lightConeConditionals },
    }
  }

  const team: TeamTuple<SavedTeammateWithConditionals> = [
    serializeTeammate(state.teammates[0]),
    serializeTeammate(state.teammates[1]),
    serializeTeammate(state.teammates[2]),
  ]

  return {
    source: BuildSource.Optimizer,
    name,
    characterId,
    equipped: { ...equipped },
    characterEidolon: state.characterEidolon,
    lightCone: state.lightCone,
    lightConeSuperimposition: state.lightConeSuperimposition,
    team,
    characterConditionals: { ...state.characterConditionals },
    lightConeConditionals: { ...state.lightConeConditionals },
    setConditionals: Object.fromEntries(
      Object.entries(state.setConditionals).map(([k, v]) => [k, [...v]]),
    ) as SetConditionals,
    comboType: state.comboType,
    comboStateJson: state.comboStateJson,
    comboPreprocessor: state.comboPreprocessor,
    comboTurnAbilities: [...state.comboTurnAbilities],
    deprioritizeBuffs: state.deprioritizeBuffs,
  }
}
