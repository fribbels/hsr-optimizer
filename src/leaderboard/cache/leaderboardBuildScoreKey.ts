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
  // leaderboardEnabled is a UI-only gating flag with no effect on scoring math —
  // excluded so its addition/removal doesn't invalidate every cached build score.
  const { leaderboardEnabled: _leaderboardEnabled, ...hashableSimulationMetadata } = input.simulationMetadata

  const preimage = {
    globalVersion: input.globalVersion,
    dependencyDigest: input.dependencyDigest,
    configType: input.configType,
    simulationMetadataHash: hashObject(hashableSimulationMetadata),
    characterEidolon: input.characterEidolon,
    lightConeSuperimposition: input.lightConeSuperimposition,
    strippedRelicHash: input.strippedRelicHash ?? buildStrippedRelicHash(input.singleRelicByPart!),
    spdBenchmark: input.spdBenchmark,
  }

  return sha256Text(stableJson(preimage))
}
