import * as objectHash from 'object-hash'
import DB from './db';
import { Message } from './message';

export const StateEditor = {
  addFromForm: (form) => {
    let characters = DB.getCharacters();
    let found = characters.find(x => x.id == form.characterId)
    if (found) {
      // TODO: update
      found.form = form
    } else {
      DB.addCharacter({
        id: form.characterId,
        form: form,
        equipped: {}
      })
    }

    console.log('Updated db characters', DB.getCharacters())
    characterGrid.current.api.setRowData(DB.getCharacters())
  },

  unequipCharacter: (characterId) => {
    let character = DB.getCharacters().find(x => x.id == characterId)
    if (!character) return console.warn('No character to unequip')

    console.log('Unequipping character', characterId, character)

    for (let part of Object.values(Constants.Parts)) {
      let equipped = character.equipped[part]
      if (!equipped) continue
      
      let relicMatch = DB.getRelicById(equipped.id)

      character.equipped[part] = undefined
      relicMatch.equippedBy = undefined
    }
  },

  removeCharacter: (characterId) => {
    StateEditor.unequipCharacter(characterId)
    let characters = DB.getCharacters()
    characters = characters.filter(x => x.id != characterId)

    DB.setCharacters(characters)
  },

  unequipRelic: (relic) => {
    if (!relic || !relic.id) return console.warn('No relic')
    relic = DB.getRelicById(relic.id)

    let characters = DB.getCharacters()
    for (let character of characters) {
      if (character.equipped && character.equipped[relic.part] && character.equipped[relic.part].id == relic.id) {
        console.log('!!! DEBUG', character, relic)

        character.equipped[relic.part].equippedBy = undefined
        character.equipped[relic.part] = undefined
      }
    }

    relic.equippedBy = undefined
  },

  equipRelic: (relic, characterId) => {
    if (!relic || !relic.id) return console.warn('No relic')
    if (!characterId) return console.warn('No character')
    relic = DB.getRelicById(relic.id)

    let prevOwnerId = relic.equippedBy;
    let character = DB.getCharacters().find(x => x.id == characterId)
    let prevCharacter = DB.getCharacters().find(x => x.id == prevOwnerId)
    let prevRelic = character.equipped[relic.part]
    StateEditor.unequipRelic(prevRelic)

    if (prevCharacter) {
      prevCharacter.equipped[relic.part] = undefined
    }
    character.equipped[relic.part] = relic
    relic.equippedBy = character.id
  },

  equipRelicsToCharacter: (relics, characterId) => {
    let character = DB.getCharacters().find(x => x.id == characterId)
    if (!character) return console.warn('No character to equip to')

    console.log('Equipping relics to character', relics, characterId, character)

    for (let relic of relics) {
      StateEditor.equipRelic(relic, characterId)
    }
  },

  deleteRelic: (id) => {
    if (!id) return Message.error('Unable to delete relic')

    for (let character of DB.getCharacters()) {
      for (let part of Object.values(Constants.Parts)) {
        console.log(character.equipped[part] && character.equipped[part].id == id, character, part, id)
        if (character.equipped[part] && character.equipped[part].id == id) {
          character.equipped[part] = undefined
        }
      }
    }

    DB.deleteRelicById(id)
    characterGrid.current.api.redrawRows()
  },

  mergeHash: () => {
  },

  mergeRelicsWithState: (newRelics) => {
    console.log('Merging relics', newRelics)

    let oldRelics = DB.getRelics()
    let characters = DB.getCharacters()

    let oldRelicHashes = {}
    for (let oldRelic of oldRelics) {
      let hash = hashRelic(oldRelic)
      oldRelicHashes[hash] = oldRelic;
    }

    let replacementRelics = []
    for (let newRelic of newRelics) {
      let hash = hashRelic(newRelic)

      let found = oldRelicHashes[hash]
      if (found) {
        replacementRelics.push(found)
        delete oldRelicHashes[hash]
      } else {
        replacementRelics.push(newRelic)
      }
    }

    console.log('Replacement relics', replacementRelics)
        
    global.relicsGrid.current.api.setRowData(replacementRelics)
    DB.setRelics(replacementRelics);


    for (let character of characters) {
      for (let part of Object.values(Constants.Parts)) {
        if (character.equipped && character.equipped[part] && !DB.getRelicById(character.equipped[part].id)) {
          character.equipped[part] = undefined
        }
      }
    }

    characterGrid.current.api.redrawRows()

    // TODO this probably shouldnt be in this file
    let fieldValues = OptimizerTabController.getForm()
    onOptimizerFormValuesChange({}, fieldValues);
  }
}

function hashRelic(relic) {
  let hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    enhance: relic.enhance,
    mainstat: relic.main.stat,
    mainvalue: Math.floor(relic.main.value),
    substats: relic.substats
  }
  let hash = objectHash(hashObject)
  return hash
}