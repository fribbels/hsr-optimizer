import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { CharacterId } from 'types/character'
import type { ShowcasePreferences } from 'types/metadata'

export function editShowcasePreferences(
  characterId: CharacterId,
  changed: Partial<ShowcasePreferences>,
) {
  const store = useShowcaseTabStore.getState()
  const existing = store.showcasePreferences[characterId] ?? {}
  const updated = { ...existing, ...changed }

  store.setShowcasePreferences({
    ...store.showcasePreferences,
    [characterId]: updated,
  })

  if (changed.colorMode != null) {
    useGlobalStore.getState().setSavedSessionKey(
      SavedSessionKeys.showcaseStandardMode,
      changed.colorMode === ShowcaseColorMode.STANDARD,
    )
  }

  SaveState.delayedSave()
}
