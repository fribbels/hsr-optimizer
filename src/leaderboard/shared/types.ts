import type { EligibleConverted } from 'leaderboard/ingest/eligibility'
import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import type { LeaderboardEidolonGroup } from 'leaderboard/shared/eidolonConfig'
import type { MinifiedCharacter } from 'leaderboard/shared/profileCompression'
import type { LeaderboardBuildScore } from 'leaderboard/shared/scoreLeaderboardBuild'
import type { UnconvertedCharacter } from 'lib/importer/characterConverter'
import type {
  ComputeOptimalSimulationWorkerInput,
  ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import type { CharacterId } from 'types/character'
import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

// ---------------------------------------------------------------------------
// Entry data
// ---------------------------------------------------------------------------

export type LeaderboardEntryTeammate = {
  characterId: string,
  lightCone: string,
  characterEidolon: number,
  lightConeSuperimposition: number,
}

export type LeaderboardEntryData = {
  character: MinifiedCharacter,
  team: LeaderboardEntryTeammate[],
  teamEidolon: number,
  characterEidolon: number,
  teamId: string,
  deprioritizeBuffs?: boolean,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,
  fetchedAt: number,
}

export type FailureEntry = {
  uid: string,
  characterId: string | number,
  configType?: ScoringConfigType,
  error: string,
}

// ---------------------------------------------------------------------------
// Export parsing
// ---------------------------------------------------------------------------

export type ParsedCharacter = {
  unconverted: UnconvertedCharacter,
  minified: MinifiedCharacter,
}

export type ParsedProfile = {
  uid: string,
  fetchedAt: number,
  payloadHash: string,
  payloadBase64: string,
  characters: ParsedCharacter[],
}

// Scoring-stage DTO: carries pre-converted characters for survivors, drops payloadBase64
export type LeaderboardScoringCharacter = {
  unconverted: UnconvertedCharacter,
  minified: MinifiedCharacter,
  converted: EligibleConverted,
  preFilterRank: number,
}

export type LeaderboardScoringProfile = {
  uid: string,
  fetchedAt: number,
  payloadHash: string,
  characters: LeaderboardScoringCharacter[],
}

export type CharacterParseError = {
  uid: string,
  avatarId: number,
  error: string,
}

export type ExportParseSummary = {
  exportPath: string,
  totalRows: number,
  profileRows: number,
  malformedRows: number,
  parsedProfiles: number,
  characterErrors: CharacterParseError[],
}

export type ParsedExport = {
  profiles: ParsedProfile[],
  summary: ExportParseSummary,
}

// ---------------------------------------------------------------------------
// Incremental state
// ---------------------------------------------------------------------------

export type ProfilePayloadIndexEntry = {
  uid: string,
  fetchedAt: number,
  payloadHash: string,
}

export type ProfilePayloadIndex = {
  exportId?: string,
  profiles: Record<string, ProfilePayloadIndexEntry>,
}

export type IncrementalProfileDiff = {
  unchangedUids: Set<string>,
  changedUids: Set<string>,
  newUids: Set<string>,
  missingUids: Set<string>,
}

// ---------------------------------------------------------------------------
// Versioning
// ---------------------------------------------------------------------------

export type LeaderboardVersionFile = {
  global: number,
  characters: Record<string, number>,
  lightCones: Record<string, number>,
}

export type LeaderboardDependencyVersions = {
  global: number,
  characterVersions: Record<string, number>,
  lightConeVersions: Record<string, number>,
  primaryCharacterId: string,
  primaryLightConeId: string | null,
  teammateCharacterIds: string[],
  teammateLightConeIds: string[],
}

export type LeaderboardDependencyNamespace = {
  dependencies: LeaderboardDependencyVersions,
  dependencyDigest: string,
}

// ---------------------------------------------------------------------------
// Private ranked output
// ---------------------------------------------------------------------------

export type PrivateRankedOutput = {
  generatedAt: string,
  versions: LeaderboardVersionFile,
  sourceExport: {
    path: string,
    exportId?: string,
    profileCount: number,
  },
  boards: Record<string, PrivateBoard>,
  payloadIndex: ProfilePayloadIndex,
}

export type PrivateBoard = {
  characterId: string,
  configType: LeaderboardConfigType,
  teamId: string,
  entries: PrivateRankedEntry[],
  completeness: PrivateBoardCompleteness,
}

export type PrivateBoardCompleteness = {
  scoredCandidateCount: number,
  totalScoredEntries: number,
  privateCutoffScore: number | null,
  publicCutoffScore: number | null,
  topN: number,
  topNPublic: number,
  canRefillPublicTopN: boolean,
}

export type PrivateRankedEntry = {
  rank: number,
  uid: string,
  uidHash: string,
  payloadHash: string,
  score: number,
  configType: ScoringConfigType,
  characterId: string,
  teamId: string,
  teamTier: LeaderboardEidolonGroup,
  data: LeaderboardEntryData,
  dependencyVersions: LeaderboardDependencyVersions,
  dependencyDigest: string,
  preFilterRank: number,
}

// ---------------------------------------------------------------------------
// Public output
// ---------------------------------------------------------------------------

export type PublicLeaderboardOutputV3 = {
  generatedAt: string,
  characters: Record<string, string>,
}

export type PublicCharacterData = {
  configs: Partial<Record<LeaderboardConfigType, PublicConfigData>>,
}

export type PublicConfigData = {
  teams: PublicTeamMeta[],
  teamsById: Record<string, PublicBoardDataV2>,
  totalEntries: number,
}

export type PublicTeamMeta = {
  teamId: string,
  teammates: PublicTeammateMeta[],
}

export type PublicTeammateMeta = {
  characterId: string,
}

export type PublicBoardDataV2 = {
  entries: PublicLeaderboardEntryV2[],
  totalEntries: number,
}

export type PublicLeaderboardEntryV2 = {
  rank: number,
  characterId: CharacterId,
  buildId: string,
  candidateId: string,
  score: number,
  data: LeaderboardEntryData,
}

// ---------------------------------------------------------------------------
// Scoring pipeline
// ---------------------------------------------------------------------------

export type LeaderboardScoringCandidate = {
  uid: string,
  uidHash: string,
  payloadHash: string,
  fetchedAt: number,
  character: LeaderboardScoringCharacter,
  characterId: string,
}

export type LeaderboardScoreCandidateConfigInput = {
  candidate: LeaderboardScoringCandidate,
  configType: ScoringConfigType,
  teamId: string,
  simulationMetadata: SimulationMetadata,
  teamEidolon?: number,
  teamTier: LeaderboardEidolonGroup,
  strippedRelicHash?: string,
  dependencyNamespace?: LeaderboardDependencyNamespace,
}

export type { LeaderboardBuildScore }

// ---------------------------------------------------------------------------
// Leaderboard build-score cache
// ---------------------------------------------------------------------------

export type LeaderboardBuildScoreCacheValue = {
  key: string,
  createdAt: string,
  score: LeaderboardBuildScore,
}

export type LeaderboardBuildScoreCacheStats = {
  l1Hits: number,
  sqliteHits: number,
  misses: number,
  writes: number,
  corruptRowsDeleted: number,
}

export type LeaderboardBuildScoreCachePruneOptions = {
  leaderboardVersionsHash: string,
}

export type LeaderboardBuildScoreCachePruneStats = {
  deletedRows: number,
}

export type LeaderboardBuildScoreCache = {
  get(key: string): LeaderboardBuildScore | null,
  set(key: string, score: LeaderboardBuildScore): void,
  getOrCompute(key: string, compute: () => Promise<LeaderboardBuildScore | null>): Promise<LeaderboardBuildScore | null>,
  stats(): LeaderboardBuildScoreCacheStats,
  flush(): void,
  clear(): LeaderboardBuildScoreCachePruneStats,
  prune(options: LeaderboardBuildScoreCachePruneOptions): LeaderboardBuildScoreCachePruneStats,
}

// ---------------------------------------------------------------------------
// Search runner
// ---------------------------------------------------------------------------

export type ComputeOptimalSimulationPhase = 'benchmark' | 'perfection'
export type ComputeOptimalSimulationResultMode = 'full' | 'scoreOnly'

export type ComputeOptimalSimulationSearchRunnerContext = {
  phase: ComputeOptimalSimulationPhase,
  configType: ScoringConfigType,
  resultMode?: ComputeOptimalSimulationResultMode,
}

export type ComputeOptimalSimulationSearchRunner = (
  input: ComputeOptimalSimulationWorkerInput,
  context: ComputeOptimalSimulationSearchRunnerContext,
) => Promise<ComputeOptimalSimulationWorkerOutput>

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export type LeaderboardMetricsSnapshot = {
  counters: Record<string, number>,
  gauges: Record<string, number>,
  timings: Record<string, { count: number, totalMs: number, avgMs: number }>,
}

export type LeaderboardMetrics = {
  increment(name: string, value?: number, tags?: Record<string, string>): void,
  timing(name: string, ms: number, tags?: Record<string, string>): void,
  gauge(name: string, value: number, tags?: Record<string, string>): void,
  snapshot(): LeaderboardMetricsSnapshot,
}

// ---------------------------------------------------------------------------
// Score worker messages (profile-worker mode)
// ---------------------------------------------------------------------------

export type LeaderboardScoreWorkerRuntimeConfig = {
  buildScoreCacheDbPath: string,
  leaderboardVersionsHash: string,
}

export type LeaderboardScoreWorkerRequest = {
  id: number,
  profile: LeaderboardScoringProfile,
  versions: LeaderboardVersionFile,
  globalVersion: number,
  runtimeConfig: LeaderboardScoreWorkerRuntimeConfig,
}

export type LeaderboardScoreWorkerSuccessResponse = {
  id: number,
  ok: true,
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  scored: number,
  failed: number,
  scoringRuns: number,
  buildScoreCacheStats: LeaderboardBuildScoreCacheStats,
  metrics: LeaderboardMetricsSnapshot,
  elapsedMs: number,
}

export type LeaderboardScoreWorkerErrorResponse = {
  id: number,
  ok: false,
  error: string,
  stack?: string,
}

export type LeaderboardScoreWorkerResponse =
  | LeaderboardScoreWorkerSuccessResponse
  | LeaderboardScoreWorkerErrorResponse
