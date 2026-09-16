import { Tabs } from '@mantine/core'
import { CHARACTERS_TAB_WIDTH } from 'lib/constants/constantsUi'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useHashNavigation } from 'lib/tabs/navigation/useHashNavigation'
import { CharacterRosterPanel } from 'lib/tabs/tabCharacters/CharacterRosterPanel'
import {
  CHARACTERS_PANELS,
  CharactersPanel,
  HashToCharactersPanel,
  pushCharactersHash,
  replaceCharactersHash,
  resolveCharactersPanel,
} from 'lib/tabs/tabCharacters/characterPanels'
import { TeamShowcaseTab } from 'lib/tabs/tabTeamShowcase/TeamShowcaseTab'
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

// TODO(i18n): the team showcase copy is still being reworked, so these labels stay literal for now.
const PANEL_LABEL: Record<CharactersPanel, string> = {
  [CharactersPanel.CHARACTERS]: 'Characters',
  [CharactersPanel.TEAMS]: 'Teams',
}

const TABS_STYLES = {
  tab: { height: 42, paddingInline: 32 },
  panel: { paddingTop: 10 },
}

/** Two panels over one hash space, the same arrangement the Calculators tab uses. */
export function CharacterTab() {
  const [activePanel, setActivePanel] = useState<CharactersPanel>(resolveCharactersPanel)
  /** The team cards are expensive, so Teams only mounts once visited and then stays mounted. */
  const [teamsMounted, setTeamsMounted] = useState(() => activePanel === CharactersPanel.TEAMS)
  const { addActivationListener } = useContext(TabVisibilityContext)

  if (activePanel === CharactersPanel.TEAMS && !teamsMounted) setTeamsMounted(true)

  const updateActivePanel = useCallback((hash: string) => {
    const panel = HashToCharactersPanel[hash]
    if (panel) setActivePanel(panel)
  }, [])

  useHashNavigation(updateActivePanel)

  useEffect(() => {
    return addActivationListener(() => {
      replaceCharactersHash(activePanel)
    })
  }, [addActivationListener, activePanel])

  function handleTabChange(value: string | null) {
    if (!value || !(CHARACTERS_PANELS as readonly string[]).includes(value)) return
    const panel = value as CharactersPanel
    if (panel === activePanel) return
    setActivePanel(panel)
    pushCharactersHash(panel)
  }

  return (
    <Tabs w={CHARACTERS_TAB_WIDTH} value={activePanel} onChange={handleTabChange} variant='outline' styles={TABS_STYLES}>
      <Tabs.List>
        {CHARACTERS_PANELS.map((panel) => (
          <Tabs.Tab key={panel} value={panel}>{PANEL_LABEL[panel]}</Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value={CharactersPanel.CHARACTERS}>
        <CharacterRosterPanel />
      </Tabs.Panel>
      <Tabs.Panel value={CharactersPanel.TEAMS}>
        {teamsMounted && <TeamShowcaseTab />}
      </Tabs.Panel>
    </Tabs>
  )
}
