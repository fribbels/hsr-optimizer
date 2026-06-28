import type {
  TimelineEvent,
  LeaderboardTimeline,
  LeaderboardSnapshot,
} from 'leaderboard/timeline/timelineTypes'
import { TimelineEventType } from 'leaderboard/timeline/timelineTypes'
import { readTimeline, readSnapshot } from 'leaderboard/timeline/timelineStorage'
import { extractSnapshot } from 'leaderboard/timeline/extractSnapshot'
import type { PrivateRankedOutput } from 'leaderboard/shared/types'
import type { CharacterId } from 'types/character'

export function displayScore(score: number): number {
  return Math.trunc(score * 1000)
}

export function diffSnapshots(
  current: LeaderboardSnapshot,
  previous: LeaderboardSnapshot | null,
  topBuildIds: Map<CharacterId, string>,
  date: string,
): TimelineEvent[] {
  if (!previous) return []

  const events: TimelineEvent[] = []

  for (const [charId, curr] of Object.entries(current.characters)) {
    const prev = previous.characters[charId]
    const buildId = topBuildIds.get(charId as CharacterId)!

    if (!prev) {
      events.push({
        type: TimelineEventType.NEW_CHARACTER,
        characterId: charId as CharacterId,
        date,
        score: curr.topScore,
        rank: curr.rank,
        entryCount: curr.entryCount,
        buildId,
      })
    } else if (displayScore(curr.topScore) > displayScore(prev.highWatermark)) {
      events.push({
        type: TimelineEventType.NEW_BEST,
        characterId: charId as CharacterId,
        date,
        score: curr.topScore,
        previousScore: prev.highWatermark,
        rank: curr.rank,
        previousRank: prev.rank,
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
    seen.set(`${event.characterId}#${event.type}#${event.date}`, event)
  }

  for (const event of existingEvents) {
    const key = `${event.characterId}#${event.type}#${event.date}`
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
}): TimelineUpdateResult {
  const previousSnapshot = readSnapshot(input.snapshotPath)
  const result = extractSnapshot(input.privateOutput, input.totalCounts, previousSnapshot, input.generatedAt, input.allowedCharacterIds)
  const date = input.generatedAt.slice(0, 10)
  const newEvents = diffSnapshots(result.snapshot, previousSnapshot, result.topBuildIds, date)
  const existingEvents = readTimeline(input.timelinePath)
  const events = deduplicateAndMerge(newEvents, existingEvents, 50)

  return {
    snapshot: result.snapshot,
    timeline: { schemaVersion: 1, generatedAt: input.generatedAt, events },
    snapshotPath: input.snapshotPath,
    timelinePath: input.timelinePath,
  }
}
