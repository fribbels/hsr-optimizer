import { Tabs } from '@mantine/core'
import { CHARACTERS_TAB_WIDTH } from 'lib/constants/constantsUi'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useHashNavigation } from 'lib/tabs/navigation/useHashNavigation'
import { CharacterRosterPanel } from 'lib/tabs/tabCharacters/CharacterRosterPanel'
import {
  CharactersPanel,
  hashToCharactersPanel,
  pushCharactersHash,
  replaceCharactersHash,
  resolveCharactersPanel,
  toCharactersPanel,
} from 'lib/tabs/tabCharacters/characterPanels'
import { CharactersPanelSwitch } from 'lib/tabs/tabCharacters/CharactersPanelSwitch'
import styles from 'lib/tabs/tabCharacters/CharactersPanelSwitch.module.css'
import { useTrialStore } from 'lib/tabs/tabTeamShowcase/layouts/trialStore'
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
  const setTitleBarSlot = useTrialStore((s) => s.setTitleBarSlot)

  if (activePanel === CharactersPanel.TEAMS && !teamsMounted) setTeamsMounted(true)

  const updateActivePanel = useCallback((hash: string) => {
    const panel = hashToCharactersPanel(hash)
    if (panel) setActivePanel(panel)
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
    pushCharactersHash(panel)
  }

  return (
    <Tabs w={CHARACTERS_TAB_WIDTH} value={activePanel} onChange={handleTabChange} variant='outline' styles={TABS_STYLES}>
      <CharactersPanelSwitch
        // The slot exists only while Teams shows, so the actions portalled into it never appear beside the roster
        trailing={activePanel === CharactersPanel.TEAMS && <div ref={setTitleBarSlot} className={styles.titleRowSlot} />}
      />

      <Tabs.Panel value={CharactersPanel.CHARACTERS}>
        <CharacterRosterPanel />
      </Tabs.Panel>
      <Tabs.Panel value={CharactersPanel.TEAMS}>
        {teamsMounted && <TeamShowcaseTab />}
      </Tabs.Panel>
    </Tabs>
  )
}
