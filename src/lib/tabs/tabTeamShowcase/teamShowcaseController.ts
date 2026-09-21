import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import {
  areSavedTeamsEqual,
  areTeamSlotsEqual,
  normalizeTeamSlots,
  sanitizeTeamSlots,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { TeamShowcaseSavedTeam } from 'types/store'

export function readTeamSlots(): TeamSlots {
  const { savedSession } = useGlobalStore.getState()
  return sanitizeTeamSlots(savedSession.teamShowcaseCharacterIds, useCharacterStore.getState().charactersById)
}

export function writeTeamSlots(slots: TeamSlots) {
  if (!updateTeamSlots(slots)) return
  SaveState.delayedSave()
}

export function loadTeamSlots(slots: TeamSlots) {
  const normalized = normalizeTeamSlots(slots)
  const rosterChanged = restoreMissingCharacters(normalized)
  const slotsChanged = updateTeamSlots(normalized)
  if (rosterChanged || slotsChanged) SaveState.delayedSave()
}

function updateTeamSlots(slots: TeamSlots): boolean {
  const { savedSession, setSavedSessionKey } = useGlobalStore.getState()
  const sanitized = sanitizeTeamSlots(slots, useCharacterStore.getState().charactersById)
  if (areTeamSlotsEqual(savedSession.teamShowcaseCharacterIds, sanitized)) return false

  setSavedSessionKey(SavedSessionKeys.teamShowcaseCharacterIds, sanitized)
  return true
}

function restoreMissingCharacters(slots: TeamSlots): boolean {
  const characterState = useCharacterStore.getState()
  const knownIds = new Set(Object.keys(characterState.charactersById) as CharacterId[])
  const metadata = getGameMetadata().characters
  const additions: Character[] = []

  for (const id of slots) {
    if (!id || knownIds.has(id) || !metadata[id]) continue
    knownIds.add(id)
    additions.push({
      id,
      form: getDefaultForm({ id }),
      equipped: {},
    })
  }

  if (additions.length === 0) return false

  const prepend = useGlobalStore.getState().settings.NewCharacterDefaultRank === SettingOptions.NewCharacterDefaultRank.First
  characterState.setCharacters(
    prepend
      ? [...additions, ...characterState.characters]
      : [...characterState.characters, ...additions],
  )
  return true
}

export function readSavedTeams(): TeamShowcaseSavedTeam[] {
  return useGlobalStore.getState().savedSession.teamShowcaseSavedTeams
}

export function writeSavedTeams(teams: TeamShowcaseSavedTeam[]) {
  const { savedSession, setSavedSessionKey } = useGlobalStore.getState()
  if (areSavedTeamsEqual(savedSession.teamShowcaseSavedTeams, teams)) return

  setSavedSessionKey(SavedSessionKeys.teamShowcaseSavedTeams, teams)
  SaveState.delayedSave()
}
