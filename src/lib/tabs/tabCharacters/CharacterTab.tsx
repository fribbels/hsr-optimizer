import { Tabs } from '@mantine/core'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { CHARACTERS_TAB_WIDTH } from 'lib/constants/constantsUi'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { useHashNavigation } from 'lib/tabs/navigation/useHashNavigation'
import {
  CharactersPanel,
  hashToCharactersPanel,
  pushCharactersHash,
  replaceCharactersHash,
  toCharactersPanel,
} from 'lib/tabs/tabCharacters/characterPanels'
import { CharactersPanelContent } from 'lib/tabs/tabCharacters/CharactersPanelContent'
import { CharactersPanelSwitch } from 'lib/tabs/tabCharacters/CharactersPanelSwitch'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { TeamShowcaseTab } from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab'
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { CharacterId } from 'types/character'

/** Two panels over one hash space, the same arrangement the Calculators tab uses. */
export function CharacterTab() {
  const activePanel = useCharacterTabStore((state) => state.activePanel)
  /** The team cards are expensive, so Teams only mounts once visited and then stays mounted. */
  const [teamsMounted, setTeamsMounted] = useState(() => activePanel === CharactersPanel.TEAMS)
  const { addActivationListener } = useContext(TabVisibilityContext)
  const savedCharacterId = useGlobalStore.getState().savedSession[SavedSessionKeys.optimizerCharacterId]
  const lastSyncedFocusRef = useRef<CharacterId | undefined>(savedCharacterId)

  const activatePanel = useCallback((panel: CharactersPanel) => {
    useCharacterTabStore.getState().setActivePanel(panel)
    if (panel === CharactersPanel.TEAMS) setTeamsMounted(true)
  }, [])

  const updateActivePanel = useCallback((hash: string) => {
    const panel = hashToCharactersPanel(hash)
    if (panel) activatePanel(panel)
  }, [activatePanel])

  useHashNavigation(updateActivePanel)

  useEffect(() => {
    return addActivationListener(() => {
      replaceCharactersHash(useCharacterTabStore.getState().activePanel)

      const optimizerFocus = useOptimizerDisplayStore.getState().focusCharacterId
      if (!optimizerFocus || optimizerFocus === lastSyncedFocusRef.current) return

      lastSyncedFocusRef.current = optimizerFocus
      useCharacterTabStore.getState().setFocusCharacter(optimizerFocus)
    })
  }, [addActivationListener])

  function handleTabChange(value: string | null) {
    const panel = toCharactersPanel(value)
    if (!panel || panel === activePanel) return
    activatePanel(panel)
    pushCharactersHash(panel)
  }

  return (
    <Tabs w={CHARACTERS_TAB_WIDTH} value={activePanel} onChange={handleTabChange} variant='outline'>
      <CharactersPanelSwitch />

      <Tabs.Panel value={CharactersPanel.CHARACTERS} pt={10}>
        <CharactersPanelContent />
      </Tabs.Panel>
      <Tabs.Panel value={CharactersPanel.TEAMS} pt={10}>
        {teamsMounted && <TeamShowcaseTab />}
      </Tabs.Panel>
    </Tabs>
  )
}
