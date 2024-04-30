import { create } from 'zustand'
import objectHash from 'object-hash'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { Constants, DEFAULT_STAT_DISPLAY, RelicSetFilterOptions } from 'lib/constants.ts'
import { SavedSessionKeys } from 'lib/constantsSession'
import { getDefaultForm } from 'lib/defaultForm'
import { Utils } from 'lib/utils'
import { SaveState } from 'lib/saveState'
import { Message } from 'lib/message'
import { OptimizerMenuIds } from 'components/optimizerTab/FormRow.tsx'
import { Themes } from 'lib/theme'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'

const state = {
  relics: [],
  characters: [],
  metadata: {}, // generated, not saved
  relicsById: {},
  globals: {},
  scorerId: undefined,
}

// This string is replaced by /dreary-quibbles by github actions, don't change
export const BASE_PATH = '/hsr-optimizer'

export const AppPages = {
  OPTIMIZER: 'OPTIMIZER',
  CHARACTERS: 'CHARACTERS',
  RELICS: 'RELICS',
  IMPORT: 'IMPORT',

  GETTING_STARTED: 'GETTING_STARTED',
  CHANGELOG: 'CHANGELOG',
  SETTINGS: 'SETTINGS',
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

// React usage
// let characterTabBlur = store(s => s.characterTabBlur);
// let setCharacterTabBlur = store(s => s.setCharacterTabBlur);

// Nonreactive usage
// store.getState().setRelicsById(relicsById)

window.store = create((set) => ({
  colorTheme: Themes.BLUE,

  optimizerGrid: undefined,

  optimizerTabFocusCharacter: undefined,
  characterTabFocusCharacter: undefined,
  scoringAlgorithmFocusCharacter: undefined,

  activeKey: RouteToPage[Utils.stripTrailingSlashes(window.location.pathname)] ? RouteToPage[Utils.stripTrailingSlashes(window.location.pathname) + window.location.hash] : AppPages.OPTIMIZER,
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
  statSimulationDisplay: StatSimTypes.Disabled,
  statSimulations: [],
  selectedStatSimulations: [],
  optimizationInProgress: false,
  optimizationId: undefined,
  teammateCount: 0,
  zeroPermutationModalOpen: false,
  menuSidebarOpen: true,
  relicScorerSidebarOpen: true,

  optimizerFormCharacterEidolon: 0,
  optimizerFormSelectedLightCone: null,
  optimizerFormSelectedLightConeSuperimposition: 1,

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
  excludedRelicPotentialCharacters: [],

  optimizerMenuState: {
    [OptimizerMenuIds.characterOptions]: true,
    [OptimizerMenuIds.relicAndStatFilters]: true,
    [OptimizerMenuIds.teammates]: true,
    [OptimizerMenuIds.characterStatsSimulation]: true,
  },

  savedSession: {
    [SavedSessionKeys.optimizerCharacterId]: null,
    [SavedSessionKeys.relicScorerSidebarOpen]: true,
  },

  setActiveKey: (x) => set(() => ({ activeKey: x })),
  setCharacters: (x) => set(() => ({ characters: x })),
  setCharactersById: (x) => set(() => ({ charactersById: x })),
  setCharacterTabBlur: (x) => set(() => ({ characterTabBlur: x })),
  setConditionalSetEffectsDrawerOpen: (x) => set(() => ({ conditionalSetEffectsDrawerOpen: x })),
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
  setStatSimulationDisplay: (x) => set(() => ({ statSimulationDisplay: x })),
  setStatSimulations: (x) => set(() => ({ statSimulations: x })),
  setSelectedStatSimulations: (x) => set(() => ({ selectedStatSimulations: x })),
  setOptimizerMenuState: (x) => set(() => ({ optimizerMenuState: x })),
  setOptimizationInProgress: (x) => set(() => ({ optimizationInProgress: x })),
  setOptimizationId: (x) => set(() => ({ optimizationId: x })),
  setTeammateCount: (x) => set(() => ({ teammateCount: x })),
  setOptimizerFormCharacterEidolon: (x) => set(() => ({ optimizerFormCharacterEidolon: x })),
  setOptimizerFormSelectedLightCone: (x) => set(() => ({ optimizerFormSelectedLightCone: x })),
  setOptimizerFormSelectedLightConeSuperimposition: (x) => set(() => ({ optimizerFormSelectedLightConeSuperimposition: x })),
  setZeroPermutationsModalOpen: (x) => set(() => ({ zeroPermutationModalOpen: x })),
  setExcludedRelicPotentialCharacters: (x) => set(() => ({ excludedRelicPotentialCharacters: x })),
  setMenuSidebarOpen: (x) => set(() => ({ menuSidebarOpen: x })),
  setSavedSession: (x) => set(() => ({ savedSession: x })),
  setSavedSessionKey: (key, x) => set((state) => ({
    savedSession: { ...state.savedSession, [key]: x },
  })),
  setColorTheme: (x) => set(() => ({ colorTheme: x })),
}))

export const DB = {
  getGlobals: () => state.globals,

  getMetadata: () => state.metadata,
  setMetadata: (x) => state.metadata = x,

  getCharacters: () => window.store.getState().characters,
  getCharacterById: (id) => window.store.getState().charactersById[id],

  setCharacters: (x) => {
    const charactersById = {}
    for (const character of x) {
      charactersById[character.id] = character
    }

    assignRanks(x)
    const newCharacterArray = [...x]
    window.store.getState().setCharacters(newCharacterArray)
    window.store.getState().setCharactersById(charactersById)
  },
  setCharacter: (x) => {
    const charactersById = window.store.getState().charactersById
    charactersById[x.id] = x

    window.store.getState().setCharactersById(charactersById)
  },
  addCharacter: (x) => {
    const characters = DB.getCharacters()
    characters.push(x)
    DB.setCharacters(characters)
  },
  insertCharacter: (id, index) => {
    console.log('insert', id, index)
    const characters = DB.getCharacters()
    if (index < 0) {
      index = characters.length
    }
    const matchingCharacter = DB.getCharacterById(id)
    if (!matchingCharacter) return console.warn('No matching character to insert', id, index)
    const removed = characters.splice(matchingCharacter.rank, 1)
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
    const relicsById = {}
    for (const relic of x) {
      relicsById[relic.id] = relic
    }
    window.store.getState().setRelicsById(relicsById)
  },
  getRelicById: (id) => window.store.getState().relicsById[id],

  /**
   * Sets the given relic in the application's database and handles relic equipping logic.
   *
   * Adds the relic if it does not already exist.
   * Equips the relic to its owner.
   *
   * If the specified relic has been edited, saves the changes.
   * If the owner has changed, equips the relic to its new owner.
   * In addition, if the part has changed, equips the relic correctly to the new part.
   * Note: If the owner is already holding a relic on the new part, said relic is unequipped.
   *
   * @param {Object} relic - The relic object to set.
   * @returns {void}
   */
  setRelic: (relic) => {
    if (!relic.id) return console.warn('No matching relic', relic)
    const oldRelic = DB.getRelicById(relic.id)
    const addRelic = !oldRelic

    if (addRelic) {
      setRelic(relic)
      if (relic.equippedBy) {
        DB.equipRelic(relic, relic.equippedBy)
      }
    } else {
      const partChanged = oldRelic.part !== relic.part
      if (partChanged || !relic.equippedBy) {
        DB.unequipRelicById(relic.id)
        setRelic(relic)
      }
      const relicIsNotEquippedByRelicOwner = relic.equippedBy
        && DB.getCharacterById(relic.equippedBy)?.equipped[relic.part] !== relic.id
      if (relicIsNotEquippedByRelicOwner) {
        DB.equipRelic(relic, relic.equippedBy)
      }
      setRelic(relic)
    }
  },

  refreshRelics: () => {
    if (window.setRelicRows) window.setRelicRows(DB.getRelics())
  },

  // Mostly for debugging
  getState: () => window.store.getState(),

  getScoringMetadata: (id) => {
    const defaultScoringMetadata = DB.getMetadata().characters[id].scoringMetadata
    const scoringMetadataOverrides = window.store.getState().scoringMetadataOverrides[id]
    const returnScoringMetadata = scoringMetadataOverrides || defaultScoringMetadata

    for (const key of Object.keys(returnScoringMetadata.stats)) {
      if (returnScoringMetadata.stats[key] == null) {
        returnScoringMetadata.stats[key] = 0
      }
    }

    return returnScoringMetadata
  },
  updateCharacterScoreOverrides: (id, updated) => {
    const overrides = window.store.getState().scoringMetadataOverrides
    overrides[id] = updated
    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.save()
  },

  setStore: (x) => {
    const charactersById = {}
    const dbCharacters = DB.getMetadata().characters
    const dbLightCones = DB.getMetadata().lightCones
    for (const character of x.characters) {
      character.equipped = {}
      charactersById[character.id] = character

      // Previously characters had customizable options, now we're defaulting to 80s
      character.form.characterLevel = 80
      character.form.lightConeLevel = 80

      // Previously the relic sets were different from what they are now, delete the deprecated options for users with old save files
      const relicSetsOptions = character.form.relicSets || []
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

      // Deduplicate main stat filter values
      for (const part of Object.keys(Constants.Parts)) {
        character.form['main' + part] = deduplicateArray(character.form['main' + part])
      }
    }

    for (const character of Object.values(dbCharacters)) {
      // Deduplicate scoring optimal main stat
      for (const part of Object.keys(Constants.Parts)) {
        character.scoringMetadata.parts[part] = deduplicateArray(character.scoringMetadata.parts[part])
      }
    }

    for (const relic of x.relics) {
      RelicAugmenter.augment(relic)
      const char = charactersById[relic.equippedBy]
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
      for (const key of Object.values(OptimizerMenuIds)) {
        if (x.optimizerMenuState[key] != null) {
          menuState[key] = x.optimizerMenuState[key]
        }
      }
      window.store.getState().setOptimizerMenuState(menuState)
    }

    if (x.savedSession) {
      window.store.getState().setSavedSession(x.savedSession)
    }

    window.store.getState().setExcludedRelicPotentialCharacters(x.excludedRelicPotentialCharacters || [])

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
    const characters = DB.getCharacters()
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

    SaveState.save()

    return found
  },

  saveCharacterPortrait: (characterId, portrait) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }
    character.portrait = portrait
    DB.setCharacter(character)
    console.log('Saved portrait', DB.getState())
  },

  deleteCharacterPortrait: (characterId) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }
    delete character.portrait
    DB.setCharacter(character)
    console.log('Deleted portrait', DB.getState())
  },

  saveCharacterBuild: (name, characterId, score) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }

    const build = character.builds?.find((x) => x.name == name)
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
    const character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to delete build for')

    character.builds = character.builds.filter((x) => x.name != name)
    DB.setCharacter(character)
  },

  clearCharacterBuilds: (characterId) => {
    const character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to clear builds for')

    character.builds = []
    DB.setCharacter(character)
  },

  unequipCharacter: (id) => {
    const character = DB.getCharacterById(id)
    if (!character) return console.warn('No character to unequip')

    console.log('Unequipping character', id, character)

    for (const part of Object.values(Constants.Parts)) {
      const equippedId = character.equipped[part]
      if (!equippedId) continue

      const relicMatch = DB.getRelicById(equippedId)

      character.equipped[part] = undefined

      if (relicMatch) {
        relicMatch.equippedBy = undefined
        setRelic(relicMatch)
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
    const relic = DB.getRelicById(id)

    console.log('UNEQUIP RELIC')

    const characters = DB.getCharacters()
    for (const character of characters) {
      if (character.equipped && character.equipped[relic.part] && character.equipped[relic.part] == relic.id) {
        character.equipped[relic.part] = undefined
      }
    }
    DB.setCharacters(characters)

    relic.equippedBy = undefined
    setRelic(relic)
  },

  /**
   * Equips the specified relic to the character identified by `characterId`.
   *
   * If the character already has a relic equipped, the relics are swapped.
   *
   * @param {Object} relic - The relic to equip.
   * @param {*} characterId - The ID of the character to equip the relic to.
   * @returns {void}
   */
  equipRelic: (relic, characterId) => {
    if (!relic || !relic.id) return console.warn('No relic')
    if (!characterId) return console.warn('No character')
    relic = DB.getRelicById(relic.id)

    const prevOwnerId = relic.equippedBy
    const prevCharacter = DB.getCharacterById(prevOwnerId)
    const character = DB.getCharacterById(characterId)
    const prevRelic = DB.getRelicById(character.equipped[relic.part])

    if (prevRelic) {
      DB.unequipRelicById(prevRelic.id)
    }

    // only re-equip prevRelic if it would go to a different character
    if (prevOwnerId !== characterId && prevCharacter) {
      if (prevRelic) {
        prevCharacter.equipped[relic.part] = prevRelic.id
        prevRelic.equippedBy = prevCharacter.id
        setRelic(prevRelic)
      } else {
        prevCharacter.equipped[relic.part] = undefined
      }
      DB.setCharacter(prevCharacter)
    }

    character.equipped[relic.part] = relic.id
    relic.equippedBy = character.id
    DB.setCharacter(character)
    setRelic(relic)
  },

  equipRelicIdsToCharacter: (relicIds, characterId) => {
    if (!characterId) return console.warn('No characterId to equip to')
    console.log('Equipping relics to character', relicIds, characterId)

    for (const relicId of relicIds) {
      DB.equipRelic({ id: relicId }, characterId)
    }
  },

  switchRelics: (fromCharacterId, toCharacterId) => {
    if (!fromCharacterId) return console.warn('No characterId to equip from')
    if (!toCharacterId) return console.warn('No characterId to equip to')
    console.log(`Switching relics from character ${fromCharacterId} to character ${toCharacterId}`)

    const fromCharacter = DB.getCharacterById(fromCharacterId)
    DB.equipRelicIdsToCharacter(Object.values(fromCharacter.equipped), toCharacterId)
  },

  deleteRelic: (id) => {
    if (!id) return Message.error('Unable to delete relic')
    DB.unequipRelicById(id)
    const relicsById = window.store.getState().relicsById
    delete relicsById[id]
    window.store.getState().setRelicsById(relicsById)

    // This refreshes the grid for the character equipped relics color coding
    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.redrawRows()
    }
  },

  // These relics are missing speed decimals from OCR importer
  // We overwrite any existing relics with imported ones
  mergeRelicsWithState: (newRelics, newCharacters) => {
    const oldRelics = DB.getRelics()
    newRelics = Utils.clone(newRelics) || []
    newCharacters = Utils.clone(newCharacters) || []

    console.log('Merging relics', newRelics, newCharacters)

    // Add new characters
    if (newCharacters) {
      for (const character of newCharacters) {
        DB.addFromForm(character)
      }
    }

    const characters = DB.getCharacters()

    // Generate a hash of existing relics for easy lookup
    const oldRelicHashes = {}
    for (const oldRelic of oldRelics) {
      const hash = hashRelic(oldRelic)
      oldRelicHashes[hash] = oldRelic
    }

    let replacementRelics = []
    // In case the user tries to import a characters only file, we do this
    if (newRelics.length == 0) {
      replacementRelics = oldRelics
    }
    for (let newRelic of newRelics) {
      const hash = hashRelic(newRelic)

      // Compare new relic hashes to old relic hashes
      const found = oldRelicHashes[hash]
      let stableRelicId
      if (found) {
        if (newRelic.verified) {
          // Inherit the new verified speed stats
          found.verified = true
          found.substats = newRelic.substats
          found.augmentedStats = newRelic.augmentedStats
        }

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
        const character = characters.find((x) => x.id == newRelic.equippedBy)
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
    for (const character of characters) {
      for (const part of Object.values(Constants.Parts)) {
        if (character.equipped && character.equipped[part] && !DB.getRelicById(character.equipped[part])) {
          character.equipped[part] = undefined
        }
      }
    }

    // Clean up relics that are double equipped
    for (const relic of DB.getRelics()) {
      if (!relic.equippedBy) continue

      const character = DB.getCharacterById(relic.equippedBy)
      if (!character || character.equipped[relic.part] != relic.id) {
        relic.equippedBy = undefined
      }
    }

    // Clean up characters who have relics equipped by someone else, or characters that dont exist ingame yet
    for (const character of DB.getCharacters()) {
      for (const part of Object.keys(character.equipped)) {
        const relicId = character.equipped[part]
        if (relicId) {
          const relic = DB.getRelicById(relicId)
          if (relic.equippedBy != character.id) {
            character.equipped[part] = undefined
          }
        }
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
    const fieldValues = OptimizerTabController.getForm()
    window.onOptimizerFormValuesChange({}, fieldValues)
    window.refreshRelicsScore()
  },

  /*
   * These relics have accurate speed values from relic scorer import
   * We keep the existing set of relics and only overwrite ones that match the ones that match an imported one
   */
  mergeVerifiedRelicsWithState: (newRelics) => {
    const oldRelics = Utils.clone(DB.getRelics()) || []
    newRelics = Utils.clone(newRelics) || []

    // part set grade mainstat substatStats
    const oldRelicPartialHashes = {}
    for (const oldRelic of oldRelics) {
      const hash = partialHashRelic(oldRelic)
      if (!oldRelicPartialHashes[hash]) oldRelicPartialHashes[hash] = []
      oldRelicPartialHashes[hash].push(oldRelic)
    }

    // Tracking these for debug / messaging
    const updatedOldRelics = []
    const addedNewRelics = []

    for (const newRelic of newRelics) {
      newRelic.equippedBy = undefined
      const partialHash = partialHashRelic(newRelic)
      const partialMatches = oldRelicPartialHashes[partialHash] || []

      let match
      for (const partialMatch of partialMatches) {
        if (newRelic.enhance < partialMatch.enhance) continue
        if (newRelic.substats.length < partialMatch.substats.length) continue

        let exit = false
        let upgrades = 0
        for (let i = 0; i < partialMatch.substats.length; i++) {
          const matchSubstat = partialMatch.substats[i]
          const newSubstat = newRelic.substats.find((x) => x.stat == matchSubstat.stat)

          // Different substats mean different relics - break
          if (!newSubstat) { exit = true; break }
          if (matchSubstat.stat != newSubstat.stat) { exit = true; break }
          if (compareSameTypeSubstat(matchSubstat, newSubstat) == -1) { exit = true; break }

          // Track if the number of stat increases make sense
          if (compareSameTypeSubstat(matchSubstat, newSubstat) == 1) {
            upgrades++
          }
        }

        if (exit) continue

        const possibleUpgrades = Math.round((Math.floor(newRelic.enhance / 3) * 3 - Math.floor(partialMatch.enhance / 3) * 3) / 3)
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
    window.refreshRelicsScore()

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
  const substatValues = []
  const substatStats = []

  for (const substat of relic.substats) {
    if (Utils.isFlat(substat.stat)) {
      // Flat atk/def/hp/spd values we floor to an int
      substatValues.push(Math.floor(substat.value))
    } else {
      // Other values we match to 1 decimal point due to OCR
      substatValues.push(Utils.precisionRound(Utils.truncate10ths(substat.value)))
    }
    substatStats.push(substat.stat)
  }
  const hashObject = {
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
  const hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    mainstat: relic.main.stat,
  }

  return objectHash(hashObject)
}

/**
 * Sets the provided relic in the application's state.
 *
 * @param {Object} relic - The relic object to set.
 */
function setRelic(relic) {
  const relicsById = window.store.getState().relicsById
  relicsById[relic.id] = relic
  window.store.getState().setRelicsById(relicsById)
}

function deduplicateArray(arr) {
  if (arr == null) return arr

  return [...new Set(arr)]
}
