import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SaveState } from 'lib/state/saveState'
import { TsUtils } from 'lib/utils/TsUtils'
import { ShowcasePreferences } from 'types/metadata'

export const DEFAULT_SHOWCASE_COLOR = '#2473e1'

export function editShowcasePreferences(
  characterId: string,
  globalShowcasePreferences: Record<string, ShowcasePreferences>,
  setGlobalShowcasePreferences: (x: Record<string, ShowcasePreferences>) => void,
  changed: ShowcasePreferences,
) {
  const existing = globalShowcasePreferences[characterId] ?? {}
  const finalized = {
    ...existing,
  }

  let changesMade = false

  if (changed.color && (finalized.color || changed.color != DEFAULT_SHOWCASE_COLOR)) {
    finalized.color = changed.color
    changesMade = true
  }

  if (changed.colorMode && (finalized.colorMode || changed.colorMode != ShowcaseColorMode.AUTO)) {
    finalized.colorMode = changed.colorMode
    changesMade = true
  }

  if (changesMade) {
    globalShowcasePreferences[characterId] = finalized

    setGlobalShowcasePreferences(TsUtils.clone(globalShowcasePreferences))
    window.store.getState().setSavedSessionKey(SavedSessionKeys.showcaseStandardMode, changed.colorMode === ShowcaseColorMode.STANDARD)

    SaveState.delayedSave()
  }
}
