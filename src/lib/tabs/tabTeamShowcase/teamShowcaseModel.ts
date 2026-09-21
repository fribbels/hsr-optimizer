import type { SimulationMetadataOverrides } from 'lib/characterPreview/characterPreviewTypes'
import { calculateTeammateSets } from 'lib/optimization/teammateSetUtils'
import { CONFIG_DISPLAY_ORDER } from 'lib/scoring/scoringConfig'
import { TEAM_SIZE } from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { SimulationMetadata } from 'types/metadata'
import type { Relic } from 'types/relic'

export enum TeamBenchmarkOverrideStatus {
  INCOMPLETE = 'incomplete',
  MISSING_LIGHT_CONE = 'missing-light-cone',
  READY = 'ready',
}

export interface TeamBenchmarkOverrideResult {
  status: TeamBenchmarkOverrideStatus
  overridesBySlot: (SimulationMetadataOverrides | undefined)[]
}

type CharacterWithLightCone = Character & {
  form: Character['form'] & { lightCone: LightConeId },
}
type BenchmarkTeammate = SimulationMetadata['teammates'][number]

function isCharacter(character: Character | null): character is Character {
  return character != null
}

function hasLightCone(character: Character): character is CharacterWithLightCone {
  return character.form.lightCone != null
}

export function normalizeTeamSlots(ids: TeamSlots): TeamSlots {
  return Array.from({ length: TEAM_SIZE }, (_, index) => ids[index] ?? null)
}

export function sanitizeTeamSlots(
  ids: TeamSlots,
  charactersById: Partial<Record<CharacterId, Character>>,
): TeamSlots {
  const seenIds = new Set<CharacterId>()
  return normalizeTeamSlots(ids).map((id) => {
    if (!id || !charactersById[id] || seenIds.has(id)) return null
    seenIds.add(id)
    return id
  })
}

export function areTeamSlotsEqual(a: TeamSlots, b: TeamSlots): boolean {
  const normalizedA = normalizeTeamSlots(a)
  const normalizedB = normalizeTeamSlots(b)
  return normalizedA.every((id, index) => id === normalizedB[index])
}

export function autofillTeamSlots(
  slots: TeamSlots,
  leaderId: CharacterId,
  ownedIds: Set<CharacterId>,
  teammateIds: CharacterId[],
): TeamSlots {
  const candidates = teammateIds.filter((id) => id !== leaderId && ownedIds.has(id))

  const filled = normalizeTeamSlots(slots)
  for (let index = 0; index < filled.length; index++) {
    if (filled[index] != null) continue
    const next = candidates.find((id) => !filled.includes(id))
    if (!next) break
    filled[index] = next
  }
  return filled
}

export function buildTeamBenchmarkOverrides(
  characters: (Character | null)[],
  relicsById: Partial<Record<string, Relic>>,
): TeamBenchmarkOverrideResult {
  if (characters.length !== TEAM_SIZE || !characters.every(isCharacter)) {
    return emptyBenchmarkOverrideResult(TeamBenchmarkOverrideStatus.INCOMPLETE)
  }

  const completeCharacters = characters
  if (!completeCharacters.every(hasLightCone)) {
    return emptyBenchmarkOverrideResult(TeamBenchmarkOverrideStatus.MISSING_LIGHT_CONE)
  }

  const benchmarkTeammates = completeCharacters.map((character) =>
    buildBenchmarkTeammate(character, relicsById)
  )
  const overridesBySlot = benchmarkTeammates.map((_, focalIndex) =>
    buildConfigOverrides(benchmarkTeammates.filter((__, index) => index !== focalIndex))
  )

  return {
    status: TeamBenchmarkOverrideStatus.READY,
    overridesBySlot,
  }
}

function emptyBenchmarkOverrideResult(status: TeamBenchmarkOverrideStatus): TeamBenchmarkOverrideResult {
  return {
    status,
    overridesBySlot: Array.from({ length: TEAM_SIZE }),
  }
}

function buildBenchmarkTeammate(
  character: CharacterWithLightCone,
  relicsById: Partial<Record<string, Relic>>,
): BenchmarkTeammate {
  return {
    characterId: character.id,
    lightCone: character.form.lightCone,
    characterEidolon: character.form.characterEidolon,
    lightConeSuperimposition: character.form.lightConeSuperimposition,
    ...calculateTeammateSets(character, relicsById),
  }
}

function buildConfigOverrides(teammates: BenchmarkTeammate[]): SimulationMetadataOverrides {
  const overrides: SimulationMetadataOverrides = {}
  for (const configType of CONFIG_DISPLAY_ORDER) {
    overrides[configType] = { teammates }
  }
  return overrides
}
