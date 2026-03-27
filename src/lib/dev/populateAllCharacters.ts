import i18next from 'i18next'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import type { Character, CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { DBMetadataLightCone } from 'types/metadata'

/**
 * Dev utility: adds every character to the character list with a matching light cone.
 * Picks the first 5★ LC matching the character's path, falling back to 4★ then 3★.
 * Skips characters that are already in the list.
 *
 * Usage: import in a component or call window.populateAllCharacters() from the console
 * after the init hook below has run.
 */
export function populateAllCharacters() {
  const metadata = getGameMetadata()
  const store = useCharacterStore.getState()
  const existing = new Set(store.characters.map((c) => c.id))

  const lcByPath = new Map<string, DBMetadataLightCone[]>()
  for (const lc of Object.values(metadata.lightCones)) {
    const list = lcByPath.get(lc.path) ?? []
    list.push(lc)
    lcByPath.set(lc.path, list)
  }

  // Sort each path's LCs by rarity descending so we pick 5★ first
  for (const list of lcByPath.values()) {
    list.sort((a, b) => b.rarity - a.rarity)
  }

  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const added: string[] = []
  const skipped: string[] = []

  for (const charMeta of Object.values(metadata.characters)) {
    const charId = charMeta.id as CharacterId

    if (existing.has(charId)) {
      skipped.push(`${t(`${charId}.LongName`)} (already exists)`)
      continue
    }

    const matchingLcs = lcByPath.get(charMeta.path) ?? []
    const lc = matchingLcs[0] // Highest rarity first
    const lcId = lc?.id as LightConeId | undefined

    const form = getDefaultForm({ id: charId })
    if (lcId) {
      form.lightCone = lcId
      form.lightConeSuperimposition = 1
    }

    const character: Character = {
      id: charId,
      equipped: {},
      form,
    }

    store.addCharacter(character)
    added.push(`${t(`${charId}.LongName`)} + ${lc?.id ?? 'no LC'}`)
  }

  // Sort the full list (existing + new) by name
  const allCharacters = [...useCharacterStore.getState().characters]
  allCharacters.sort((a, b) => {
    const nameA = t(`${a.id}.LongName`)
    const nameB = t(`${b.id}.LongName`)
    return nameA.localeCompare(nameB)
  })
  store.setCharacters(allCharacters)

  console.log(`[populateAllCharacters] Added ${added.length}, skipped ${skipped.length}, total ${allCharacters.length} (sorted by name)`)
  if (added.length) console.table(added)
  if (skipped.length) console.log('Skipped:', skipped)
}

