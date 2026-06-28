import { eidolonToGroup } from 'leaderboard/shared/eidolonConfig'
import type {
  PublicCharacterData,
  PublicLeaderboardEntryV2,
} from 'leaderboard/shared/types'
import type { LeaderboardTimeline, TimelineEvent } from 'leaderboard/timeline/timelineTypes'
import { BASE_PATH } from 'lib/tabs/navigation/constants'
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

const LEADERBOARD_DATA_URL = new URL(`${BASE_PATH}/leaderboard/leaderboard.json`, import.meta.url).href

let cachedPromise: Promise<RawLeaderboardOutput> | null = null

export async function loadLeaderboardData(): Promise<RawLeaderboardOutput> {
  if (!cachedPromise) {
    cachedPromise = fetch(LEADERBOARD_DATA_URL)
      .then((r) => r.json() as Promise<RawLeaderboardOutput>)
      .catch((e) => {
        cachedPromise = null
        throw e
      })
  }
  return cachedPromise
}

const TIMELINE_DATA_URL = new URL(`${BASE_PATH}/leaderboard/leaderboard-timeline.json`, import.meta.url).href

let cachedTimelinePromise: Promise<TimelineEvent[]> | null = null

export async function loadLeaderboardTimeline(): Promise<TimelineEvent[]> {
  if (!cachedTimelinePromise) {
    cachedTimelinePromise = fetch(TIMELINE_DATA_URL)
      .then((r) => r.json() as Promise<LeaderboardTimeline>)
      .then((t) => t.events)
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
      if (boardData.entries.length > max) max = boardData.entries.length
    }
  }
  return max
}

export function getLeaderboardCharacterIds(output: RawLeaderboardOutput): CharacterId[] {
  return Object.keys(output.characters) as CharacterId[]
}

export function mapPublicEntry(entry: PublicLeaderboardEntryV2): LeaderboardEntry {
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
