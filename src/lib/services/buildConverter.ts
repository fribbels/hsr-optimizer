import { DEFAULT_TEAM } from 'lib/constants/constants'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import { createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import type { OptimizerRequestState, TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import type { Character, CharacterId } from 'types/character'
import type { Form, Teammate } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import {
  BuildSource,
  type Build,
  type CharacterSavedBuild,
  type OptimizerSavedBuild,
  type SavedBuild,
  type SavedTeammate,
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

export function serializeFromCharacterTab(
  name: string,
  character: Character,
  teammates: Teammate[] | undefined,
  teamSelection: string | undefined,
): CharacterSavedBuild {
  const isCustom = teamSelection != null && teamSelection !== DEFAULT_TEAM
  const team: TeamTuple<SavedTeammate> = isCustom && teammates
    ? teammatesFromSimulation(teammates)
    : [null, null, null]

  return {
    source: BuildSource.Character,
    name,
    characterId: character.id,
    equipped: { ...character.equipped },
    characterEidolon: character.form.characterEidolon,
    lightCone: character.form.lightCone,
    lightConeSuperimposition: character.form.lightConeSuperimposition,
    team,
  }
}

function teammatesFromSimulation(teammates: Teammate[]): TeamTuple<SavedTeammate> {
  const result: (SavedTeammate | null)[] = [null, null, null]
  for (let i = 0; i < 3 && i < teammates.length; i++) {
    const tm = teammates[i]
    if (!tm?.characterId) continue
    result[i] = {
      characterId: tm.characterId,
      characterEidolon: tm.characterEidolon,
      lightCone: tm.lightCone,
      lightConeSuperimposition: tm.lightConeSuperimposition,
      teamRelicSet: tm.teamRelicSet,
      teamOrnamentSet: tm.teamOrnamentSet,
    }
  }
  return result as TeamTuple<SavedTeammate>
}

export function deserializeBuild(
  build: SavedBuild,
  currentForm: Form,
): Partial<OptimizerRequestState> {
  // LC flexibility — applies to both sources
  const lc = resolveFlexibleLC(
    build.lightCone, build.lightConeSuperimposition,
    currentForm.lightCone, currentForm.lightConeSuperimposition,
  )
  const eidolon = resolveEidolon(build.characterEidolon, currentForm.characterEidolon)

  const basePatch: Partial<OptimizerRequestState> = {
    characterEidolon: eidolon,
    lightCone: lc.lightCone,
    lightConeSuperimposition: lc.lightConeSuperimposition,
  }

  if (build.source === BuildSource.Character) {
    // Character tab builds only override LC + eidolon
    return basePatch
  }

  // Optimizer builds override all damage-affecting fields
  function toTeammateState(tm: SavedTeammateWithConditionals | null): TeammateState {
    if (!tm) return createDefaultTeammate()
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

  const teammates: [TeammateState, TeammateState, TeammateState] = [
    toTeammateState(build.team[0]),
    toTeammateState(build.team[1]),
    toTeammateState(build.team[2]),
  ]

  return {
    ...basePatch,
    teammates,
    characterConditionals: { ...build.characterConditionals },
    lightConeConditionals: { ...build.lightConeConditionals },
    setConditionals: Object.fromEntries(
      Object.entries(build.setConditionals).map(([k, v]) => [k, [...v]]),
    ) as SetConditionals,
    comboType: build.comboType,
    comboStateJson: build.comboStateJson,
    comboPreprocessor: build.comboPreprocessor,
    comboTurnAbilities: [...build.comboTurnAbilities],
    deprioritizeBuffs: build.deprioritizeBuffs,
  }
}
