import { atomicWriteJsonFile } from 'leaderboard/output/atomicWrite'
import {
  cwd,
  dirnamePath,
  fileExists,
  joinPath,
  readTextFile,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'
import type { LeaderboardChangelog, LeaderboardSnapshot } from 'leaderboard/changelog/changelogTypes'
import type { ChangelogUpdateResult } from 'leaderboard/changelog/computeChangelog'

export function readSnapshot(path: string): LeaderboardSnapshot | null {
  if (!fileExists(path)) return null
  try {
    return JSON.parse(readTextFile(path)) as LeaderboardSnapshot
  } catch (err) {
    console.warn(`Failed to parse snapshot at ${path}:`, err)
    return null
  }
}

export function readChangelog(path: string): LeaderboardChangelog['events'] {
  if (!fileExists(path)) return []
  try {
    const parsed = JSON.parse(readTextFile(path)) as LeaderboardChangelog
    return parsed.events ?? []
  } catch (err) {
    console.warn(`Failed to parse changelog at ${path}:`, err)
    return []
  }
}

export function writeChangelogArtifacts(result: ChangelogUpdateResult): void {
  atomicWriteJsonFile(result.changelogPath, JSON.stringify(result.changelog, null, 2))
  atomicWriteJsonFile(result.snapshotPath, JSON.stringify(result.snapshot, null, 2))
}

export function deriveChangelogPath(publicOutputPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), publicOutputPath)), 'leaderboard-changelog.json')
}

export function deriveSnapshotPath(buildScoreCacheDbPath: string): string {
  return joinPath(dirnamePath(resolvePath(cwd(), buildScoreCacheDbPath)), 'leaderboard-snapshot.json')
}
