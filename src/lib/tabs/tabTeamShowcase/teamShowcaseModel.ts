import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { TEAM_SIZE } from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { TeamShowcaseSavedTeam } from 'types/store'

export function normalizeTeamSlots(ids: TeamSlots): TeamSlots {
  return Array.from({ length: TEAM_SIZE }, (_, index) => ids[index] ?? null)
}

export function sanitizeTeamSlots(
  ids: TeamSlots,
  charactersById: Partial<Record<CharacterId, Character>>,
): TeamSlots {
  return normalizeTeamSlots(ids).map((id) => (id && charactersById[id] ? id : null))
}

export function areTeamSlotsEqual(a: TeamSlots, b: TeamSlots): boolean {
  const normalizedA = normalizeTeamSlots(a)
  const normalizedB = normalizeTeamSlots(b)
  return normalizedA.every((id, index) => id === normalizedB[index])
}

export function areSavedTeamsEqual(a: TeamShowcaseSavedTeam[], b: TeamShowcaseSavedTeam[]): boolean {
  return a.length === b.length && a.every((team, index) => {
    const other = b[index]
    return team.id === other.id
      && team.name === other.name
      && areTeamSlotsEqual(team.characterIds, other.characterIds)
  })
}

export function autofillTeamSlots(
  slots: TeamSlots,
  leaderId: CharacterId,
  ownedIds: Set<CharacterId>,
): TeamSlots {
  const teammates = getScoringMetadata(leaderId).simulation?.teammates ?? []
  const candidates = teammates
    .map((teammate) => teammate.characterId)
    .filter((id) => id !== leaderId && ownedIds.has(id))

  const filled = [...slots]
  for (let index = 0; index < filled.length; index++) {
    if (filled[index] != null) continue
    const next = candidates.find((id) => !filled.includes(id))
    if (!next) break
    filled[index] = next
  }
  return filled
}

export function isSavedTeamIndex(index: number, teams: TeamShowcaseSavedTeam[]): boolean {
  return Number.isInteger(index) && index >= 0 && index < teams.length
}
