import {
  dirnamePath,
  ensureDirectory,
  fileExists,
  joinPath,
  readTextFile,
  writeTextFile,
} from '../shared/nodeFacade'
import { configTypeToPublic, type LeaderboardConfigType } from '../shared/configTypeMapping'
import type {
  PrivateBoard,
  PrivateBoardCompleteness,
  PrivateRankedEntry,
  PrivateRankedOutput,
  ProfilePayloadIndex,
  LeaderboardVersionFile,
} from '../shared/types'
import { getCharacterVersion, getLightConeVersion } from '../shared/versioning'

export function comparePrivateRankedEntries(
  a: Pick<PrivateRankedEntry, 'score' | 'uidHash'>,
  b: Pick<PrivateRankedEntry, 'score' | 'uidHash'>,
): number {
  return b.score - a.score || a.uidHash.localeCompare(b.uidHash)
}

function boardKeyFromEntry(entry: PrivateRankedEntry): string {
  return `${entry.characterId}#${configTypeToPublic(entry.configType)}#${entry.teamId}`
}

function entryReplacementKey(entry: PrivateRankedEntry): string {
  return `${entry.uid}#${entry.characterId}#${configTypeToPublic(entry.configType)}#${entry.teamId}`
}

function parseBoardKey(key: string): { characterId: string; configType: LeaderboardConfigType; teamId: string } {
  const [characterId, configType, teamId] = key.split('#')
  return {
    characterId,
    configType: configType as LeaderboardConfigType,
    teamId,
  }
}

function dedupePrivateRankedEntries(entries: PrivateRankedEntry[]): PrivateRankedEntry[] {
  const bestByIdentity = new Map<string, PrivateRankedEntry>()
  for (const entry of entries) {
    const key = entryReplacementKey(entry)
    const existing = bestByIdentity.get(key)
    if (!existing || comparePrivateRankedEntries(entry, existing) < 0) {
      bestByIdentity.set(key, entry)
    }
  }
  return [...bestByIdentity.values()]
}

export function mergePrivateRankedOutput(input: {
  previous: PrivateRankedOutput | null
  newEntries: PrivateRankedEntry[]
  changedUids: Set<string>
  missingUids: Set<string>
  invalidatedDependencyDigests: Set<string>
  globalVersion: number
  topN: number
  topNPublic: number
}): {
  output: PrivateRankedOutput
  dependencyInvalidatedUids: Set<string>
} {
  const {
    previous,
    newEntries,
    changedUids,
    missingUids,
    invalidatedDependencyDigests,
    globalVersion,
    topN,
    topNPublic,
  } = input

  const dependencyInvalidatedUids = new Set<string>()
  const boardEntries = new Map<string, PrivateRankedEntry[]>()
  const newEntriesCountByBoard = new Map<string, number>()
  const replacementKeys = new Set(newEntries.map(entryReplacementKey))

  const globalVersionMismatch = previous == null || previous.versions.global !== globalVersion

  if (!globalVersionMismatch && previous != null) {
    for (const [boardKey, board] of Object.entries(previous.boards)) {
      const retained: PrivateRankedEntry[] = []
      for (const entry of board.entries) {
        if (missingUids.has(entry.uid) || changedUids.has(entry.uid)) {
          continue
        }
        if (invalidatedDependencyDigests.has(entry.dependencyDigest)) {
          dependencyInvalidatedUids.add(entry.uid)
          continue
        }
        if (replacementKeys.has(entryReplacementKey(entry))) {
          continue
        }
        retained.push(entry)
      }
      if (retained.length > 0) {
        boardEntries.set(boardKey, retained)
      }
    }
  }

  for (const entry of newEntries) {
    const boardKey = boardKeyFromEntry(entry)
    let list = boardEntries.get(boardKey)
    if (!list) {
      list = []
      boardEntries.set(boardKey, list)
    }
    list.push(entry)

    newEntriesCountByBoard.set(boardKey, (newEntriesCountByBoard.get(boardKey) ?? 0) + 1)
  }

  const boards: Record<string, PrivateBoard> = {}

  for (const [boardKey, entries] of boardEntries) {
    const dedupedEntries = dedupePrivateRankedEntries(entries)
    dedupedEntries.sort(comparePrivateRankedEntries)

    const sliced = dedupedEntries.slice(0, topN)

    for (let i = 0; i < sliced.length; i++) {
      sliced[i] = { ...sliced[i], rank: i + 1 }
    }

    const { characterId, configType, teamId } = parseBoardKey(boardKey)

    const completeness: PrivateBoardCompleteness = {
      scoredCandidateCount: newEntriesCountByBoard.get(boardKey) ?? 0,
      totalScoredEntries: dedupedEntries.length,
      privateCutoffScore: sliced.length > 0 ? sliced[sliced.length - 1].score : null,
      publicCutoffScore: sliced.length >= topNPublic ? sliced[topNPublic - 1].score : null,
      topN,
      topNPublic,
      canRefillPublicTopN: sliced.length >= topNPublic,
    }

    boards[boardKey] = {
      characterId,
      configType,
      teamId,
      entries: sliced,
      completeness,
    }
  }

  const output: PrivateRankedOutput = {
    generatedAt: new Date().toISOString(),
    versions: previous?.versions ?? { global: 0, characters: {}, lightCones: {} },
    sourceExport: previous?.sourceExport ?? { path: '', profileCount: 0 },
    boards,
    payloadIndex: previous?.payloadIndex ?? { profiles: {} },
  }

  return { output, dependencyInvalidatedUids }
}

export function collectDependencyInvalidations(input: {
  previous: PrivateRankedOutput | null
  versions: LeaderboardVersionFile
  globalVersion: number
}): {
  invalidatedDependencyDigests: Set<string>
  invalidatedUids: Set<string>
} {
  const invalidatedDependencyDigests = new Set<string>()
  const invalidatedUids = new Set<string>()
  const { previous, versions, globalVersion } = input

  if (previous == null || previous.versions.global !== globalVersion) {
    return { invalidatedDependencyDigests, invalidatedUids }
  }

  for (const board of Object.values(previous.boards)) {
    for (const entry of board.entries) {
      if (dependencyVersionsAreStale(entry, versions)) {
        invalidatedDependencyDigests.add(entry.dependencyDigest)
        invalidatedUids.add(entry.uid)
      }
    }
  }

  return { invalidatedDependencyDigests, invalidatedUids }
}

function dependencyVersionsAreStale(
  entry: PrivateRankedEntry,
  versions: LeaderboardVersionFile,
): boolean {
  if (entry.dependencyVersions.global !== versions.global) {
    return true
  }

  for (const [characterId, version] of Object.entries(entry.dependencyVersions.characterVersions)) {
    if (version !== getCharacterVersion(versions, characterId)) {
      return true
    }
  }

  for (const [lightConeId, version] of Object.entries(entry.dependencyVersions.lightConeVersions)) {
    if (version !== getLightConeVersion(versions, lightConeId)) {
      return true
    }
  }

  return false
}

export function assertPrivateOutputPublishable(output: PrivateRankedOutput): void {
  const boardEntries = Object.entries(output.boards)
  if (boardEntries.length === 0) {
    throw new Error('Leaderboard private output contains no boards; refusing to publish empty public output')
  }

  for (const [boardKey, board] of boardEntries) {
    if (!board.completeness.canRefillPublicTopN) {
      console.warn(
        `Leaderboard board ${boardKey} has only ${board.entries.length} ranked entries `
          + `(topNPublic=${board.completeness.topNPublic}); publishing partial board`,
      )
    }

    const identities = new Set<string>()
    for (const entry of board.entries) {
      const identity = entryReplacementKey(entry)
      if (identities.has(identity)) {
        throw new Error(`Leaderboard board ${boardKey} contains duplicate candidate identity ${identity}`)
      }
      identities.add(identity)
    }
  }
}

export function writePrivateRankedOutput(path: string, output: PrivateRankedOutput): void {
  const dir = dirnamePath(path)
  ensureDirectory(dir)
  writeTextFile(path, JSON.stringify(output, null, 2))
}

export function readPrivateRankedOutput(path: string): PrivateRankedOutput | null {
  if (!fileExists(path)) return null
  const raw = readTextFile(path)
  return JSON.parse(raw) as PrivateRankedOutput
}
