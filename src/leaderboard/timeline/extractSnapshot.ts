import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import type { PrivateRankedOutput } from 'leaderboard/shared/types'
import type { CharacterId } from 'types/character'
import type { LeaderboardSnapshot, LeaderboardSnapshotEntry, UserCharacterWatermark } from 'leaderboard/timeline/timelineTypes'

export type SnapshotExtractionResult = {
  snapshot: LeaderboardSnapshot,
  userCharEntries: Map<string, UserCharCurrentEntry>,
}

export type UserCharCurrentEntry = {
  score: number,
  rank: number,
  uidHash: string,
  characterId: CharacterId,
  configType: LeaderboardConfigType,
  teamId: string,
  fetchedAt: number,
}

export function userCharKey(uidHash: string, characterId: CharacterId, configType: LeaderboardConfigType): string {
  return `${uidHash}:${characterId}:${configType}`
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
  const topScores = new Map<string, number>()
  const userCharEntries = new Map<string, UserCharCurrentEntry>()

  for (const board of Object.values(privateOutput.boards)) {
    const charId = board.characterId as CharacterId
    if (board.entries.length === 0) continue
    if (allowedCharacterIds && !allowedCharacterIds.has(charId)) continue

    const topEntry = board.entries[0]
    const current = topScores.get(charId)
    if (current === undefined || topEntry.score > current) {
      topScores.set(charId, topEntry.score)
    }

    for (const entry of board.entries) {
      if (entry.rank > maxBoardRank) continue
      const key = userCharKey(entry.uidHash, charId, board.configType)
      const existing = userCharEntries.get(key)
      if (!existing || entry.score > existing.score) {
        userCharEntries.set(key, {
          score: entry.score,
          rank: entry.rank,
          uidHash: entry.uidHash,
          characterId: charId,
          configType: board.configType,
          teamId: board.teamId,
          fetchedAt: entry.data.fetchedAt,
        })
      }
    }
  }

  const sorted = [...topScores.entries()]
    .sort(([idA, a], [idB, b]) => b - a || idA.localeCompare(idB))

  const characters: Record<string, LeaderboardSnapshotEntry> = {}
  for (let i = 0; i < sorted.length; i++) {
    const [charId, score] = sorted[i]
    const prevWatermark = previousSnapshot?.characters[charId]?.highWatermark ?? -Infinity
    characters[charId] = {
      topScore: score,
      highWatermark: Math.max(prevWatermark, score),
      rank: i + 1,
      entryCount: totalCounts.get(charId) ?? 0,
    }
  }

  const byCharConfig = new Map<string, UserCharCurrentEntry[]>()
  for (const entry of userCharEntries.values()) {
    const groupKey = `${entry.characterId}:${entry.configType}`
    let list = byCharConfig.get(groupKey)
    if (!list) {
      list = []
      byCharConfig.set(groupKey, list)
    }
    list.push(entry)
  }
  for (const entries of byCharConfig.values()) {
    entries.sort((a, b) => b.score - a.score)
    for (let i = 0; i < entries.length; i++) {
      entries[i].rank = i + 1
    }
  }

  const prevUserBests = previousSnapshot?.userBests ?? {}
  const userBests: Record<string, UserCharacterWatermark> = { ...prevUserBests }
  for (const [key, entry] of userCharEntries) {
    const prevWatermark = prevUserBests[key]?.highWatermark ?? -Infinity
    userBests[key] = {
      highWatermark: Math.max(prevWatermark, entry.score),
      rank: entry.rank,
    }
  }

  return {
    snapshot: { generatedAt, characters, userBests },
    userCharEntries,
  }
}
