import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { sanitizeTeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type { TeamShowcaseSavedTeam } from 'types/store'

export function readTeamSlots(): TeamSlots {
  const { savedSession } = useGlobalStore.getState()
  return sanitizeTeamSlots(savedSession.teamShowcaseCharacterIds, useCharacterStore.getState().charactersById)
}

export function writeTeamSlots(slots: TeamSlots) {
  useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.teamShowcaseCharacterIds, slots)
  SaveState.delayedSave()
}

export function readSavedTeams(): TeamShowcaseSavedTeam[] {
  return useGlobalStore.getState().savedSession.teamShowcaseSavedTeams
}

export function writeSavedTeams(teams: TeamShowcaseSavedTeam[]) {
  useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.teamShowcaseSavedTeams, teams)
  SaveState.delayedSave()
}
