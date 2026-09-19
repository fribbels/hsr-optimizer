import { atomicWriteJsonFile } from 'leaderboard/output/atomicWrite'
import {
  dirnamePath,
  fileExists,
  joinPath,
  readTextFile,
} from 'leaderboard/shared/nodeFacade'
import type {
  PrivateRankedOutput,
  PublicLeaderboardOutputV3,
} from 'leaderboard/shared/types'
import type { CharacterId } from 'types/character'

export const REFRESH_NO_WORK = 'LEADERBOARD_REFRESH_NO_WORK'

export type CharacterRefreshRecord = {
  completedAt: string,
  cacheVersion: string,
}

export type CharacterRefreshHistory = Partial<Record<CharacterId, CharacterRefreshRecord>>

export function readCharacterRefreshHistory(cacheDbPath: string): CharacterRefreshHistory {
  const path = refreshHistoryPath(cacheDbPath)
  if (!fileExists(path)) return {}
  // Written atomically; do not silently discard active cache versions on read errors.
  return JSON.parse(readTextFile(path)) as CharacterRefreshHistory
}

export function writeCharacterRefreshHistory(cacheDbPath: string, history: CharacterRefreshHistory): void {
  atomicWriteJsonFile(refreshHistoryPath(cacheDbPath), JSON.stringify(history, null, 2))
}

function refreshHistoryPath(cacheDbPath: string): string {
  return joinPath(dirnamePath(cacheDbPath), 'leaderboard-refresh-history.json')
}

export function selectOldestCharacter(
  characterIds: CharacterId[],
  history: CharacterRefreshHistory,
  now = new Date(),
): CharacterId | undefined {
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  const refreshedAt = (id: CharacterId) => Date.parse(history[id]?.completedAt ?? '') || 0
  return characterIds
    .filter((id) => refreshedAt(id) < midnight.getTime())
    .sort((a, b) => refreshedAt(a) - refreshedAt(b) || a.localeCompare(b))[0]
}

export function mergeCharacterRefresh(
  previous: PrivateRankedOutput,
  refreshed: PrivateRankedOutput,
  characterId: CharacterId,
): PrivateRankedOutput {
  const retainedBoards = Object.fromEntries(
    Object.entries(previous.boards).filter(([, board]) => board.characterId !== characterId),
  )
  return { ...refreshed, boards: { ...retainedBoards, ...refreshed.boards } }
}

export function mergePublicCharacterRefresh(
  previous: PublicLeaderboardOutputV3,
  refreshed: PublicLeaderboardOutputV3,
  characterId: CharacterId,
): PublicLeaderboardOutputV3 {
  // Reading private boards from disk changes iteration order. Preserve the
  // untouched public payloads, including their team ordering, byte for byte.
  return {
    ...refreshed,
    characters: { ...previous.characters, [characterId]: refreshed.characters[characterId] },
  }
}
