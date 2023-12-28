import { OptimizerTabController } from "./optimizerTabController"
import { RelicAugmenter } from "./relicAugmenter"
import * as objectHash from 'object-hash'

let state = {
  relics: [],
  characters: [],
  metadata: {},
  relicsById: {},
  scorerId: undefined
}
import { create } from 'zustand'

window.store = create((set) => ({
  relicsById: {},
  setRelicsById: (x) => set(() => ({ relicsById: x })),

  characters: [],
  charactersById: {},
  setCharactersById: (x) => set(() => ({ charactersById: x })),
  setCharacters: (x) => set(() => ({ characters: x })),

  characterTabSelectedId: undefined,
  setCharacterTabSelectedId: (x) => set(() => ({ characterTabSelectedId: x })),

  characterTabBlur: false,
  setCharacterTabBlur: (x) => set(() => ({ characterTabBlur: x })),
}))

export const DB = {
  getScorerId: () => state.scorerId,
  setScorerId: (x) => state.scorerId = x,

  getMetadata: () => state.metadata,
  setMetadata: (x) => state.metadata = x,

  getCharacters: () => store.getState().characters,
  getCharacterById: (id) => store.getState().charactersById[id],

  setCharacters: (x) => {
    let charactersById = {}
    for (let character of x) {
      charactersById[character.id] = character
    }

    assignRanks(x)
    store.getState().setCharacters(x)
    store.getState().setCharactersById(charactersById)
  },
  setCharacter: (x) => {
    let charactersById = store.getState().charactersById
    charactersById[x.id] = x

    store.getState().setCharactersById(charactersById)
  },
  addCharacter: (x) => {
    let characters = DB.getCharacters()
    characters.push(x);
    DB.setCharacters(characters);
  },
  insertCharacter: (id, index) => {
    console.log('insert', id, index)
    let characters = DB.getCharacters()
    if (index < 0) {
      index = characters.length
    }
    let matchingCharacter = DB.getCharacterById(id)
    if (!matchingCharacter) return console.warn('No matching character to insert', id, index)
    let removed = characters.splice(matchingCharacter.rank, 1)
    characters.splice(index, 0, removed[0])
    DB.setCharacters(characters)
  },
  refreshCharacters: () => {
    if (window.setCharacterRows) {
      setCharacterRows(DB.getCharacters())
    }
  },

  getRelics: () => Object.values(Object.values(store.getState().relicsById)),
  getRelicsById: () => store.getState().relicsById,
  setRelics: (x) => {
    let relicsById = {}
    for (let relic of x) {
      relicsById[relic.id] = relic 
    }
    store.getState().setRelicsById(relicsById)
  },
  getRelicById: (id) => store.getState().relicsById[id],
  setRelic: (relic) => {
    if (!relic.id) return console.warn('No matching relic', relic)
    let relicsById = store.getState().relicsById
    relicsById[relic.id] = relic
    store.getState().setRelicsById(relicsById)
  },

  refreshRelics: () => {
    if (window.setRelicRows) setRelicRows(DB.getRelics())
  },

  getState: () => store.getState(),

  setStore: (x) => {
    console.log('Set state', x)
    let charactersById = {}
    for (let character of x.characters) {
      character.equipped = {}
      charactersById[character.id] = character
    }

    for (let relic of x.relics) {
      RelicAugmenter.augment(relic)
      let char = charactersById[relic.equippedBy]
      if (char) {
        char.equipped[relic.part] = relic.id
      } else {
        relic.equippedBy = undefined
      }
    }
    assignRanks(x.characters)
    DB.setRelics(x.relics)
    DB.setCharacters(x.characters)
    
    DB.refreshCharacters()
    DB.refreshRelics()
    SaveState.save()
  },
  resetStore: () => {
    DB.setStore({
      relics: [],
      characters: []
    })
  },

  addFromForm: (form) => {
    let characters = DB.getCharacters();
    let found = DB.getCharacterById(form.characterId)
    if (found) {
      found.form = form // TODO: update
      DB.setCharacters(characters)
    } else {
      DB.addCharacter({
        id: form.characterId,
        form: form,
        equipped: {}
      })
    }

    console.log('Updated db characters', characters)
    characterGrid.current.api.setRowData(characters)
  },

  unequipCharacter: (id) => {
    let character = DB.getCharacterById(id)
    if (!character) return console.warn('No character to unequip')

    console.log('Unequipping character', id, character)

    for (let part of Object.values(Constants.Parts)) {
      let equippedId = character.equipped[part]
      if (!equippedId) continue

      let relicMatch = DB.getRelicById(equippedId)

      character.equipped[part] = undefined

      if (relicMatch) {
        relicMatch.equippedBy = undefined
        DB.setRelic(relicMatch)
      }
    }
    DB.setCharacter(character)
  },

  removeCharacter: (characterId) => {
    DB.unequipCharacter(characterId)
    let characters = DB.getCharacters()
    characters = characters.filter(x => x.id != characterId)
    DB.setCharacters(characters)
  },

  unequipRelicById: (id) => {
    if (!id) return console.warn('No relic')
    let relic = DB.getRelicById(id)

    console.log('UNEQUIP RELIC')

    let characters = DB.getCharacters()
    for (let character of characters) {
      if (character.equipped && character.equipped[relic.part] && character.equipped[relic.part] == relic.id) {
        character.equipped[relic.part] = undefined
      }
    }
    DB.setCharacters(characters)

    relic.equippedBy = undefined
    DB.setRelic(relic)
  },

  equipRelic: (relic, characterId) => {
    if (!relic || !relic.id) return console.warn('No relic')
    if (!characterId) return console.warn('No character')
    relic = DB.getRelicById(relic.id)

    let prevOwnerId = relic.equippedBy;
    let character = DB.getCharacters().find(x => x.id == characterId)
    let prevCharacter = DB.getCharacters().find(x => x.id == prevOwnerId)
    let prevRelic = character.equipped[relic.part]
    DB.unequipRelicById(prevRelic)

    if (prevCharacter) {
      prevCharacter.equipped[relic.part] = undefined
      DB.setCharacter(prevCharacter)
    }
    character.equipped[relic.part] = relic.id
    relic.equippedBy = character.id
    DB.setCharacter(character)
    DB.setRelic(relic)
  },

  equipRelicIdsToCharacter: (relicIds, characterId) => {
    if (!characterId) return console.warn('No characterId to equip to')
    console.log('Equipping relics to character', relicIds, characterId)

    for (let relicId of relicIds) {
      DB.equipRelic({ id: relicId }, characterId)
    }
  },

  deleteRelic: (id) => {
    if (!id) return Message.error('Unable to delete relic')
    DB.unequipRelicById(id)
    let relicsById = store.getState().relicsById
    delete relicsById[id]
    store.getState().setRelicsById(relicsById)
    characterGrid.current.api.redrawRows()
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
        if (character.equipped && character.equipped[part] && !DB.getRelicById(character.equipped[part])) {
          character.equipped[part] = undefined
        }
      }
    }

    DB.setRelics(replacementRelics)
    DB.setCharacters(characters)

    characterGrid.current.api.redrawRows()

    // TODO this probably shouldn't be in this file
    let fieldValues = OptimizerTabController.getForm()
    onOptimizerFormValuesChange({}, fieldValues);
  }
}

export default DB;

function assignRanks(characters) {
  for (let i = 0; i < characters.length; i++) {
    characters[i].rank = i
  }

  return characters;
}

function hashRelic(relic) {
  let hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    enhance: relic.enhance,
    mainstat: relic.main.stat,
    mainvalue: Math.floor(relic.main.value),
    substatValues: relic.substats.map(x => x.value),
    substatStats: relic.substats.map(x => x.stat),
  }
  let hash = objectHash(hashObject)
  return hash
}