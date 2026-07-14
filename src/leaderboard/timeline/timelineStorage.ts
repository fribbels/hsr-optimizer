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
  buildTimelineEvent,
  isCandidateId,
  parseTimelineEventWire,
} from 'leaderboard/timeline/timelineEventValidation'
import type {
  LeaderboardSnapshot,
  LeaderboardTimeline,
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

export function readTimeline(path: string): LeaderboardTimeline['events'] {
  if (!fileExists(path)) return []
  try {
    const parsed = JSON.parse(readTextFile(path)) as { schemaVersion?: number, events?: unknown[] }
    if ((parsed.schemaVersion ?? 1) < TIMELINE_SCHEMA_VERSION) {
      return []
    }
    if (!Array.isArray(parsed.events)) return []

    const events: LeaderboardTimeline['events'] = []
    for (const value of parsed.events) {
      const event = parseTimelineEventWire(value)
      if (!event) {
        console.warn(`Ignoring malformed timeline event in ${path}`)
        continue
      }

      const legacyCandidateId = event.uidHash == null
        ? undefined
        : computeCandidateId(event.uidHash, event.characterId)
      if (event.candidateId != null && legacyCandidateId != null && event.candidateId !== legacyCandidateId) {
        console.warn(`Ignoring timeline event with mismatched identity in ${path}`)
        continue
      }

      const candidateId = event.candidateId ?? legacyCandidateId
      if (!isCandidateId(candidateId)) {
        console.warn(`Ignoring timeline event with invalid identity in ${path}`)
        continue
      }
      events.push(buildTimelineEvent(event, candidateId))
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

export function validateNoUidInPublicTimeline(timeline: LeaderboardTimeline): void {
  validateNoUidFields(timeline, 'timeline')
}

function validateNoUidFields(value: unknown, path: string): void {
  if (value == null || typeof value !== 'object') return

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      validateNoUidFields(value[i], `${path}[${i}]`)
    }
    return
  }

  for (const [field, child] of Object.entries(value)) {
    if (field === 'uid' || field === 'uidHash') {
      throw new Error(`Public timeline contains forbidden field "${field}" in ${path}`)
    }
    validateNoUidFields(child, `${path}.${field}`)
  }
}

export function deriveTimelinePath(publicOutputPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), publicOutputPath)), 'leaderboard-timeline.json')
}

export function deriveSnapshotPath(buildScoreCacheDbPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), buildScoreCacheDbPath)), 'leaderboard-snapshot.json')
}
