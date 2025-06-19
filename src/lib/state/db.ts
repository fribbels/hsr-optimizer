import { IRowNode } from 'ag-grid-community'
import i18next from 'i18next'
import {
  COMPUTE_ENGINE_GPU_STABLE,
  ComputeEngine,
  Constants,
  CURRENT_OPTIMIZER_VERSION,
  DEFAULT_MEMO_DISPLAY,
  DEFAULT_STAT_DISPLAY,
  Parts,
  SubStats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { Message } from 'lib/interactions/message'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import {
  DefaultSettingOptions,
  SettingOptions,
} from 'lib/overlays/drawers/SettingsDrawer'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import {
  getGlobalThemeConfigFromColorTheme,
  Themes,
} from 'lib/rendering/theme'
import { oldCharacterScoringMetadata } from 'lib/scoring/oldCharacterScoringMetadata'
import { setModifiedScoringMetadata } from 'lib/scoring/scoreComparison'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { SaveState } from 'lib/state/saveState'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { useRelicLocatorStore } from 'lib/tabs/tabRelics/RelicLocator'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import { debounceEffect } from 'lib/utils/debounceUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  Character,
  CharacterId,
} from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Form } from 'types/form'
import {
  DBMetadata,
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'
import {
  Relic,
  Stat,
} from 'types/relic'
import {
  GlobalSavedSession,
  HsrOptimizerSaveFormat,
  HsrOptimizerStore,
  UserSettings,
} from 'types/store'
import { create } from 'zustand'

export type HsrOptimizerMetadataState = {
  metadata: DBMetadata,
}

const state: HsrOptimizerMetadataState = {
  metadata: {} as DBMetadata, // generated, not saved
}

export enum BasePath {
  MAIN = '/hsr-optimizer',
  BETA = '/dreary-quibbles',
}

// This string is replaced by BasePath.BETA by github actions, don't change
export const BASE_PATH: BasePath = BasePath.MAIN

export const AppPages = {
  HOME: 'HOME',

  OPTIMIZER: 'OPTIMIZER',
  CHARACTERS: 'CHARACTERS',
  RELICS: 'RELICS',
  IMPORT: 'IMPORT',

  CHANGELOG: 'CHANGELOG',
  SHOWCASE: 'SHOWCASE',
  WARP: 'WARP',
  BENCHMARKS: 'BENCHMARKS',

  WEBGPU_TEST: 'WEBGPU_TEST',
  METADATA_TEST: 'METADATA_TEST',
} as const

export type AppPage = typeof AppPages[keyof typeof AppPages]

export type Route = `${typeof BASE_PATH}${RouteSuffix}`

type RouteSuffix = '' | '#main' | '#showcase' | '#changelog' | '#warp' | '#benchmarks' | '#webgpu' | '#metadata'

export const PageToRoute = {
  [AppPages.HOME]: BASE_PATH,

  [AppPages.OPTIMIZER]: `${BASE_PATH}#main`,
  [AppPages.CHARACTERS]: `${BASE_PATH}#main`,
  [AppPages.RELICS]: `${BASE_PATH}#main`,
  [AppPages.IMPORT]: `${BASE_PATH}#main`,

  [AppPages.SHOWCASE]: `${BASE_PATH}#showcase`,
  [AppPages.CHANGELOG]: `${BASE_PATH}#changelog`,
  [AppPages.WARP]: `${BASE_PATH}#warp`,
  [AppPages.BENCHMARKS]: `${BASE_PATH}#benchmarks`,

  [AppPages.WEBGPU_TEST]: `${BASE_PATH}#webgpu`,
  [AppPages.METADATA_TEST]: `${BASE_PATH}#metadata`,
} as const satisfies Record<AppPage, Route>

export const RouteToPage = {
  [PageToRoute[AppPages.OPTIMIZER]]: AppPages.OPTIMIZER,
  [PageToRoute[AppPages.SHOWCASE]]: AppPages.SHOWCASE,
  [PageToRoute[AppPages.WARP]]: AppPages.WARP,
  [PageToRoute[AppPages.CHANGELOG]]: AppPages.CHANGELOG,
  [PageToRoute[AppPages.BENCHMARKS]]: AppPages.BENCHMARKS,

  [PageToRoute[AppPages.WEBGPU_TEST]]: AppPages.WEBGPU_TEST,
  [PageToRoute[AppPages.METADATA_TEST]]: AppPages.METADATA_TEST,
  [PageToRoute[AppPages.HOME]]: AppPages.HOME,
} as const satisfies Record<Route, AppPage>

// React usage
// let characterTabBlur = store(s => s.characterTabBlur);
// let setCharacterTabBlur = store(s => s.setCharacterTabBlur);

// Nonreactive usage
// store.getState().setRelicsById(relicsById)

const savedSessionDefaults: GlobalSavedSession = {
  [SavedSessionKeys.optimizerCharacterId]: null,
  [SavedSessionKeys.scoringType]: ScoringType.COMBAT_SCORE,
  [SavedSessionKeys.computeEngine]: COMPUTE_ENGINE_GPU_STABLE,
  [SavedSessionKeys.showcaseStandardMode]: false,
  [SavedSessionKeys.showcaseDarkMode]: false,
  [SavedSessionKeys.showcaseUID]: true,
  [SavedSessionKeys.showcasePreciseSpd]: false,
}

function getDefaultActiveKey() {
  const pathname = TsUtils.stripTrailingSlashes(window.location.pathname)
  const page = RouteToPage[pathname + window.location.hash.split('?')[0] as Route]
  return page ?? AppPages.HOME
}

window.store = create<HsrOptimizerStore>()((set) => ({
  version: CURRENT_OPTIMIZER_VERSION,
  colorTheme: Themes.BLUE,
  globalThemeConfig: getGlobalThemeConfigFromColorTheme(Themes.BLUE),

  formValues: undefined,

  optimizerGrid: undefined,

  comboState: {} as ComboState,
  optimizerTabFocusCharacter: undefined,
  scoringAlgorithmFocusCharacter: undefined,
  statTracesDrawerFocusCharacter: undefined,
  relicsTabFocusCharacter: undefined,

  activeKey: getDefaultActiveKey(),
  permutations: 0,
  permutationsResults: 0,
  permutationsSearched: 0,
  relicsById: {},
  relics: [],
  scoringMetadataOverrides: {},
  showcasePreferences: {},
  showcaseTemporaryOptionsByCharacter: {},
  statDisplay: DEFAULT_STAT_DISPLAY,
  memoDisplay: DEFAULT_MEMO_DISPLAY,
  statSimulationDisplay: StatSimTypes.Disabled,
  statSimulations: [],
  selectedStatSimulations: [],
  optimizationInProgress: false,
  optimizationId: null,
  teammateCount: 0,
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
    initialRolls: [],
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
  optimizerSelectedRowData: null,

  setComboState: (x) => set(() => ({ comboState: x })),
  setVersion: (x) => set(() => ({ version: x })),
  setActiveKey: (x) => set(() => ({ activeKey: x })),
  setFormValues: (x) => set(() => ({ formValues: x })),
  setOptimizerTabFocusCharacter: (characterId) => set(() => ({ optimizerTabFocusCharacter: characterId })),
  setScoringAlgorithmFocusCharacter: (characterId) => set(() => ({ scoringAlgorithmFocusCharacter: characterId })),
  setStatTracesDrawerFocusCharacter: (characterId) => set(() => ({ statTracesDrawerFocusCharacter: characterId })),
  setRelicsTabFocusCharacter: (characterId) => set(() => ({ relicsTabFocusCharacter: characterId })),
  setPermutationDetails: (x) => set(() => ({ permutationDetails: x })),
  setPermutations: (x) => set(() => ({ permutations: x })),
  setPermutationsResults: (x) => set(() => ({ permutationsResults: x })),
  setPermutationsSearched: (x) => set(() => ({ permutationsSearched: x })),
  setRelicsById: (relicsById) =>
    set(() => {
      const relics = Object.values(relicsById).filter(ArrayFilters.nonNullable)
      return { relicsById, relics }
    }),
  setRelicTabFilters: (x) => set(() => ({ relicTabFilters: x })),
  setScoringMetadataOverrides: (x) => set(() => ({ scoringMetadataOverrides: x })),
  setShowcasePreferences: (x) => set(() => ({ showcasePreferences: x })),
  setShowcaseTemporaryOptionsByCharacter: (x) => set(() => ({ showcaseTemporaryOptionsByCharacter: x })),
  setStatDisplay: (x) => set(() => ({ statDisplay: x })),
  setMemoDisplay: (x) => set(() => ({ memoDisplay: x })),
  setStatSimulationDisplay: (x) => set(() => ({ statSimulationDisplay: x })),
  setStatSimulations: (x) => set(() => ({ statSimulations: Utils.clone(x) })),
  setSelectedStatSimulations: (x) => set(() => ({ selectedStatSimulations: x })),
  setOptimizerMenuState: (x) => set(() => ({ optimizerMenuState: x })),
  setOptimizationInProgress: (x) => set(() => ({ optimizationInProgress: x })),
  setOptimizationId: (x) => set(() => ({ optimizationId: x })),
  setOptimizerStartTime: (x) => set(() => ({ optimizerStartTime: x })),
  setOptimizerRunningEngine: (x) => set(() => ({ optimizerRunningEngine: x })),
  setOptimizerEndTime: (x) => set(() => ({ optimizerEndTime: x })),
  setTeammateCount: (x) => set(() => ({ teammateCount: x })),
  setOptimizerFormCharacterEidolon: (x) => set(() => ({ optimizerFormCharacterEidolon: x })),
  setOptimizerFormSelectedLightCone: (x) => set(() => ({ optimizerFormSelectedLightCone: x })),
  setOptimizerFormSelectedLightConeSuperimposition: (x) => set(() => ({ optimizerFormSelectedLightConeSuperimposition: x })),
  setOptimizerTabFocusCharacterSelectModalOpen: (x) => set(() => ({ optimizerTabFocusCharacterSelectModalOpen: x })),
  setExcludedRelicPotentialCharacters: (x) => set(() => ({ excludedRelicPotentialCharacters: x })),
  setSettings: (x) => set(() => ({ settings: x })),
  setSavedSession: (x) => set(() => ({ savedSession: x })),
  setSavedSessionKey: (key, x) =>
    set((state) => ({
      savedSession: { ...state.savedSession, [key]: x },
    })),
  setColorTheme: (x) => set(() => ({ colorTheme: x })),
  setOptimizerBuild: (x) => set(() => ({ optimizerBuild: x })),
  setOptimizerSelectedRowData: (x) => set(() => ({ optimizerSelectedRowData: x })),
  setGlobalThemeConfig: (x) => set(() => ({ globalThemeConfig: x })),
}))

export const DB = {
  getMetadata: (): DBMetadata => state.metadata,
  setMetadata: (metadata: DBMetadata) => state.metadata = metadata,

  getCharacters: () => useCharacterTabStore.getState().characters,
  getCharacterById: (id: CharacterId) => useCharacterTabStore.getState().charactersById[id],

  setCharacters: (characters: Character[]) => {
    assignRanks(characters)
    useCharacterTabStore.getState().setCharacters([...characters])
  },
  setCharacter: (character: Character) => {
    useCharacterTabStore.getState().setCharacter(character)
  },
  addCharacter: (character: Character) => {
    const characters = DB.getCharacters()
    characters.push(character)
    DB.setCharacters(characters)
  },
  insertCharacter: (id: CharacterId, index: number) => {
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

    window.onOptimizerFormValuesChange({} as Form, OptimizerTabController.getForm())
  },

  getRelics: () => window.store.getState().relics,
  getRelicsById: () => window.store.getState().relicsById,
  setRelics: (relics: Relic[]) => {
    const relicsById = relics.reduce((relicsById, relic) => {
      relicsById[relic.id] = relic
      return relicsById
    }, {} as Record<string, Relic>)
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

  getScoringMetadata: (id: CharacterId) => {
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

    for (const stat of SubStats) {
      // eslint-disable-next-line
      if (returnScoringMetadata.stats[stat] == null) {
        returnScoringMetadata.stats[stat] = 0
      }
    }

    setModifiedScoringMetadata(defaultScoringMetadata, returnScoringMetadata)

    // We don't want to carry over presets, use the optimizer defined ones
    // TODO: What does this do
    // @ts-ignore
    delete returnScoringMetadata.presets

    return returnScoringMetadata
  },
  updateCharacterScoreOverrides: (id: CharacterId, updated: ScoringMetadata) => {
    let overrides = window.store.getState().scoringMetadataOverrides
    overrides = { ...overrides, [id]: { ...overrides[id], ...updated } }

    const defaultScoringMetadata = DB.getMetadata().characters[id].scoringMetadata

    setModifiedScoringMetadata(defaultScoringMetadata, overrides[id]!)

    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.delayedSave()
  },
  updateSimulationScoreOverrides: (id: CharacterId, updatedSimulation: SimulationMetadata) => {
    if (!updatedSimulation) return

    let overrides = window.store.getState().scoringMetadataOverrides
    overrides = { ...overrides, [id]: { ...overrides[id], simulation: updatedSimulation } }
    window.store.getState().setScoringMetadataOverrides(overrides)

    SaveState.delayedSave()
  },

  setStore: (saveData: HsrOptimizerSaveFormat, autosave = true) => {
    const charactersById: Record<string, Character> = {}
    const dbCharacters = DB.getMetadata().characters

    // Remove invalid characters
    saveData.characters = saveData.characters.filter((x) => dbCharacters[x.id])

    for (const character of saveData.characters) {
      character.equipped = {}
      charactersById[character.id] = character

      // Previously sim requests didn't use the stats field
      if (character.form?.statSim?.simulations) {
        character.form.statSim.simulations = character.form.statSim.simulations.filter((simulation: Simulation) => simulation.request?.stats)
      }

      // Previously characters had customizable options, now we're defaulting to 80s
      character.form.characterLevel = 80
      character.form.lightConeLevel = 80

      // Previously there was a weight sort which is now removed, arbitrarily replaced with SPD if the user had used it
      // @ts-ignore
      if (character.form.resultSort === 'WEIGHT') {
        character.form.resultSort = 'SPD'
      }

      // Deduplicate main stat filter values
      character.form.mainBody = deduplicateStringArray(character.form.mainBody)
      character.form.mainFeet = deduplicateStringArray(character.form.mainFeet)
      character.form.mainPlanarSphere = deduplicateStringArray(character.form.mainPlanarSphere)
      character.form.mainLinkRope = deduplicateStringArray(character.form.mainLinkRope)
    }

    for (const character of Object.values(dbCharacters)) {
      // Deduplicate scoring optimal main stat
      for (const part of Object.keys(Constants.Parts) as Parts[]) {
        if (part === Parts.Hands || part === Parts.Head) continue
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
      for (const [key, value] of Object.entries(saveData.scoringMetadataOverrides) as [CharacterId, unknown][]) {
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
            if (Utils.nullUndefinedToZero(scoringMetadataOverrides.stats[stat as SubStats]) != Utils.nullUndefinedToZero(oldScoringMetadataStats[stat])) {
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
            for (const stat of Constants.SubStats) {
              const weight = scoringMetadataOverrides.stats[stat]
              if (Utils.nullUndefinedToZero(weight) != Utils.nullUndefinedToZero(defaultScoringMetadata.stats[stat])) {
                statWeightsModified = true
              }
              if (weight < 0) scoringMetadataOverrides.stats[stat] = 0
              if (weight > 1) scoringMetadataOverrides.stats[stat] = 1
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

    useWarpCalculatorStore.getState().setRequest(saveData.warpRequest)

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
      if (saveData.savedSession.global) {
        const session = saveData.savedSession.global
        const optimizerCharacterId = session.optimizerCharacterId
        if (optimizerCharacterId && !dbCharacters[optimizerCharacterId]) {
          session.optimizerCharacterId = null
        }
        // When new session items are added, set user's save to the default
        const overiddenSavedSessionDefaults: GlobalSavedSession = { ...savedSessionDefaults, ...session }

        window.store.getState().setSavedSession(overiddenSavedSessionDefaults)
      }

      if (saveData.savedSession.showcaseTab) { // Set showcase tab state
        useShowcaseTabStore.getState().setSavedSession(saveData.savedSession.showcaseTab)
      }
    }

    if (saveData.settings) {
      window.store.getState().setSettings(saveData.settings)
    }

    // Set relics tab state
    window.store.getState().setExcludedRelicPotentialCharacters(saveData.excludedRelicPotentialCharacters || [])
    window.store.getState().setVersion(saveData.version)
    useRelicLocatorStore.getState().setInventoryWidth(saveData.relicLocator?.inventoryWidth)
    useRelicLocatorStore.getState().setRowLimit(saveData.relicLocator?.rowLimit)

    assignRanks(saveData.characters)
    DB.setRelics(saveData.relics)
    DB.setCharacters(saveData.characters)

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
      window.characterGrid.current.api.forEachNode((node: IRowNode<Character>) => {
        if (node.data?.id == found.id) node.setSelected(true)
      })
      useCharacterTabStore.getState().setFocusCharacter(found.id)
    }

    if (autosave) {
      SaveState.delayedSave()
    }

    return found
  },

  saveCharacterPortrait: (characterId: CharacterId, portrait: CustomImageConfig) => {
    let character = DB.getCharacterById(characterId)
    if (!character) {
      DB.addFromForm({ characterId: characterId } as Form)
      character = DB.getCharacterById(characterId)!
      console.log('Character did not previously exist, adding', character)
    }
    const updatedCharacter = { ...character, portrait }
    DB.setCharacter(updatedCharacter)
    console.log('Saved portrait', DB.getState())
  },

  deleteCharacterPortrait: (characterId: CharacterId) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }
    const updatedCharacter = { ...character, portrait: undefined }
    DB.setCharacter(updatedCharacter)
    console.log('Deleted portrait', DB.getState())
  },

  saveCharacterBuild: (name: string, characterId: CharacterId, score: {
    rating: string,
    score: string,
  }) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }

    let build = character.builds?.find((x) => x.name == name)?.build
    if (build) {
      const errorMessage = i18next.t('charactersTab:Messages.BuildAlreadyExists', { name })
      console.warn(errorMessage)
      return { error: errorMessage }
    } else {
      build = Object.values(character.equipped)
      const builds = character.builds ?? []
      builds.push({ name, build, score })

      const updatedCharacter = { ...character, builds: [...builds] }
      DB.setCharacter(updatedCharacter)
      console.log('Saved build', build, useCharacterTabStore.getState())
    }
  },

  deleteCharacterBuild: (characterId: CharacterId, name: string) => {
    const character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to delete build for')

    const updatedCharacter = { ...character, builds: character.builds.filter((x) => x.name != name) }
    DB.setCharacter(updatedCharacter)
  },

  clearCharacterBuilds: (characterId: CharacterId) => {
    const character = DB.getCharacterById(characterId)
    if (!character) return console.warn('No character to clear builds for')

    const updatedCharacter = { ...character, builds: [] }
    DB.setCharacter(updatedCharacter)
  },

  unequipCharacter: (id: CharacterId) => {
    let character = DB.getCharacterById(id)
    if (!character) return console.warn('No character to unequip')

    console.log('Unequipping character', id, character)

    for (const part of Object.values(Constants.Parts)) {
      const equippedId = character.equipped[part]
      if (!equippedId) continue

      const relicMatch = DB.getRelicById(equippedId)

      character = { ...character, equipped: { ...character.equipped, [part]: undefined } }

      if (relicMatch) {
        const relic = { ...relicMatch, equippedBy: undefined }
        setRelic(relic)
      }
    }
    DB.setCharacter(character)
  },

  removeCharacter: (characterId: CharacterId) => {
    DB.unequipCharacter(characterId)
    let characters = DB.getCharacters()
    characters = characters.filter((x) => x.id != characterId)
    DB.setCharacters(characters)
  },

  unequipRelicById: (id: string) => {
    if (!id) return console.warn('No relic')
    const relic = DB.getRelicById(id)
    if (!relic) return console.warn('No relic')

    console.log('UNEQUIP RELIC')

    const characters = DB.getCharacters()
      .map((c) => {
        if (c.equipped?.[relic.part] && c.equipped[relic.part] == relic.id) {
          return { ...c, equipped: { ...c.equipped, [relic.part]: undefined } }
        }
        return c
      })
    DB.setCharacters(characters)

    const newRelic = { ...relic, equippedBy: undefined }
    setRelic(newRelic)
  },

  /**
   * Equips the specified relic to the character identified by `characterId`.
   *
   * If the character already has a relic equipped, the relics are swapped.
   */
  equipRelic: (relic: Relic, characterId: CharacterId | undefined, forceSwap = false) => {
    if (!relic?.id) return console.warn('No relic')
    if (!characterId) return console.warn('No character')
    relic = DB.getRelicById(relic.id)!

    const prevOwnerId = relic.equippedBy
    const prevCharacter = DB.getCharacterById(prevOwnerId!)
    const character = DB.getCharacterById(characterId)!
    const prevRelic = DB.getRelicById(character.equipped[relic.part]!)
    let updatedPrevCharacter: Character

    if (prevRelic) {
      DB.unequipRelicById(prevRelic.id)
    }

    const swap = forceSwap
      || DB.getState().settings[SettingOptions.RelicEquippingBehavior.name] == SettingOptions.RelicEquippingBehavior.Swap

    // only re-equip prevRelic if it would go to a different character
    if (prevOwnerId !== characterId && prevCharacter) {
      if (prevRelic && swap) {
        updatedPrevCharacter = { ...prevCharacter, equipped: { ...prevCharacter.equipped, [relic.part]: prevRelic.id } }

        const updatedPrevRelic = { ...prevRelic, equippedBy: prevCharacter.id }
        setRelic(updatedPrevRelic)
      } else {
        updatedPrevCharacter = { ...prevCharacter, equipped: { ...prevCharacter.equipped, [relic.part]: undefined } }
        prevCharacter.equipped[relic.part] = undefined
      }
      DB.setCharacter(updatedPrevCharacter)
    }

    const updatedCharacter = { ...character, equipped: { ...character.equipped, [relic.part]: relic.id } }
    DB.setCharacter(updatedCharacter)
    const newRelic = { ...relic, equippedBy: character.id }
    setRelic(newRelic)

    debounceEffect('refreshRelics', 500, () => window.relicsGrid?.current?.api.refreshCells())
  },

  equipRelicIdsToCharacter: (relicIds: string[], characterId: CharacterId, forceSwap = false) => {
    if (!characterId) return console.warn('No characterId to equip to')
    console.log('Equipping relics to character', relicIds, characterId)

    for (const relicId of relicIds) {
      DB.equipRelic({ id: relicId } as Relic, characterId, forceSwap)
    }
  },

  switchRelics: (fromCharacterId: CharacterId, toCharacterId: CharacterId) => {
    if (!fromCharacterId) return console.warn('No characterId to equip from')
    if (!toCharacterId) return console.warn('No characterId to equip to')
    console.log(`Switching relics from character ${fromCharacterId} to character ${toCharacterId}`)

    const fromCharacter = DB.getCharacterById(fromCharacterId)!
    DB.equipRelicIdsToCharacter(Object.values(fromCharacter.equipped), toCharacterId, true)
  },

  deleteRelic: (id: string) => {
    if (!id) return Message.error(i18next.t('relicsTab:Messages.UnableToDeleteRelic'))
    DB.unequipRelicById(id)
    const relicsById = window.store.getState().relicsById
    delete relicsById[id]
    window.store.getState().setRelicsById({ ...relicsById })

    // This refreshes the grid for the character equipped relics color coding
    if (window.characterGrid?.current?.api) {
      window.characterGrid.current.api.redrawRows()
    }
  },

  // These relics may be missing speed decimals depending on the importer.\
  // We overwrite any existing relics with imported ones.
  mergeRelicsWithState: (newRelics: Relic[], newCharacters: Form[]) => {
    const oldRelics = DB.getRelics()
    newRelics = TsUtils.clone(newRelics) ?? []
    newCharacters = TsUtils.clone(newCharacters) ?? []

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
      let found = oldRelicHashes[hash]
      let stableRelicId: string
      if (found) {
        if (newRelic.verified) {
          // Inherit the new verified speed stats
          found = {
            ...found,
            verified: true,
            substats: newRelic.substats,
            augmentedStats: newRelic.augmentedStats,
          }
        }

        if (newRelic.equippedBy && newCharacters.length) {
          // Update the owner of the existing relic with the newly imported owner
          found = { ...found, equippedBy: newRelic.equippedBy }
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
        const idx = characters.findIndex((x) => x.id == newRelic.equippedBy)
        if (idx >= 0) {
          characters[idx] = { ...characters[idx], equipped: { ...characters[idx].equipped, [newRelic.part]: stableRelicId } }
        } else {
          console.log('No character to equip relic to', newRelic)
        }
      }
    }

    indexRelics(replacementRelics)

    console.log('Replacement relics', replacementRelics)

    DB.setRelics(replacementRelics)

    // Clean up any deleted relic ids that are still equipped
    characters.forEach((char, idx, arr) => {
      for (const part of Object.values(Constants.Parts)) {
        if (char.equipped?.[part] && !DB.getRelicById(char.equipped[part])) {
          arr[idx] = { ...char, equipped: { ...char.equipped, [part]: undefined } }
        }
      }
    })
    DB.setCharacters(characters)

    // Clean up relics that are double equipped
    const relics = DB.getRelics().map((r) => {
      if (!r.equippedBy) return r
      const wearer = DB.getCharacterById(r.equippedBy)
      if (!wearer || wearer.equipped[r.part] != r.id) {
        return { ...r, equippedBy: undefined }
      }
      return r
    })
    DB.setRelics(relics)

    // Clean up characters who have relics equipped by someone else, or characters that don't exist ingame yet
    const cleanedCharacters = DB.getCharacters().map((c) => {
      let newC = c
      for (const part of Object.keys(c.equipped) as Parts[]) {
        const relicId = c.equipped[part]
        if (relicId) {
          const relic = DB.getRelicById(relicId)
          if (!relic || relic.equippedBy != c.id) {
            newC = { ...newC, equipped: { ...newC.equipped, [part]: undefined } }
          }
        }
      }
      return newC
    })
    DB.setCharacters(cleanedCharacters)

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
  mergePartialRelicsWithState: (newRelics: Relic[] = [], sourceCharacters: { id: CharacterId }[] = []) => {
    const oldRelics = TsUtils.clone(DB.getRelics()) || []
    newRelics = TsUtils.clone(newRelics)

    // Tracking these for debug / messaging
    const updatedOldRelics: Relic[] = []
    const addedNewRelics: Relic[] = []
    const equipUpdates: {
      relic: Relic,
      equippedBy: CharacterId | undefined,
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
    characters[i] = { ...characters[i], rank: i }
  }

  // This sets the rank for the current optimizer character because shuffling ranks will desync the Priority filter selector
  const optimizerCharacterRank = characters.findIndex((c) => c.id == window.store.getState().optimizerTabFocusCharacter!)
  if (optimizerCharacterRank >= 0) {
    window.optimizerForm.setFieldValue('rank', optimizerCharacterRank)
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
  const relicsById = { ...window.store.getState().relicsById, [relic.id]: relic }
  window.store.getState().setRelicsById(relicsById)
}

function deduplicateStringArray<T extends string[] | null | undefined>(arr: T) {
  if (arr == null) return arr

  return [...new Set(arr)] as T
}

function indexRelics(relics: Relic[]) {
  relics.forEach((r, idx, relics) => {
    relics[idx] = { ...r, ageIndex: relics.length - idx - 1 }
  })
}
