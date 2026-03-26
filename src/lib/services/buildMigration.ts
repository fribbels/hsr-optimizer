import type { CharacterId } from 'types/character'
import type { ConditionalValueMap } from 'types/conditionals'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { Relic } from 'types/relic'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { DEFAULT_BASIC, NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  BuildSource,
  type Build,
  type CharacterSavedBuild,
  type OptimizerSavedBuild,
  type SavedBuild,
  type SavedTeammate,
  type SavedTeammateWithConditionals,
  type TeamTuple,
} from 'types/savedBuild'

export function migrateBuild(
  raw: Record<string, unknown>,
  characterId: CharacterId,
  characterForm: Pick<Form, 'characterEidolon' | 'lightCone' | 'lightConeSuperimposition'>,
  relicsById: Map<string, Relic>,
): SavedBuild | null {
  // Guard: reject completely invalid data
  if (!raw || typeof raw !== 'object' || !('name' in raw)) {
    console.warn('[buildMigration] Skipping invalid build data for character', characterId, raw)
    return null
  }

  // Layer 3: already new format — validate critical fields before trusting the cast
  if ('source' in raw && (raw.source === BuildSource.Character || raw.source === BuildSource.Optimizer)) {
    if (typeof raw.name !== 'string' || !raw.characterId || !Array.isArray(raw.team)) {
      console.warn('[buildMigration] Corrupt new-format build, missing required fields', characterId, raw)
      return null
    }
    return raw as SavedBuild
  }

  // Layer 1: ancient format { build: string[], name, score }
  if (Array.isArray(raw.build)) {
    return migrateAncientFormat(raw, characterId, characterForm, relicsById)
  }

  // Layer 2: current format with old field names
  return migrateCurrentFormat(raw, characterId)
}

// Layer 1: { build: string[], name, score } → CharacterSavedBuild
function migrateAncientFormat(
  raw: Record<string, unknown>,
  characterId: CharacterId,
  characterForm: Pick<Form, 'characterEidolon' | 'lightCone' | 'lightConeSuperimposition'>,
  relicsById: Map<string, Relic>,
): CharacterSavedBuild {
  const buildArray = raw.build as string[]
  const equipped: Build = {}
  for (const relicId of buildArray) {
    const relic = relicsById.get(relicId)
    if (relic) {
      equipped[relic.part] = relicId
    }
  }

  return {
    source: BuildSource.Character,
    name: raw.name as string,
    characterId,
    equipped,
    characterEidolon: characterForm.characterEidolon,
    lightCone: characterForm.lightCone,
    lightConeSuperimposition: characterForm.lightConeSuperimposition,
    team: [null, null, null],
  }
}

// Layer 2: current format with old field names → new format
function migrateCurrentFormat(
  raw: Record<string, unknown>,
  characterId: CharacterId,
): SavedBuild {
  const meta = raw.optimizerMetadata as Record<string, unknown> | null

  // Rename base fields
  const name = raw.name as string
  const characterEidolon = (raw.eidolon as number) ?? 0
  const lightCone = (raw.lightConeId as LightConeId) ?? ('' as LightConeId)
  const lightConeSuperimposition = (raw.superimposition as number) ?? 1
  const equipped = (raw.equipped as Build) ?? {}

  // If no optimizer metadata, it's a character tab build
  if (meta == null) {
    const oldTeam = (raw.team as unknown[]) ?? []
    const team = migrateTeam(oldTeam) as TeamTuple<SavedTeammate>

    const result: CharacterSavedBuild = {
      source: BuildSource.Character,
      name,
      characterId,
      equipped,
      characterEidolon,
      lightCone,
      lightConeSuperimposition,
      team,
    }
    return result
  }

  // Optimizer build: flatten optimizerMetadata fields onto top level
  const comboType = (meta.comboType as ComboType)
    ?? (meta.comboStateJson && meta.comboStateJson !== '{}'
      ? ComboType.ADVANCED : ComboType.SIMPLE)
  const comboStateJson = (meta.comboStateJson as string) ?? '{}'
  const comboPreprocessor = (meta.presets as boolean) ?? true
  const setConditionals = (meta.setConditionals as OptimizerSavedBuild['setConditionals']) ?? defaultSetConditionals

  // Handle legacy conditionals relocation
  const oldConditionals = meta.conditionals as Record<string, ConditionalValueMap> | undefined
  let characterConditionals = (raw.characterConditionals as ConditionalValueMap) ?? {}
  let lightConeConditionals = (raw.lightConeConditionals as ConditionalValueMap) ?? {}

  if (oldConditionals && !raw.characterConditionals) {
    characterConditionals = oldConditionals[characterId] ?? {}
    lightConeConditionals = oldConditionals[lightCone] ?? {}
  }

  const oldTeam = (raw.team as unknown[]) ?? []
  const team = migrateTeamWithConditionals(oldTeam, oldConditionals) as TeamTuple<SavedTeammateWithConditionals>

  const result: OptimizerSavedBuild = {
    source: BuildSource.Optimizer,
    name,
    characterId,
    equipped,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    team,
    characterConditionals,
    lightConeConditionals,
    setConditionals,
    comboType,
    comboStateJson,
    comboPreprocessor,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC],
    deprioritizeBuffs: (raw.deprioritizeBuffs as boolean) ?? false,
  }
  return result
}

function migrateTeammate(raw: unknown): SavedTeammate | null {
  if (!raw || typeof raw !== 'object') return null
  const tm = raw as Record<string, unknown>
  if (!tm.characterId) return null
  return {
    characterId: tm.characterId as CharacterId,
    characterEidolon: (tm.eidolon as number) ?? (tm.characterEidolon as number) ?? 0,
    lightCone: (tm.lightConeId as LightConeId) ?? (tm.lightCone as LightConeId) ?? ('' as LightConeId),
    lightConeSuperimposition: (tm.superimposition as number) ?? (tm.lightConeSuperimposition as number) ?? 1,
    teamRelicSet: (tm.relicSet as string) ?? (tm.teamRelicSet as string) ?? undefined,
    teamOrnamentSet: (tm.ornamentSet as string) ?? (tm.teamOrnamentSet as string) ?? undefined,
  }
}

function migrateTeammateWithConditionals(
  raw: unknown,
  oldConditionals: Record<string, ConditionalValueMap> | undefined,
): SavedTeammateWithConditionals | null {
  const base = migrateTeammate(raw)
  if (!base) return null
  const tm = raw as Record<string, unknown>

  let charConds = (tm.characterConditionals as ConditionalValueMap) ?? {}
  let lcConds = (tm.lightConeConditionals as ConditionalValueMap) ?? {}

  // If conditionals were stored in the old location, pull them
  if (oldConditionals && !tm.characterConditionals) {
    charConds = oldConditionals[base.characterId] ?? {}
    const lcKey = (tm.lightConeId as string) ?? (tm.lightCone as string) ?? base.lightCone
    lcConds = oldConditionals[lcKey] ?? {}
  }

  return {
    ...base,
    characterConditionals: charConds,
    lightConeConditionals: lcConds,
  }
}

function migrateTeam(oldTeam: unknown[]): TeamTuple<SavedTeammate> {
  return [
    migrateTeammate(oldTeam[0]),
    migrateTeammate(oldTeam[1]),
    migrateTeammate(oldTeam[2]),
  ]
}

function migrateTeamWithConditionals(
  oldTeam: unknown[],
  oldConditionals: Record<string, ConditionalValueMap> | undefined,
): TeamTuple<SavedTeammateWithConditionals> {
  return [
    migrateTeammateWithConditionals(oldTeam[0], oldConditionals),
    migrateTeammateWithConditionals(oldTeam[1], oldConditionals),
    migrateTeammateWithConditionals(oldTeam[2], oldConditionals),
  ]
}
