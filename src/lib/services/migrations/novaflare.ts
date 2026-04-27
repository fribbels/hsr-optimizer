import { getDefaultForm } from 'lib/optimization/defaultForm'
import type { Character, CharacterId } from 'types/character'
import type { DBMetadata } from 'types/metadata'
import type { HsrOptimizerSaveFormat } from 'types/store'

// Derives novaflare migration pairs from game metadata.
// A released character whose ID ends in "b1" has an original version that should be migrated.
function getNovaflaredPairs(dbCharacters: DBMetadata['characters']): [CharacterId, CharacterId][] {
  return Object.values(dbCharacters)
    .filter((c) => !c.unreleased && c.id.endsWith('b1') && dbCharacters[c.id.replace('b1', '') as CharacterId])
    .map((c) => [c.id.replace('b1', '') as CharacterId, c.id])
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

  for (const [oldId, newId] of pairs) {
    try {
      migrateCharacterEntry(saveData, oldId, newId)
      sweepCharacterIdReferences(saveData, oldId, newId)
      migrations[`novaflare${oldId}`] = 1
    } catch (e) {
      console.error(`Novaflare migration: ${oldId} → ${newId} failed, skipping`, e)
    }
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

// Replaces all teammate/session references from oldId to newId
function sweepCharacterIdReferences(saveData: HsrOptimizerSaveFormat, oldId: CharacterId, newId: CharacterId): void {
  for (const character of saveData.characters) {
    const form = character.form
    if (form?.teammate0?.characterId === oldId) form.teammate0.characterId = newId
    if (form?.teammate1?.characterId === oldId) form.teammate1.characterId = newId
    if (form?.teammate2?.characterId === oldId) form.teammate2.characterId = newId

    for (const build of character.builds ?? []) {
      if (!build.team) continue
      for (const teammate of build.team) {
        if (teammate?.characterId === oldId) teammate.characterId = newId
      }
    }
  }

  if (saveData.scoringMetadataOverrides) {
    for (const override of Object.values(saveData.scoringMetadataOverrides)) {
      if (!override?.simulation?.teammates) continue
      for (const teammate of override.simulation.teammates) {
        if (teammate?.characterId === oldId) teammate.characterId = newId
      }
    }
  }

  if (saveData.savedSession?.global?.optimizerCharacterId === oldId) {
    saveData.savedSession.global.optimizerCharacterId = newId
  }
}
