import { create } from 'zustand'
import objectHash from 'object-hash'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { Constants, DEFAULT_STAT_DISPLAY, RelicSetFilterOptions } from 'lib/constants.ts'
import { getDefaultForm } from 'lib/defaultForm'
import { Utils } from 'lib/utils'
import { SaveState } from 'lib/saveState'
import { Message } from 'lib/message'
import { OptimizerMenuIds } from 'components/optimizerTab/FormRow'

const state = {
  relics: [],
  characters: [],
  metadata: {}, // generated, not saved
  relicsById: {},
  globals: {},
  scorerId: undefined,
}

// This string is replaced by /dreary-quibbles by github actions, don't change
const BASE_PATH = '/hsr-optimizer'

export const AppPages = {
  OPTIMIZER: 'OPTIMIZER',
  CHARACTERS: 'CHARACTERS',
  RELICS: 'RELICS',
  IMPORT: 'IMPORT',

  GETTING_STARTED: 'GETTING_STARTED',
  CHANGELOG: 'CHANGELOG',
  RELIC_SCORER: 'RELIC_SCORER',
}

export const PageToRoute = {
  [AppPages.OPTIMIZER]: BASE_PATH,

  [AppPages.RELIC_SCORER]: BASE_PATH + '#scorer',
  [AppPages.CHANGELOG]: BASE_PATH + '#changelog',
  [AppPages.GETTING_STARTED]: BASE_PATH + '#getting-started',
}

export const RouteToPage = {
  [PageToRoute[AppPages.OPTIMIZER]]: AppPages.OPTIMIZER,
  [PageToRoute[AppPages.RELIC_SCORER]]: AppPages.RELIC_SCORER,
  [PageToRoute[AppPages.CHANGELOG]]: AppPages.CHANGELOG,
  [PageToRoute[AppPages.GETTING_STARTED]]: AppPages.GETTING_STARTED,
}

/*
 * React usage
 * let characterTabBlur = store(s => s.characterTabBlur);
 * let setCharacterTabBlur = store(s => s.setCharacterTabBlur);
 */

/*
 * Nonreactive usage
 * store.getState().setRelicsById(relicsById)
 */

window.store = create((set) => ({
  optimizerGrid: undefined,

  optimizerTabFocusCharacter: undefined,
  characterTabFocusCharacter: undefined,
  scoringAlgorithmFocusCharacter: undefined,

  activeKey: RouteToPage[window.location.pathname] ? RouteToPage[window.location.pathname + window.location.hash] : AppPages.OPTIMIZER,
  characters: [],
  charactersById: {},
  characterTabBlur: false,
  conditionalSetEffectsDrawerOpen: false,
  permutations: 0,
  permutationsResults: 0,
  permutationsSearched: 0,
  relicsById: {},
  scorerId: undefined,
  scoringMetadataOverrides: {},
  statDisplay: DEFAULT_STAT_DISPLAY,
  optimizationInProgress: false,
  optimizationId: undefined,
  teammateCount: 0,

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

  relicTabFilters: {
    set: [],
    part: [],
    enhance: [],
    mainStats: [],
    subStats: [],
    grade: [],
    verified: [],
  },

  optimizerMenuState: {
    [OptimizerMenuIds.characterOptions]: true,
    [OptimizerMenuIds.relicAndStatFilters]: true,
    [OptimizerMenuIds.teammates]: true,
  },

  setActiveKey: (x) => set(() => ({ activeKey: x })),
  setCharacters: (x) => set(() => ({ characters: x })),
  setCharactersById: (x) => set(() => ({ charactersById: x })),
  setCharacterTabBlur: (x) => set(() => ({ characterTabBlur: x })),
  setConditionalSetEffectsDrawerOpen: (x) => set(() => ({ conditionalSetEffectsDrawerOpen: x })),
  setFilteredRelics: (relics) => set(() => ({ filteredRelics: relics })),
  setOptimizerTabFocusCharacter: (characterId) => set(() => ({ optimizerTabFocusCharacter: characterId })),
  setCharacterTabFocusCharacter: (characterId) => set(() => ({ characterTabFocusCharacter: characterId })),
  setScoringAlgorithmFocusCharacter: (characterId) => set(() => ({ scoringAlgorithmFocusCharacter: characterId })),
  setPermutationDetails: (x) => set(() => ({ permutationDetails: x })),
  setPermutations: (x) => set(() => ({ permutations: x })),
  setPermutationsResults: (x) => set(() => ({ permutationsResults: x })),
  setPermutationsSearched: (x) => set(() => ({ permutationsSearched: x })),
  setRelicsById: (x) => set(() => ({ relicsById: x })),
  setRelicTabFilters: (x) => set(() => ({ relicTabFilters: x })),
  setScorerId: (x) => set(() => ({ scorerId: x })),
  setScoringMetadataOverrides: (x) => set(() => ({ scoringMetadataOverrides: x })),
  setStatDisplay: (x) => set(() => ({ statDisplay: x })),
  setOptimizerMenuState: (x) => set(() => ({ optimizerMenuState: x })),
  setOptimizationInProgress: (x) => set(() => ({ optimizationInProgress: x })),
  setOptimizationId: (x) => set(() => ({ optimizationId: x })),
  setTeammateCount: (x) => set(() => ({ teammateCount: x })),
}))

export const DB = {
  getGlobals: () => state.globals,

  getMetadata: () => state.metadata,
  setMetadata: (x) => state.metadata = x,

  getCharacters: () => window.store.getState().characters,
  getCharacterById: (id) => window.store.getState().charactersById[id],

  setCharacters: (x) => {
    let charactersById = {}
    for (let character of x) {
      charactersById[character.id] = character
    }

    assignRanks(x)
    const newCharacterArray = [...x]
    window.store.getState().setCharacters(newCharacterArray)
    window.store.getState().setCharactersById(charactersById)
  },
  setCharacter: (x) => {
    let charactersById = window.store.getState().charactersById
    charactersById[x.id] = x

    window.store.getState().setCharactersById(charactersById)
  },
  addCharacter: (x) => {
    let characters = DB.getCharacters()
    characters.push(x)
    DB.setCharacters(characters)
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
      window.setCharacterRows(DB.getCharacters())
    }
  },

  getRelics: () => Object.values(window.store.getState().relicsById),
  getRelicsById: () => window.store.getState().relicsById,
  setRelics: (x) => {
    let relicsById = {}
    for (let relic of x) {
      relicsById[relic.id] = relic
    }
    window.store.getState().setRelicsById(relicsById)
  },
  getRelicById: (id) => window.store.getState().relicsById[id],
  setRelic: (relic) => {
    if (!relic.id) return console.warn('No matching relic', relic)
    let relicsById = window.store.getState().relicsById
    relicsById[relic.id] = relic
    window.store.getState().setRelicsById(relicsById)
  },

  refreshRelics: () => {
    if (window.setRelicRows) window.setRelicRows(DB.getRelics())
  },

  // Mostly for debugging
  getState: () => window.store.getState(),

  getScoringMetadata: (id) => {
    let defaultScoringMetadata = DB.getMetadata().characters[id].scoringMetadata
    let scoringMetadataOverrides = window.store.getState().scoringMetadataOverrides[id]

    return scoringMetadataOverrides || defaultScoringMetadata
  },
  updateCharacterScoreOverrides: (id, updated) => {
    let overrides = window.store.getState().scoringMetadataOverrides
    overrides[id] = updated
    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.save()
  },

  setStore: (x) => {
    let charactersById = {}
    const dbCharacters = DB.getMetadata().characters
    const dbLightCones = DB.getMetadata().lightCones
    for (let character of x.characters) {
      character.equipped = {}
      charactersById[character.id] = character

      // Previously the relic sets were different than what they are now, delete the deprecated options for users with old save files
      let relicSetsOptions = character.form.relicSets || []
      for (let i = relicSetsOptions.length - 1; i >= 0; i--) {
        if (!relicSetsOptions[i] || !Object.values(RelicSetFilterOptions).includes(relicSetsOptions[i][0])) {
          character.form.relicSets.splice(i, 1)
        }
      }

      // Unset light cone fields for mismatched light cone path
      const dbLightCone = dbLightCones[character.form?.lightCone] || {}
      const dbCharacter = dbCharacters[character.id]
      if (dbLightCone.path != dbCharacter.path) {
        character.form.lightCone = undefined
        character.form.lightConeLevel = 80
        character.form.lightConeSuperimposition = 1
        character.form.lightConeConditionals = {}
      }
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

    window.store.getState().setScorerId(x.scorerId)
    window.store.getState().setScoringMetadataOverrides(x.scoringMetadataOverrides || {})
    if (x.optimizerMenuState) {
      const menuState = window.store.getState().optimizerMenuState
      for (let key of Object.values(OptimizerMenuIds)) {
        if (x.optimizerMenuState[key] != null) {
          menuState[key] = x.optimizerMenuState[key]
        }
      }
      window.store.getState().setOptimizerMenuState(menuState)
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
      characters: [],
    })
  },

  addFromForm: (form) => {
    let characters = DB.getCharacters()
    let found = DB.getCharacterById(form.characterId)
    if (found) {
      found.form = {
        ...found.form,
        ...form,
      }
      DB.setCharacters(characters)
    } else {
      const defaultForm = getDefaultForm({ id: form.characterId })
      found = {
        id: form.characterId,
        form: { ...defaultForm, ...form },
        equipped: {},
      }
      DB.addCharacter(found)
    }

    console.log('Updated db characters', characters)

    /*
     * TODO: after render optimization, window.characterGrid is possibly undefined
     * Since the grid resets the rows, we have to re-select the grid node and inform the character tab
     */
    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.updateGridOptions({ rowData: characters })
      window.characterGrid.current.api.forEachNode((node) => node.data.id == found.id ? node.setSelected(true) : 0)
      window.store.getState().setCharacterTabFocusCharacter(found.id)
    }

    return found
  },

  saveCharacterBuild: (name, characterId, score) => {
    let character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }

    let build = character.builds?.find((x) => x.name == name)
    if (build) {
      const errorMessage = `Build name [${name}] already exists`
      console.warn(errorMessage)
      return { error: errorMessage }
    } else {
      if (!character.builds) character.builds = []
      character.builds.push({
        name: name,
        build: [...Object.values(character.equipped)],
        score: score,
      })
      DB.setCharacter(character)
      console.log('Saved build', DB.getState())
    }
  },

  deleteCharacterBuild: (characterId, name) => {
    let character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to delete build for')

    character.builds = character.builds.filter((x) => x.name != name)
    DB.setCharacter(character)
  },

  clearCharacterBuilds: (characterId) => {
    let character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to clear builds for')

    character.builds = []
    DB.setCharacter(character)
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
    characters = characters.filter((x) => x.id != characterId)
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

    let prevOwnerId = relic.equippedBy
    let character = DB.getCharacters().find((x) => x.id == characterId)
    let prevCharacter = DB.getCharacters().find((x) => x.id == prevOwnerId)
    let prevRelic = DB.getRelicById(character.equipped[relic.part])

    if (prevRelic) {
      DB.unequipRelicById(prevRelic.id)
    }

    if (prevRelic && prevCharacter) {
      prevCharacter.equipped[relic.part] = prevRelic.id
      prevRelic.equippedBy = prevCharacter.id
      DB.setCharacter(prevCharacter)
      DB.setRelic(prevRelic)
    } else if (prevCharacter) {
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
    let relicsById = window.store.getState().relicsById
    delete relicsById[id]
    window.store.getState().setRelicsById(relicsById)

    // This refreshes the grid for the character equipped relics color coding
    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.redrawRows()
    }
  },

  /*
   * These relics are missing speed decimals from OCR importer
   * We overwrite any existing relics with imported ones
   */
  mergeRelicsWithState: (newRelics, newCharacters) => {
    let oldRelics = DB.getRelics()
    newRelics = Utils.clone(newRelics) || []
    newCharacters = Utils.clone(newCharacters) || []

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
      oldRelicHashes[hash] = oldRelic
    }

    let replacementRelics = []
    // In case the user tries to import a characters only file, we do this
    if (newRelics.length == 0) {
      replacementRelics = oldRelics
    }
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

        // Save the old relic because it may have edited speed values, delete the hash to prevent duplicates
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
        let character = characters.find((x) => x.id == newRelic.equippedBy)
        if (character) {
          character.equipped[newRelic.part] = stableRelicId
        } else {
          console.log('No character to equip relic to', newRelic)
        }
      }
    }

    console.log('Replacement relics', replacementRelics)

    DB.setRelics(replacementRelics)

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

    // only valid when on relics tab
    if (window.relicsGrid?.current?.api) {
      window.relicsGrid.current.api.updateGridOptions({ rowData: replacementRelics })
    }

    // only valid when on character tab
    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.redrawRows()
    }

    // TODO this probably shouldn't be in this file
    let fieldValues = OptimizerTabController.getForm()
    window.onOptimizerFormValuesChange({}, fieldValues)
  },

  /*
   * These relics have accurate speed values from relic scorer import
   * We keep the existing set of relics and only overwrite ones that match the ones that match an imported one
   */
  mergeVerifiedRelicsWithState: (newRelics) => {
    let oldRelics = Utils.clone(DB.getRelics()) || []
    newRelics = Utils.clone(newRelics) || []

    // part set grade mainstat substatStats
    let oldRelicPartialHashes = {}
    for (let oldRelic of oldRelics) {
      let hash = partialHashRelic(oldRelic)
      if (!oldRelicPartialHashes[hash]) oldRelicPartialHashes[hash] = []
      oldRelicPartialHashes[hash].push(oldRelic)
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
          if (matchSubstat.stat != newSubstat.stat) { exit = true; break }
          if (compareSameTypeSubstat(matchSubstat, newSubstat) == -1) { exit = true; break }

          // Track if the number of stat increases make sense
          if (compareSameTypeSubstat(matchSubstat, newSubstat) == 1) {
            upgrades++
          }
        }

        if (exit) continue

        let possibleUpgrades = Math.round((Math.floor(newRelic.enhance / 3) * 3 - Math.floor(partialMatch.enhance / 3) * 3) / 3) // + (newRelic.substats.length > partialMatch.substats.length ? 1 : 0)
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

    oldRelics.map((x) => RelicAugmenter.augment(x))
    DB.setRelics(oldRelics)
    DB.refreshRelics()

    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.redrawRows()
    }

    if (updatedOldRelics.length) Message.success(`Updated stats for ${updatedOldRelics.length} existing relics`, 8)
    if (addedNewRelics.length) Message.success(`Added ${addedNewRelics.length} new relics`, 8)
  },
}

export default DB

function assignRanks(characters) {
  for (let i = 0; i < characters.length; i++) {
    characters[i].rank = i
  }

  // This sets the rank for the current optimizer character because shuffling ranks will desync the Priority filter selector
  const optimizerMatchingCharacter = DB.getCharacterById(window.store.getState().optimizerTabFocusCharacter)
  if (optimizerMatchingCharacter) {
    window.optimizerForm.setFieldValue('rank', optimizerMatchingCharacter.rank)
  }

  return characters
}

function hashRelic(relic) {
  let substatValues = []
  let substatStats = []

  for (let substat of relic.substats) {
    if (Utils.isFlat(substat.stat)) {
      // Flat atk/def/hp/spd values we floor to an int
      substatValues.push(Math.floor(substat.value))
    } else {
      // Other values we match to 1 decimal point due to OCR
      substatValues.push(Utils.precisionRound(Utils.truncate10ths(substat.value)))
    }
    substatStats.push(substat.stat)
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
  return objectHash(hashObject)
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
    substatStats: relic.substats.slice(0, baseSubstatCount).map((x) => x.stat),
  }

  return objectHash(hashObject)
}
