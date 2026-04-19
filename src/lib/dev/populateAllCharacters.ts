import i18next from 'i18next'
import {
  type MainStats,
  MainStatsValues,
  Parts,
  type Sets,
  Stats,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import {
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { uuid } from 'lib/utils/miscUtils'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { DBMetadataLightCone } from 'types/metadata'
import type {
  Relic,
  RelicSubstatMetadata,
} from 'types/relic'
import type { Build } from 'types/savedBuild'

const GRADE = 5
const ENHANCE = 15

// Main stats for each part (first option for variable slots)
const partMainStats: Record<Parts, MainStats> = {
  [Parts.Head]: Stats.HP,
  [Parts.Hands]: Stats.ATK,
  [Parts.Body]: Stats.CR,
  [Parts.Feet]: Stats.SPD,
  [Parts.PlanarSphere]: Stats.ATK_P,
  [Parts.LinkRope]: Stats.ERR,
}

// Common substats pool
const substatPool: SubStats[] = [Stats.CR, Stats.CD, Stats.ATK_P, Stats.SPD, Stats.HP_P, Stats.DEF_P]

function calculateMainStatValue(stat: MainStats): number {
  const values = MainStatsValues[stat]?.[GRADE]
  if (!values) return 0
  return values.base + ENHANCE * values.increment
}

function pickSubstats(mainStat: MainStats): RelicSubstatMetadata[] {
  const available = substatPool.filter((s) => s !== mainStat)
  const selected = available.slice(0, 4)
  return selected.map((stat) => {
    const values = SubStatValues[stat as keyof typeof SubStatValues]?.[GRADE]
    // Use mid-roll value, assume 2 rolls (initial + 1 upgrade)
    const rollValue = values?.mid ?? 0
    return {
      stat,
      value: rollValue * 2,
      addedRolls: 1,
    }
  })
}

function createRelic(
  part: Parts,
  set: Sets,
  charId: CharacterId,
): Relic {
  const mainStat = partMainStats[part]
  const substats = pickSubstats(mainStat)

  return {
    id: uuid(),
    set,
    part,
    grade: GRADE,
    enhance: ENHANCE,
    equippedBy: charId,
    main: {
      stat: mainStat,
      value: calculateMainStatValue(mainStat),
    },
    substats,
    previewSubstats: [],
    augmentedStats: {} as Relic['augmentedStats'],
    weightScore: 0,
    initialRolls: 4,
  }
}

function createRelicsForCharacter(charId: CharacterId): { relics: Relic[], equipped: Build } {
  const relicSet = SetsRelicsNames[0]
  const ornamentSet = SetsOrnamentsNames[0]

  const relics: Relic[] = [
    createRelic(Parts.Head, relicSet, charId),
    createRelic(Parts.Hands, relicSet, charId),
    createRelic(Parts.Body, relicSet, charId),
    createRelic(Parts.Feet, relicSet, charId),
    createRelic(Parts.PlanarSphere, ornamentSet, charId),
    createRelic(Parts.LinkRope, ornamentSet, charId),
  ]

  const equipped: Build = {}
  for (const relic of relics) {
    equipped[relic.part] = relic.id
  }

  return { relics, equipped }
}

/**
 * Dev utility: adds every character to the character list with a matching light cone.
 * Picks the first 5★ LC matching the character's path, falling back to 4★ then 3★.
 * Also creates 6 valid equipped relics (4 substats each) per character.
 * Skips characters that are already in the list.
 *
 * Usage: import in a component or call window.populateAllCharacters() from the console
 * after the init hook below has run.
 */
export function populateAllCharacters() {
  const metadata = getGameMetadata()
  const store = useCharacterStore.getState()

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
  const removed: string[] = []
  const allRelics: Relic[] = []

  // Build set of all character IDs to check for buffed versions
  const allCharIds = new Set(Object.keys(metadata.characters))

  // Remove existing buffed characters from the store
  for (const char of [...store.characters]) {
    if (/^\d+$/.test(char.id) && allCharIds.has(`${char.id}b1`)) {
      removed.push(`${t(`${char.id}.LongName`)} (buffed version removed)`)
      store.removeCharacter(char.id)
    }
  }

  // Rebuild existing set after removals
  const existingAfterRemoval = new Set(store.characters.map((c) => c.id))

  for (const charMeta of Object.values(metadata.characters)) {
    const charId = charMeta.id as CharacterId
    const charName = t(`${charId}.LongName`)

    // Skip buffed versions: if ID is numeric and {id}b1 exists, this is the buffed version
    if (/^\d+$/.test(charId) && allCharIds.has(`${charId}b1`)) {
      skipped.push(`${charName} (buffed version)`)
      continue
    }

    if (existingAfterRemoval.has(charId)) {
      skipped.push(`${charName} (already exists)`)
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

    // Create relics for this character
    const { relics, equipped } = createRelicsForCharacter(charId)
    allRelics.push(...relics)

    const character: Character = {
      id: charId,
      equipped,
      form,
    }

    store.addCharacter(character)
    added.push(`${charName} + ${lc?.id ?? 'no LC'} + 6 relics`)
  }

  // Add all relics to the store
  if (allRelics.length > 0) {
    useRelicStore.getState().batchUpsertRelics(allRelics)
  }

  // Sort the full list (existing + new) by name and clear all custom portraits
  const allCharacters = [...useCharacterStore.getState().characters]
  allCharacters.sort((a, b) => {
    const nameA = t(`${a.id}.LongName`)
    const nameB = t(`${b.id}.LongName`)
    return nameA.localeCompare(nameB)
  })
  for (const char of allCharacters) {
    delete char.portrait
  }
  store.setCharacters(allCharacters)

  console.log(
    `[populateAllCharacters] Added ${added.length} characters, ${allRelics.length} relics, removed ${removed.length} buffed, skipped ${skipped.length}, total ${allCharacters.length} (sorted by name)`,
  )
  if (removed.length) console.log('Removed:', removed)
  if (added.length) console.table(added)
  if (skipped.length) console.log('Skipped:', skipped)
}
