import { Tabs } from '@mantine/core'
import { CHARACTERS_TAB_WIDTH } from 'lib/constants/constantsUi'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useHashNavigation } from 'lib/tabs/navigation/useHashNavigation'
import {
  CharactersPanel,
  hashToCharactersPanel,
  pushCharactersHash,
  replaceCharactersHash,
  resolveCharactersPanel,
  toCharactersPanel,
} from 'lib/tabs/tabCharacters/characterPanels'
import { CharactersPanelContent } from 'lib/tabs/tabCharacters/CharactersPanelContent'
import { CharactersPanelSwitch } from 'lib/tabs/tabCharacters/CharactersPanelSwitch'
import { TeamShowcaseTab } from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab'
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/** Two panels over one hash space, the same arrangement the Calculators tab uses. */
export function CharacterTab() {
  const [activePanel, setActivePanel] = useState<CharactersPanel>(resolveCharactersPanel)
  /** The team cards are expensive, so Teams only mounts once visited and then stays mounted. */
  const [teamsMounted, setTeamsMounted] = useState(() => activePanel === CharactersPanel.TEAMS)
  const { addActivationListener } = useContext(TabVisibilityContext)

  const activatePanel = useCallback((panel: CharactersPanel) => {
    setActivePanel(panel)
    if (panel === CharactersPanel.TEAMS) setTeamsMounted(true)
  }, [])

  const updateActivePanel = useCallback((hash: string) => {
    const panel = hashToCharactersPanel(hash)
    if (panel) activatePanel(panel)
  }, [activatePanel])

  useHashNavigation(updateActivePanel)

  useEffect(() => {
    return addActivationListener(() => {
      replaceCharactersHash(activePanel)
    })
  }, [addActivationListener, activePanel])

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
