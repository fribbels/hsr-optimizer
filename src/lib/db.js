import { create } from 'zustand'
import objectHash from 'object-hash'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { Constants, CURRENT_OPTIMIZER_VERSION, DAMAGE_UPGRADES, DEFAULT_STAT_DISPLAY, RelicSetFilterOptions, Sets, SIMULATION_SCORE } from 'lib/constants.ts'
import { SavedSessionKeys } from 'lib/constantsSession'
import { getDefaultForm } from 'lib/defaultForm'
import { Utils } from 'lib/utils'
import { SaveState } from 'lib/saveState'
import { Message } from 'lib/message'
import { OptimizerMenuIds } from 'components/optimizerTab/FormRow.tsx'
import { Themes } from 'lib/theme'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { DefaultSettingOptions, SettingOptions } from 'components/SettingsDrawer'

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

  WEBGPU_TEST: 'WEBGPU_TEST',
}

export const PageToRoute = {
  [AppPages.OPTIMIZER]: BASE_PATH,

  [AppPages.RELIC_SCORER]: BASE_PATH + '#scorer',
  [AppPages.CHANGELOG]: BASE_PATH + '#changelog',
  [AppPages.GETTING_STARTED]: BASE_PATH + '#getting-started',

  [AppPages.WEBGPU_TEST]: BASE_PATH + '#webgpu',
}

export const RouteToPage = {
  [PageToRoute[AppPages.OPTIMIZER]]: AppPages.OPTIMIZER,
  [PageToRoute[AppPages.RELIC_SCORER]]: AppPages.RELIC_SCORER,
  [PageToRoute[AppPages.CHANGELOG]]: AppPages.CHANGELOG,
  [PageToRoute[AppPages.GETTING_STARTED]]: AppPages.GETTING_STARTED,
  [PageToRoute[AppPages.WEBGPU_TEST]]: AppPages.WEBGPU_TEST,
}

// React usage
// let characterTabBlur = store(s => s.characterTabBlur);
// let setCharacterTabBlur = store(s => s.setCharacterTabBlur);

// Nonreactive usage
// store.getState().setRelicsById(relicsById)

window.store = create((set) => ({
  version: CURRENT_OPTIMIZER_VERSION,
  colorTheme: Themes.BLUE,

  optimizerGrid: undefined,

  optimizerTabFocusCharacter: undefined,
  characterTabFocusCharacter: undefined,
  scoringAlgorithmFocusCharacter: undefined,
  relicsTabFocusCharacter: undefined,
  inventoryWidth: 7,

  activeKey: RouteToPage[Utils.stripTrailingSlashes(window.location.pathname)]
    ? RouteToPage[Utils.stripTrailingSlashes(window.location.pathname) + window.location.hash.split('?')[0]]
    : AppPages.OPTIMIZER,
  characters: [],
  charactersById: {},
  conditionalSetEffectsDrawerOpen: false,
  combatBuffsDrawerOpen: false,
  enemyConfigurationsDrawerOpen: false,
  settingsDrawerOpen: false,
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
  zeroResultModalOpen: false,
  menuSidebarOpen: true,
  relicScorerSidebarOpen: true,
  gpuAccelerationWarned: false,
  optimizerStartTime: null,

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
    equippedBy: [],
  },
  characterTabFilters: {
    name: '',
    element: [],
    path: [],
    rarity: [],
  },
  excludedRelicPotentialCharacters: [],

  optimizerMenuState: {
    [OptimizerMenuIds.characterOptions]: true,
    [OptimizerMenuIds.relicAndStatFilters]: true,
    [OptimizerMenuIds.teammates]: true,
    [OptimizerMenuIds.characterStatsSimulation]: false,
  },

  savedSession: {
    [SavedSessionKeys.optimizerCharacterId]: null,
    [SavedSessionKeys.relicScorerSidebarOpen]: true,
    [SavedSessionKeys.scoringType]: SIMULATION_SCORE,
    [SavedSessionKeys.combatScoreDetails]: DAMAGE_UPGRADES,
  },

  settings: DefaultSettingOptions,

  setVersion: (x) => set(() => ({ version: x })),
  setActiveKey: (x) => set(() => ({ activeKey: x })),
  setCharacters: (x) => set(() => ({ characters: x })),
  setCharactersById: (x) => set(() => ({ charactersById: x })),
  setInventoryWidth: (x) => set(() => ({ inventoryWidth: x })),
  setConditionalSetEffectsDrawerOpen: (x) => set(() => ({ conditionalSetEffectsDrawerOpen: x })),
  setCombatBuffsDrawerOpen: (x) => set(() => ({ combatBuffsDrawerOpen: x })),
  setEnemyConfigurationsDrawerOpen: (x) => set(() => ({ enemyConfigurationsDrawerOpen: x })),
  setSettingsDrawerOpen: (x) => set(() => ({ settingsDrawerOpen: x })),
  setOptimizerTabFocusCharacter: (characterId) => set(() => ({ optimizerTabFocusCharacter: characterId })),
  setCharacterTabFocusCharacter: (characterId) => set(() => ({ characterTabFocusCharacter: characterId })),
  setScoringAlgorithmFocusCharacter: (characterId) => set(() => ({ scoringAlgorithmFocusCharacter: characterId })),
  setRelicsTabFocusCharacter: (characterId) => set(() => ({ relicsTabFocusCharacter: characterId })),
  setPermutationDetails: (x) => set(() => ({ permutationDetails: x })),
  setPermutations: (x) => set(() => ({ permutations: x })),
  setPermutationsResults: (x) => set(() => ({ permutationsResults: x })),
  setPermutationsSearched: (x) => set(() => ({ permutationsSearched: x })),
  setRelicsById: (x) => set(() => ({ relicsById: x })),
  setRelicTabFilters: (x) => set(() => ({ relicTabFilters: x })),
  setCharacterTabFilters: (x) => set(() => ({ characterTabFilters: x })),
  setScorerId: (x) => set(() => ({ scorerId: x })),
  setScoringMetadataOverrides: (x) => set(() => ({ scoringMetadataOverrides: x })),
  setStatDisplay: (x) => set(() => ({ statDisplay: x })),
  setStatSimulationDisplay: (x) => set(() => ({ statSimulationDisplay: x })),
  setStatSimulations: (x) => set(() => ({ statSimulations: Utils.clone(x) })),
  setSelectedStatSimulations: (x) => set(() => ({ selectedStatSimulations: x })),
  setOptimizerMenuState: (x) => set(() => ({ optimizerMenuState: x })),
  setOptimizationInProgress: (x) => set(() => ({ optimizationInProgress: x })),
  setOptimizationId: (x) => set(() => ({ optimizationId: x })),
  setGpuAccelerationWarned: (x) => set(() => ({ gpuAccelerationWarned: x })),
  setOptimizerStartTime: (x) => set(() => ({ optimizerStartTime: x })),
  setTeammateCount: (x) => set(() => ({ teammateCount: x })),
  setOptimizerFormCharacterEidolon: (x) => set(() => ({ optimizerFormCharacterEidolon: x })),
  setOptimizerFormSelectedLightCone: (x) => set(() => ({ optimizerFormSelectedLightCone: x })),
  setOptimizerFormSelectedLightConeSuperimposition: (x) => set(() => ({ optimizerFormSelectedLightConeSuperimposition: x })),
  setZeroPermutationsModalOpen: (x) => set(() => ({ zeroPermutationModalOpen: x })),
  setZeroResultModalOpen: (x) => set(() => ({ zeroResultModalOpen: x })),
  setExcludedRelicPotentialCharacters: (x) => set(() => ({ excludedRelicPotentialCharacters: x })),
  setMenuSidebarOpen: (x) => set(() => ({ menuSidebarOpen: x })),
  setSettings: (x) => set(() => ({ settings: x })),
  setSavedSession: (x) => set(() => ({ savedSession: x })),
  setSavedSessionKey: (key, x) => set((state) => ({
    savedSession: { ...state.savedSession, [key]: x },
  })),
  setColorTheme: (x) => set(() => ({ colorTheme: x })),
}))

export const DB = {
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
    const returnScoringMetadata = Utils.mergeUndefinedValues(scoringMetadataOverrides || {}, defaultScoringMetadata)

    for (const key of Object.keys(returnScoringMetadata.stats)) {
      if (returnScoringMetadata.stats[key] == null) {
        returnScoringMetadata.stats[key] = 0
      }
    }

    // We don't want to carry over presets, use the optimizer defined ones
    delete returnScoringMetadata.presets

    return returnScoringMetadata
  },
  updateCharacterScoreOverrides: (id, updated) => {
    const overrides = window.store.getState().scoringMetadataOverrides
    if (!overrides[id]) {
      overrides[id] = updated
    } else {
      Utils.mergeDefinedValues(overrides[id], updated)
    }
    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.save()
  },
  updateSimulationScoreOverrides: (id, updatedSimulation) => {
    if (!updatedSimulation) return

    const overrides = window.store.getState().scoringMetadataOverrides
    if (!overrides[id]) {
      overrides[id] = {
        simulation: updatedSimulation,
      }
    } else {
      overrides[id].simulation = updatedSimulation
    }
    window.store.getState().setScoringMetadataOverrides(overrides)

    setTimeout(() => {
      SaveState.save()
    }, 2000)
  },

  setStore: (x) => {
    const charactersById = {}
    const dbCharacters = DB.getMetadata().characters
    const dbLightCones = DB.getMetadata().lightCones

    // Remove invalid characters
    x.characters = x.characters.filter((x) => dbCharacters[x.id])

    for (const character of x.characters) {
      character.equipped = {}
      charactersById[character.id] = character

      // Previously sim requests didn't use the stats field
      if (character.form?.statSim?.simulations) {
        character.form.statSim.simulations = character.form.statSim.simulations.filter((x) => x.request?.stats)
      }

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
      if (dbLightCone?.path != dbCharacter?.path) {
        character.form.lightCone = undefined
        character.form.lightConeLevel = 80
        character.form.lightConeSuperimposition = 1
        character.form.lightConeConditionals = {}
      }

      // Deduplicate main stat filter values
      for (const part of Object.keys(Constants.Parts)) {
        character.form['main' + part] = deduplicateArray(character.form['main' + part])
      }

      // In beta, Duran maxed out at 6
      if (character.form.setConditionals?.[Sets.DuranDynastyOfRunningWolves]?.[1] > 5) {
        character.form.setConditionals[Sets.DuranDynastyOfRunningWolves][1] = 5
      }
    }

    for (const character of Object.values(dbCharacters)) {
      // Deduplicate scoring optimal main stat
      for (const part of Object.keys(Constants.Parts)) {
        character.scoringMetadata.parts[part] = deduplicateArray(character.scoringMetadata.parts[part])
      }
    }

    const currentTime = Date.now()
    let i = 0
    for (const relic of x.relics) {
      RelicAugmenter.augment(relic)
      const char = charactersById[relic.equippedBy]
      if (!relic.timeCreated) relic.timeCreated = currentTime - x.relics.length + i++
      if (char && !char.equipped[relic.part]) {
        char.equipped[relic.part] = relic.id
      } else {
        relic.equippedBy = undefined
      }
    }
    x.relics = sortAndIndexRelics(x.relics)

    if (x.scoringMetadataOverrides) {
      for (const [key, value] of Object.entries(x.scoringMetadataOverrides)) {
        // Previously the overrides were an array, invalidate the arrays
        if (value.length) {
          delete x.scoringMetadataOverrides[key]
        }
      }
      window.store.getState().setScoringMetadataOverrides(x.scoringMetadataOverrides || {})
    }

    window.store.getState().setScorerId(x.scorerId)
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
      // Don't load an invalid character
      if (!dbCharacters[x.savedSession.optimizerCharacterId]) {
        delete x.savedSession.optimizerCharacterId
      }

      window.store.getState().setSavedSession(x.savedSession)
    }

    if (x.settings) {
      window.store.getState().setSettings(x.settings)
    }

    window.store.getState().setExcludedRelicPotentialCharacters(x.excludedRelicPotentialCharacters || [])
    window.store.getState().setVersion(x.version)

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

  addFromForm: (form, autosave = true) => {
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

    if (autosave) {
      SaveState.save()
    }

    return found
  },

  saveCharacterPortrait: (characterId, portrait) => {
    let character = DB.getCharacterById(characterId)
    if (!character) {
      DB.addFromForm({ characterId: characterId })
      character = DB.getCharacterById(characterId)
      console.log('Character did not previously exist, adding', character)
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
  equipRelic: (relic, characterId, forceSwap = false) => {
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

    const swap = forceSwap || DB.getState().settings[SettingOptions.RelicEquippingBehavior.name] == SettingOptions.RelicEquippingBehavior.Swap

    // only re-equip prevRelic if it would go to a different character
    if (prevOwnerId !== characterId && prevCharacter) {
      if (prevRelic && swap) {
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

  equipRelicIdsToCharacter: (relicIds, characterId, forceSwap = false) => {
    if (!characterId) return console.warn('No characterId to equip to')
    console.log('Equipping relics to character', relicIds, characterId)

    for (const relicId of relicIds) {
      DB.equipRelic({ id: relicId }, characterId, forceSwap)
    }
  },

  switchRelics: (fromCharacterId, toCharacterId) => {
    if (!fromCharacterId) return console.warn('No characterId to equip from')
    if (!toCharacterId) return console.warn('No characterId to equip to')
    console.log(`Switching relics from character ${fromCharacterId} to character ${toCharacterId}`)

    const fromCharacter = DB.getCharacterById(fromCharacterId)
    DB.equipRelicIdsToCharacter(Object.values(fromCharacter.equipped), toCharacterId, true)
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
        DB.addFromForm(character, false)
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
    const currentTime = Date.now()
    let i = 0
    for (let newRelic of newRelics) {
      i++
      const hash = hashRelic(newRelic)

      // Compare new relic hashes to old relic hashes
      const found = oldRelicHashes[hash]
      let stableRelicId
      if (found) {
        if (!found.timeCreated) found.timeCreated = currentTime - newRelics.length + i
        if (newRelic.verified) {
          // Inherit the new verified speed stats
          found.verified = true
          found.substats = newRelic.substats
          found.augmentedStats = newRelic.augmentedStats
        }

        if (newRelic.equippedBy && newCharacters.length) {
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
        newRelic.timeCreated = currentTime - newRelics.length + i
        replacementRelics.push(newRelic)
      }

      // Update the character's equipped inventory
      if (newRelic.equippedBy && newCharacters.length) {
        const character = characters.find((x) => x.id == newRelic.equippedBy)
        if (character) {
          character.equipped[newRelic.part] = stableRelicId
        } else {
          console.log('No character to equip relic to', newRelic)
        }
      }
    }

    replacementRelics = sortAndIndexRelics(replacementRelics)

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
   * New relics have their creation date assigned to current time as in game creation date is unknown
   */
  mergePartialRelicsWithState: (newRelics, sourceCharacters = []) => {
    const oldRelics = Utils.clone(DB.getRelics()) || []
    newRelics = Utils.clone(newRelics) || []

    // Tracking these for debug / messaging
    const updatedOldRelics = []
    const addedNewRelics = []
    const equipUpdates = []

    const currentTime = Date.now()
    let i = 0
    for (const newRelic of newRelics) {
      i++
      const match = findRelicMatch(newRelic, oldRelics)

      if (match) {
        match.substats = newRelic.substats
        match.main = newRelic.main
        match.enhance = newRelic.enhance
        match.verified = true
        updatedOldRelics.push(match)

        equipUpdates.push({ relic: match, equippedBy: newRelic.equippedBy })
      } else {
        oldRelics.push(newRelic)
        addedNewRelics.push(newRelic)

        equipUpdates.push({ relic: newRelic, equippedBy: newRelic.equippedBy })
        newRelic.equippedBy = undefined
        newRelic.timeCreated = currentTime - newRelics.length + i
      }
    }

    console.log('addedNewRelics', addedNewRelics)
    console.log('updatedOldRelics', updatedOldRelics)

    oldRelics.map((x) => RelicAugmenter.augment(x))
    oldRelics = sortAndIndexRelics(oldRelics)
    DB.setRelics(oldRelics)

    for (const equipUpdate of equipUpdates) {
      if (sourceCharacters.find((character) => character.id == equipUpdate.equippedBy)) {
        DB.equipRelic(equipUpdate.relic, equipUpdate.equippedBy)
      }
    }

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

function findRelicMatch(relic, oldRelics) {
  // part set grade mainstat substatStats
  const oldRelicPartialHashes = {}
  for (const oldRelic of oldRelics) {
    const hash = partialHashRelic(oldRelic)
    if (!oldRelicPartialHashes[hash]) oldRelicPartialHashes[hash] = []
    oldRelicPartialHashes[hash].push(oldRelic)
  }
  const partialHash = partialHashRelic(relic)
  const partialMatches = oldRelicPartialHashes[partialHash] || []

  let match = undefined
  for (const partialMatch of partialMatches) {
    if (relic.enhance < partialMatch.enhance) continue
    if (relic.substats.length < partialMatch.substats.length) continue

    let exit = false
    let upgrades = 0
    for (let i = 0; i < partialMatch.substats.length; i++) {
      const matchSubstat = partialMatch.substats[i]
      const newSubstat = relic.substats.find((x) => x.stat == matchSubstat.stat)

      // Different substats mean different relics - break
      if (!newSubstat) {
        exit = true
        break
      }
      if (matchSubstat.stat != newSubstat.stat) {
        exit = true
        break
      }
      if (compareSameTypeSubstat(matchSubstat, newSubstat) == -1) {
        exit = true
        break
      }

      // Track if the number of stat increases make sense
      if (compareSameTypeSubstat(matchSubstat, newSubstat) == 1) {
        upgrades++
      }
    }

    if (exit) continue

    const possibleUpgrades = Math.round((Math.floor(relic.enhance / 3) * 3 - Math.floor(partialMatch.enhance / 3) * 3) / 3)
    if (upgrades > possibleUpgrades) continue

    // If it passes all the tests, keep it
    match = partialMatch
    break
  }
  return match
}

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

function sortAndIndexRelics(arr) {
  arr.sort((a, b) => b.timeCreated - a.timeCreated)
  let i = 0
  for (const relic of arr) {
    relic.ageIndex = i++
  }
  return arr
}
