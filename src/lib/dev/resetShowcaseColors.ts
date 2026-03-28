import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { SavedSessionKeys } from 'lib/constants/constantsSession'

/**
 * Dev utility: resets all showcase color customizations back to AUTO mode.
 * Clears per-character color preferences, extracted portrait colors/swatches,
 * and disables global STANDARD mode.
 *
 * Usage: window.__HSR_DEBUG.resetShowcaseColors() from the console
 */
export function resetShowcaseColors() {
  const showcaseStore = useShowcaseTabStore.getState()
  const globalStore = useGlobalStore.getState()

  // Clear per-character color preferences (custom colors + color modes)
  showcaseStore.setShowcasePreferences({})

  // Clear extracted portrait colors and swatches so they re-extract fresh
  useShowcaseTabStore.setState({
    portraitColorByCharacterId: {},
    portraitSwatchesByCharacterId: {},
  })

  // Disable global STANDARD mode → falls through to AUTO
  globalStore.setSavedSessionKey(SavedSessionKeys.showcaseStandardMode, false)

  console.log('[resetShowcaseColors] Cleared all per-character color preferences, portrait colors/swatches, and disabled STANDARD mode. All characters now use AUTO.')
}
