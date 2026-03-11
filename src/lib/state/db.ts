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

  setStore: (saveData: HsrOptimizerSaveFormat, autosave = true, sanitize = true) => {
    const charactersById: Record<string, Character> = {}
    const dbCharacters = DB.getMetadata().characters

    // Remove invalid characters
    saveData.characters = saveData.characters.filter((x) => dbCharacters[x.id])

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

      useScoringStore.getState().setScoringMetadataOverrides(saveData.scoringMetadataOverrides || {})
    }

    const relicsById = new Map(saveData.relics.map((r) => [r.id, r]))

    // Initialize characters: migrate form fields and build format
    for (const character of saveData.characters) {
      character.equipped = {}
      charactersById[character.id] = character
      migrateCharacterForm(character, dbCharacters)

      // TODO: Temporary migration from old to new format, remove once appropriate
      const scoringMetadata = DB.getScoringMetadata(character.id)
      character.builds = character.builds?.map((savedBuild) => {
        if (savedBuild.optimizerMetadata !== undefined) return savedBuild
        const build = savedBuild as unknown as { build: string[], name: string, score: { score: string, rating: string } }
        const migratedBuild: SavedBuild = {
          characterId: character.id,
          eidolon: character.form.characterEidolon,
          lightConeId: character.form.lightCone,
          superimposition: character.form.lightConeSuperimposition,
          name: build.name,
          equipped: build.build.reduce((acc, cur) => {
            const relic = relicsById.get(cur)
            if (relic) acc[relic.part] = cur
            return acc
          }, {} as Build),
          team: scoringMetadata.simulation?.teammates.map((x) => ({
            characterId: x.characterId,
            eidolon: x.characterEidolon,
            lightConeId: x.lightCone,
            superimposition: x.lightConeSuperimposition,
            relicSet: x.teamRelicSet,
            ornamentSet: x.teamOrnamentSet,
          })) ?? [],
          optimizerMetadata: null,
          deprioritizeBuffs: scoringMetadata.simulation?.deprioritizeBuffs ?? false,
        }
        return migratedBuild
      }) ?? []
    }

    deduplicateDbCharacterScoringParts(dbCharacters)
    processRelics(saveData.relics, charactersById)

    if (saveData.showcasePreferences) {
      useGlobalStore.getState().setShowcasePreferences(saveData.showcasePreferences || {})
    }

    useWarpCalculatorStore.getState().setRequest(saveData.warpRequest)

    if (saveData.optimizerMenuState) {
      const menuState = useOptimizerDisplayStore.getState().menuState
      for (const key of Object.values(OptimizerMenuIds)) {
        if (saveData.optimizerMenuState[key] != null) {
          menuState[key] = saveData.optimizerMenuState[key]
        }
      }
      useOptimizerDisplayStore.getState().setMenuState(menuState)
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

        useGlobalStore.getState().setSavedSession(overiddenSavedSessionDefaults)
      }

      if (saveData.savedSession.showcaseTab) { // Set showcase tab state
        useShowcaseTabStore.getState().setSavedSession(saveData.savedSession.showcaseTab)
      }
    }

    if (saveData.settings) {
      useGlobalStore.getState().setSettings(saveData.settings)
    }

    // Set relics tab state
    useRelicsTabStore.getState().setExcludedRelicPotentialCharacters(saveData.excludedRelicPotentialCharacters || [])

    useGlobalStore.getState().setVersion(saveData.version)

    useRelicLocatorStore.getState().setInventoryWidth(saveData.relicLocator?.inventoryWidth)
    useRelicLocatorStore.getState().setRowLimit(saveData.relicLocator?.rowLimit)

    // Restore scanner settings if they exist
    if (saveData.scannerSettings) {
      const scannerState = useScannerState.getState()
      scannerState.setIngest(saveData.scannerSettings.ingest)
      scannerState.setIngestCharacters(saveData.scannerSettings.ingestCharacters)
      scannerState.setIngestWarpResources(saveData.scannerSettings.ingestWarpResources)

      // For security, don't restore the websocket url if we're sanitizing (manual load)
      if (!sanitize && saveData.scannerSettings.customUrl) {
        scannerState.setWebsocketUrl(saveData.scannerSettings.websocketUrl)
      }
    }

    DB.setRelics(saveData.relics)
    DB.setCharacters(saveData.characters)

    if (autosave) {
      SaveState.delayedSave()
    }
  },
  resetStore: () => {
    const saveFormat: HsrOptimizerSaveFormat = {
      relics: [],
      characters: [],
    }
    DB.setStore(saveFormat)
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

  // These relics may be missing speed decimals depending on the importer.\
  // We overwrite any existing relics with imported ones.
  mergeRelicsWithState: (newRelics: Relic[], newCharacters: Form[]) => {
    const oldRelics = DB.getRelics()
    newRelics = TsUtils.clone(newRelics) ?? []
    newCharacters = TsUtils.clone(newCharacters) ?? []

    // console.log('Merging relics', newRelics, newCharacters)

    // Add new characters
    if (newCharacters) {
      for (const character of newCharacters) {
        DB.addFromForm(character, false, false)
      }
    }

    const characters = DB.getCharacters()

    // Generate a hash of existing relics for easy lookup
    const oldRelicHashes: Record<string, Relic> = {}
    for (const oldRelic of oldRelics) {
      const hash = hashRelic(oldRelic)
      oldRelicHashes[hash] = oldRelic
    }

    // Track relic ID changes for updating references
    const relicIdMapping: Record<string, string> = {} // oldId -> newId

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
          // Track the ID change if it will occur
          if (found.id !== newRelic.id) {
            relicIdMapping[found.id] = newRelic.id
          }

          // Inherit the new verified speed stats
          found = {
            ...found,
            id: newRelic.id,
            verified: true,
            substats: newRelic.substats,
            previewSubstats: newRelic.previewSubstats,
            augmentedStats: newRelic.augmentedStats,
          }
        }

        if (newRelic.equippedBy && newCharacters.length) {
          // Update the owner of the existing relic with the newly imported owner
          found = { ...found, equippedBy: newRelic.equippedBy }
          newRelic = found
        }

        if (newRelic.ageIndex !== undefined) {
          found.ageIndex = newRelic.ageIndex
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
          console.warn('No character to equip relic to', newRelic)
        }
      }
    }

    // Update all relic ID references in character equipment and saved builds
    if (Object.keys(relicIdMapping).length > 0) {
      // console.log('Updating relic ID references', relicIdMapping)

      characters.forEach((character, idx, characters) => {
        let newEquipped
        // Update equipped relic IDs
        for (const part of Object.values(Constants.Parts)) {
          const equippedId = character.equipped?.[part]
          if (equippedId && relicIdMapping[equippedId]) {
            newEquipped = { ...character.equipped, [part]: relicIdMapping[equippedId] }
          }
        }

        let newSavedBuilds
        // Update saved builds relic IDs
        if (character.builds && character.builds.length > 0) {
          newSavedBuilds = character.builds.map((savedBuild) => {
            const updatedBuild = savedBuild
            ;(Object.entries(savedBuild.equipped) as Array<[Parts, string | undefined]>).forEach(([part, id]) => {
              if (!id) return
              updatedBuild.equipped[part] = relicIdMapping[id] || id
            })

            return { ...savedBuild, build: updatedBuild }
          })
        }
        characters[idx] = { ...character, equipped: newEquipped ?? character.equipped, builds: newSavedBuilds ?? character.builds }
      })
    }

    indexRelics(replacementRelics)

    // console.log('Replacement relics', replacementRelics)

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

    void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions').then(({ recalculatePermutations }) => {
      recalculatePermutations()
    })
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
        match.previewSubstats = newRelic.previewSubstats
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

    oldRelics.map((x) => RelicAugmenter.augment(x))
    indexRelics(oldRelics)
    DB.setRelics(oldRelics)

    for (const equipUpdate of equipUpdates) {
      if (sourceCharacters.find((character) => character.id == equipUpdate.equippedBy)) {
        DB.equipRelic(equipUpdate.relic, equipUpdate.equippedBy)
      }
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

function deduplicateStringArray<T extends string[] | null | undefined>(arr: T) {
  if (arr == null) return arr

  return [...new Set(arr)] as T
}

/**
 * Shared character form migration logic used by setStore.
 * Migrates form fields, validates resultSort, and deduplicates main stat filters.
 */
function migrateCharacterForm(character: Character, dbCharacters: DBMetadata['characters']) {
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

  // Validate that the saved resultSort is a valid sort option, otherwise reset to default
  if (!character.form.resultSort || !(character.form.resultSort in SortOption)) {
    const scoringMetadata = dbCharacters[character.id]?.scoringMetadata
    character.form.resultSort = scoringMetadata?.simulation
      ? SortOption.COMBO.key
      : scoringMetadata?.sortOption.key
  }

  // Deduplicate main stat filter values
  character.form.mainBody = deduplicateStringArray(character.form.mainBody)
  character.form.mainFeet = deduplicateStringArray(character.form.mainFeet)
  character.form.mainPlanarSphere = deduplicateStringArray(character.form.mainPlanarSphere)
  character.form.mainLinkRope = deduplicateStringArray(character.form.mainLinkRope)
}

/**
 * Deduplicates scoring optimal main stats for all db characters.
 */
function deduplicateDbCharacterScoringParts(dbCharacters: DBMetadata['characters']) {
  for (const character of Object.values(dbCharacters)) {
    for (const part of Object.keys(Constants.Parts) as Parts[]) {
      if (part === Parts.Hands || part === Parts.Head) continue
      character.scoringMetadata.parts[part] = deduplicateStringArray(character.scoringMetadata.parts[part])
    }
  }
}

/**
 * Processes relics: augments, equips to characters, and indexes.
 */
function processRelics(
  relics: Relic[],
  charactersById: Record<string, Character>,
) {
  for (const relic of relics) {
    // @ts-ignore temporary while migrating relic object format
    delete relic.weights
    RelicAugmenter.augment(relic)
    const character = charactersById[relic.equippedBy!]
    if (character && !character.equipped[relic.part]) {
      character.equipped[relic.part] = relic.id
    } else {
      relic.equippedBy = undefined
    }
  }
  indexRelics(relics)
}

function indexRelics(relics: Relic[]) {
  relics.forEach((r, idx, relics) => {
    if (r.ageIndex) return
    relics[idx] = { ...r, ageIndex: idx === 0 ? 0 : relics[idx - 1].ageIndex! + 1 }
  })
}

// Dead code below — loadCharacterBuildInOptimizer moved to buildService.ts
// Keeping only utility functions still used by setStore/merge methods
function _DEAD_loadCharacterBuildInOptimizer(arg1: CharacterId | SavedBuild, buildIndex?: number) {
  const characterId = typeof arg1 === 'string' ? arg1 : arg1.characterId
  const build = typeof arg1 === 'string' ? DB.getCharacterById(characterId)?.builds?.[buildIndex!] : arg1

  if (!build) {
    console.error(`attempted to load build ${buildIndex} into optimizer for character ${characterId} but build does not exist`)
    return
  }
  if (build.characterId !== characterId) {
    console.error(`attempted to load build`, build, `for character ${characterId} but characterIds do not match`)
    return
  }

  const meta = build.optimizerMetadata
  const metadata = DB.getMetadata()

  // Set the character first (sets focus + characterId in store)
  setCharacter(characterId)

  // Build teammate states
  const teammateIndices = [0, 1, 2] as const
  const teammateStates = teammateIndices.map((i) => {
    const teammate = build.team[i] as BuildTeammate | undefined
    if (!teammate) {
      return defaultTeammate() as TeammateState
    }

    let characterConditionals: Record<string, unknown> = {}
    let lightConeConditionals: Record<string, unknown> = {}

    if (!meta) {
      // No saved conditionals - try to preserve conditionals from the DB form for the same teammate character
      const dbCharForm = DB.getCharacterById(characterId)?.form
      const dbTeammates = [dbCharForm?.teammate0, dbCharForm?.teammate1, dbCharForm?.teammate2]
      const matchingDbTeammate = dbTeammates.find((t) => t?.characterId === teammate.characterId && t?.lightCone === teammate.lightConeId)

      if (matchingDbTeammate) {
        characterConditionals = matchingDbTeammate.characterConditionals ?? {}
        lightConeConditionals = matchingDbTeammate.lightConeConditionals ?? {}
      } else {
        const lightConePath = metadata.lightCones[teammate.lightConeId].path
        const path = metadata.characters[teammate.characterId].path
        const element = metadata.characters[teammate.characterId].element

        characterConditionals = CharacterConditionalsResolver
          .get({ characterId: teammate.characterId, characterEidolon: teammate.eidolon })
          .defaults()

        lightConeConditionals = LightConeConditionalsResolver
          .get({
            lightCone: teammate.lightConeId,
            lightConeSuperimposition: teammate.superimposition,
            lightConePath,
            path,
            element,
            characterId: teammate.characterId,
          })
          .defaults()
      }
    }

    return {
      characterId: teammate.characterId,
      characterEidolon: teammate.eidolon,
      lightCone: teammate.lightConeId,
      lightConeSuperimposition: teammate.superimposition,
      teamOrnamentSet: teammate.ornamentSet,
      teamRelicSet: teammate.relicSet,
      characterConditionals,
      lightConeConditionals,
    } as TeammateState
  }) as [TeammateState, TeammateState, TeammateState]

  // Build store state patch
  const patch: Record<string, unknown> = {
    characterEidolon: build.eidolon,
    lightCone: build.lightConeId,
    lightConeSuperimposition: build.superimposition,
    deprioritizeBuffs: build.deprioritizeBuffs,
    teammates: teammateStates,
  }

  if (!meta) {
    const dbCharForm = DB.getCharacterById(characterId)!.form
    patch.comboType = ComboType.SIMPLE
    patch.comboPreprocessor = true
    patch.comboStateJson = '{}'
    patch.setConditionals = TsUtils.clone(dbCharForm.setConditionals)
    patch.relicSets = TsUtils.clone(dbCharForm.relicSets)
    patch.ornamentSets = TsUtils.clone(dbCharForm.ornamentSets)
    // Reset stat filters to empty (undefined values)
    patch.statFilters = {
      minAtk: undefined, maxAtk: undefined, minHp: undefined, maxHp: undefined,
      minDef: undefined, maxDef: undefined, minSpd: undefined, maxSpd: undefined,
      minCr: undefined, maxCr: undefined, minCd: undefined, maxCd: undefined,
      minEhr: undefined, maxEhr: undefined, minRes: undefined, maxRes: undefined,
      minBe: undefined, maxBe: undefined, minErr: undefined, maxErr: undefined,
    }
  } else {
    if (meta.comboStateJson) {
      patch.comboType = ComboType.ADVANCED
      patch.comboPreprocessor = meta.presets
      patch.comboStateJson = TsUtils.clone(meta.comboStateJson)
    } else {
      patch.comboType = ComboType.SIMPLE
    }
    if (meta.statFilters) {
      // statFilters from meta are in internal format (flat keys on form) — convert to display
      patch.statFilters = TsUtils.clone(meta.statFilters)
    }
    patch.relicSets = TsUtils.clone(meta.setFilters.relics)
    patch.ornamentSets = TsUtils.clone(meta.setFilters.ornaments)
    patch.setConditionals = TsUtils.clone(meta.setConditionals)

    // Apply saved conditionals
    definedEntries(meta.conditionals)
      .forEach(([id, conditionalValueMap]) => {
        if (id === build.characterId) {
          patch.characterConditionals = TsUtils.clone(conditionalValueMap)
          return
        }
        if (id === build.lightConeId) {
          patch.lightConeConditionals = TsUtils.clone(conditionalValueMap)
          return
        }

        let teammateIdx = build.team.findIndex((x) => x.characterId === id)
        switch (teammateIdx) {
          case 0:
          case 1:
          case 2:
            teammateStates[teammateIdx] = {
              ...teammateStates[teammateIdx],
              characterConditionals: TsUtils.clone(conditionalValueMap),
            }
            return
          default:
            break
        }

        teammateIdx = build.team.findIndex((x) => x.lightConeId === id)
        switch (teammateIdx) {
          case 0:
          case 1:
          case 2:
            teammateStates[teammateIdx] = {
              ...teammateStates[teammateIdx],
              lightConeConditionals: TsUtils.clone(conditionalValueMap),
            }
            return
          default:
            break
        }

        console.error('Found orphaned conditional while loading build')
      })
  }

  // Apply all overrides to store at once, then navigate.
  // Await the dynamic import so setState completes before page navigation.
  void import('lib/stores/optimizerForm/useOptimizerRequestStore').then(({ useOptimizerRequestStore }) => {
    useOptimizerRequestStore.setState(patch)

    useGlobalStore.getState().setActiveKey(AppPages.OPTIMIZER)
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, characterId)
    SaveState.delayedSave()
  })
}
