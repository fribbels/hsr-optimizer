import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import { computeBuildId, hashObject } from 'leaderboard/shared/hash'
import { atomicWriteJsonFile } from 'leaderboard/output/atomicWrite'
import {
  gunzipBase64Text,
  gzipTextToBase64,
} from 'leaderboard/shared/nodeFacade'
import type {
  PrivateRankedOutput,
  PublicBoardDataV2,
  PublicCharacterData,
  PublicConfigData,
  PublicLeaderboardEntryV2,
  PublicLeaderboardOutputV3,
  PublicTeamMeta,
} from 'leaderboard/shared/types'
import type { CharacterId } from 'types/character'

export const MIN_PUBLIC_SCORE = 1.50

export function buildPublicOutputFromPrivate(input: {
  privateOutput: PrivateRankedOutput,
  topNPublic: number,
  totalCounts: Map<string, number>,
  generatedAt: string,
}): PublicLeaderboardOutputV3 {
  const { privateOutput, topNPublic, totalCounts, generatedAt } = input
  if (!Number.isInteger(topNPublic) || topNPublic <= 0) {
    throw new Error(`topNPublic must be a positive integer, received ${topNPublic}`)
  }

  type BoardRef = typeof privateOutput.boards[string]
  const grouped = new Map<string, Map<LeaderboardConfigType, Map<string, BoardRef>>>()

  for (const [, board] of Object.entries(privateOutput.boards)) {
    const { characterId, configType, teamId } = board

    let configMap = grouped.get(characterId)
    if (!configMap) {
      configMap = new Map()
      grouped.set(characterId, configMap)
    }

    let teamMap = configMap.get(configType)
    if (!teamMap) {
      teamMap = new Map()
      configMap.set(configType, teamMap)
    }

    teamMap.set(teamId, board)
  }

  const characters: Record<string, string> = {}

  for (const [characterId, configMap] of grouped) {
    const configs: Partial<Record<LeaderboardConfigType, PublicConfigData>> = {}

    for (const [configType, teamMap] of configMap) {
      const teams: PublicTeamMeta[] = []
      for (const [teamId, board] of teamMap) {
        if (board.entries.length > 0) {
          teams.push({
            teamId,
            teammates: board.entries[0].data.team.map((t) => ({ characterId: t.characterId })),
          })
        }
      }
      const teamsById: Record<string, PublicBoardDataV2> = {}

      for (const [teamId, board] of teamMap) {
        // Temporarily disabled — including all scores while iterating on the leaderboard
        // const qualified = board.entries.filter((e) => e.score >= MIN_PUBLIC_SCORE)
        const topEntries = board.entries.slice(0, topNPublic)
        const publicEntries: PublicLeaderboardEntryV2[] = topEntries.map((entry) => ({
          rank: entry.rank,
          characterId: entry.characterId as CharacterId,
          buildId: computeBuildId(entry.uidHash, entry.characterId, board.configType, board.teamId),
          candidateId: hashObject(`${entry.uidHash}#${entry.characterId}`).slice(0, 12),
          score: entry.score,
          data: entry.data,
        }))

        const boardTotalEntries = board.completeness?.totalScoredEntries ?? board.entries.length

        teamsById[teamId] = {
          entries: publicEntries,
          totalEntries: boardTotalEntries,
        }
      }

      configs[configType] = {
        teams,
        teamsById,
        totalEntries: totalCounts.get(characterId) ?? 0,
      }
    }

    const characterData: PublicCharacterData = { configs }
    characters[characterId] = gzipTextToBase64(JSON.stringify(characterData))
  }

  return {
    generatedAt,
    characters,
  }
}

export function validateNoUidInPublicOutput(output: PublicLeaderboardOutputV3): void {
  const forbiddenFields = new Set(['uid', 'uidHash', 'payloadHash', 'dependencyDigest', 'dependencyVersions'])
  const HEX12 = /^[0-9a-f]{12}$/
  const allBuildIds = new Set<string>()

  for (const [characterId, compressed] of Object.entries(output.characters)) {
    const json = gunzipBase64Text(compressed)
    const charData = JSON.parse(json) as PublicCharacterData
    validateNoForbiddenFields(charData, forbiddenFields, `character ${characterId}`)

    for (const [configType, configData] of Object.entries(charData.configs)) {
      for (const [teamId, boardData] of Object.entries(configData.teamsById)) {
        for (let i = 0; i < boardData.entries.length; i++) {
          const entry = boardData.entries[i]
          const path = `character ${characterId}, config ${configType}, team ${teamId}, entry index ${i}`

          if (!HEX12.test(entry.buildId)) {
            throw new Error(`Invalid buildId format "${entry.buildId}" at ${path} (expected 12 hex chars)`)
          }
          if (!HEX12.test(entry.candidateId)) {
            throw new Error(`Invalid candidateId format "${entry.candidateId}" at ${path} (expected 12 hex chars)`)
          }

          if (allBuildIds.has(entry.buildId)) {
            throw new Error(`Duplicate buildId ${entry.buildId} at ${path}`)
          }
          allBuildIds.add(entry.buildId)
        }
      }
    }
  }
}

function validateNoForbiddenFields(value: unknown, forbiddenFields: Set<string>, path: string): void {
  if (value == null || typeof value !== 'object') {
    return
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      validateNoForbiddenFields(value[i], forbiddenFields, `${path}[${i}]`)
    }
    return
  }

  for (const [field, child] of Object.entries(value)) {
    if (forbiddenFields.has(field)) {
      throw new Error(`Public output contains forbidden field "${field}" in ${path}`)
    }
    validateNoForbiddenFields(child, forbiddenFields, `${path}.${field}`)
  }
}

export function writePublicLeaderboardOutput(path: string, output: PublicLeaderboardOutputV3): void {
  atomicWriteJsonFile(path, JSON.stringify(output, null, 2))
}
