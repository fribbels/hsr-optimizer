import { OptimizerTabController } from "./optimizerTabController"
import { RelicAugmenter } from "./relicAugmenter"

let state = {
  relics: [],
  characters: [],
  metadata: {},
  relicsById: {}
}
import { create } from 'zustand'

window.store = create((set) => ({
  relicsById: {},
  setRelicsById: (x) => set(s => ({ relicsById: x })),

  characters: [],
  charactersById: {},
  setCharactersById: (x) => set(s => ({ charactersById: x })),
  setCharacters: (x) => set(s => ({ characters: x })),

  characterTabSelectedId: undefined,
  setCharacterTabSelectedId: (x) => set(s => ({ characterTabSelectedId: x })),

  characterTabBlur: false,
  setCharacterTabBlur: (x) => set(s => ({ characterTabBlur: x })),
}))

export const DB = {
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
  setRelics: (x) => {
    let relicsById = {}
    for (let relic of x) {
      relicsById[relic.id] = relic 
    }
    store.getState().setRelicsById(relicsById)
  },
  getRelicById: (id) => store.getState().relicsById[id],
  setRelicById: (relic) => {
    if (!relic.id) return console.warn('No matching relic', relic)
    store.getState().relicsById[relic.id] = relic
  },
  deleteRelicById: (id) => {
    if (!id) return console.warn('No id')
    let relicsById = store.getState().relicsById
    delete relicsById[id]
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
}

export default DB;

function assignRanks(characters) {
  for (let i = 0; i < characters.length; i++) {
    characters[i].rank = i
  }

  return characters;
}