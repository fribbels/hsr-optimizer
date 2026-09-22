import { Tabs } from '@mantine/core'
import {
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react'
import {
  CHARACTERS_PANELS,
  CharactersPanel,
} from 'lib/tabs/tabCharacters/characterPanels'
import styles from 'lib/tabs/tabCharacters/CharactersPanelSwitch.module.css'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

const ICON_SIZE = 16

const PANEL_LABEL_KEY = {
  [CharactersPanel.CHARACTERS]: 'Panels.Characters',
  [CharactersPanel.TEAMS]: 'Panels.Teams',
} as const satisfies Record<CharactersPanel, string>

const PANEL_ICON: Record<CharactersPanel, ReactNode> = {
  [CharactersPanel.CHARACTERS]: <IconUsers size={ICON_SIZE} />,
  [CharactersPanel.TEAMS]: <IconUsersGroup size={ICON_SIZE} />,
}

/** The Character Builds / Team Showcase tab list; its parent owns selection and navigation. */
export function CharactersPanelSwitch() {
  const { t } = useTranslation('teamShowcaseTab')

  return (
    <Tabs.List className={styles.list}>
      {CHARACTERS_PANELS.map((panel) => (
        <Tabs.Tab key={panel} value={panel} leftSection={PANEL_ICON[panel]}>
          {t(PANEL_LABEL_KEY[panel])}
        </Tabs.Tab>
      ))}
    </Tabs.List>
  )
}
