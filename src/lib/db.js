import { OptimizerTabController } from "./optimizerTabController"
import { RelicAugmenter } from "./relicAugmenter"

let state = {
  relics: [],
  characters: [],
  metadata: {},
  relicsById: {}
}

export const DB = {
  getMetadata: () => state.metadata,
  setMetadata: (x) => state.metadata = x,

  getCharacters: () => state.characters,
  getCharacterById: (id) => {
    return state.characters.find(x => x.id == id)
  },
  setCharacters: (x) => {
    state.characters = x
    assignRanks()
  },
  addCharacter: (x) => {
    state.characters.push(x);
    assignRanks()
  },
  insertCharacter: (id, index) => {
    console.log('insert', id, index)
    if (index < 0) {
      index = state.characters.length
    }
    let matchingCharacter = state.characters.find(x => x.id == id)
    if (!matchingCharacter) return console.warn('No matching character to insert', id, index)

    let removed = state.characters.splice(matchingCharacter.rank, 1)
    state.characters.splice(index, 0, removed[0])
    assignRanks()
  },
  refreshCharacters: () => {
    if (window.setCharacterRows) {
      setCharacterRows(state.characters)
    }
  },

  getRelics: () => Object.values(state.relicsById),
  setRelics: (x) => {
    let relicsById = {}
    for (let relic of x) {
      relicsById[relic.id] = relic 
    }
    state.relicsById = relicsById
  },
  getRelicById: (id) => {
    return state.relicsById[id]
  },
  setRelicById: (relic) => {
    if (!relic.id) return console.warn('No matching relic', relic)
    state.relicsById[relic.id] = relic
  },
  deleteRelicById: (id) => {
    if (!id) return console.warn('No id')
    delete state.relicsById[id]
  },
  refreshRelics: () => {
    if (window.setRelicRows == undefined) return
    setRelicRows(Object.values(state.relicsById))
  },

  getState: () => state,
  setState: (x) => {
    console.log('Set state', x)
    for (let relic of x.relics) {
      RelicAugmenter.augment(relic)
    }
    DB.setCharacters(x.characters)
    DB.setRelics(x.relics)
    assignRanks()
    DB.refreshCharacters()
    DB.refreshRelics()
  },
  resetState: () => {
    DB.setState({
      relics: [],
      characters: []
    })
    SaveState.save()
  },
}

export default DB;

function assignRanks() {
  for (let i = 0; i < state.characters.length; i++) {
    state.characters[i].rank = i
  }

  OptimizerTabController.updateFilters();
}