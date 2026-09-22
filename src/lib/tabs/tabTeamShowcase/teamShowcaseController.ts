import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import {
  areBenchmarkSnapshotsEqual,
  areTeamSlotsEqual,
  normalizeTeamSlots,
  sanitizeTeamSlots,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type {
  Character,
} from 'types/character'
import type { TeamShowcaseSavedTeam } from 'types/store'

/** Restores characters referenced by a saved team, then returns slots safe for local working state. */
export function loadSavedTeamSlots(slots: TeamSlots): TeamSlots {
  const normalized = normalizeTeamSlots(slots)
  const rosterChanged = restoreMissingCharacters(normalized)
  if (rosterChanged) SaveState.delayedSave()
  return sanitizeTeamSlots(normalized, useCharacterStore.getState().charactersById)
}

function restoreMissingCharacters(slots: TeamSlots): boolean {
  const characterState = useCharacterStore.getState()
  const knownIds = new Set(characterState.characters.map((character) => character.id))
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

function areSavedTeamsEqual(a: TeamShowcaseSavedTeam[], b: TeamShowcaseSavedTeam[]): boolean {
  return a.length === b.length && a.every((team, index) => {
    const other = b[index]
    return team.id === other.id
      && team.name === other.name
      && areTeamSlotsEqual(team.characterIds, other.characterIds)
      && areBenchmarkSnapshotsEqual(team.benchmarkSnapshot, other.benchmarkSnapshot)
  })
}
