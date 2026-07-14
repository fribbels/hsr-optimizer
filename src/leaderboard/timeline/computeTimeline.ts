import {
  computeBuildId,
  computeCandidateId,
} from 'leaderboard/shared/hash'
import type { PrivateRankedOutput } from 'leaderboard/shared/types'
import {
  extractSnapshot,
  type UserCharCurrentEntry,
} from 'leaderboard/timeline/extractSnapshot'
import {
  readSnapshot,
  readTimeline,
} from 'leaderboard/timeline/timelineStorage'
import type {
  LeaderboardSnapshot,
  LeaderboardTimeline,
  TimelineEvent,
} from 'leaderboard/timeline/timelineTypes'
import {
  TIMELINE_MIN_SCORE,
  TIMELINE_SCHEMA_VERSION,
  TimelineEventType,
} from 'leaderboard/timeline/timelineTypes'

export function displayScore(score: number): number {
  return Math.trunc(score * 1000)
}

function fetchedAtToISOString(fetchedAt: number): string {
  return new Date(fetchedAt * 1000).toISOString()
}

function dedupDay(date: string): string {
  return date.slice(0, 10)
}

export function diffSnapshots(
  current: LeaderboardSnapshot,
  previous: LeaderboardSnapshot | null,
  userCharEntries: Map<string, UserCharCurrentEntry>,
  options?: { maxRank?: number },
): TimelineEvent[] {
  if (!previous) return []

  const maxRank = options?.maxRank ?? 100
  const prevUserBests = previous.userBests ?? {}
  const events: TimelineEvent[] = []

  for (const [key, entry] of userCharEntries) {
    if (entry.score < TIMELINE_MIN_SCORE || entry.rank > maxRank) continue

    const prev = prevUserBests[key]
    if (prev && displayScore(entry.score) <= displayScore(prev.highWatermark)) continue

    const common = {
      characterId: entry.characterId,
      configType: entry.configType,
      candidateId: computeCandidateId(entry.uidHash, entry.characterId),
      date: fetchedAtToISOString(entry.fetchedAt),
      score: entry.score,
      rank: entry.rank,
      buildId: computeBuildId(entry.uidHash, entry.characterId, entry.configType, entry.teamId),
    }

    if (!prev) {
      events.push({
        ...common,
        type: TimelineEventType.NEW_CHARACTER,
        entryCount: current.characters[entry.characterId]?.entryCount ?? 0,
      })
    } else {
      events.push({
        ...common,
        type: TimelineEventType.NEW_BEST,
        previousScore: prev.highWatermark,
        previousRank: Math.min(prev.rank, maxRank + 1),
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
    seen.set(`${event.candidateId}#${event.configType}#${event.type}#${dedupDay(event.date)}`, event)
  }

  for (const event of existingEvents) {
    const key = `${event.candidateId}#${event.configType}#${event.type}#${dedupDay(event.date)}`
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
    timeline: { schemaVersion: TIMELINE_SCHEMA_VERSION, generatedAt: input.generatedAt, events },
    snapshotPath: input.snapshotPath,
    timelinePath: input.timelinePath,
  }
}
