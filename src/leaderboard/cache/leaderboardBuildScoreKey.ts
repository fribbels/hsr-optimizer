import {
  hashObject,
  sha256Text,
  stableJson,
} from 'leaderboard/shared/hash'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'
import type { Relic } from 'types/relic'

function stripRelicIds(relics: PreviewRelics): PreviewRelics {
  return Object.fromEntries(
    Object.entries(relics).map(([part, relic]) => {
      if (!relic) return [part, null]

      const { id, ...cacheableRelic } = relic as Relic
      return [part, cacheableRelic]
    }),
  ) as PreviewRelics
}

export function buildStrippedRelicHash(relics: PreviewRelics): string {
  return hashObject(stripRelicIds(relics))
}

export function buildLeaderboardBuildScoreCacheKey(input: {
  globalVersion: number,
  dependencyDigest: string,
  configType: ScoringConfigType,
  simulationMetadata: SimulationMetadata,
  characterEidolon: number,
  lightConeSuperimposition: number,
  singleRelicByPart?: PreviewRelics,
  strippedRelicHash?: string,
  spdBenchmark: number | null,
}): string {
  const preimage = {
    globalVersion: input.globalVersion,
    dependencyDigest: input.dependencyDigest,
    configType: input.configType,
    simulationMetadataHash: hashObject(input.simulationMetadata),
    characterEidolon: input.characterEidolon,
    lightConeSuperimposition: input.lightConeSuperimposition,
    strippedRelicHash: input.strippedRelicHash ?? buildStrippedRelicHash(input.singleRelicByPart!),
    spdBenchmark: input.spdBenchmark,
  }

  return sha256Text(stableJson(preimage))
}
