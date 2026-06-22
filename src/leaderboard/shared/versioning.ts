import { hashObject } from 'leaderboard/shared/hash'
import { LEADERBOARD_VERSIONS } from 'leaderboard/shared/leaderboardVersions'
import type {
  LeaderboardDependencyNamespace,
  LeaderboardDependencyVersions,
  LeaderboardEntryTeammate,
  LeaderboardVersionFile,
} from 'leaderboard/shared/types'

export function readLeaderboardVersions(): LeaderboardVersionFile {
  return LEADERBOARD_VERSIONS
}

export function getCharacterVersion(
  versions: LeaderboardVersionFile,
  characterId: string | null | undefined,
): number {
  if (characterId == null) return 0
  return versions.characters[characterId] ?? 0
}

export function getLightConeVersion(
  versions: LeaderboardVersionFile,
  lightConeId: string | null | undefined,
): number {
  if (lightConeId == null) return 0
  return versions.lightCones[lightConeId] ?? 0
}

export function getDependencyVersions(input: {
  versions: LeaderboardVersionFile,
  primaryCharacterId: string,
  primaryLightConeId: string | null | undefined,
  teammates: LeaderboardEntryTeammate[],
}): LeaderboardDependencyVersions {
  const { versions, primaryCharacterId, primaryLightConeId, teammates } = input

  const characterVersions: Record<string, number> = {
    [primaryCharacterId]: getCharacterVersion(versions, primaryCharacterId),
  }
  const lightConeVersions: Record<string, number> = {}

  if (primaryLightConeId != null) {
    lightConeVersions[primaryLightConeId] = getLightConeVersion(versions, primaryLightConeId)
  }

  const teammateCharacterIds: string[] = []
  const teammateLightConeIds: string[] = []

  for (const teammate of teammates) {
    teammateCharacterIds.push(teammate.characterId)
    characterVersions[teammate.characterId] = getCharacterVersion(versions, teammate.characterId)

    if (teammate.lightCone) {
      teammateLightConeIds.push(teammate.lightCone)
      lightConeVersions[teammate.lightCone] = getLightConeVersion(versions, teammate.lightCone)
    }
  }

  return {
    global: versions.global,
    characterVersions,
    lightConeVersions,
    primaryCharacterId,
    primaryLightConeId: primaryLightConeId ?? null,
    teammateCharacterIds,
    teammateLightConeIds,
  }
}

export function buildDependencyNamespace(input: {
  dependencyVersions: LeaderboardDependencyVersions,
}): LeaderboardDependencyNamespace {
  const dependencyDigest = hashObject(input.dependencyVersions)

  return {
    dependencies: input.dependencyVersions,
    dependencyDigest,
  }
}
