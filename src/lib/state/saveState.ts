import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/UseShowcaseTabStore'
import { HsrOptimizerSaveFormat } from 'types/store'

let saveTimeout: NodeJS.Timeout | null

export const SaveState = {
  save: () => {
    const globalState = window.store.getState()
    const showcaseTabSession = useShowcaseTabStore.getState().savedSession
    const globalSession = globalState.savedSession
    // @ts-ignore TODO remove once migration complete | added on 02/05/2025 (dd/mm/yyyy)
    delete globalSession.relicScorerSidebarOpen
    const state: HsrOptimizerSaveFormat = {
      relics: DB.getRelics(),
      characters: DB.getCharacters(),
      scoringMetadataOverrides: globalState.scoringMetadataOverrides,
      showcasePreferences: globalState.showcasePreferences,
      optimizerMenuState: globalState.optimizerMenuState,
      excludedRelicPotentialCharacters: globalState.excludedRelicPotentialCharacters,
      savedSession: {
        showcaseTab: showcaseTabSession,
        global: globalSession,
      },
      settings: globalState.settings,
      version: CURRENT_OPTIMIZER_VERSION,
      warpRequest: globalState.warpRequest,
      relicLocator: {
        inventoryWidth: globalState.inventoryWidth,
        rowLimit: globalState.rowLimit,
      },
    }

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
