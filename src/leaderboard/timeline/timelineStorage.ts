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
import type { TimelineUpdateResult } from 'leaderboard/timeline/computeTimeline'

export function readSnapshot(path: string): LeaderboardSnapshot | null {
  if (!fileExists(path)) return null
  try {
    return JSON.parse(readTextFile(path)) as LeaderboardSnapshot
  } catch (err) {
    console.warn(`Failed to parse snapshot at ${path}:`, err)
    return null
  }
}

export function readTimeline(path: string): LeaderboardTimeline['events'] {
  if (!fileExists(path)) return []
  try {
    const parsed = JSON.parse(readTextFile(path)) as LeaderboardTimeline
    return parsed.events ?? []
  } catch (err) {
    console.warn(`Failed to parse timeline at ${path}:`, err)
    return []
  }
}

export function writeTimelineArtifacts(result: TimelineUpdateResult): void {
  atomicWriteJsonFile(result.timelinePath, JSON.stringify(result.timeline, null, 2))
  atomicWriteJsonFile(result.snapshotPath, JSON.stringify(result.snapshot, null, 2))
}

export function deriveTimelinePath(publicOutputPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), publicOutputPath)), 'leaderboard-timeline.json')
}

export function deriveSnapshotPath(buildScoreCacheDbPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), buildScoreCacheDbPath)), 'leaderboard-snapshot.json')
}
