import { IRowNode } from 'ag-grid-community'
import i18next from 'i18next'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  COMPUTE_ENGINE_GPU_STABLE,
  Constants,
  CURRENT_OPTIMIZER_VERSION,
  DEFAULT_TEAM,
  Parts,
  SubStats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { Message } from 'lib/interactions/message'
import {
  defaultTeammate,
  getDefaultForm,
} from 'lib/optimization/defaultForm'
import { ComboType } from 'lib/optimization/rotation/comboType'
import type { TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { SortOption } from 'lib/optimization/sortOptions'

import {
  DefaultSettingOptions,
  SettingOptions,
} from 'lib/overlays/drawers/SettingsDrawer'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import {
  Themes,
} from 'lib/rendering/theme'
import { oldCharacterScoringMetadata } from 'lib/scoring/oldCharacterScoringMetadata'
import { setModifiedScoringMetadata } from 'lib/scoring/scoreComparison'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  Simulation,
} from 'lib/simulations/statSimulationTypes'
import * as buildService from 'lib/services/buildService'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { getGameMetadata, setGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, getCharacters, useCharacterStore } from 'lib/stores/characterStore'
import { getRelicById, getRelics, getRelicsById, useRelicStore } from 'lib/stores/relicStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { setCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { useRelicLocatorStore } from 'lib/tabs/tabRelics/RelicLocator'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import {
  ArrayFilters,
  definedEntries,
} from 'lib/utils/arrayUtils'
import { debounceEffect } from 'lib/utils/debounceUtils'
import { gridStore } from 'lib/utils/gridStore'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  Build,
  BuildOptimizerMetadata,
  BuildTeammate,
  Character,
  CharacterId,
  SavedBuild,
} from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Form, StatFilters } from 'types/form'
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
} from 'types/store'
import { create } from 'zustand'

export enum SavedBuildSource {
  SHOWCASE = 'showcase',
  OPTIMIZER = 'optimizer',
}

export enum BasePath {
  MAIN = '/hsr-optimizer',
  BETA = '/dreary-quibbles',
}

// This string is replaced by BasePath.BETA by github actions, don't change
export const BASE_PATH: BasePath = BasePath.MAIN

export enum AppPages {
  HOME = 'HOME',

  OPTIMIZER = 'OPTIMIZER',
  CHARACTERS = 'CHARACTERS',
  RELICS = 'RELICS',
  IMPORT = 'IMPORT',

  CHANGELOG = 'CHANGELOG',
  SHOWCASE = 'SHOWCASE',
  WARP = 'WARP',
  BENCHMARKS = 'BENCHMARKS',

  WEBGPU_TEST = 'WEBGPU_TEST',
  METADATA_TEST = 'METADATA_TEST',
}

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
} as const satisfies Record<AppPages, Route>

export const RouteToPage = {
  [PageToRoute[AppPages.OPTIMIZER]]: AppPages.OPTIMIZER,
  [PageToRoute[AppPages.SHOWCASE]]: AppPages.SHOWCASE,
  [PageToRoute[AppPages.WARP]]: AppPages.WARP,
  [PageToRoute[AppPages.CHANGELOG]]: AppPages.CHANGELOG,
  [PageToRoute[AppPages.BENCHMARKS]]: AppPages.BENCHMARKS,

  [PageToRoute[AppPages.WEBGPU_TEST]]: AppPages.WEBGPU_TEST,
  [PageToRoute[AppPages.METADATA_TEST]]: AppPages.METADATA_TEST,
  [PageToRoute[AppPages.HOME]]: AppPages.HOME,
} as const satisfies Record<Route, AppPages>

// React usage
// let characterTabBlur = store(s => s.characterTabBlur);
// let setCharacterTabBlur = store(s => s.setCharacterTabBlur);

// Nonreactive usage
// store.getState().setRelicsById(relicsById)

export const savedSessionDefaults: GlobalSavedSession = {
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

export const useGlobalStore = create<HsrOptimizerStore>()((set) => ({
  version: CURRENT_OPTIMIZER_VERSION,
  colorTheme: Themes.BLUE,

  optimizerGrid: undefined,

  scoringAlgorithmFocusCharacter: undefined,
  statTracesDrawerFocusCharacter: undefined,

  activeKey: getDefaultActiveKey(),
  relicsById: {},
  relics: [],
  scoringMetadataOverrides: {},
  showcaseTeamPreferenceById: {},
  showcasePreferences: {},
  showcaseTemporaryOptionsByCharacter: {},

  savedSession: savedSessionDefaults,

  settings: DefaultSettingOptions,

  setVersion: (x) => {
    if (!x) return
    return set(() => ({ version: x }))
  },
  setActiveKey: (x) => set(() => ({ activeKey: x })),
  setScoringAlgorithmFocusCharacter: (characterId) => set(() => ({ scoringAlgorithmFocusCharacter: characterId })),
  setStatTracesDrawerFocusCharacter: (characterId) => set(() => ({ statTracesDrawerFocusCharacter: characterId })),
  setRelicsById: (relicsById) =>
    set(() => {
      const relics = Object.values(relicsById).filter(ArrayFilters.nonNullable)
      return { relicsById, relics }
    }),
  setScoringMetadataOverrides: (x) => set(() => ({ scoringMetadataOverrides: x })),
  setShowcaseTeamPreferenceById(update) {
    set((state) => ({
      showcaseTeamPreferenceById: { ...state.showcaseTeamPreferenceById, [update[0]]: update[1] },
    }))
  },
  setShowcasePreferences: (x) => set(() => ({ showcasePreferences: x })),
  setShowcaseTemporaryOptionsByCharacter: (x) => set(() => ({ showcaseTemporaryOptionsByCharacter: x })),
  setSettings: (x) => set(() => ({ settings: x })),
  setSavedSession: (x) => set(() => ({ savedSession: x })),
  setSavedSessionKey: (key, x) =>
    set((state) => ({
      savedSession: { ...state.savedSession, [key]: x },
    })),
  setColorTheme: (x) => set(() => ({ colorTheme: x })),
}))

export const DB = {
  getMetadata: (): DBMetadata => getGameMetadata(),
  setMetadata: (metadata: DBMetadata) => setGameMetadata(metadata),

  getCharacters: () => getCharacters(),
  getCharacterById: (id: CharacterId) => getCharacterById(id),

  setCharacters: (characters: Character[]) => {
    useCharacterStore.getState().setCharacters([...characters])
  },
  setCharacter: (character: Character) => {
    useCharacterStore.getState().setCharacter(character)
  },
  addCharacter: (character: Character) => {
    useCharacterStore.getState().addCharacter(character)
  },
  insertCharacter: (id: CharacterId, index: number) => {
    useCharacterStore.getState().insertCharacter(id, index)

    void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions').then(({ recalculatePermutations }) => {
      recalculatePermutations()
    })
  },

  getRelics: () => getRelics(),
  getRelicsById: () => getRelicsById(),
  setRelics: (relics: Relic[]) => {
    useRelicStore.getState().setRelics(relics)
  },
  getRelicById: (id: string | undefined) => getRelicById(id),

  setRelic: (relic: Relic) => equipmentService.upsertRelicWithEquipment(relic),

  // Mostly for debugging
  getState: () => useGlobalStore.getState(),

  getScoringMetadata: (id: CharacterId) => getScoringMetadata(id),
  updateCharacterScoreOverrides: (id: CharacterId, updated: Partial<ScoringMetadata>) => {
    useScoringStore.getState().updateCharacterOverrides(id, updated)
    SaveState.delayedSave()
  },
  updateSimulationScoreOverrides: (id: CharacterId, updatedSimulation: Partial<SimulationMetadata>) => {
    useScoringStore.getState().updateSimulationOverrides(id, updatedSimulation)
    SaveState.delayedSave()
  },
  clearSimulationScoreOverrides: (id: CharacterId) => {
    useScoringStore.getState().clearSimulationOverrides(id)
    SaveState.delayedSave()
  },

  setStore: (saveData: HsrOptimizerSaveFormat, autosave = true, sanitize = true) =>
    persistenceService.loadSaveData(saveData, autosave, sanitize),
  resetStore: () => persistenceService.resetAll(),

  replaceCharacterForm: (form: Form) => {
    const found = DB.getCharacterById(form.characterId)
    if (found) {
      found.form = {
        ...found.form,
        ...form,
      }
    }
  },

  addFromForm: (form: Form, autosave = true, select = true) => {
    const characters = DB.getCharacters()
    let found = DB.getCharacterById(form.characterId)
    if (found) {
      const index = characters.indexOf(found)
      characters[index] = { ...found, form: { ...found.form, ...form } }
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
     * TODO: after render optimization, characterGrid is possibly undefined
     * Since the grid resets the rows, we have to re-select the grid node and inform the character tab
     */
    const oldFocusCharacter = useCharacterTabStore.getState().focusCharacter
    if (gridStore.characterGridApi() && (select || !oldFocusCharacter)) {
      gridStore.characterGridApi()!.forEachNode((node: IRowNode<Character>) => {
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
    }
    const updatedCharacter = { ...character, portrait }
    DB.setCharacter(updatedCharacter)
  },

  deleteCharacterPortrait: (characterId: CharacterId) => {
    const character = DB.getCharacterById(characterId)
    if (!character) {
      console.warn('No character selected')
      return
    }
    const updatedCharacter = { ...character, portrait: undefined }
    DB.setCharacter(updatedCharacter)
  },

  saveCharacterBuild: (name: string, characterId: CharacterId, source: SavedBuildSource, overwriteExisting: boolean) =>
    buildService.saveBuild(name, characterId, source, overwriteExisting),
  deleteCharacterBuild: (characterId: CharacterId, name: string) => buildService.deleteBuild(characterId, name),
  clearCharacterBuilds: (characterId: CharacterId) => buildService.clearBuilds(characterId),
  loadCharacterBuildInOptimizer: buildService.loadBuildInOptimizer,

  unequipCharacter: (id: CharacterId) => equipmentService.unequipCharacter(id),
  removeCharacter: (characterId: CharacterId) => equipmentService.removeCharacter(characterId),
  unequipRelicById: (id: string) => equipmentService.unequipRelic(id),
  equipRelic: (relic: Relic, characterId: CharacterId | undefined, forceSwap = false) => equipmentService.equipRelic(relic, characterId, forceSwap),
  equipRelicIdsToCharacter: (relicIds: string[], characterId: CharacterId, forceSwap = false) => equipmentService.equipRelicIds(relicIds, characterId, forceSwap),
  switchRelics: (fromCharacterId: CharacterId, toCharacterId: CharacterId) => equipmentService.switchRelics(fromCharacterId, toCharacterId),
  deleteRelic: (id: string) => equipmentService.removeRelic(id),

  mergeRelicsWithState: (newRelics: Relic[], newCharacters: Form[]) =>
    persistenceService.mergeRelics(newRelics, newCharacters),
  mergePartialRelicsWithState: (newRelics?: Relic[], sourceCharacters?: { id: CharacterId }[]) =>
    persistenceService.mergePartialRelics(newRelics, sourceCharacters),
}

export default DB
