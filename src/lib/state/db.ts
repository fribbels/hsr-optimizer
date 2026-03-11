/**
 * DB facade — re-exports from domain stores, services, and constants.
 * All logic has been extracted. This file exists for backward compatibility.
 * New code should import directly from the canonical locations:
 *   - Constants: 'lib/constants/appPages'
 *   - App store: 'lib/stores/appStore'
 *   - Characters: 'lib/stores/characterStore'
 *   - Relics: 'lib/stores/relicStore'
 *   - Scoring: 'lib/stores/scoringStore'
 *   - Equipment: 'lib/services/equipmentService'
 *   - Builds: 'lib/services/buildService'
 *   - Persistence: 'lib/services/persistenceService'
 */

import { IRowNode } from 'ag-grid-community'
import * as buildService from 'lib/services/buildService'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { getGameMetadata, setGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, getCharacters, useCharacterStore } from 'lib/stores/characterStore'
import { getRelicById, getRelics, getRelicsById, useRelicStore } from 'lib/stores/relicStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { gridStore } from 'lib/utils/gridStore'
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
import { Relic } from 'types/relic'
import { HsrOptimizerSaveFormat } from 'types/store'

// Re-export constants from canonical locations
export {
  AppPages,
  BasePath,
  BASE_PATH,
  PageToRoute,
  RouteToPage,
  SavedBuildSource,
} from 'lib/constants/appPages'
export type { Route } from 'lib/constants/appPages'

// Re-export useGlobalStore and savedSessionDefaults from canonical location
export { useGlobalStore, savedSessionDefaults } from 'lib/stores/appStore'

// DB facade — all methods delegate to domain stores/services
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
  getState: () => {
    // Lazy import to avoid circular dependency
    const { useGlobalStore } = require('lib/stores/appStore')
    return useGlobalStore.getState()
  },

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

  saveCharacterBuild: (name: string, characterId: CharacterId, source: import('lib/constants/appPages').SavedBuildSource, overwriteExisting: boolean) =>
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
