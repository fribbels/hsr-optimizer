import i18next from 'i18next'
import { Constants } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  getCharacterById,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { gridStore } from 'lib/stores/gridStore'
import {
  getRelicById,
  useRelicStore,
} from 'lib/stores/relic/relicStore'
import { debounceEffect } from 'lib/utils/frontendUtils'
import type { CharacterId } from 'types/character'
import type {
  Relic,
  RelicId,
} from 'types/relic'

function getSwapSetting(): boolean {
  return useGlobalStore.getState().settings.RelicEquippingBehavior === SettingOptions.RelicEquippingBehavior.Swap
}

function upsertRelic(relic: Relic): void {
  useRelicStore.getState().upsertRelic(relic)
}

function unequipRelic(id: RelicId): void {
  if (!id) return console.warn('No relic')
  const relic = getRelicById(id)
  if (!relic) return console.warn('No relic')

  // Defensive scan by slot rather than equippedBy to catch state inconsistencies
  const owner = useCharacterStore.getState().characters
    .find((c) => c.equipped?.[relic.part] === relic.id)
  if (owner) {
    useCharacterStore.getState().setCharacter({
      ...owner,
      equipped: { ...owner.equipped, [relic.part]: undefined },
    })
  }

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
  const storeRelic = getRelicById(relic.id)
  if (!storeRelic) return console.warn('Relic not found in store', relic.id)

  const prevOwnerId = storeRelic.equippedBy
  const prevCharacter = prevOwnerId ? getCharacterById(prevOwnerId) : undefined
  const character = getCharacterById(characterId)
  if (!character) return console.warn('Character not found in store', characterId)
  const equippedId = character.equipped[storeRelic.part]
  const prevRelic = equippedId ? getRelicById(equippedId) : undefined

  if (prevRelic) {
    unequipRelic(prevRelic.id)
  }

  const swap = forceSwap || getSwapSetting()

  // only re-equip prevRelic if it would go to a different character
  if (prevOwnerId !== characterId && prevCharacter) {
    const updatedEquipped = prevRelic && swap
      ? { ...prevCharacter.equipped, [storeRelic.part]: prevRelic.id }
      : { ...prevCharacter.equipped, [storeRelic.part]: undefined }
    if (prevRelic && swap) {
      upsertRelic({ ...prevRelic, equippedBy: prevCharacter.id })
    }
    useCharacterStore.getState().setCharacter({ ...prevCharacter, equipped: updatedEquipped })
  }

  useCharacterStore.getState().setCharacter({ ...character, equipped: { ...character.equipped, [storeRelic.part]: storeRelic.id } })
  upsertRelic({ ...storeRelic, equippedBy: character.id })

  debounceEffect('refreshRelics', 500, () => gridStore.relicsGridApi()?.refreshCells())
}

/**
 * Batch equip multiple relics to a character.
 */
export function equipRelicIds(relicIds: RelicId[], characterId: CharacterId, forceSwap = false): void {
  if (!characterId) return console.warn('No characterId to equip to')
  for (const relicId of relicIds) {
    const relic = getRelicById(relicId)
    if (relic) equipRelic(relic, characterId, forceSwap)
  }
}

/**
 * Transfers all equipped relics from one character to another.
 */
export function switchRelics(fromId: CharacterId, toId: CharacterId): void {
  if (!fromId) return console.warn('No characterId to equip from')
  if (!toId) return console.warn('No characterId to equip to')
  const fromCharacter = getCharacterById(fromId)
  if (!fromCharacter) return console.warn('Source character not found', fromId)
  const relicIds = Object.values(fromCharacter.equipped).filter((id): id is RelicId => id != null)
  equipRelicIds(relicIds, toId, true)
}

/**
 * Removes a relic: unequips it, then deletes from store.
 */
export function removeRelic(relicId: RelicId): void {
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
    upsertRelic(relic)
    if (relic.equippedBy) {
      equipRelic(relic, relic.equippedBy)
    }
  } else {
    const partChanged = oldRelic.part !== relic.part
    if (partChanged || !relic.equippedBy) {
      unequipRelic(relic.id)
      // Write before equipRelic so it sees new equippedBy (old owner already cleaned by unequipRelic)
      upsertRelic(relic)
    }
    const relicIsNotEquippedByRelicOwner = relic.equippedBy
      && getCharacterById(relic.equippedBy)?.equipped[relic.part] !== relic.id
    if (relicIsNotEquippedByRelicOwner) {
      // No upsert before this — equipRelic must read old equippedBy from store to handle previous owner swap
      equipRelic(relic, relic.equippedBy)
    }
    upsertRelic(relic)
  }
}
