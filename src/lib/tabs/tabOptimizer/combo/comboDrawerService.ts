import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { SaveState } from 'lib/state/saveState'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { preprocessTurnAbilityNames } from 'lib/optimization/rotation/turnPreprocessor'
import type { ComboState } from './comboDrawerTypes'
import { COMBO_STATE_JSON_VERSION } from './comboDrawerTypes'
import { useComboDrawerStore } from './useComboDrawerStore'

function syncToStores(comboState: ComboState) {
  const requestStore = useOptimizerRequestStore.getState()
  requestStore.setComboStateJson(JSON.stringify(comboState))
  requestStore.setComboTurnAbilities(comboState.comboTurnAbilities)

  const form = getForm()
  const found = getCharacterById(form.characterId)
  if (found) {
    useCharacterStore.getState().setCharacter({ ...found, form: { ...found.form, ...form } })
  }

  SaveState.delayedSave(1000)
}

/**
 * Reads the combo drawer store, serializes to comboStateJson, and
 * persists to the optimizer request store + character store + SaveState.
 * Called on drawer close.
 */
export function flushComboDrawerToForm() {
  const state = useComboDrawerStore.getState()
  if (!state.initialized || !state.comboCharacter) return

  const comboTurnAbilities = preprocessTurnAbilityNames(state.comboTurnAbilities)

  const comboState: ComboState = {
    comboCharacter: state.comboCharacter,
    comboTeammate0: state.comboTeammate0,
    comboTeammate1: state.comboTeammate1,
    comboTeammate2: state.comboTeammate2,
    comboTurnAbilities,
    version: COMBO_STATE_JSON_VERSION,
  }

  syncToStores(comboState)
}

/**
 * Persists the current set selection state to stores.
 * Called after updateSelectedSets modifies the store.
 */
export function persistSelectedSets() {
  const comboState = useComboDrawerStore.getState().getComboState()
  if (!comboState) return
  comboState.version = COMBO_STATE_JSON_VERSION
  syncToStores(comboState)
}
