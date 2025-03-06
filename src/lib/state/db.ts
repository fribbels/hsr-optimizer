import i18next from 'i18next'
import {
  COMPUTE_ENGINE_GPU_STABLE,
  ComputeEngine,
  Constants,
  CURRENT_OPTIMIZER_VERSION,
  DAMAGE_UPGRADES,
  DEFAULT_MEMO_DISPLAY,
  DEFAULT_STAT_DISPLAY,
  Parts,
  Sets,
  SIMULATION_SCORE,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { Message } from 'lib/interactions/message'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { DefaultSettingOptions, SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { getGlobalThemeConfigFromColorTheme, Themes } from 'lib/rendering/theme'
import { oldCharacterScoringMetadata } from 'lib/scoring/oldCharacterScoringMetadata'
import { setModifiedScoringMetadata } from 'lib/scoring/scoreComparison'
import { SaveState } from 'lib/state/saveState'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { WarpRequest, WarpResult } from 'lib/tabs/tabWarp/warpCalculatorController'
import { debounceEffect } from 'lib/utils/debounceUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Character } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Form } from 'types/form'
import { DBMetadata, ScoringMetadata, SimulationMetadata } from 'types/metadata'
import { Relic, Stat } from 'types/relic'
import { HsrOptimizerSaveFormat, HsrOptimizerStore, SavedSession, UserSettings } from 'types/store'
import { create } from 'zustand'

export type HsrOptimizerMetadataState = {
  metadata: DBMetadata
}

const state: HsrOptimizerMetadataState = {
  metadata: {} as DBMetadata, // generated, not saved
}

export enum BasePath {
  MAIN = '/hsr-optimizer',
  BETA = '/dreary-quibbles',
}

// This string is replaced by /dreary-quibbles by github actions, don't change
export const BASE_PATH: BasePath = BasePath.MAIN

export const AppPages = {
  OPTIMIZER: 'OPTIMIZER',
  CHARACTERS: 'CHARACTERS',
  RELICS: 'RELICS',
  IMPORT: 'IMPORT',

  GETTING_STARTED: 'GETTING_STARTED',
  CHANGELOG: 'CHANGELOG',
  RELIC_SCORER: 'RELIC_SCORER', // Deprecated - reroute to showcase
  SHOWCASE: 'SHOWCASE',
  WARP: 'WARP',

  WEBGPU_TEST: 'WEBGPU_TEST',
  METADATA_TEST: 'METADATA_TEST',
  HOME: 'HOME',
}

export const PageToRoute = {
  [AppPages.HOME]: BASE_PATH,

  [AppPages.OPTIMIZER]: BASE_PATH + '#main',

  [AppPages.RELIC_SCORER]: BASE_PATH + '#scorer', // Deprecated - reroute to showcase
  [AppPages.SHOWCASE]: BASE_PATH + '#showcase',
  [AppPages.WARP]: BASE_PATH + '#warp',
  [AppPages.CHANGELOG]: BASE_PATH + '#changelog',
  [AppPages.GETTING_STARTED]: BASE_PATH + '#getting-started',

  [AppPages.WEBGPU_TEST]: BASE_PATH + '#webgpu',
  [AppPages.METADATA_TEST]: BASE_PATH + '#metadata',
}

export const RouteToPage = {
  [PageToRoute[AppPages.OPTIMIZER]]: AppPages.OPTIMIZER,
  [PageToRoute[AppPages.RELIC_SCORER]]: AppPages.SHOWCASE,
  [PageToRoute[AppPages.SHOWCASE]]: AppPages.SHOWCASE,
  [PageToRoute[AppPages.WARP]]: AppPages.WARP,
  [PageToRoute[AppPages.CHANGELOG]]: AppPages.CHANGELOG,
  [PageToRoute[AppPages.GETTING_STARTED]]: AppPages.GETTING_STARTED,

  [PageToRoute[AppPages.WEBGPU_TEST]]: AppPages.WEBGPU_TEST,
  [PageToRoute[AppPages.METADATA_TEST]]: AppPages.METADATA_TEST,
  [PageToRoute[AppPages.HOME]]: AppPages.HOME,
}

// React usage
// let characterTabBlur = store(s => s.characterTabBlur);
// let setCharacterTabBlur = store(s => s.setCharacterTabBlur);

// Nonreactive usage
// store.getState().setRelicsById(relicsById)

const savedSessionDefaults: SavedSession = {
  [SavedSessionKeys.optimizerCharacterId]: null,
  [SavedSessionKeys.relicScorerSidebarOpen]: true,
  [SavedSessionKeys.scoringType]: SIMULATION_SCORE,
  [SavedSessionKeys.combatScoreDetails]: DAMAGE_UPGRADES,
  [SavedSessionKeys.computeEngine]: COMPUTE_ENGINE_GPU_STABLE,
  [SavedSessionKeys.showcaseStandardMode]: false,
  [SavedSessionKeys.showcaseDarkMode]: false,
  [SavedSessionKeys.showcaseUID]: true,
  [SavedSessionKeys.showcasePreciseSpd]: false,
}

function getDefaultActiveKey() {
  const pathname = TsUtils.stripTrailingSlashes(window.location.pathname)
  const page = RouteToPage[pathname + window.location.hash.split('?')[0]]
  return page ?? AppPages.HOME
}

window.store = create((set) => {
  const store: HsrOptimizerStore = {
    version: CURRENT_OPTIMIZER_VERSION,
    colorTheme: Themes.BLUE,
    globalThemeConfig: getGlobalThemeConfigFromColorTheme(Themes.BLUE),

    formValues: undefined,

    optimizerGrid: undefined,

    comboState: {} as ComboState,
    optimizerTabFocusCharacter: undefined,
    characterTabFocusCharacter: undefined,
    scoringAlgorithmFocusCharacter: undefined,
    statTracesDrawerFocusCharacter: undefined,
    relicsTabFocusCharacter: undefined,
    inventoryWidth: 9,
    rowLimit: 10,

    activeKey: getDefaultActiveKey(),
    characters: [],
    charactersById: {},
    conditionalSetEffectsDrawerOpen: false,
    comboDrawerOpen: false,
    combatBuffsDrawerOpen: false,
    statTracesDrawerOpen: false,
    enemyConfigurationsDrawerOpen: false,
    settingsDrawerOpen: false,
    gettingStartedDrawerOpen: false,
    permutations: 0,
    permutationsResults: 0,
    permutationsSearched: 0,
    relicsById: {},
    scorerId: '',
    scoringMetadataOverrides: {},
    showcasePreferences: {},
    showcaseTemporaryOptions: {},
    warpRequest: {} as WarpRequest,
    warpResult: {} as WarpResult,
    statDisplay: DEFAULT_STAT_DISPLAY,
    memoDisplay: DEFAULT_MEMO_DISPLAY,
    statSimulationDisplay: StatSimTypes.Disabled,
    statSimulations: [],
    selectedStatSimulations: [],
    optimizationInProgress: false,
    optimizationId: null,
    teammateCount: 0,
    zeroPermutationModalOpen: false,
    zeroResultModalOpen: false,
    scoringModalOpen: false,
    menuSidebarOpen: true,
    relicScorerSidebarOpen: true,
    optimizerRunningEngine: COMPUTE_ENGINE_GPU_STABLE,
    optimizerStartTime: null,
    optimizerEndTime: null,
    optimizerTabFocusCharacterSelectModalOpen: false,

    optimizerFormCharacterEidolon: 0,
    optimizerFormSelectedLightCone: undefined,
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
      [OptimizerMenuIds.analysis]: true,
    },

    savedSession: savedSessionDefaults,

    settings: DefaultSettingOptions,
    optimizerBuild: null,
    optimizerExpandedPanelBuildData: null,
    optimizerSelectedRowData: null,
    optimizerBuffGroups: undefined,

    setComboState: (x) => set(() => ({ comboState: x })),
    setVersion: (x) => set(() => ({ version: x })),
    setActiveKey: (x) => set(() => ({ activeKey: x })),
    setFormValues: (x) => set(() => ({ formValues: x })),
    setCharacters: (x) => set(() => ({ characters: x })),
    setCharactersById: (x) => set(() => ({ charactersById: x })),
    setInventoryWidth: (x) => set(() => ({ inventoryWidth: x })),
    setRowLimit: (x) => set(() => ({ rowLimit: x })),
    setConditionalSetEffectsDrawerOpen: (x) => set(() => ({ conditionalSetEffectsDrawerOpen: x })),
    setComboDrawerOpen: (x) => set(() => ({ comboDrawerOpen: x })),
    setCombatBuffsDrawerOpen: (x) => set(() => ({ combatBuffsDrawerOpen: x })),
    setStatTracesDrawerOpen: (x) => set(() => ({ statTracesDrawerOpen: x })),
    setEnemyConfigurationsDrawerOpen: (x) => set(() => ({ enemyConfigurationsDrawerOpen: x })),
    setSettingsDrawerOpen: (x) => set(() => ({ settingsDrawerOpen: x })),
    setGettingStartedDrawerOpen: (x) => set(() => ({ gettingStartedDrawerOpen: x })),
    setOptimizerTabFocusCharacter: (characterId) => set(() => ({ optimizerTabFocusCharacter: characterId })),
    setCharacterTabFocusCharacter: (characterId) => set(() => ({ characterTabFocusCharacter: characterId })),
    setScoringAlgorithmFocusCharacter: (characterId) => set(() => ({ scoringAlgorithmFocusCharacter: characterId })),
    setStatTracesDrawerFocusCharacter: (characterId) => set(() => ({ statTracesDrawerFocusCharacter: characterId })),
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
    setShowcasePreferences: (x) => set(() => ({ showcasePreferences: x })),
    setShowcaseTemporaryOptions: (x) => set(() => ({ showcaseTemporaryOptions: x })),
    setWarpRequest: (x) => set(() => ({ warpRequest: x })),
    setWarpResult: (x) => set(() => ({ warpResult: x })),
    setStatDisplay: (x) => set(() => ({ statDisplay: x })),
    setMemoDisplay: (x) => set(() => ({ memoDisplay: x })),
    setStatSimulationDisplay: (x) => set(() => ({ statSimulationDisplay: x })),
    setStatSimulations: (x) => set(() => ({ statSimulations: Utils.clone(x) })),
    setSelectedStatSimulations: (x) => set(() => ({ selectedStatSimulations: x })),
    setOptimizerMenuState: (x) => set(() => ({ optimizerMenuState: x })),
    setOptimizationInProgress: (x) => set(() => ({ optimizationInProgress: x })),
    setOptimizationId: (x) => set(() => ({ optimizationId: x })),
    setOptimizerStartTime: (x) => set(() => ({ optimizerStartTime: x })),
    setOptimizerRunningEngine: (x: ComputeEngine) => set(() => ({ optimizerRunningEngine: x })),
    setOptimizerEndTime: (x) => set(() => ({ optimizerEndTime: x })),
    setTeammateCount: (x) => set(() => ({ teammateCount: x })),
    setOptimizerFormCharacterEidolon: (x) => set(() => ({ optimizerFormCharacterEidolon: x })),
    setOptimizerFormSelectedLightCone: (x) => set(() => ({ optimizerFormSelectedLightCone: x })),
    setOptimizerFormSelectedLightConeSuperimposition: (x) => set(() => ({ optimizerFormSelectedLightConeSuperimposition: x })),
    setOptimizerTabFocusCharacterSelectModalOpen: (x) => set(() => ({ optimizerTabFocusCharacterSelectModalOpen: x })),
    setZeroPermutationsModalOpen: (x) => set(() => ({ zeroPermutationModalOpen: x })),
    setZeroResultModalOpen: (x) => set(() => ({ zeroResultModalOpen: x })),
    setScoringModalOpen: (x) => set(() => ({ scoringModalOpen: x })),
    setExcludedRelicPotentialCharacters: (x) => set(() => ({ excludedRelicPotentialCharacters: x })),
    setMenuSidebarOpen: (x) => set(() => ({ menuSidebarOpen: x })),
    setSettings: (x: UserSettings) => set(() => ({ settings: x })),
    setSavedSession: (x) => set(() => ({ savedSession: x })),
    setSavedSessionKey: (key, x) => set((state) => ({
      savedSession: { ...state.savedSession, [key]: x },
    })),
    setColorTheme: (x) => set(() => ({ colorTheme: x })),
    setOptimizerBuild: (x) => set(() => ({ optimizerBuild: x })),
    setOptimizerExpandedPanelBuildData: (x) => set(() => ({ optimizerExpandedPanelBuildData: x })),
    setOptimizerSelectedRowData: (x) => set(() => ({ optimizerSelectedRowData: x })),
    setOptimizerBuffGroups: (x) => set(() => ({ optimizerBuffGroups: x })),
    setGlobalThemeConfig: (x) => set(() => ({ globalThemeConfig: x })),
  }
  return store
})

// TODO: define specific overrides
// export type ScoringMetadataOverride = {
//   "simulation": {
//   },
//   "stats": {
//   },
//   "parts": {
//   },
//   "sortOption": {
//   },
//   "characterId": "1003",
//   "modified": false
// }

export const DB = {
  getMetadata: (): DBMetadata => state.metadata,
  setMetadata: (metadata: DBMetadata) => state.metadata = metadata,

  getCharacters: () => window.store.getState().characters,
  getCharacterById: (id: string) => window.store.getState().charactersById[id],

  setCharacters: (characters: Character[]) => {
    const charactersById: Record<string, Character> = {}
    for (const character of characters) {
      charactersById[character.id] = character
    }

    assignRanks(characters)
    const newCharacterArray = [...characters]
    window.store.getState().setCharacters(newCharacterArray)
    window.store.getState().setCharactersById(charactersById)
  },
  setCharacter: (character: Character) => {
    const charactersById = window.store.getState().charactersById
    charactersById[character.id] = character

    window.store.getState().setCharactersById(charactersById)
  },
  addCharacter: (character: Character) => {
    const characters = DB.getCharacters()
    characters.push(character)
    DB.setCharacters(characters)
  },
  insertCharacter: (id: string, index: number) => {
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

    window.onOptimizerFormValuesChange({}, OptimizerTabController.getForm())
  },
  refreshCharacters: () => {
    if (window.setCharacterRows) {
      window.setCharacterRows(DB.getCharacters())
    }
  },

  getRelics: () => Object.values(window.store.getState().relicsById),
  getRelicsById: () => window.store.getState().relicsById,
  setRelics: (relics: Relic[]) => {
    const relicsById: Record<string, Relic> = {}
    for (const relic of relics) {
      relicsById[relic.id] = relic
    }
    window.store.getState().setRelicsById(relicsById)
  },
  getRelicById: (id: string) => window.store.getState().relicsById[id],

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
   */
  setRelic: (relic: Relic) => {
    if (!relic.id) return console.warn('No matching relic', relic)
    const oldRelic = DB.getRelicById(relic.id)
    const addRelic = !oldRelic

    if (addRelic) {
      relic.ageIndex = DB.getRelics().length
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

  getScoringMetadata: (id: string) => {
    const dbMetadata = DB.getMetadata()
    const defaultScoringMetadata = dbMetadata.characters[id].scoringMetadata
    const scoringMetadataOverrides = window.store.getState().scoringMetadataOverrides
    const override = scoringMetadataOverrides[id]
    const returnScoringMetadata = Utils.mergeUndefinedValues(override || {}, defaultScoringMetadata) as ScoringMetadata

    // POST MIGRATION UNCOMMENT
    // if (scoringMetadataOverrides && scoringMetadataOverrides.modified) {
    //   let statWeightsModified = false
    //   for (const stat of Object.values(Constants.Stats)) {
    //     if (Utils.nullUndefinedToZero(scoringMetadataOverrides.stats[stat]) != Utils.nullUndefinedToZero(defaultScoringMetadata.stats[stat])) {
    //       statWeightsModified = true
    //     }
    //   }
    //
    //   if (statWeightsModified) {
    //     returnScoringMetadata.stats = scoringMetadataOverrides.stats
    //     returnScoringMetadata.modified = true
    //   } else {
    //     returnScoringMetadata.stats = defaultScoringMetadata.stats
    //     returnScoringMetadata.modified = false
    //   }
    // } else {
    //   returnScoringMetadata.stats = defaultScoringMetadata.stats
    //   returnScoringMetadata.modified = false
    // }

    for (const key of Object.keys(defaultScoringMetadata.stats)) {
      if (returnScoringMetadata.stats[key] == null) {
        returnScoringMetadata.stats[key] = 0
      }
    }

    setModifiedScoringMetadata(defaultScoringMetadata, returnScoringMetadata)

    // We don't want to carry over presets, use the optimizer defined ones
    // TODO: What does this do
    // @ts-ignore
    delete returnScoringMetadata.presets

    return returnScoringMetadata
  },
  updateCharacterScoreOverrides: (id: string, updated: ScoringMetadata) => {
    const overrides = window.store.getState().scoringMetadataOverrides
    if (!overrides[id]) {
      overrides[id] = updated
    } else {
      Utils.mergeDefinedValues(overrides[id], updated)
    }
    if (updated.modified) {
      // TODO: bug
      // overrides.modified = true
    }

    const defaultScoringMetadata = DB.getMetadata().characters[id].scoringMetadata

    setModifiedScoringMetadata(defaultScoringMetadata, overrides[id])

    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.delayedSave()
  },
  updateSimulationScoreOverrides: (id: string, updatedSimulation: SimulationMetadata) => {
    if (!updatedSimulation) return

    const overrides = window.store.getState().scoringMetadataOverrides
    if (!overrides[id]) {
      overrides[id] = {
        simulation: updatedSimulation,
      } as ScoringMetadata
    } else {
      overrides[id].simulation = updatedSimulation
    }
    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.delayedSave()
  },

  setStore: (saveData: HsrOptimizerSaveFormat, autosave = true) => {
    const charactersById: Record<string, Character> = {}
    const dbCharacters = DB.getMetadata().characters
    const dbLightCones = DB.getMetadata().lightCones

    // Remove invalid characters
    saveData.characters = saveData.characters.filter((x) => dbCharacters[x.id])

    for (const character of saveData.characters) {
      character.equipped = {}
      charactersById[character.id] = character

      // Previously sim requests didn't use the stats field
      if (character.form?.statSim?.simulations) {
        character.form.statSim.simulations = character.form.statSim.simulations.filter((simulation) => simulation.request?.stats)
      }

      // Previously characters had customizable options, now we're defaulting to 80s
      character.form.characterLevel = 80
      character.form.lightConeLevel = 80

      // Previously there was a weight sort which is now removed, arbitrarily replaced with SPD if the user had used it
      if (character.form.resultSort === 'WEIGHT') {
        character.form.resultSort = 'SPD'
      }

      // Deduplicate main stat filter values
      character.form.mainBody = deduplicateStringArray(character.form.mainBody)
      character.form.mainFeet = deduplicateStringArray(character.form.mainFeet)
      character.form.mainPlanarSphere = deduplicateStringArray(character.form.mainPlanarSphere)
      character.form.mainLinkRope = deduplicateStringArray(character.form.mainLinkRope)

      // In beta, Duran maxed out at 6
      if (character.form.setConditionals?.[Sets.DuranDynastyOfRunningWolves]?.[1] ?? 0 > 5) {
        character.form.setConditionals[Sets.DuranDynastyOfRunningWolves][1] = 5
      }

      // In beta, it was later discovered Sacerdos could apply to self buffs
      if (typeof character.form.setConditionals?.[Sets.SacerdosRelivedOrdeal]?.[1] == 'boolean') {
        character.form.setConditionals[Sets.SacerdosRelivedOrdeal][1] = 0
      }
    }

    for (const character of Object.values(dbCharacters)) {
      // Deduplicate scoring optimal main stat
      for (const part of Object.keys(Constants.Parts)) {
        character.scoringMetadata.parts[part] = deduplicateStringArray(character.scoringMetadata.parts[part])
      }
    }

    for (const relic of saveData.relics) {
      RelicAugmenter.augment(relic)
      const character = charactersById[relic.equippedBy!]
      if (character && !character.equipped[relic.part]) {
        character.equipped[relic.part] = relic.id
      } else {
        relic.equippedBy = undefined
      }
    }
    indexRelics(saveData.relics)

    if (saveData.scoringMetadataOverrides) {
      for (const [key, value] of Object.entries(saveData.scoringMetadataOverrides)) {
        // Migration: previously the overrides were an array, invalidate the arrays
        // @ts-ignore
        if (value.length) {
          delete saveData.scoringMetadataOverrides[key]
        }

        // There was a bug setting the modified flag on custom scoring weight changes
        // This makes it impossible to tell if a previous saved score was customized or not
        // We attempt to fix this by running a migration for a few months (start 9/5/2024), any scores matching
        // the old score will be migrated to the new scores, while any non-matching ones are marked modified
        // After this migration done, Ctrl + F and uncomment the POST MIGRATION UNCOMMENT section to re-enable overwriting
        const scoringMetadataOverrides = saveData.scoringMetadataOverrides[key]
        if (scoringMetadataOverrides) {
          if (!dbCharacters[key]?.scoringMetadata) {
            continue
          }

          const oldScoringMetadataStats = oldCharacterScoringMetadata[key] || {}
          const defaultScoringMetadata = dbCharacters[key].scoringMetadata

          let isOldScoring = true
          for (const stat of Object.values(Constants.Stats)) {
            if (Utils.nullUndefinedToZero(scoringMetadataOverrides.stats[stat]) != Utils.nullUndefinedToZero(oldScoringMetadataStats[stat])) {
              isOldScoring = false
              break
            }
          }

          // Migrate old scoring to new scoring
          if (isOldScoring) {
            scoringMetadataOverrides.stats = Utils.clone(defaultScoringMetadata.stats)
            scoringMetadataOverrides.modified = false
          } else {
            // Otherwise mark any modified as modified
            let statWeightsModified = false
            for (const stat of Object.values(Constants.Stats)) {
              if (Utils.nullUndefinedToZero(scoringMetadataOverrides.stats[stat]) != Utils.nullUndefinedToZero(defaultScoringMetadata.stats[stat])) {
                statWeightsModified = true
                break
              }
            }

            if (statWeightsModified) {
              scoringMetadataOverrides.modified = true
            }
          }

          // Just use this post migration? I don't quite remember what the above does
          setModifiedScoringMetadata(defaultScoringMetadata, scoringMetadataOverrides)
        }
      }

      window.store.getState().setScoringMetadataOverrides(saveData.scoringMetadataOverrides || {})
    }

    if (saveData.showcasePreferences) {
      window.store.getState().setShowcasePreferences(saveData.showcasePreferences || {})
    }

    if (saveData.warpRequest) {
      window.store.getState().setWarpRequest(saveData.warpRequest || {})
    }

    window.store.getState().setScorerId(saveData.scorerId)
    if (saveData.optimizerMenuState) {
      const menuState = window.store.getState().optimizerMenuState
      for (const key of Object.values(OptimizerMenuIds)) {
        if (saveData.optimizerMenuState[key] != null) {
          menuState[key] = saveData.optimizerMenuState[key]
        }
      }
      window.store.getState().setOptimizerMenuState(menuState)
    }

    if (saveData.savedSession) {
      // Don't load an invalid character
      const optimizerCharacterId = saveData.savedSession.optimizerCharacterId
      if (optimizerCharacterId && !dbCharacters[optimizerCharacterId]) {
        // @ts-ignore
        delete saveData.savedSession.optimizerCharacterId
      }

      // When new session items are added, set user's save to the default
      const overiddenSavedSessionDefaults = {
        ...savedSessionDefaults,
        ...saveData.savedSession,
      }

      window.store.getState().setSavedSession(overiddenSavedSessionDefaults)
    }

    if (saveData.settings) {
      window.store.getState().setSettings(saveData.settings)
    }

    window.store.getState().setExcludedRelicPotentialCharacters(saveData.excludedRelicPotentialCharacters || [])
    window.store.getState().setVersion(saveData.version)
    window.store.getState().setInventoryWidth(saveData.relicLocator?.inventoryWidth ?? 9)
    window.store.getState().setRowLimit(saveData.relicLocator?.rowLimit ?? 10)

    assignRanks(saveData.characters)
    DB.setRelics(saveData.relics)
    DB.setCharacters(saveData.characters)

    DB.refreshCharacters()
    DB.refreshRelics()

    if (autosave) {
      SaveState.delayedSave()
    }
  },
  resetStore: () => {
    const saveFormat: Partial<HsrOptimizerSaveFormat> = {
      relics: [],
      characters: [],
      showcasePreferences: {},
    }
    DB.setStore(saveFormat as HsrOptimizerSaveFormat)
  },

  replaceCharacterForm: (form: Form) => {
    const found = DB.getCharacterById(form.characterId)
    if (found) {
      found.form = {
        ...found.form,
        ...form,
      }
    }
  },

  addFromForm: (form: Form, autosave = true) => {
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
      } as Character
      DB.addCharacter(found)
    }

    // console.log('Updated db characters', characters)

    /*
     * TODO: after render optimization, window.characterGrid is possibly undefined
     * Since the grid resets the rows, we have to re-select the grid node and inform the character tab
     */
    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.updateGridOptions({ rowData: characters })
      window.characterGrid.current.api.forEachNode((node: {
        data: {
          id: string
        }
        setSelected: (b: boolean) => void
      }) => {
        node.data.id == found.id ? node.setSelected(true) : 0
      })
      window.store.getState().setCharacterTabFocusCharacter(found.id)
    }

    if (autosave) {
      SaveState.delayedSave()
    }

    return found
  },

  saveCharacterPortrait: (characterId: string, portrait: CustomImageConfig) => {
    let character = DB.getCharacterById(characterId)
    if (!character) {
      DB.addFromForm({ characterId: characterId } as Form)
      character = DB.getCharacterById(characterId)
      console.log('Character did not previously exist, adding', character)
    }
    character.portrait = portrait
    DB.setCharacter(character)
    console.log('Saved portrait', DB.getState())
  },

  deleteCharacterPortrait: (characterId: string) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }
    delete character.portrait
    DB.setCharacter(character)
    console.log('Deleted portrait', DB.getState())
  },

  saveCharacterBuild: (name: string,
    characterId: string,
    score: {
      rating: string
      score: string
    }) => {
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
        build: [...Object.values(character.equipped)] as string[],
        score: score,
      })
      DB.setCharacter(character)
      console.log('Saved build', DB.getState())
    }
  },

  deleteCharacterBuild: (characterId: string, name: string) => {
    const character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to delete build for')

    character.builds = character.builds.filter((x) => x.name != name)
    DB.setCharacter(character)
  },

  clearCharacterBuilds: (characterId: string) => {
    const character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to clear builds for')

    character.builds = []
    DB.setCharacter(character)
  },

  unequipCharacter: (id: string) => {
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

  removeCharacter: (characterId: string) => {
    DB.unequipCharacter(characterId)
    let characters = DB.getCharacters()
    characters = characters.filter((x) => x.id != characterId)
    DB.setCharacters(characters)
  },

  unequipRelicById: (id: string) => {
    if (!id) return console.warn('No relic')
    const relic = DB.getRelicById(id)

    console.log('UNEQUIP RELIC')

    const characters = DB.getCharacters()
    for (const character of characters) {
      if (character.equipped?.[relic.part] && character.equipped[relic.part] == relic.id) {
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
   */
  equipRelic: (relic: Relic, characterId: string | undefined, forceSwap = false) => {
    if (!relic?.id) return console.warn('No relic')
    if (!characterId) return console.warn('No character')
    relic = DB.getRelicById(relic.id)

    const prevOwnerId = relic.equippedBy
    const prevCharacter = DB.getCharacterById(prevOwnerId!)
    const character = DB.getCharacterById(characterId)
    const prevRelic = DB.getRelicById(character.equipped[relic.part]!)

    if (prevRelic) {
      DB.unequipRelicById(prevRelic.id)
    }

    const swap = forceSwap || DB.getState().settings[SettingOptions.RelicEquippingBehavior.name as keyof UserSettings] == SettingOptions.RelicEquippingBehavior.Swap

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

    debounceEffect('refreshRelics', 500, () => window.relicsGrid?.current?.api.refreshCells())
  },

  equipRelicIdsToCharacter: (relicIds: string[], characterId: string, forceSwap = false) => {
    if (!characterId) return console.warn('No characterId to equip to')
    console.log('Equipping relics to character', relicIds, characterId)

    for (const relicId of relicIds) {
      DB.equipRelic({ id: relicId } as Relic, characterId, forceSwap)
    }
  },

  switchRelics: (fromCharacterId: string, toCharacterId: string) => {
    if (!fromCharacterId) return console.warn('No characterId to equip from')
    if (!toCharacterId) return console.warn('No characterId to equip to')
    console.log(`Switching relics from character ${fromCharacterId} to character ${toCharacterId}`)

    const fromCharacter = DB.getCharacterById(fromCharacterId)
    DB.equipRelicIdsToCharacter(Object.values(fromCharacter.equipped), toCharacterId, true)
  },

  deleteRelic: (id: string) => {
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

  // These relics may be missing speed decimals depending on the importer.\
  // We overwrite any existing relics with imported ones.
  mergeRelicsWithState: (newRelics: Relic[], newCharacters: Form[]) => {
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
    const oldRelicHashes: Record<string, Relic> = {}
    for (const oldRelic of oldRelics) {
      const hash = hashRelic(oldRelic)
      oldRelicHashes[hash] = oldRelic
    }

    let replacementRelics: Relic[] = []
    // In case the user tries to import a characters only file, we do this
    if (newRelics.length == 0) {
      replacementRelics = oldRelics
    }
    for (let newRelic of newRelics) {
      const hash = hashRelic(newRelic)

      // Compare new relic hashes to old relic hashes
      const found = oldRelicHashes[hash]
      let stableRelicId: string
      if (found) {
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

    indexRelics(replacementRelics)

    console.log('Replacement relics', replacementRelics)

    DB.setRelics(replacementRelics)

    // Clean up any deleted relic ids that are still equipped
    for (const character of characters) {
      for (const part of Object.values(Constants.Parts)) {
        if (character.equipped?.[part] && !DB.getRelicById(character.equipped[part])) {
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

    // Clean up characters who have relics equipped by someone else, or characters that don't exist ingame yet
    for (const character of DB.getCharacters()) {
      for (const part of Object.keys(character.equipped)) {
        const relicId = character.equipped[part as Parts]
        if (relicId) {
          const relic = DB.getRelicById(relicId)
          if (relic.equippedBy != character.id) {
            character.equipped[part as Parts] = undefined
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
    window.onOptimizerFormValuesChange({} as Form, fieldValues)
    window.refreshRelicsScore()
  },

  /*
   * These relics have accurate speed values from relic scorer import.\
   * We keep the existing set of relics and only overwrite ones that match the ones that match an imported one.
   */
  mergePartialRelicsWithState: (newRelics: Relic[], sourceCharacters: Character[] = []) => {
    const oldRelics = TsUtils.clone(DB.getRelics()) || []
    newRelics = TsUtils.clone(newRelics) || []

    // Tracking these for debug / messaging
    const updatedOldRelics: Relic[] = []
    const addedNewRelics: Relic[] = []
    const equipUpdates: {
      relic: Relic
      equippedBy: string | undefined
    }[] = []

    for (const newRelic of newRelics) {
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
      }
    }

    console.log('addedNewRelics', addedNewRelics)
    console.log('updatedOldRelics', updatedOldRelics)

    oldRelics.map((x) => RelicAugmenter.augment(x))
    indexRelics(oldRelics)
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

    // Updated stats for ${updatedOldRelics.length} existing relics
    // Added ${addedNewRelics.length} new relics
    if (updatedOldRelics.length) Message.success(i18next.t('importSaveTab:PartialImport.OldRelics', { count: updatedOldRelics.length }), 8)
    if (addedNewRelics.length) Message.success(i18next.t('importSaveTab:PartialImport.NewRelics', { count: addedNewRelics.length }), 8)
  },
}

export default DB

function findRelicMatch(relic: Relic, oldRelics: Relic[]) {
  // part set grade mainstat substatStats
  const oldRelicPartialHashes: Record<string, Relic[]> = {}
  for (const oldRelic of oldRelics) {
    const hash = partialHashRelic(oldRelic)
    if (!oldRelicPartialHashes[hash]) oldRelicPartialHashes[hash] = []
    oldRelicPartialHashes[hash].push(oldRelic)
  }
  const partialHash = partialHashRelic(relic)
  const partialMatches = oldRelicPartialHashes[partialHash] || []

  let match: Relic | undefined = undefined
  for (const partialMatch of partialMatches) {
    if (relic.enhance < partialMatch.enhance) continue
    if (relic.substats.length < partialMatch.substats.length) continue

    let exit = false
    let upgrades = 0
    for (let i = 0; i < partialMatch.substats.length; i++) {
      const matchSubstat = partialMatch.substats[i] as Stat
      const newSubstat = relic.substats.find((x) => x.stat == matchSubstat.stat) as Stat

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

function assignRanks(characters: Character[]) {
  for (let i = 0; i < characters.length; i++) {
    characters[i].rank = i
  }

  // This sets the rank for the current optimizer character because shuffling ranks will desync the Priority filter selector
  const optimizerMatchingCharacter = DB.getCharacterById(window.store.getState().optimizerTabFocusCharacter!)
  if (optimizerMatchingCharacter) {
    window.optimizerForm.setFieldValue('rank', optimizerMatchingCharacter.rank)
  }

  return characters
}

function hashRelic(relic: Relic) {
  const substatValues: number[] = []
  const substatStats: string[] = []

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
    mainStat: relic.main.stat,
    mainValue: Math.floor(relic.main.value),
    substatValues: substatValues, // Match to 1 decimal point
    substatStats: substatStats,
  }

  return TsUtils.objectHash(hashObject)
}

// -1: old > new, 0: old == new, 1, new > old
function compareSameTypeSubstat(oldSubstat: Stat, newSubstat: Stat) {
  let oldValue: number
  let newValue: number
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

function partialHashRelic(relic: Relic) {
  const hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    mainStat: relic.main.stat,
  }

  return TsUtils.objectHash(hashObject)
}

/**
 * Sets the provided relic in the application's state.
 */
function setRelic(relic: Relic) {
  const relicsById = window.store.getState().relicsById
  relicsById[relic.id] = relic
  window.store.getState().setRelicsById(relicsById)
}

function deduplicateStringArray(arr: string[]): string[] {
  if (arr == null) return arr

  return [...new Set(arr)]
}

function indexRelics(arr: Relic[]) {
  const length = arr.length
  for (let i = 0; i < length; i++) {
    arr[i].ageIndex = length - i - 1
  }
}
