import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { preprocessTurnAbilityNames } from 'lib/optimization/rotation/turnPreprocessor'
import type { ComboState } from 'lib/optimization/combo/comboTypes'
import { COMBO_STATE_JSON_VERSION } from 'lib/optimization/combo/comboTypes'
import { persistFormToCharacterStore } from './comboDrawerUtils'
import { useComboDrawerStore } from './useComboDrawerStore'

function arraysEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function syncToStores(comboState: ComboState) {
  const requestStore = useOptimizerRequestStore.getState()

  // Change-detection guards: skip writes when values haven't changed
  // to avoid triggering unnecessary re-renders in OptimizerOptionsDisplay / main form
  const newJson = JSON.stringify(comboState)
  if (requestStore.comboStateJson !== newJson) {
    requestStore.setComboStateJson(newJson)
  }
  if (!arraysEqual(requestStore.comboTurnAbilities, comboState.comboTurnAbilities)) {
    requestStore.setComboTurnAbilities(comboState.comboTurnAbilities)
  }

  persistFormToCharacterStore(1000)
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
