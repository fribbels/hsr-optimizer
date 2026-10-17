import type {
  SimulationMetadataOverride,
  SimulationMetadataOverrides,
} from 'lib/characterPreview/characterPreviewTypes'
import { calculateTeammateSets } from 'lib/optimization/teammateSetUtils'
import {
  CONFIG_DISPLAY_ORDER,
  SCORING_CONFIG_REGISTRY,
} from 'lib/scoring/scoringConfig'
import { TEAM_SIZE } from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type {
  Relic,
  RelicId,
} from 'types/relic'
import type {
  TeamShowcaseBenchmarkMember,
  TeamShowcaseBenchmarkSnapshot,
} from 'types/store'

export enum TeamBenchmarkOverrideStatus {
  INCOMPLETE = 'incomplete',
  MISSING_LIGHT_CONE = 'missing-light-cone',
  READY = 'ready',
}

export interface TeamBenchmarkSnapshotResult {
  status: TeamBenchmarkOverrideStatus
  snapshot?: TeamShowcaseBenchmarkSnapshot
}

type BenchmarkOverridesByRole = {
  mainDps: SimulationMetadataOverrides
  nonMainDps: SimulationMetadataOverrides
}

type BenchmarkOverridesByCharacter = ReadonlyMap<CharacterId, BenchmarkOverridesByRole>

const EMPTY_BENCHMARK_OVERRIDES: (SimulationMetadataOverrides | undefined)[] = Array.from({ length: TEAM_SIZE })
const EMPTY_BENCHMARK_OVERRIDE_VARIANTS: BenchmarkOverridesByCharacter = new Map()

type CharacterWithLightCone = Character & {
  form: Character['form'] & { lightCone: LightConeId },
}

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

export function captureTeamBenchmarkSnapshot(
  characters: (Character | null)[],
  relicsById: Partial<Record<RelicId, Relic>>,
): TeamBenchmarkSnapshotResult {
  if (characters.length !== TEAM_SIZE || !characters.every(isCharacter)) {
    return { status: TeamBenchmarkOverrideStatus.INCOMPLETE }
  }

  const completeCharacters = characters
  if (!completeCharacters.every(hasLightCone)) {
    return { status: TeamBenchmarkOverrideStatus.MISSING_LIGHT_CONE }
  }

  return {
    status: TeamBenchmarkOverrideStatus.READY,
    snapshot: {
      members: completeCharacters.map((character) => buildBenchmarkMember(character, relicsById)),
    },
  }
}

export function buildTeamBenchmarkOverrideVariants(
  snapshot: TeamShowcaseBenchmarkSnapshot | undefined,
): BenchmarkOverridesByCharacter {
  const members = getValidSnapshotMembers(snapshot)
  if (!members) return EMPTY_BENCHMARK_OVERRIDE_VARIANTS

  const variants = new Map<CharacterId, BenchmarkOverridesByRole>()
  for (const member of members) {
    const teammates = members.filter((teammate) => teammate.characterId !== member.characterId)
    variants.set(member.characterId, {
      mainDps: buildConfigOverrides(teammates, false),
      nonMainDps: buildConfigOverrides(teammates, true),
    })
  }

  return variants
}

export function resolveTeamBenchmarkOverrides(
  slots: TeamSlots,
  variants: BenchmarkOverridesByCharacter,
): (SimulationMetadataOverrides | undefined)[] {
  const normalizedSlots = normalizeTeamSlots(slots)
  if (!normalizedSlots.every((id) => id != null && variants.has(id))) {
    return EMPTY_BENCHMARK_OVERRIDES
  }

  return normalizedSlots.map((id, index) => {
    if (!id) return undefined
    const characterVariants = variants.get(id)
    if (!characterVariants) return undefined
    return index === 0 ? characterVariants.mainDps : characterVariants.nonMainDps
  })
}

export function areBenchmarkSnapshotsEqual(
  a: TeamShowcaseBenchmarkSnapshot | undefined,
  b: TeamShowcaseBenchmarkSnapshot | undefined,
): boolean {
  if (!a || !b) return a === b
  if (a.members.length !== b.members.length) return false

  return a.members.every((member, index) => areBenchmarkMembersEqual(member, b.members[index]))
}

function buildBenchmarkMember(
  character: CharacterWithLightCone,
  relicsById: Partial<Record<RelicId, Relic>>,
): TeamShowcaseBenchmarkMember {
  return {
    characterId: character.id,
    lightCone: character.form.lightCone,
    characterEidolon: character.form.characterEidolon,
    lightConeSuperimposition: character.form.lightConeSuperimposition,
    ...calculateTeammateSets(character, relicsById),
  }
}

function getValidSnapshotMembers(
  snapshot: TeamShowcaseBenchmarkSnapshot | undefined,
): TeamShowcaseBenchmarkMember[] | undefined {
  if (!snapshot || snapshot.members.length !== TEAM_SIZE) return undefined

  const memberIds = new Set(snapshot.members.map((member) => member.characterId))
  return memberIds.size === TEAM_SIZE ? snapshot.members : undefined
}

function buildConfigOverrides(
  teammates: TeamShowcaseBenchmarkMember[],
  deprioritizeBuffs: boolean,
): SimulationMetadataOverrides {
  const overrides: SimulationMetadataOverrides = {}
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const override: SimulationMetadataOverride = { teammates }
    if (SCORING_CONFIG_REGISTRY[configType].supportsDeprioritizeBuffs) {
      override.deprioritizeBuffs = deprioritizeBuffs
    }
    overrides[configType] = override
  }
  return overrides
}

function areBenchmarkMembersEqual(
  a: TeamShowcaseBenchmarkMember,
  b: TeamShowcaseBenchmarkMember | undefined,
): boolean {
  return b != null
    && a.characterId === b.characterId
    && a.characterEidolon === b.characterEidolon
    && a.lightCone === b.lightCone
    && a.lightConeSuperimposition === b.lightConeSuperimposition
    && a.teamRelicSet === b.teamRelicSet
    && a.teamOrnamentSet === b.teamOrnamentSet
}
