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
import {Constants} from './constants';
import {getDefaultForm} from './defaultForm';

// TODO clean up
let hashes = [
  '#scorer',
  '#getting-started',
  '#beta'
]

// React usage
// let characterTabBlur = store(s => s.characterTabBlur);
// let setCharacterTabBlur = store(s => s.setCharacterTabBlur);

// Nonreactive usage
// store.getState().setRelicsById(relicsById)

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

  permutationDetails: {
    Head: 0,
    Hands: 0,
    Body: 0,
    Feet: 0,
    PlanarSphere: 0,
    LinkRope: 0,
    HeadTotal: 0,
    HandsTotal: 0,
    BodyTotal: 0,
    FeetTotal: 0,
    PlanarSphereTotal: 0,
    LinkRopeTotal: 0,
  },
  setPermutationDetails: (x) => set(() => ({ permutationDetails: x })),

  permutations: 0,
  setPermutations: (x) => set(() => ({ permutations: x })),

  permutationsSearched: 0,
  setPermutationsSearched: (x) => set(() => ({ permutationsSearched: x })),

  permutationsResults: 0,
  setPermutationsResults: (x) => set(() => ({ permutationsResults: x })),

  statDisplay: 'base',
  setStatDisplay: (x) => set(() => ({ statDisplay: x })),

  activeKey: hashes.includes(window.location.hash) ? window.location.hash : 'optimizer',
  setActiveKey: (x) => set(() => ({ activeKey: x })),

  scorerId: undefined,
  setScorerId: (x) => set(() => ({ scorerId: x })),

  scoringMetadataOverrides: {},
  setScoringMetadataOverrides: (x) => set(() => ({ scoringMetadataOverrides: x })),

  conditionalSetEffectsDrawerOpen: false,
  setConditionalSetEffectsDrawerOpen: (x) => set(() => ({ conditionalSetEffectsDrawerOpen: x })),

  selectedScoringCharacter: undefined,
  setSelectedScoringCharacter: (x) => set(() => ({ selectedScoringCharacter: x })),

  relicTabFilters: {
    set: [],
    part: [],
    enhance: [],
    mainStats: [],
    subStats: [],
  },
  setRelicTabFilters: (x) => set(() => ({ relicTabFilters: x })),
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

  getRelics: () => Object.values(store.getState().relicsById),
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

  // Mostly for debugging
  getState: () => store.getState(),

  getScoringMetadata: (id) => {
    let defaultScoringMetadata = DB.getMetadata().characters[id].scoringMetadata
    let scoringMetadataOverrides = store.getState().scoringMetadataOverrides[id]

    return scoringMetadataOverrides || defaultScoringMetadata
  },
  updateCharacterScoreOverrides: (id, updated) => {
    let overrides = store.getState().scoringMetadataOverrides
    overrides[id] = updated
    store.getState().setScoringMetadataOverrides(overrides)
  },

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
      if (char && !char.equipped[relic.part]) {
        char.equipped[relic.part] = relic.id
      } else {
        relic.equippedBy = undefined
      }
    }

    store.getState().setScorerId(x.scorerId)
    store.getState().setScoringMetadataOverrides(x.scoringMetadataOverrides || {})

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
      found.form = {
        ...found.form,
        ...form
      }
      DB.setCharacters(characters)
    } else {
      const defaultForm = getDefaultForm({ id: form.characterId })

      DB.addCharacter({
        id: form.characterId,
        form: {...defaultForm, ...form},
        equipped: {}
      })
    }

    console.log('Updated db characters', characters)
    characterGrid.current.api.updateGridOptions({ rowData: characters })
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

  // These relics are missing speed decimals from OCR importer
  // We overwrite any existing relics with imported ones
  mergeRelicsWithState: (newRelics, newCharacters) => {
    let oldRelics = DB.getRelics()
    newRelics = Utils.clone(newRelics)
    newCharacters = Utils.clone(newCharacters)

    console.log('Merging relics', newRelics, newCharacters)

    // Add new characters
    if (newCharacters) {
      for (const character of newCharacters) {
        DB.addFromForm(character)
      }
    }

    let characters = DB.getCharacters()

    // Generate a hash of existing relics for easy lookup
    let oldRelicHashes = {}
    for (let oldRelic of oldRelics) {
      let hash = hashRelic(oldRelic)
      oldRelicHashes[hash] = oldRelic;
    }

    let replacementRelics = []
    for (let newRelic of newRelics) {
      let hash = hashRelic(newRelic)

      // Compare new relic hashes to old relic hashes
      let found = oldRelicHashes[hash]
      let stableRelicId
      if (found) {
        if (newRelic.equippedBy && newCharacters) {
          // Update the owner of the existing relic with the newly imported owner
          found.equippedBy = newRelic.equippedBy
          newRelic = found
        }

        // Save the old relic because it may already be scorer-verified, delete the hash to prevent duplicates
        replacementRelics.push(found)
        stableRelicId = found.id
        delete oldRelicHashes[hash]
      } else {
        // No match found - save the new relic
        stableRelicId = newRelic.id
        replacementRelics.push(newRelic)
      }

      // Update the character's equipped inventory
      if (newRelic.equippedBy && newCharacters) {
        let character = characters.find(x => x.id == newRelic.equippedBy)
        if (character) {
          character.equipped[newRelic.part] = stableRelicId
        } else {
          console.error('No character to equip relic to', newRelic)
        }
      }
    }

    console.log('Replacement relics', replacementRelics)

    DB.setRelics(replacementRelics);

    // Clean up any deleted relic ids that are still equipped
    for (let character of characters) {
      for (let part of Object.values(Constants.Parts)) {
        if (character.equipped && character.equipped[part] && !DB.getRelicById(character.equipped[part])) {
          character.equipped[part] = undefined
        }
      }
    }

    // Clean up relics that are double equipped
    for (let relic of DB.getRelics()) {
      if (!relic.equippedBy) continue

      let character = DB.getCharacterById(relic.equippedBy)
      if (!character || character.equipped[relic.part] != relic.id) {
        relic.equippedBy = undefined
      }
    }

    DB.setRelics(replacementRelics)
    DB.setCharacters(characters)

    global.relicsGrid.current.api.updateGridOptions({ rowData: replacementRelics })

    characterGrid.current.api.redrawRows()

    // TODO this probably shouldn't be in this file
    let fieldValues = OptimizerTabController.getForm()
    onOptimizerFormValuesChange({}, fieldValues);
  },

  // These relics have accurate speed values from relic scorer import
  // We keep the existing set of relics and only overwrite ones that match the ones that match an imported one
  mergeVerifiedRelicsWithState: (newRelics) => {
    let oldRelics = Utils.clone(DB.getRelics())
    newRelics = Utils.clone(newRelics)

    // part set grade mainstat substatStats
    let oldRelicPartialHashes = {}
    for (let oldRelic of oldRelics) {
      let hash = partialHashRelic(oldRelic)
      if (!oldRelicPartialHashes[hash]) oldRelicPartialHashes[hash] = []
      oldRelicPartialHashes[hash].push(oldRelic);
    }

    // Tracking these for debug / logging
    let updatedOldRelics = []
    let addedNewRelics = []

    for (let newRelic of newRelics) {
      newRelic.equippedBy = undefined
      let partialHash = partialHashRelic(newRelic)
      let partialMatches = oldRelicPartialHashes[partialHash] || []

      let match
      for (let partialMatch of partialMatches) {
        if (newRelic.enhance < partialMatch.enhance) continue
        if (newRelic.substats.length < partialMatch.substats.length) continue

        let exit = false
        let upgrades = 0
        for (let i = 0; i < partialMatch.substats.length; i++) {
          let matchSubstat = partialMatch.substats[i]
          let newSubstat = newRelic.substats[i]

          // Different substats mean different relics - break
          if (matchSubstat.type != newSubstat.type) { exit = true; break }
          if (compareSameTypeSubstat(matchSubstat, newSubstat) == -1) { exit = true; break }

          // Track if the number of stat increases make sense
          if (compareSameTypeSubstat(matchSubstat, newSubstat) == 1) {
            upgrades++
          }
        }

        if (exit) continue

        let possibleUpgrades = Math.round((Math.floor(newRelic.enhance/3)*3 - Math.floor(partialMatch.enhance/3)*3)/3) // + (newRelic.substats.length > partialMatch.substats.length ? 1 : 0)
        if (upgrades > possibleUpgrades) continue

        // If it passes all the tests, keep it
        match = partialMatch
        break
      }

      if (match) {
        match.substats = newRelic.substats
        match.main = newRelic.main
        match.enhance = newRelic.enhance
        match.verified = true

        updatedOldRelics.push(match)
      } else {
        oldRelics.push(newRelic)
        newRelic.verified = true

        addedNewRelics.push(newRelic)
      }
    }

    console.warn('addedNewRelics', addedNewRelics)
    console.warn('updatedOldRelics', updatedOldRelics)

    oldRelics.map(x => RelicAugmenter.augment(x))
    DB.setRelics(oldRelics)
    DB.refreshRelics()
    characterGrid.current.api.redrawRows()

    if (updatedOldRelics.length) Message.success(`Updated stats for ${updatedOldRelics.length} existing relics`, 8)
    if (addedNewRelics.length) Message.success(`Added ${addedNewRelics.length} new relics`, 8)

    // TODO this probably shouldn't be in this file
    let fieldValues = OptimizerTabController.getForm()
    onOptimizerFormValuesChange({}, fieldValues);
  },
}

export default DB;

function assignRanks(characters) {
  for (let i = 0; i < characters.length; i++) {
    characters[i].rank = i
  }

  return characters;
}

function hashRelic(relic) {
  let substatValues = []
  let substatStats = []

  for (let substat of relic.substats) {
    if (substat.type == Constants.Stats.SPD) {
      // Speed values we floor to an int
      substatValues.push(Math.floor(substat.value))
    } else {
      // Other values we match to 1 decimal point due to OCR
      substatValues.push(Utils.precisionRound(Utils.truncate10ths(substat.value)))
    }
    substatStats.push(substat.type)
  }
  let hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    enhance: relic.enhance,
    mainstat: relic.main.stat,
    mainvalue: Math.floor(relic.main.value),
    substatValues: substatValues, // Match to 1 decimal point
    substatStats: substatStats,
  }
  let hash = objectHash(hashObject)
  return hash
}

// -1: old > new, 0: old == new, 1, new > old
function compareSameTypeSubstat(oldSubstat, newSubstat) {
  let oldValue
  let newValue
  if (Utils.isFlat(oldSubstat.stat)) {
    // Flat atk/def/hp/spd values we floor to an int
    oldValue = Math.floor(oldSubstat.value)
    newValue = Math.floor(newSubstat.value)
  } else {
    // Other values we match to 1 decimal point due to OCR
    oldValue = Utils.precisionRound(Utils.truncate10ths(oldSubstat.value))
    newValue = Utils.precisionRound(Utils.truncate10ths(newSubstat.value))
  }

  if (oldValue == newValue) return 0
  if (oldValue < newValue) return 1
  return -1
}

function partialHashRelic(relic) {
  let baseSubstatCount = relic.grade == 5 ? 3 : 2

  let hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    mainstat: relic.main.stat,
    substatStats: relic.substats.slice(0, baseSubstatCount).map(x => x.stat)
  }

  let hash = objectHash(hashObject)
  return hash
}