import { getDefaultForm } from 'lib/optimization/defaultForm'
import type { Character, CharacterId } from 'types/character'
import type { DBMetadata } from 'types/metadata'
import type { HsrOptimizerSaveFormat } from 'types/store'

// Derives novaflare migration pairs from game metadata.
// A released character whose ID ends in "b1" has an original version that should be migrated.
function getNovaflaredPairs(dbCharacters: DBMetadata['characters']): [CharacterId, CharacterId][] {
  return Object.values(dbCharacters)
    .filter((c) => !c.unreleased && c.id.endsWith('b1'))
    .flatMap((c) => {
      const oldId = c.id.replace('b1', '') as CharacterId
      return dbCharacters[oldId] ? [[oldId, c.id] as [CharacterId, CharacterId]] : []
    })
}

export function migrateNovaflare(
  saveData: HsrOptimizerSaveFormat,
  dbCharacters: DBMetadata['characters'],
): void {
  saveData.completedMigrations ??= {}
  const migrations = saveData.completedMigrations

  const pairs = getNovaflaredPairs(dbCharacters).filter(
    ([oldId]) => !migrations[`novaflare${oldId}`],
  )

  if (pairs.length === 0) return

  console.log(`Novaflare migration: migrating ${pairs.length} characters`)

  // Phase 1: per-pair character entry migration and relic transfer
  const migratedPairs: [CharacterId, CharacterId][] = []
  for (const [oldId, newId] of pairs) {
    try {
      migrateCharacterEntry(saveData, oldId, newId)
      migratedPairs.push([oldId, newId])
      migrations[`novaflare${oldId}`] = 1
    } catch (e) {
      console.error(`Novaflare migration: ${oldId} → ${newId} failed, skipping`, e)
    }
  }

  // Phase 2: single-pass reference sweep across all migrated pairs
  if (migratedPairs.length > 0) {
    const idMap = new Map(migratedPairs)
    sweepCharacterIdReferences(saveData, idMap)
  }
}

function migrateCharacterEntry(
  saveData: HsrOptimizerSaveFormat,
  oldId: CharacterId,
  newId: CharacterId,
): void {
  const oldIdx = saveData.characters.findIndex((c) => c.id === oldId)
  if (oldIdx < 0) return

  // Both versions exist — leave both intact, only the reference sweep applies
  if (saveData.characters.some((c) => c.id === newId)) return

  // Only old version exists — replace with upgraded character and transfer relics
  const oldChar = saveData.characters[oldIdx]
  saveData.characters.push(createUpgradedCharacter(newId, oldChar))
  transferRelics(saveData, oldId, newId)
  saveData.characters.splice(oldIdx, 1)
}

function createUpgradedCharacter(newId: CharacterId, oldChar: Character): Character {
  return {
    id: newId,
    form: getDefaultForm({ id: newId }),
    equipped: {},
    builds: [],
    portrait: oldChar.portrait,
  }
}

function transferRelics(saveData: HsrOptimizerSaveFormat, oldId: CharacterId, newId: CharacterId): void {
  for (const relic of saveData.relics) {
    if (relic.equippedBy === oldId) {
      relic.equippedBy = newId
    }
  }
}

// Single-pass replacement of all teammate/session references for all migrated pairs
function sweepCharacterIdReferences(saveData: HsrOptimizerSaveFormat, idMap: Map<CharacterId, CharacterId>): void {
  const remap = (id: CharacterId) => idMap.get(id) ?? id

  for (const character of saveData.characters) {
    const form = character.form
    if (form?.teammate0?.characterId) form.teammate0.characterId = remap(form.teammate0.characterId)
    if (form?.teammate1?.characterId) form.teammate1.characterId = remap(form.teammate1.characterId)
    if (form?.teammate2?.characterId) form.teammate2.characterId = remap(form.teammate2.characterId)

    for (const build of character.builds ?? []) {
      if (!build.team) continue
      for (const teammate of build.team) {
        if (teammate?.characterId) teammate.characterId = remap(teammate.characterId)
      }
    }
  }

  if (saveData.scoringMetadataOverrides) {
    for (const override of Object.values(saveData.scoringMetadataOverrides)) {
      if (!override?.simulation?.teammates) continue
      for (const teammate of override.simulation.teammates) {
        if (teammate?.characterId) teammate.characterId = remap(teammate.characterId)
      }
    }
  }

  const sessionCharId = saveData.savedSession?.global?.optimizerCharacterId
  if (sessionCharId) {
    saveData.savedSession!.global.optimizerCharacterId = remap(sessionCharId)
  }
}
