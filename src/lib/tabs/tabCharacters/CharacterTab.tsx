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
import { CharacterRosterPanel } from 'lib/tabs/tabCharacters/CharacterRosterPanel'
import { CharactersPanelSwitch } from 'lib/tabs/tabCharacters/CharactersPanelSwitch'
import { TeamShowcaseTab } from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab'
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/* Tab height and padding live in CharactersPanelSwitch.module.css */
const TABS_STYLES = {
  panel: { paddingTop: 10 },
}

/** Two panels over one hash space, the same arrangement the Calculators tab uses. */
export function CharacterTab() {
  const [activePanel, setActivePanel] = useState<CharactersPanel>(resolveCharactersPanel)
  /** The team cards are expensive, so Teams only mounts once visited and then stays mounted. */
  const [teamsMounted, setTeamsMounted] = useState(() => activePanel === CharactersPanel.TEAMS)
  const { addActivationListener } = useContext(TabVisibilityContext)

  const updateActivePanel = useCallback((hash: string) => {
    const panel = hashToCharactersPanel(hash)
    if (!panel) return
    setActivePanel(panel)
    if (panel === CharactersPanel.TEAMS) setTeamsMounted(true)
  }, [])

  useHashNavigation(updateActivePanel)

  useEffect(() => {
    return addActivationListener(() => {
      replaceCharactersHash(activePanel)
    })
  }, [addActivationListener, activePanel])

  function handleTabChange(value: string | null) {
    const panel = toCharactersPanel(value)
    if (!panel || panel === activePanel) return
    setActivePanel(panel)
    if (panel === CharactersPanel.TEAMS) setTeamsMounted(true)
    pushCharactersHash(panel)
  }

  return (
    <Tabs w={CHARACTERS_TAB_WIDTH} value={activePanel} onChange={handleTabChange} variant='outline' styles={TABS_STYLES}>
      <CharactersPanelSwitch />

      <Tabs.Panel value={CharactersPanel.CHARACTERS}>
        <CharacterRosterPanel />
      </Tabs.Panel>
      <Tabs.Panel value={CharactersPanel.TEAMS}>
        {teamsMounted && <TeamShowcaseTab />}
      </Tabs.Panel>
    </Tabs>
  )
}
