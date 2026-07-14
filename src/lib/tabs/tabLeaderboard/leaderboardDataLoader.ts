import { eidolonToGroup } from 'leaderboard/shared/eidolonConfig'
import type {
  PublicCharacterData,
  PublicLeaderboardEntry,
} from 'leaderboard/shared/types'
import {
  buildTimelineEvent,
  isCandidateId,
  parseTimelineEventWire,
} from 'leaderboard/timeline/timelineEventValidation'
import {
  TIMELINE_SCHEMA_VERSION,
  type TimelineEvent,
} from 'leaderboard/timeline/timelineTypes'
import {
  BASE_PATH,
  BasePath,
} from 'lib/tabs/navigation/constants'
import { computeBrowserCandidateId } from 'lib/tabs/tabLeaderboard/leaderboardBrowserHash'
import { IS_LOCALHOST } from 'lib/tabs/tabLeaderboard/leaderboardCharacterHelpers'
import {
  type LeaderboardEntry,
  type LeaderboardTeammate,
} from 'lib/tabs/tabLeaderboard/leaderboardTabTypes'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export type BuildIndexEntry = { characterId: CharacterId, configType: string, teamId: string }

export type LeaderboardTopScoresResult = {
  bestScores: Partial<Record<CharacterId, number>>,
  totalEntries: Partial<Record<CharacterId, number>>,
}

type RawLeaderboardOutput = {
  characters: Record<string, string>,
}

let buildIndex: Map<string, BuildIndexEntry> | null = null
const decompressedCache = new Map<CharacterId, PublicCharacterData>()

export function getBuildIndex(): Map<string, BuildIndexEntry> | null {
  return buildIndex
}

const BETA_ORIGIN = 'https://fribbels.github.io'

function leaderboardUrl(filename: string): string {
  return new URL(`${BASE_PATH}/leaderboard/${filename}`, import.meta.url).href
}

function betaFallbackUrl(filename: string): string {
  return `${BETA_ORIGIN}${BasePath.BETA}/leaderboard/${filename}`
}

async function fetchJsonWithFallback<T>(filename: string): Promise<T> {
  const localResponse = await fetch(leaderboardUrl(filename))
  const contentType = localResponse.headers.get('content-type') ?? ''
  if (localResponse.ok && contentType.includes('json')) {
    return localResponse.json() as Promise<T>
  }

  if (IS_LOCALHOST) {
    const betaResponse = await fetch(betaFallbackUrl(filename))
    if (betaResponse.ok) {
      return betaResponse.json() as Promise<T>
    }
  }

  throw new Error(`Failed to load ${filename}`)
}

let cachedPromise: Promise<RawLeaderboardOutput> | null = null

export async function loadLeaderboardData(): Promise<RawLeaderboardOutput> {
  if (!cachedPromise) {
    cachedPromise = fetchJsonWithFallback<RawLeaderboardOutput>('leaderboard.json')
      .catch((e) => {
        cachedPromise = null
        throw e
      })
  }
  return cachedPromise
}

let cachedTimelinePromise: Promise<TimelineEvent[]> | null = null

type RawLeaderboardTimeline = {
  schemaVersion?: number,
  events?: unknown[],
}

export async function normalizeBrowserTimelineEvent(value: unknown): Promise<TimelineEvent | null> {
  const event = parseTimelineEventWire(value)
  if (!event) {
    console.warn('Ignoring malformed leaderboard timeline event')
    return null
  }

  try {
    const legacyCandidateId = event.uidHash == null
      ? undefined
      : await computeBrowserCandidateId(event.uidHash, event.characterId)
    if (event.candidateId != null && legacyCandidateId != null && event.candidateId !== legacyCandidateId) {
      console.warn('Ignoring leaderboard timeline event with mismatched identity')
      return null
    }

    const candidateId = event.candidateId ?? legacyCandidateId
    if (!isCandidateId(candidateId)) {
      console.warn('Ignoring leaderboard timeline event with invalid identity')
      return null
    }
    return buildTimelineEvent(event, candidateId)
  } catch (error) {
    console.warn('Failed to normalize leaderboard timeline event', error)
    return null
  }
}

export async function loadLeaderboardTimeline(): Promise<TimelineEvent[]> {
  if (!cachedTimelinePromise) {
    cachedTimelinePromise = fetchJsonWithFallback<RawLeaderboardTimeline>('leaderboard-timeline.json')
      .then(async (timeline) => {
        if ((timeline.schemaVersion ?? 1) < TIMELINE_SCHEMA_VERSION || !Array.isArray(timeline.events)) return []
        const events = await Promise.all(timeline.events.map(normalizeBrowserTimelineEvent))
        return events.filter((event): event is TimelineEvent => event !== null)
      })
      .catch(() => {
        cachedTimelinePromise = null
        return []
      })
  }
  return cachedTimelinePromise
}

async function decompressCharacterDataAsync(compressed: string): Promise<PublicCharacterData> {
  const binary = atob(compressed)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const decompressed = new DecompressionStream('gzip')
  const writer = decompressed.writable.getWriter()
  writer.write(bytes)
  writer.close()

  return await new Response(decompressed.readable).json() as PublicCharacterData
}

export function loadCharacterData(characterId: CharacterId): PublicCharacterData | null {
  return decompressedCache.get(characterId) ?? null
}

export function getPublicEntryCount(characterId: CharacterId): number {
  const charData = decompressedCache.get(characterId)
  if (!charData) return 0
  let max = 0
  for (const configData of Object.values(charData.configs)) {
    if (!configData) continue
    for (const boardData of Object.values(configData.teamsById)) {
      const count = boardData.entries.filter((e) => e.score >= 1.50).length
      if (count > max) max = count
    }
  }
  return max
}

export function getLeaderboardCharacterIds(output: RawLeaderboardOutput): CharacterId[] {
  return Object.keys(output.characters) as CharacterId[]
}

export function mapPublicEntry(entry: PublicLeaderboardEntry): LeaderboardEntry {
  const characterEidolon = entry.data.character.r ?? 0
  return {
    rank: entry.rank,
    score: entry.score,
    buildId: entry.buildId,
    candidateId: entry.candidateId,
    team: entry.data.team.map((t) => ({
      characterId: t.characterId as CharacterId,
      lightCone: t.lightCone as LightConeId,
      characterEidolon: t.characterEidolon,
      lightConeSuperimposition: t.lightConeSuperimposition,
    })) as LeaderboardTeammate[],
    characterEidolon,
    eidolonGroup: eidolonToGroup(characterEidolon),
    deprioritizeBuffs: entry.data.deprioritizeBuffs,
    minifiedCharacter: entry.data.character,
    baselineSimScore: entry.data.baselineSimScore,
    benchmarkSimScore: entry.data.benchmarkSimScore,
    maximumSimScore: entry.data.maximumSimScore,
    fetchedAt: entry.data.fetchedAt,
  }
}

export async function getLeaderboardTopScores(): Promise<LeaderboardTopScoresResult> {
  try {
    const output = await loadLeaderboardData()
    const bestScores: Partial<Record<CharacterId, number>> = {}
    const totalEntries: Partial<Record<CharacterId, number>> = {}
    if (!buildIndex) buildIndex = new Map()

    await Promise.all(
      Object.entries(output.characters).map(async ([id, compressed]) => {
        const data = await decompressCharacterDataAsync(compressed)
        decompressedCache.set(id as CharacterId, data)
      }),
    )

    for (const characterId of Object.keys(output.characters) as CharacterId[]) {
      const charData = decompressedCache.get(characterId)
      if (!charData) continue

      let charBestScore = -Infinity
      let charTotalEntries = 0
      let isFirstConfig = true

      for (const [configType, configData] of Object.entries(charData.configs)) {
        if (!configData) continue

        if (isFirstConfig) {
          charTotalEntries = configData.totalEntries
        }

        for (const [teamId, boardData] of Object.entries(configData.teamsById)) {
          for (const entry of boardData.entries) {
            if (entry.score > charBestScore) {
              charBestScore = entry.score
            }
            buildIndex.set(entry.buildId, { characterId, configType, teamId })
          }
        }

        isFirstConfig = false
      }

      if (charBestScore > -Infinity) {
        bestScores[characterId] = charBestScore
      }
      if (charTotalEntries > 0) {
        totalEntries[characterId] = charTotalEntries
      }
    }

    return { bestScores, totalEntries }
  } catch {
    return { bestScores: {}, totalEntries: {} }
  }
}
