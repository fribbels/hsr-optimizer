import { atomicWriteJsonFile } from 'leaderboard/output/atomicWrite'
import {
  cwd,
  dirnamePath,
  fileExists,
  joinPath,
  readTextFile,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'
import type { LeaderboardTimeline, LeaderboardSnapshot } from 'leaderboard/timeline/timelineTypes'
import { TIMELINE_SCHEMA_VERSION } from 'leaderboard/timeline/timelineTypes'
import type { TimelineUpdateResult } from 'leaderboard/timeline/computeTimeline'

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
    const parsed = JSON.parse(readTextFile(path)) as LeaderboardTimeline
    if ((parsed.schemaVersion ?? 1) < TIMELINE_SCHEMA_VERSION) {
      return []
    }
    return parsed.events ?? []
  } catch (err) {
    console.warn(`Failed to parse timeline at ${path}:`, err)
    return []
  }
}

export function writeTimelineArtifacts(result: TimelineUpdateResult): void {
  atomicWriteJsonFile(result.timelinePath, JSON.stringify(result.timeline, null, 2))
  const snapshot = { ...result.snapshot, schemaVersion: TIMELINE_SCHEMA_VERSION }
  atomicWriteJsonFile(result.snapshotPath, JSON.stringify(snapshot, null, 2))
}

export function deriveTimelinePath(publicOutputPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), publicOutputPath)), 'leaderboard-timeline.json')
}

export function deriveSnapshotPath(buildScoreCacheDbPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), buildScoreCacheDbPath)), 'leaderboard-snapshot.json')
}
