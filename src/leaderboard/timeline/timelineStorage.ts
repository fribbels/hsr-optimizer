import { atomicWriteJsonFile } from 'leaderboard/output/atomicWrite'
import { computeCandidateId } from 'leaderboard/shared/hash'
import {
  cwd,
  dirnamePath,
  fileExists,
  joinPath,
  readTextFile,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'
import type { TimelineUpdateResult } from 'leaderboard/timeline/computeTimeline'
import {
  completeTimelineEventIdentity,
  parseTimelineEventWire,
  type RawTimelineEvent,
} from 'leaderboard/timeline/timelineEventValidation'
import type {
  LeaderboardSnapshot,
  LeaderboardTimeline,
  TimelineEvent,
} from 'leaderboard/timeline/timelineTypes'
import { TIMELINE_SCHEMA_VERSION } from 'leaderboard/timeline/timelineTypes'

export function readSnapshot(path: string): LeaderboardSnapshot | null {
  if (!fileExists(path)) return null
  try {
    const parsed = JSON.parse(readTextFile(path)) as LeaderboardSnapshot
    if ((parsed.schemaVersion ?? 1) < TIMELINE_SCHEMA_VERSION) {
      console.warn(`Snapshot at ${path} is schema v${parsed.schemaVersion ?? 1}, expected v${TIMELINE_SCHEMA_VERSION} — treating as cold start`)
      return null
    }
    return parsed
  } catch (err) {
    console.warn(`Failed to parse snapshot at ${path}:`, err)
    return null
  }
}

export function readTimeline(path: string): TimelineEvent[] {
  if (!fileExists(path)) return []
  try {
    const parsed = JSON.parse(readTextFile(path)) as { schemaVersion?: number, events?: RawTimelineEvent[] }
    if ((parsed.schemaVersion ?? 1) < TIMELINE_SCHEMA_VERSION) {
      return []
    }
    if (!Array.isArray(parsed.events)) return []

    const events: TimelineEvent[] = []
    for (const value of parsed.events) {
      const event = parseTimelineEventWire(value)
      if (!event) {
        console.warn(`Ignoring malformed timeline event in ${path}`)
        continue
      }

      const legacyCandidateId = event.uidHash == null
        ? undefined
        : computeCandidateId(event.uidHash, event.characterId)
      const completedEvent = completeTimelineEventIdentity(event, legacyCandidateId)
      if (!completedEvent) {
        console.warn(`Ignoring timeline event with invalid identity in ${path}`)
        continue
      }
      events.push(completedEvent)
    }
    return events
  } catch (err) {
    console.warn(`Failed to parse timeline at ${path}:`, err)
    return []
  }
}

export function writeTimelineArtifacts(result: TimelineUpdateResult): void {
  validateNoUidInPublicTimeline(result.timeline)
  atomicWriteJsonFile(result.timelinePath, JSON.stringify(result.timeline, null, 2))
  const snapshot = { ...result.snapshot, schemaVersion: TIMELINE_SCHEMA_VERSION }
  atomicWriteJsonFile(result.snapshotPath, JSON.stringify(snapshot, null, 2))
}

function validateNoUidInPublicTimeline(timeline: LeaderboardTimeline): void {
  for (let i = 0; i < timeline.events.length; i++) {
    const event = timeline.events[i]
    if ('uid' in event) {
      throw new Error(`Public timeline contains forbidden field "uid" in timeline.events[${i}]`)
    }
    if ('uidHash' in event) {
      throw new Error(`Public timeline contains forbidden field "uidHash" in timeline.events[${i}]`)
    }
  }
}

export function deriveTimelinePath(publicOutputPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), publicOutputPath)), 'leaderboard-timeline.json')
}

export function deriveSnapshotPath(buildScoreCacheDbPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), buildScoreCacheDbPath)), 'leaderboard-snapshot.json')
}
