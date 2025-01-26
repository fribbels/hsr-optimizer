import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { HsrOptimizerSaveFormat } from 'types/store'

let saveTimeout: NodeJS.Timeout | null

export const SaveState = {
  save: () => {
    const storedState = window.store.getState()
    const state: HsrOptimizerSaveFormat = {
      relics: DB.getRelics(),
      characters: DB.getCharacters(),
      scorerId: storedState.scorerId,
      scoringMetadataOverrides: storedState.scoringMetadataOverrides,
      showcasePreferences: storedState.showcasePreferences,
      optimizerMenuState: storedState.optimizerMenuState,
      excludedRelicPotentialCharacters: storedState.excludedRelicPotentialCharacters,
      savedSession: storedState.savedSession,
      settings: storedState.settings,
      version: CURRENT_OPTIMIZER_VERSION,
      warpRequest: storedState.warpRequest,
      relicLocator: {
        inventoryWidth: storedState.inventoryWidth,
        rowLimit: storedState.rowLimit,
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
