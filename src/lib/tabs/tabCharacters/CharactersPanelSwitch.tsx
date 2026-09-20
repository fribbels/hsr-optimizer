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

const ICON_SIZE = 16

// TODO(i18n): the team showcase copy is still being reworked, so these labels stay literal for now.
const PANEL_LABEL: Record<CharactersPanel, string> = {
  [CharactersPanel.CHARACTERS]: 'Characters',
  [CharactersPanel.TEAMS]: 'Teams',
}

const PANEL_ICON: Record<CharactersPanel, ReactNode> = {
  [CharactersPanel.CHARACTERS]: <IconUsers size={ICON_SIZE} />,
  [CharactersPanel.TEAMS]: <IconUsersGroup size={ICON_SIZE} />,
}

/**
 * The Characters / Teams tab list. It lives inside the Characters tab's Tabs wrapper, which owns the
 * value and the change handler. `trailing` renders at the right end of the list, inside it, so the list
 * can span the whole row and its rule runs the full width.
 */
export function CharactersPanelSwitch({ trailing }: { trailing?: ReactNode }) {
  return (
    <Tabs.List className={styles.list}>
      {CHARACTERS_PANELS.map((panel) => (
        <Tabs.Tab key={panel} value={panel} leftSection={PANEL_ICON[panel]}>
          {PANEL_LABEL[panel]}
        </Tabs.Tab>
      ))}
      {trailing && <div className={styles.listTrailing}>{trailing}</div>}
    </Tabs.List>
  )
}
