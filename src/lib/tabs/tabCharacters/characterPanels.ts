import {
  BASE_PATH,
  type PageHash,
} from 'lib/tabs/navigation/constants'
import { parseHash } from 'lib/tabs/navigation/parseHash'
import { flipStringMapping } from 'lib/utils/objectUtils'

export enum CharactersPanel {
  CHARACTERS = 'CHARACTERS',
  TEAMS = 'TEAMS',
}

export const CHARACTERS_PANELS = [CharactersPanel.CHARACTERS, CharactersPanel.TEAMS] as const

export const CHARACTERS_PANEL_HASH = {
  [CharactersPanel.CHARACTERS]: '#characters',
  [CharactersPanel.TEAMS]: '#teams',
} as const satisfies Record<CharactersPanel, PageHash>

export const HashToCharactersPanel = flipStringMapping(CHARACTERS_PANEL_HASH) as Record<string, CharactersPanel>

export function resolveCharactersPanel(): CharactersPanel {
  return HashToCharactersPanel[parseHash().hash] ?? CharactersPanel.CHARACTERS
}

export function pushCharactersHash(panel: CharactersPanel) {
  if (HashToCharactersPanel[parseHash().hash] === panel) return
  const route = `${BASE_PATH}${CHARACTERS_PANEL_HASH[panel]}`
  window.history.pushState({}, '', route)
}

export function replaceCharactersHash(panel: CharactersPanel) {
  const route = `${BASE_PATH}${CHARACTERS_PANEL_HASH[panel]}`
  window.history.replaceState({}, '', route)
}
