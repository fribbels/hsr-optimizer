import { hashObject } from 'leaderboard/shared/hash'
import { LEADERBOARD_VERSIONS } from 'leaderboard/shared/leaderboardVersions'
import type {
  LeaderboardDependencyNamespace,
  LeaderboardDependencyVersions,
  LeaderboardEntryTeammate,
  LeaderboardVersionFile,
} from 'leaderboard/shared/types'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'

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

export function collectBumpedIds(
  previous: LeaderboardVersionFile | undefined,
  current: LeaderboardVersionFile,
): { characterIds: Set<string>, lightConeIds: Set<string> } {
  const characterIds = new Set<string>()
  const lightConeIds = new Set<string>()
  if (!previous) return { characterIds, lightConeIds }

  for (const [id, version] of Object.entries(current.characters)) {
    if ((previous.characters[id] ?? 0) !== version) {
      characterIds.add(id)
    }
  }
  for (const [id, version] of Object.entries(current.lightCones)) {
    if ((previous.lightCones[id] ?? 0) !== version) {
      lightConeIds.add(id)
    }
  }
  return { characterIds, lightConeIds }
}

export function collectAffectedCharacterIds(
  bumpedCharIds: Set<string>,
  bumpedLcIds: Set<string>,
): Set<string> {
  const affected = new Set<string>(bumpedCharIds)
  if (bumpedCharIds.size === 0 && bumpedLcIds.size === 0) return affected

  const characters = getGameMetadata().characters
  for (const [charId, charMeta] of Object.entries(characters)) {
    if (affected.has(charId)) continue
    const scoring = charMeta?.scoringMetadata
    if (!scoring) continue

    const simConfigs = [scoring.simulation, scoring.supportSimulation, scoring.healSimulation, scoring.shieldSimulation]
    for (const sim of simConfigs) {
      if (!sim) continue
      if (isSimAffected(sim, bumpedCharIds, bumpedLcIds)) {
        affected.add(charId)
        break
      }
    }
  }

  return affected
}

function isSimAffected(
  sim: {
    teammates: { characterId: CharacterId, lightCone: string }[],
    leaderboardTeams?: { teammates: { characterId: CharacterId, lightCones: string[] }[] }[],
  },
  bumpedCharIds: Set<string>,
  bumpedLcIds: Set<string>,
): boolean {
  if (sim.teammates.some((t) => bumpedCharIds.has(t.characterId) || bumpedLcIds.has(t.lightCone))) {
    return true
  }
  if (sim.leaderboardTeams?.some((team) => team.teammates.some((t) => bumpedCharIds.has(t.characterId) || t.lightCones.some((lc) => bumpedLcIds.has(lc))))) {
    return true
  }
  return false
}
