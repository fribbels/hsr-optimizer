import {
  configTypeToPublic,
  type LeaderboardConfigType,
} from 'leaderboard/shared/configTypeMapping'
import {
  ensureDirectory,
  fileExists,
  isDirectory,
  joinPath,
  listDirectory,
  readTextFile,
  removeDirectory,
  writeTextFile,
} from 'leaderboard/shared/nodeFacade'
import type {
  PrivateBoard,
  PrivateBoardCompleteness,
  PrivateRankedEntry,
  PrivateRankedOutput,
  ProfilePayloadIndex,
} from 'leaderboard/shared/types'

export function comparePrivateRankedEntries(
  a: Pick<PrivateRankedEntry, 'score' | 'uidHash'>,
  b: Pick<PrivateRankedEntry, 'score' | 'uidHash'>,
): number {
  return b.score - a.score || a.uidHash.localeCompare(b.uidHash)
}

export function boardKeyFromEntry(entry: Pick<PrivateRankedEntry, 'characterId' | 'configType' | 'teamId'>): string {
  return `${entry.characterId}#${configTypeToPublic(entry.configType)}#${entry.teamId}`
}

export function entryReplacementKey(entry: Pick<PrivateRankedEntry, 'uid' | 'characterId' | 'configType' | 'teamId'>): string {
  return `${entry.uid}#${entry.characterId}#${configTypeToPublic(entry.configType)}#${entry.teamId}`
}

function parseBoardKey(key: string): { characterId: string, configType: LeaderboardConfigType, teamId: string } {
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

export function buildPrivateRankedOutput(input: {
  entries: PrivateRankedEntry[],
  versions: PrivateRankedOutput['versions'],
  sourceExport: PrivateRankedOutput['sourceExport'],
  payloadIndex: ProfilePayloadIndex,
  generatedAt: string,
  topN: number,
  topNPublic: number,
}): PrivateRankedOutput {
  const {
    entries,
    versions,
    sourceExport,
    payloadIndex,
    generatedAt,
    topN,
    topNPublic,
  } = input

  const boardEntries = new Map<string, PrivateRankedEntry[]>()

  for (const entry of entries) {
    const boardKey = boardKeyFromEntry(entry)
    let list = boardEntries.get(boardKey)
    if (!list) {
      list = []
      boardEntries.set(boardKey, list)
    }
    list.push(entry)
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
      scoredCandidateCount: entries.length,
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

  return {
    generatedAt,
    versions,
    sourceExport,
    boards,
    payloadIndex,
  }
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

function encodeBoardKeyForFilename(key: string): string {
  return key.replace(/#/g, '_').replace(/\|/g, '-')
}

export function writePrivateRankedOutput(dir: string, output: PrivateRankedOutput): void {
  removeDirectory(dir)
  ensureDirectory(dir)
  const boardsDir = joinPath(dir, 'boards')
  ensureDirectory(boardsDir)

  writeTextFile(joinPath(dir, 'header.json'), JSON.stringify({
    generatedAt: output.generatedAt,
    versions: output.versions,
    sourceExport: output.sourceExport,
  }))

  for (const [key, board] of Object.entries(output.boards)) {
    const filename = encodeBoardKeyForFilename(key) + '.json'
    writeTextFile(joinPath(boardsDir, filename), JSON.stringify({ key, board }))
  }

  writeTextFile(joinPath(dir, 'payloadIndex.json'), JSON.stringify(output.payloadIndex))
}

export function readPrivateRankedOutput(dir: string): PrivateRankedOutput | null {
  if (!isDirectory(dir)) return null

  const headerPath = joinPath(dir, 'header.json')
  if (!fileExists(headerPath)) return null

  const header = JSON.parse(readTextFile(headerPath)) as Pick<PrivateRankedOutput, 'generatedAt' | 'versions' | 'sourceExport'>

  const boards: Record<string, PrivateBoard> = {}
  const boardsDir = joinPath(dir, 'boards')
  if (isDirectory(boardsDir)) {
    for (const filename of listDirectory(boardsDir)) {
      if (!filename.endsWith('.json')) continue
      const parsed = JSON.parse(readTextFile(joinPath(boardsDir, filename))) as { key: string, board: PrivateBoard }
      boards[parsed.key] = parsed.board
    }
  }

  const payloadIndex = readProfilePayloadIndex(dir) ?? { profiles: {} }

  return {
    generatedAt: header.generatedAt,
    versions: header.versions,
    sourceExport: header.sourceExport,
    boards,
    payloadIndex,
  }
}

export function readProfilePayloadIndex(dir: string): ProfilePayloadIndex | null {
  if (!isDirectory(dir)) return null

  const payloadIndexPath = joinPath(dir, 'payloadIndex.json')
  if (!fileExists(payloadIndexPath)) return null

  return JSON.parse(readTextFile(payloadIndexPath)) as ProfilePayloadIndex
}
