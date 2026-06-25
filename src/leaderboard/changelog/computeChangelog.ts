import type {
  ChangelogEvent,
  LeaderboardChangelog,
  LeaderboardSnapshot,
} from 'leaderboard/changelog/changelogTypes'
import { ChangelogEventType } from 'leaderboard/changelog/changelogTypes'
import { readChangelog, readSnapshot } from 'leaderboard/changelog/changelogStorage'
import { extractSnapshot } from 'leaderboard/changelog/extractSnapshot'
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
): ChangelogEvent[] {
  if (!previous) return []

  const events: ChangelogEvent[] = []

  for (const [charId, curr] of Object.entries(current.characters)) {
    const prev = previous.characters[charId]
    const buildId = topBuildIds.get(charId as CharacterId) ?? ''

    if (!prev) {
      events.push({
        type: ChangelogEventType.NEW_CHARACTER,
        characterId: charId as CharacterId,
        date,
        score: curr.topScore,
        rank: curr.rank,
        entryCount: curr.entryCount,
        buildId,
      })
    } else if (displayScore(curr.topScore) > displayScore(prev.highWatermark)) {
      events.push({
        type: ChangelogEventType.NEW_BEST,
        characterId: charId as CharacterId,
        date,
        score: curr.topScore,
        previousScore: prev.topScore,
        rank: curr.rank,
        previousRank: prev.rank,
        buildId,
      })
    }
  }

  return events
}

export function deduplicateAndMerge(
  newEvents: ChangelogEvent[],
  existingEvents: ChangelogEvent[],
  maxEvents: number,
): ChangelogEvent[] {
  const seen = new Map<string, ChangelogEvent>()

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

export type ChangelogUpdateResult = {
  snapshot: LeaderboardSnapshot,
  changelog: LeaderboardChangelog,
  snapshotPath: string,
  changelogPath: string,
}

export function computeChangelogUpdate(input: {
  privateOutput: PrivateRankedOutput,
  totalCounts: Map<string, number>,
  generatedAt: string,
  snapshotPath: string,
  changelogPath: string,
  allowedCharacterIds?: Set<string>,
}): ChangelogUpdateResult {
  const previousSnapshot = readSnapshot(input.snapshotPath)
  const result = extractSnapshot(input.privateOutput, input.totalCounts, previousSnapshot, input.generatedAt, input.allowedCharacterIds)
  const date = input.generatedAt.slice(0, 10)
  const newEvents = diffSnapshots(result.snapshot, previousSnapshot, result.topBuildIds, date)
  const existingEvents = readChangelog(input.changelogPath)
  const events = deduplicateAndMerge(newEvents, existingEvents, 50)

  return {
    snapshot: result.snapshot,
    changelog: { schemaVersion: 1, generatedAt: input.generatedAt, events },
    snapshotPath: input.snapshotPath,
    changelogPath: input.changelogPath,
  }
}
