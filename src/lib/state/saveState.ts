import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacters } from 'lib/stores/character/characterStore'
import { getRelics } from 'lib/stores/relic/relicStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import * as persistenceService from 'lib/services/persistenceService'
import {
  DEFAULT_WEBSOCKET_URL,
  useScannerState,
} from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { useRelicLocatorStore } from 'lib/tabs/tabRelics/RelicLocator'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import type { Relic } from 'types/relic'
import type { HsrOptimizerSaveFormat } from 'types/store'

let saveTimeout: ReturnType<typeof setTimeout> | null
let allowEmptySave = false

const STATE_KEY = 'state'

// Flush pending saves before page unload (e.g. HMR full reload)
window.addEventListener('beforeunload', () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    SaveState.save()
  }
})

export const SaveState = {
  save: () => {
    const characters = getCharacters()
    const relics = getRelics()

    // Block saves that would wipe existing data (e.g. broken metadata during HMR reload)
    if (!allowEmptySave) {
      const existing = localStorage.getItem(STATE_KEY)
      if (existing) {
        try {
          const parsed = JSON.parse(existing) as HsrOptimizerSaveFormat
          if (characters.length === 0 && parsed.characters?.length > 0) {
            console.warn(`SaveState: Blocked save — would delete ${parsed.characters.length} characters`)
            saveTimeout = null
            return
          }
          if (relics.length === 0 && parsed.relics?.length > 0) {
            console.warn(`SaveState: Blocked save — would delete ${parsed.relics.length} relics`)
            saveTimeout = null
            return
          }
        } catch {
          // If we can't parse existing state, allow the save
        }
      }
    }
    allowEmptySave = false

    const globalState = useGlobalStore.getState()
    const relicsTabState = useRelicsTabStore.getState()
    const showcaseTabSession = useShowcaseTabStore.getState().savedSession
    const globalSession = globalState.savedSession
    const relicLocatorSession = useRelicLocatorStore.getState()

    const warpCalculatorTabState = useWarpCalculatorStore.getState()
    const scannerState = useScannerState.getState()

    const state: HsrOptimizerSaveFormat = {
      relics: relics.map(({ augmentedStats, ...rest }) => rest) as Relic[],
      characters: characters,
      scoringMetadataOverrides: useScoringStore.getState().scoringMetadataOverrides,
      showcasePreferences: useShowcaseTabStore.getState().showcasePreferences,
      optimizerMenuState: useOptimizerDisplayStore.getState().menuState,
      excludedRelicPotentialCharacters: relicsTabState.excludedRelicPotentialCharacters,
      savedSession: {
        showcaseTab: showcaseTabSession,
        global: globalSession,
      },
      settings: globalState.settings,
      version: CURRENT_OPTIMIZER_VERSION,
      warpRequest: warpCalculatorTabState.request,
      relicLocator: {
        inventoryWidth: relicLocatorSession.inventoryWidth,
        rowLimit: relicLocatorSession.rowLimit,
      },
      scannerSettings: {
        ingest: scannerState.ingest,
        ingestCharacters: scannerState.ingestCharacters,
        ingestWarpResources: scannerState.ingestWarpResources,
        websocketUrl: scannerState.websocketUrl,
        customUrl: scannerState.websocketUrl !== DEFAULT_WEBSOCKET_URL,
      },
    }

    const stateString = JSON.stringify(state)
    try {
      localStorage.setItem(STATE_KEY, stateString)
    } catch (e) {
      console.error('Failed to save state (storage quota exceeded?)', e)
    }
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

  // Bypass the empty-save guard for the next save (used by "Clear data")
  permitEmptySave: () => {
    allowEmptySave = true
  },

  load: (autosave = true, sanitize = true) => {
    try {
      const state = localStorage.getItem(STATE_KEY)
      if (state) {
        const parsed = JSON.parse(state) as HsrOptimizerSaveFormat
        console.log('Loaded SaveState')

        persistenceService.loadSaveData(parsed, autosave, sanitize)

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
