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

type OrderedUserLeaderboardRank = UserLeaderboardRank & { order: number }

export async function lookupUserLeaderboardRanks(
  uid: string,
  characters: readonly LoadedLeaderboardCharacter[],
): Promise<UserLeaderboardRank[]> {
  const uidHash = await hashLeaderboardUid(uid)
  const candidateIds = await Promise.all(
    characters.map(({ characterId }) => computeBrowserCandidateId(uidHash, characterId)),
  )
  const matches: OrderedUserLeaderboardRank[] = []

  for (let characterIndex = 0; characterIndex < characters.length; characterIndex++) {
    const { characterId, characterData } = characters[characterIndex]
    const candidateId = candidateIds[characterIndex]

    for (let configIndex = 0; configIndex < LEADERBOARD_CONFIG_TYPES.length; configIndex++) {
      const configType = LEADERBOARD_CONFIG_TYPES[configIndex]
      if (!characterData.configs[configType]) continue

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
        order: characterIndex * LEADERBOARD_CONFIG_TYPES.length + configIndex,
      })
    }
  }

  return matches
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .map(({ order: _order, ...rank }) => rank)
}
