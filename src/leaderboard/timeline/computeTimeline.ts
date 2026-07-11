import type {
  TimelineEvent,
  LeaderboardTimeline,
  LeaderboardSnapshot,
} from 'leaderboard/timeline/timelineTypes'
import { TimelineEventType } from 'leaderboard/timeline/timelineTypes'
import { readTimeline, readSnapshot } from 'leaderboard/timeline/timelineStorage'
import { extractSnapshot, type UserCharCurrentEntry } from 'leaderboard/timeline/extractSnapshot'
import { computeBuildId } from 'leaderboard/shared/hash'
import type { PrivateRankedOutput } from 'leaderboard/shared/types'
import type { CharacterId } from 'types/character'

export function displayScore(score: number): number {
  return Math.trunc(score * 1000)
}

function fetchedAtToDateString(fetchedAt: number): string {
  return new Date(fetchedAt * 1000).toISOString().slice(0, 10)
}

export function diffSnapshots(
  current: LeaderboardSnapshot,
  previous: LeaderboardSnapshot | null,
  userCharEntries: Map<string, UserCharCurrentEntry>,
  options?: { minScore?: number, maxRank?: number },
): TimelineEvent[] {
  if (!previous) return []

  const minScore = options?.minScore ?? 1.5
  const maxRank = options?.maxRank ?? 100
  const prevUserBests = previous.userBests ?? {}
  const events: TimelineEvent[] = []

  for (const [key, entry] of userCharEntries) {
    if (entry.score < minScore || entry.rank > maxRank) continue

    const prev = prevUserBests[key]
    const buildId = computeBuildId(entry.uidHash, entry.characterId, entry.configType, entry.teamId)
    const date = fetchedAtToDateString(entry.fetchedAt)

    if (!prev) {
      events.push({
        type: TimelineEventType.NEW_CHARACTER,
        characterId: entry.characterId as CharacterId,
        uidHash: entry.uidHash,
        date,
        score: entry.score,
        rank: entry.rank,
        entryCount: current.characters[entry.characterId]?.entryCount ?? 0,
        buildId,
      })
    } else if (displayScore(entry.score) > displayScore(prev.highWatermark)) {
      events.push({
        type: TimelineEventType.NEW_BEST,
        characterId: entry.characterId as CharacterId,
        uidHash: entry.uidHash,
        date,
        score: entry.score,
        previousScore: prev.highWatermark,
        rank: entry.rank,
        previousRank: Math.min(prev.rank, maxRank + 1),
        buildId,
      })
    }
  }

  return events
}

export function deduplicateAndMerge(
  newEvents: TimelineEvent[],
  existingEvents: TimelineEvent[],
  maxEvents: number,
): TimelineEvent[] {
  const seen = new Map<string, TimelineEvent>()

  for (const event of newEvents) {
    seen.set(`${event.uidHash}#${event.characterId}#${event.type}#${event.date}`, event)
  }

  for (const event of existingEvents) {
    const key = `${event.uidHash}#${event.characterId}#${event.type}#${event.date}`
    if (!seen.has(key)) {
      seen.set(key, event)
    }
  }

  return [...seen.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, maxEvents)
}

export type TimelineUpdateResult = {
  snapshot: LeaderboardSnapshot,
  timeline: LeaderboardTimeline,
  snapshotPath: string,
  timelinePath: string,
}

export function computeTimelineUpdate(input: {
  privateOutput: PrivateRankedOutput,
  totalCounts: Map<string, number>,
  generatedAt: string,
  snapshotPath: string,
  timelinePath: string,
  allowedCharacterIds?: Set<string>,
  topNPublic?: number,
}): TimelineUpdateResult {
  const previousSnapshot = readSnapshot(input.snapshotPath)
  const result = extractSnapshot(input.privateOutput, input.totalCounts, previousSnapshot, input.generatedAt, input.allowedCharacterIds, input.topNPublic)
  const newEvents = diffSnapshots(result.snapshot, previousSnapshot, result.userCharEntries, { maxRank: input.topNPublic })
  const existingEvents = readTimeline(input.timelinePath)
  const events = deduplicateAndMerge(newEvents, existingEvents, 100)

  return {
    snapshot: result.snapshot,
    timeline: { schemaVersion: 1, generatedAt: input.generatedAt, events },
    snapshotPath: input.snapshotPath,
    timelinePath: input.timelinePath,
  }
}
