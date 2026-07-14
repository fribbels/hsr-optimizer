import {
  LEADERBOARD_CONFIG_TYPES,
  type LeaderboardConfigType,
} from 'leaderboard/shared/configTypeMapping'
import { LEADERBOARD_FILTER_ALL } from 'leaderboard/shared/eidolonConfig'
import type { PublicCharacterData } from 'leaderboard/shared/types'
import { deriveVisibleEntries } from 'lib/tabs/tabLeaderboard/deriveVisibleEntries'
import {
  computeBrowserCandidateId,
  hashLeaderboardUid,
} from 'lib/tabs/tabLeaderboard/leaderboardBrowserHash'
import type { CharacterId } from 'types/character'

export type LoadedLeaderboardCharacter = {
  characterId: CharacterId,
  characterData: PublicCharacterData,
}

export type UserLeaderboardRank = {
  characterId: CharacterId,
  configType: LeaderboardConfigType,
  rank: number,
  score: number,
  buildId: string,
}

function hasCandidate(characterData: PublicCharacterData, configType: LeaderboardConfigType, candidateId: string): boolean {
  const configData = characterData.configs[configType]
  if (!configData) return false
  for (const board of Object.values(configData.teamsById)) {
    if (board.entries.some((e) => e.candidateId === candidateId)) return true
  }
  return false
}

export async function lookupUserLeaderboardRanks(
  uid: string,
  characters: readonly LoadedLeaderboardCharacter[],
): Promise<UserLeaderboardRank[]> {
  const uidHash = await hashLeaderboardUid(uid)
  const candidateIds = await Promise.all(
    characters.map(({ characterId }) => computeBrowserCandidateId(uidHash, characterId)),
  )
  const matches: UserLeaderboardRank[] = []

  for (let characterIndex = 0; characterIndex < characters.length; characterIndex++) {
    const { characterId, characterData } = characters[characterIndex]
    const candidateId = candidateIds[characterIndex]

    for (const configType of LEADERBOARD_CONFIG_TYPES) {
      if (!hasCandidate(characterData, configType, candidateId)) continue

      const entry = deriveVisibleEntries({
        characterData,
        activeConfigType: configType,
        activeTeamId: LEADERBOARD_FILTER_ALL,
        filterCharacterEidolon: LEADERBOARD_FILTER_ALL,
      }).find((candidate) => candidate.candidateId === candidateId)
      if (!entry) continue

      matches.push({
        characterId,
        configType,
        rank: entry.rank,
        score: entry.score,
        buildId: entry.buildId,
      })
    }
  }

  return matches.sort((a, b) => a.rank - b.rank)
}
