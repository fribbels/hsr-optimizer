import {
  buildLeaderboardBuildScoreCacheKey,
  buildStrippedRelicHash,
} from 'leaderboard/cache/leaderboardBuildScoreCache'
import type { EligibleConverted } from 'leaderboard/ingest/eligibility'
import { expandScoringVariants } from 'leaderboard/scoring/scoringVariants'
import {
  EIDOLON_TIERS,
  type EidolonTierValue,
} from 'leaderboard/shared/eidolonConfig'
import { hashUid } from 'leaderboard/shared/hash'
import {
  type LeaderboardBuildScore,
  scoreLeaderboardBuild,
} from 'leaderboard/shared/scoreLeaderboardBuild'
import type {
  ComputeOptimalSimulationSearchRunner,
  FailureEntry,
  LeaderboardBuildScoreCache,
  LeaderboardDependencyNamespace,
  LeaderboardEntryTeammate,
  LeaderboardMetrics,
  LeaderboardScoreCandidateConfigInput,
  LeaderboardScoringCandidate,
  LeaderboardScoringProfile,
  LeaderboardVersionFile,
  PrivateRankedEntry,
} from 'leaderboard/shared/types'
import {
  buildDependencyNamespace,
  getDependencyVersions,
} from 'leaderboard/shared/versioning'
import { DEFAULT_TEAM } from 'lib/constants/constants'
import { CONFIG_DISPLAY_ORDER } from 'lib/scoring/scoringConfig'
import { resolveSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'
import type {
  LeaderboardTeam,
  LeaderboardTeammates,
  SimulationMetadata,
} from 'types/metadata'

export async function scoreLeaderboardCandidateConfig(input: {
  candidateConfig: LeaderboardScoreCandidateConfigInput,
  versions: LeaderboardVersionFile,
  globalVersion: number,
  searchRunner: ComputeOptimalSimulationSearchRunner,
  buildScoreCache: LeaderboardBuildScoreCache,
  metrics: LeaderboardMetrics,
}): Promise<PrivateRankedEntry | null> {
  const { candidateConfig, versions, globalVersion, searchRunner, buildScoreCache, metrics } = input
  const { candidate, configType, teamId, simulationMetadata } = candidateConfig
  const converted = candidate.character.converted

  const team: LeaderboardEntryTeammate[] = simulationMetadata.teammates.map((t) => ({
    characterId: String(t.characterId),
    lightCone: String(t.lightCone),
    characterEidolon: t.characterEidolon,
    lightConeSuperimposition: t.lightConeSuperimposition,
  }))

  const charId = candidate.characterId
  const primaryLightConeId = converted.form.lightCone
    ? String(converted.form.lightCone)
    : null

  let resolvedNamespace = candidateConfig.dependencyNamespace
  if (!resolvedNamespace) {
    const dependencyVersions = getDependencyVersions({
      versions,
      primaryCharacterId: charId,
      primaryLightConeId,
      teammates: team,
    })
    resolvedNamespace = buildDependencyNamespace({ dependencyVersions })
  }

  const t0Key = performance.now()
  const cacheKey = buildLeaderboardBuildScoreCacheKey({
    globalVersion,
    dependencyDigest: resolvedNamespace.dependencyDigest,
    configType,
    simulationMetadata,
    characterEidolon: converted.form.characterEidolon,
    lightConeSuperimposition: converted.form.lightConeSuperimposition,
    strippedRelicHash: candidateConfig.strippedRelicHash,
    singleRelicByPart: candidateConfig.strippedRelicHash ? undefined : converted.equipped,
    spdBenchmark: null,
  })
  metrics.timing('scorer.keyBuild', performance.now() - t0Key)

  const t0Cache = performance.now()
  const cached = buildScoreCache.get(cacheKey)
  metrics.timing('scorer.cacheGet', performance.now() - t0Cache)

  let result: LeaderboardBuildScore | null
  if (cached != null) {
    result = cached
  } else {
    const t0Compute = performance.now()
    const computeScore = () =>
      scoreLeaderboardBuild({
        character: converted,
        configType,
        simulationMetadata,
        singleRelicByPart: converted.equipped,
        showcaseTemporaryOptions: { spdBenchmark: undefined },
        searchRunner,
        scoreOnly: true,
      })
    result = await computeScore()
    if (result != null) {
      buildScoreCache.set(cacheKey, result)
    }
    metrics.timing('scorer.compute', performance.now() - t0Compute)
  }

  if (!result) return null
  if (result.percent <= 0 || !Number.isFinite(result.percent)) return null

  return {
    rank: 0,
    uid: candidate.uid,
    uidHash: candidate.uidHash,
    payloadHash: candidate.payloadHash,
    score: result.percent,
    configType,
    characterId: charId,
    teamId,
    teamTier: candidateConfig.teamTier,
    data: {
      character: candidate.character.minified,
      team,
      teamEidolon: candidateConfig.teamEidolon ?? 0,
      characterEidolon: converted.form.characterEidolon,
      teamId: candidateConfig.teamId,
      deprioritizeBuffs: simulationMetadata.deprioritizeBuffs ?? false,
      baselineSimScore: result.baselineSimScore,
      benchmarkSimScore: result.benchmarkSimScore,
      maximumSimScore: result.maximumSimScore,
      fetchedAt: candidate.fetchedAt,
    },
    dependencyVersions: resolvedNamespace.dependencies,
    dependencyDigest: resolvedNamespace.dependencyDigest,
    preFilterRank: candidate.character.preFilterRank,
  }
}

export async function scoreProfile(input: {
  profile: LeaderboardScoringProfile,
  versions: LeaderboardVersionFile,
  globalVersion: number,
  searchRunner: ComputeOptimalSimulationSearchRunner,
  metrics: LeaderboardMetrics,
  buildScoreCache: LeaderboardBuildScoreCache,
}): Promise<{
  entries: PrivateRankedEntry[],
  failures: FailureEntry[],
  scored: number,
  failed: number,
  scoringRuns: number,
}> {
  const { profile, versions, globalVersion, searchRunner, metrics, buildScoreCache } = input
  const entries: PrivateRankedEntry[] = []
  const failures: FailureEntry[] = []
  let scored = 0
  let failed = 0
  let scoringRuns = 0

  const uidHash = hashUid(profile.uid)

  let relicHashMs = 0
  let planMs = 0
  let expandMs = 0

  for (const character of profile.characters) {
    const converted = character.converted
    const charId = String(converted.id)
    const metadata = getGameMetadata().characters[charId as CharacterId]
    if (!metadata?.scoringMetadata) continue

    const t0Hash = performance.now()
    const strippedRelicHash = buildStrippedRelicHash(converted.equipped)
    relicHashMs += performance.now() - t0Hash

    const primaryLightConeId = converted.form.lightCone
      ? String(converted.form.lightCone)
      : null

    const candidate: LeaderboardScoringCandidate = {
      uid: profile.uid,
      uidHash,
      payloadHash: profile.payloadHash,
      fetchedAt: profile.fetchedAt,
      character,
      characterId: charId,
    }

    const depNamespaceCache = new Map<string, LeaderboardDependencyNamespace>()

    for (const configType of CONFIG_DISPLAY_ORDER) {
      try {
        const t0Plan = performance.now()
        const plan = buildScoringPlan(converted, configType)
        planMs += performance.now() - t0Plan
        if (!plan) continue

        metrics.increment('scorer.configAttempted', 1, { configType })

        const bestPerTeam = new Map<string, PrivateRankedEntry>()

        const t0Expand = performance.now()
        const variants = expandScoringVariants({
          candidate,
          configType,
          ...plan,
        })
        expandMs += performance.now() - t0Expand

        for (const variant of variants) {
          const teammates = variant.simulationMetadata.teammates
          const depKey = teammates.map((t) => `${t.characterId}:${t.lightCone}`).join('|')
          let depNamespace = depNamespaceCache.get(depKey)
          if (!depNamespace) {
            const team: LeaderboardEntryTeammate[] = teammates.map((t) => ({
              characterId: String(t.characterId),
              lightCone: String(t.lightCone),
              characterEidolon: t.characterEidolon,
              lightConeSuperimposition: t.lightConeSuperimposition,
            }))
            const dependencyVersions = getDependencyVersions({
              versions,
              primaryCharacterId: charId,
              primaryLightConeId,
              teammates: team,
            })
            depNamespace = buildDependencyNamespace({ dependencyVersions })
            depNamespaceCache.set(depKey, depNamespace)
          }
          variant.strippedRelicHash = strippedRelicHash
          variant.dependencyNamespace = depNamespace

          scoringRuns++
          const result = await scoreLeaderboardCandidateConfig({
            candidateConfig: variant,
            versions,
            globalVersion,
            searchRunner,
            buildScoreCache,
            metrics,
          })

          const current = bestPerTeam.get(variant.teamId)
          if (result && (!current || result.score > current.score)) {
            bestPerTeam.set(variant.teamId, result)
          }
        }

        for (const entry of bestPerTeam.values()) {
          entries.push(entry)
          scored++
          metrics.increment('scorer.scored')
        }
      } catch (e) {
        failures.push({
          uid: profile.uid,
          characterId: charId,
          configType,
          error: String(e),
        })
        failed++
        metrics.increment('scorer.failure', 1, { configType })
      }
    }
  }

  metrics.timing('scorer.relicHash', relicHashMs)
  metrics.timing('scorer.plan', planMs)
  metrics.timing('scorer.expand', expandMs)

  return {
    entries,
    failures,
    scored,
    failed,
    scoringRuns,
  }
}

type ScoringPlan = {
  baseMetadata: SimulationMetadata,
  leaderboardTeams: LeaderboardTeam[],
  eligibleTiers: EidolonTierValue[],
}

function buildScoringPlan(
  converted: EligibleConverted,
  configType: typeof CONFIG_DISPLAY_ORDER[number],
): ScoringPlan | null {
  const baseMetadata = resolveSimulationMetadata(converted, configType, DEFAULT_TEAM)
  if (!baseMetadata) return null

  const defaultTeam: LeaderboardTeam = {
    teammates: baseMetadata.teammates.map((t) => ({
      characterId: t.characterId,
      lightCones: [t.lightCone],
      teamRelicSet: t.teamRelicSet,
      teamOrnamentSet: t.teamOrnamentSet,
    })) as LeaderboardTeammates,
  }
  const customTeams = baseMetadata.leaderboardTeams ?? []
  const defaultTeamKey = defaultTeam.teammates.map((t) => t.characterId).sort().join('|')
  const customCoversDefault = customTeams.some((t) => t.teammates.map((m) => m.characterId).sort().join('|') === defaultTeamKey)
  const leaderboardTeams = customCoversDefault ? customTeams : [defaultTeam, ...customTeams]
  const characterEidolon = converted.form.characterEidolon
  const eligibleTiers = EIDOLON_TIERS.filter((tier) => tier <= characterEidolon)

  return { baseMetadata, leaderboardTeams, eligibleTiers }
}
