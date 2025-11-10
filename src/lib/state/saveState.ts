import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { useRelicLocatorStore } from 'lib/tabs/tabRelics/RelicLocator'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { TsUtils } from 'lib/utils/TsUtils'
import { HsrOptimizerSaveFormat } from 'types/store'
import { Relic } from "types/relic";

let saveTimeout: NodeJS.Timeout | null

const STATE_KEY = 'state'

export const SaveState = {
  save: () => {
    const globalState = window.store.getState()
    const relicsTabState = useRelicsTabStore.getState()
    const showcaseTabSession = useShowcaseTabStore.getState().savedSession
    const globalSession = globalState.savedSession
    const relicLocatorSession = useRelicLocatorStore.getState()

    const warpCalculatorTabState = useWarpCalculatorStore.getState()
    const scannerState = useScannerState.getState()

    const state: HsrOptimizerSaveFormat = {
      relics: DB.getRelics().map(({ augmentedStats, ...rest }) => rest) as Relic[],
      characters: DB.getCharacters(),
      scoringMetadataOverrides: globalState.scoringMetadataOverrides,
      showcasePreferences: globalState.showcasePreferences,
      optimizerMenuState: globalState.optimizerMenuState,
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
      },
    }

    const stateString = JSON.stringify(state)
    localStorage.setItem(STATE_KEY, stateString)
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

  load: (autosave = true, sanitize = true) => {
    try {
      const state = localStorage.getItem(STATE_KEY)
      if (state) {
        const parsed = JSON.parse(state) as HsrOptimizerSaveFormat
        console.log('Loaded SaveState')

        DB.setStore(parsed, autosave, sanitize)

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
