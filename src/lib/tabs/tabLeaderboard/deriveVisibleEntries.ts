import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import {
  LEADERBOARD_FILTER_ALL,
  type LeaderboardEidolonFilter,
} from 'leaderboard/shared/eidolonConfig'
import type { PublicCharacterData } from 'leaderboard/shared/types'
import { IS_LOCALHOST } from 'lib/tabs/tabLeaderboard/leaderboardCharacterHelpers'
import { mapPublicEntry } from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import type { LeaderboardEntry } from 'lib/tabs/tabLeaderboard/leaderboardTabTypes'

export const LEADERBOARD_DISPLAY_TOP_N = 100

export interface DeriveVisibleEntriesInput {
  characterData: PublicCharacterData | null
  activeConfigType: LeaderboardConfigType | null
  activeTeamId: string
  filterCharacterEidolon: LeaderboardEidolonFilter
}

export function deriveVisibleEntries(input: DeriveVisibleEntriesInput): LeaderboardEntry[] {
  const { characterData, activeConfigType, activeTeamId, filterCharacterEidolon } = input

  if (!characterData || !activeConfigType) return []

  const configData = characterData.configs[activeConfigType]
  if (!configData) return []

  const entries: LeaderboardEntry[] = []

  if (activeTeamId === LEADERBOARD_FILTER_ALL) {
    for (const board of Object.values(configData.teamsById)) {
      entries.push(...board.entries.map((e) => mapPublicEntry(e)))
    }
  } else {
    const board = configData.teamsById[activeTeamId]
    if (board) {
      entries.push(...board.entries.map((e) => mapPublicEntry(e)))
    }
  }

  const best = new Map<string, LeaderboardEntry>()
  for (const entry of entries) {
    const current = best.get(entry.candidateId)
    if (!current || entry.score > current.score || (entry.score === current.score && entry.buildId < current.buildId)) {
      best.set(entry.candidateId, entry)
    }
  }

  const ranked = [...best.values()]
    .sort((a, b) => b.score - a.score || a.buildId.localeCompare(b.buildId))
    .map((entry, i) => ({ ...entry, rank: i + 1 }))

  const qualified = IS_LOCALHOST ? ranked : ranked.filter((e) => e.score >= 1.50)

  // Cap by overall rank before the eidolon filter so nothing past the cutoff shows.
  const topRanked = qualified.slice(0, LEADERBOARD_DISPLAY_TOP_N)

  return filterCharacterEidolon !== LEADERBOARD_FILTER_ALL
    ? topRanked.filter((e) => e.eidolonGroup === filterCharacterEidolon)
    : topRanked
}
