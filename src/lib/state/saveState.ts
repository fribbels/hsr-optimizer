import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { HsrOptimizerSaveFormat } from 'types/store'

let saveTimeout: NodeJS.Timeout | null

export const SaveState = {
  save: () => {
    const state: HsrOptimizerSaveFormat = {
      relics: DB.getRelics(),
      characters: DB.getCharacters(),
      scorerId: window.store.getState().scorerId,
      scoringMetadataOverrides: window.store.getState().scoringMetadataOverrides,
      showcasePreferences: window.store.getState().showcasePreferences,
      optimizerMenuState: window.store.getState().optimizerMenuState,
      excludedRelicPotentialCharacters: window.store.getState().excludedRelicPotentialCharacters,
      savedSession: window.store.getState().savedSession,
      settings: window.store.getState().settings,
      version: CURRENT_OPTIMIZER_VERSION,
      relicLocator: {
        inventoryWidth: window.store.getState().inventoryWidth,
        rowLimit: window.store.getState().rowLimit,
      },
    }

    console.log('Saved state')
    const stateString = JSON.stringify(state)
    localStorage.state = stateString
    saveTimeout = null

    return stateString
  },

  delayedSave: (ms: number = 5000) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
      SaveState.save()
    }, ms)
  },

  load: (autosave = true) => {
    try {
      const state = localStorage.state as string
      if (state) {
        const parsed = JSON.parse(state) as HsrOptimizerSaveFormat
        console.log('Loaded SaveState')

        DB.setStore(parsed, autosave)
        return true
      }

      console.log('No SaveState found')
      return false
    } catch (e) {
      console.error('Error loading state', e)
      return false
    }
  },
}
