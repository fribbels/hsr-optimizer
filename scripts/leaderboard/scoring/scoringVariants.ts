import { SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
import {
  DEFAULT_TIER_SUPERIMPOSITION,
  type EidolonTierValue,
  eidolonToGroup,
  FIXED_TEAMMATE_OVERRIDES,
  TEAMMATE_EIDOLON_CAPS,
} from 'scripts/leaderboard/shared/eidolonConfig'
import type {
  LeaderboardScoreCandidateConfigInput,
  LeaderboardScoringCandidate,
} from 'scripts/leaderboard/shared/types'
import type { LightConeId } from 'types/lightCone'
import type {
  LeaderboardTeam,
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

export type ExpandScoringVariantsInput = {
  candidate: LeaderboardScoringCandidate,
  configType: ScoringConfigType,
  baseMetadata: SimulationMetadata,
  leaderboardTeams: LeaderboardTeam[],
  eligibleTiers: EidolonTierValue[],
}

export type CountScoringVariantsInput = Pick<
  ExpandScoringVariantsInput,
  'leaderboardTeams' | 'eligibleTiers'
>

export type LeaderboardScoringVariant = LeaderboardScoreCandidateConfigInput

export function expandScoringVariants(input: ExpandScoringVariantsInput): LeaderboardScoringVariant[] {
  const variants: LeaderboardScoringVariant[] = []

  for (const team of input.leaderboardTeams) {
    const teamId = buildTeamId(team)
    const lcPermutations = cartesianLcPermutations(team.teammates.map((t) => t.lightCones))

    for (const tier of input.eligibleTiers) {
      const teamTier = eidolonToGroup(tier)
      for (const lcCombo of lcPermutations) {
        variants.push({
          candidate: input.candidate,
          configType: input.configType,
          teamId,
          simulationMetadata: buildSimulationMetadata({
            baseMetadata: input.baseMetadata,
            configType: input.configType,
            team,
            tierEidolon: tier,
            lcCombo,
          }),
          teamEidolon: tier,
          teamTier,
        })
      }
    }
  }

  return variants
}

export function countScoringVariants(input: CountScoringVariantsInput): number {
  let total = 0
  for (const team of input.leaderboardTeams) {
    total += input.eligibleTiers.length * countLcPermutations(team.teammates.map((t) => t.lightCones))
  }
  return total
}

function buildTeamId(team: LeaderboardTeam): string {
  return team.teammates.map((t) => t.characterId).sort().join('|')
}

function buildSimulationMetadata(input: {
  baseMetadata: SimulationMetadata,
  configType: ScoringConfigType,
  team: LeaderboardTeam,
  tierEidolon: EidolonTierValue,
  lcCombo: LightConeId[],
}): SimulationMetadata {
  const teammates: SimulationMetadata['teammates'] = input.team.teammates.map((t, i) => {
    const fixed = FIXED_TEAMMATE_OVERRIDES[t.characterId]
    const cap = TEAMMATE_EIDOLON_CAPS[t.characterId]
    const baseEidolon = fixed?.eidolon ?? input.tierEidolon
    return {
      characterId: t.characterId,
      lightCone: input.lcCombo[i],
      characterEidolon: cap != null ? Math.min(baseEidolon, cap) : baseEidolon,
      lightConeSuperimposition: fixed?.lcSuperimpositions[input.lcCombo[i]] ?? DEFAULT_TIER_SUPERIMPOSITION,
      teamRelicSet: t.teamRelicSet,
      teamOrnamentSet: t.teamOrnamentSet,
    }
  })

  const metadata: SimulationMetadata = {
    ...input.baseMetadata,
    teammates,
    leaderboardTeams: undefined,
  }

  if (SCORING_CONFIG_REGISTRY[input.configType].supportsDeprioritizeBuffs && input.team.deprioritizeBuffs) {
    metadata.deprioritizeBuffs = true
  }

  return metadata
}

function countLcPermutations(lcArrays: LightConeId[][]): number {
  return lcArrays.reduce((total, lcs) => total * lcs.length, 1)
}

function cartesianLcPermutations(lcArrays: LightConeId[][]): LightConeId[][] {
  let result: LightConeId[][] = [[]]
  for (const lcs of lcArrays) {
    const next: LightConeId[][] = []
    for (const combo of result) {
      for (const lc of lcs) {
        next.push([...combo, lc])
      }
    }
    result = next
  }
  return result
}
