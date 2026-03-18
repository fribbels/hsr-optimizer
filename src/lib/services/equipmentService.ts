import i18next from 'i18next'
import { Constants } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { useGlobalStore } from 'lib/stores/appStore'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { getRelicById, getRelics, useRelicStore } from 'lib/stores/relicStore'
import { debounceEffect } from 'lib/utils/debounceUtils'
import { gridStore } from 'lib/utils/gridStore'
import type { Character, CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

/**
 * Reads the swap setting from the global store.
 */
function getSwapSetting(): boolean {
  return useGlobalStore.getState().settings.RelicEquippingBehavior === SettingOptions.RelicEquippingBehavior.Swap
}

/**
 * Upserts a single relic into the relic store (no equipment logic).
 */
function upsertRelic(relic: Relic): void {
  useRelicStore.getState().upsertRelic(relic)
}

/**
 * Unequips a relic by ID. Clears relic.equippedBy and the owning character's equipped slot.
 */
export function unequipRelic(id: string): void {
  if (!id) return console.warn('No relic')
  const relic = getRelicById(id)
  if (!relic) return console.warn('No relic')

  const characters = useCharacterStore.getState().characters
    .map((c) => {
      if (c.equipped?.[relic.part] && c.equipped[relic.part] === relic.id) {
        return { ...c, equipped: { ...c.equipped, [relic.part]: undefined } }
      }
      return c
    })
  useCharacterStore.getState().setCharacters(characters)

  const newRelic = { ...relic, equippedBy: undefined }
  upsertRelic(newRelic)
}

/**
 * Unequips all relics from a character.
 */
export function unequipCharacter(characterId: CharacterId): void {
  let character = getCharacterById(characterId)
  if (!character) return console.warn('No character to unequip')

  for (const part of Object.values(Constants.Parts)) {
    const equippedId = character.equipped[part]
    if (!equippedId) continue

    const relicMatch = getRelicById(equippedId)
    character = { ...character, equipped: { ...character.equipped, [part]: undefined } }

    if (relicMatch) {
      upsertRelic({ ...relicMatch, equippedBy: undefined })
    }
  }
  useCharacterStore.getState().setCharacter(character)
}

/**
 * Equips a relic to a character. Handles:
 * - Unequipping the relic from its previous owner
 * - Swapping with the relic currently in the target slot (if swap setting enabled)
 * - Updating both relic.equippedBy and character.equipped
 */
export function equipRelic(relic: Relic, characterId: CharacterId | undefined, forceSwap = false): void {
  if (!relic?.id) return console.warn('No relic')
  if (!characterId) return console.warn('No character')
  relic = getRelicById(relic.id)!

  const prevOwnerId = relic.equippedBy
  const prevCharacter = getCharacterById(prevOwnerId!)
  const character = getCharacterById(characterId)!
  const prevRelic = getRelicById(character.equipped[relic.part]!)
  let updatedPrevCharacter: Character

  if (prevRelic) {
    unequipRelic(prevRelic.id)
  }

  const swap = forceSwap || getSwapSetting()

  // only re-equip prevRelic if it would go to a different character
  if (prevOwnerId !== characterId && prevCharacter) {
    if (prevRelic && swap) {
      updatedPrevCharacter = { ...prevCharacter, equipped: { ...prevCharacter.equipped, [relic.part]: prevRelic.id } }
      upsertRelic({ ...prevRelic, equippedBy: prevCharacter.id })
    } else {
      updatedPrevCharacter = { ...prevCharacter, equipped: { ...prevCharacter.equipped, [relic.part]: undefined } }
    }
    useCharacterStore.getState().setCharacter(updatedPrevCharacter!)
  }

  useCharacterStore.getState().setCharacter({ ...character, equipped: { ...character.equipped, [relic.part]: relic.id } })
  upsertRelic({ ...relic, equippedBy: character.id })

  debounceEffect('refreshRelics', 500, () => gridStore.relicsGridApi()?.refreshCells())
}

/**
 * Batch equip multiple relics to a character.
 */
export function equipRelicIds(relicIds: string[], characterId: CharacterId, forceSwap = false): void {
  if (!characterId) return console.warn('No characterId to equip to')
  for (const relicId of relicIds) {
    equipRelic({ id: relicId } as Relic, characterId, forceSwap)
  }
}

/**
 * Transfers all equipped relics from one character to another.
 */
export function switchRelics(fromId: CharacterId, toId: CharacterId): void {
  if (!fromId) return console.warn('No characterId to equip from')
  if (!toId) return console.warn('No characterId to equip to')
  const fromCharacter = getCharacterById(fromId)!
  equipRelicIds(Object.values(fromCharacter.equipped), toId, true)
}

/**
 * Removes a relic: unequips it, then deletes from store.
 */
export function removeRelic(relicId: string): void {
  if (!relicId) return Message.error(i18next.t('relicsTab:Messages.UnableToDeleteRelic'))
  unequipRelic(relicId)
  useRelicStore.getState().deleteRelic(relicId)
}

/**
 * Removes a character: unequips all relics, then deletes from character store.
 */
export function removeCharacter(characterId: CharacterId): void {
  unequipCharacter(characterId)
  useCharacterStore.getState().removeCharacter(characterId)
}

/**
 * Upserts a relic and handles its equipment state.
 * - If new: adds to store, equips if relic.equippedBy is set
 * - If existing: handles part changes, re-equips as needed
 */
export function upsertRelicWithEquipment(relic: Relic): void {
  if (!relic.id) return console.warn('No matching relic', relic)
  const oldRelic = getRelicById(relic.id)
  const addRelic = !oldRelic

  if (addRelic) {
    relic.ageIndex ??= 1 + Math.max(
      ...getRelics()
        .map((r) => r.ageIndex)
        .filter((x) => x != null),
    )

    upsertRelic(relic)
    if (relic.equippedBy) {
      equipRelic(relic, relic.equippedBy)
    }
  } else {
    const partChanged = oldRelic.part !== relic.part
    if (partChanged || !relic.equippedBy) {
      unequipRelic(relic.id)
      upsertRelic(relic)
    }
    const relicIsNotEquippedByRelicOwner = relic.equippedBy
      && getCharacterById(relic.equippedBy)?.equipped[relic.part] !== relic.id
    if (relicIsNotEquippedByRelicOwner) {
      equipRelic(relic, relic.equippedBy)
    }
    upsertRelic(relic)
  }
}
