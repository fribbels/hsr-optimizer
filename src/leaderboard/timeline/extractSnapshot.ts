import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import { computeBuildId } from 'leaderboard/shared/hash'
import type { PrivateRankedOutput } from 'leaderboard/shared/types'
import type { CharacterId } from 'types/character'
import type { LeaderboardSnapshot, LeaderboardSnapshotEntry, UserCharacterWatermark } from 'leaderboard/timeline/timelineTypes'

export type SnapshotExtractionResult = {
  snapshot: LeaderboardSnapshot,
  topBuildIds: Map<CharacterId, string>,
  userCharEntries: Map<string, UserCharCurrentEntry>,
}

export type UserCharCurrentEntry = {
  score: number,
  rank: number,
  uidHash: string,
  characterId: string,
  configType: LeaderboardConfigType,
  teamId: string,
  fetchedAt: number,
}

type TopEntryIdentity = {
  score: number,
  uidHash: string,
  characterId: string,
  configType: LeaderboardConfigType,
  teamId: string,
}

export function extractSnapshot(
  privateOutput: PrivateRankedOutput,
  totalCounts: Map<string, number>,
  previousSnapshot: LeaderboardSnapshot | null,
  generatedAt: string,
  allowedCharacterIds?: Set<string>,
  topNPublic?: number,
): SnapshotExtractionResult {
  const maxBoardRank = topNPublic ?? 100
  const topEntries = new Map<string, TopEntryIdentity>()
  const userCharEntries = new Map<string, UserCharCurrentEntry>()

  for (const board of Object.values(privateOutput.boards)) {
    const charId = board.characterId
    if (board.entries.length === 0) continue
    if (allowedCharacterIds && !allowedCharacterIds.has(charId)) continue

    const topEntry = board.entries[0]
    const current = topEntries.get(charId)

    if (!current || topEntry.score > current.score) {
      topEntries.set(charId, {
        score: topEntry.score,
        uidHash: topEntry.uidHash,
        characterId: topEntry.characterId,
        configType: board.configType,
        teamId: board.teamId,
      })
    }

    for (const entry of board.entries) {
      if (entry.rank > maxBoardRank) continue
      const key = `${entry.uidHash}:${charId}`
      const existing = userCharEntries.get(key)
      if (!existing || entry.score > existing.score) {
        userCharEntries.set(key, {
          score: entry.score,
          rank: entry.rank,
          uidHash: entry.uidHash,
          characterId: entry.characterId,
          configType: board.configType,
          teamId: board.teamId,
          fetchedAt: entry.data.fetchedAt,
        })
      }
    }
  }

  const sorted = [...topEntries.entries()]
    .sort(([idA, a], [idB, b]) => b.score - a.score || idA.localeCompare(idB))

  const characters: Record<string, LeaderboardSnapshotEntry> = {}
  const topBuildIds = new Map<CharacterId, string>()
  for (let i = 0; i < sorted.length; i++) {
    const [charId, entry] = sorted[i]
    const prevWatermark = previousSnapshot?.characters[charId]?.highWatermark ?? -Infinity
    characters[charId] = {
      topScore: entry.score,
      highWatermark: Math.max(prevWatermark, entry.score),
      rank: i + 1,
      entryCount: totalCounts.get(charId) ?? 0,
    }
    topBuildIds.set(
      charId as CharacterId,
      computeBuildId(entry.uidHash, entry.characterId, entry.configType, entry.teamId),
    )
  }

  const byCharacter = new Map<string, string[]>()
  for (const [key, entry] of userCharEntries) {
    const charId = entry.characterId
    let list = byCharacter.get(charId)
    if (!list) {
      list = []
      byCharacter.set(charId, list)
    }
    list.push(key)
  }
  for (const keys of byCharacter.values()) {
    keys.sort((a, b) => userCharEntries.get(b)!.score - userCharEntries.get(a)!.score)
    for (let i = 0; i < keys.length; i++) {
      userCharEntries.get(keys[i])!.rank = i + 1
    }
  }

  const prevUserBests = previousSnapshot?.userBests ?? {}
  const userBests: Record<string, UserCharacterWatermark> = {}
  for (const [key, entry] of userCharEntries) {
    const prevWatermark = prevUserBests[key]?.highWatermark ?? -Infinity
    userBests[key] = {
      highWatermark: Math.max(prevWatermark, entry.score),
      rank: entry.rank,
    }
  }

  return {
    snapshot: { generatedAt, characters, userBests },
    topBuildIds,
    userCharEntries,
  }
}
