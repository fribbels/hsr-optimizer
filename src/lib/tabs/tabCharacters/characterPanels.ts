import {
  BASE_PATH,
  CHARACTERS_HASH,
  type PageHash,
  TEAMS_HASH,
} from 'lib/tabs/navigation/constants'
import { parseHash } from 'lib/tabs/navigation/parseHash'

export enum CharactersPanel {
  CHARACTERS = 'CHARACTERS',
  TEAMS = 'TEAMS',
}

export const CHARACTERS_PANELS = [CharactersPanel.CHARACTERS, CharactersPanel.TEAMS] as const

export const CHARACTERS_PANEL_HASH = {
  [CharactersPanel.CHARACTERS]: CHARACTERS_HASH,
  [CharactersPanel.TEAMS]: TEAMS_HASH,
} as const satisfies Record<CharactersPanel, PageHash>

export function toCharactersPanel(value: string | null): CharactersPanel | undefined {
  return CHARACTERS_PANELS.find((panel) => panel === value)
}

export function hashToCharactersPanel(hash: string): CharactersPanel | undefined {
  return CHARACTERS_PANELS.find((panel) => CHARACTERS_PANEL_HASH[panel] === hash)
}

export function resolveCharactersPanel(): CharactersPanel {
  return hashToCharactersPanel(parseHash().hash) ?? CharactersPanel.CHARACTERS
}

export function pushCharactersHash(panel: CharactersPanel) {
  if (hashToCharactersPanel(parseHash().hash) === panel) return
  const route = `${BASE_PATH}${CHARACTERS_PANEL_HASH[panel]}`
  window.history.pushState({}, '', route)
}

export function replaceCharactersHash(panel: CharactersPanel) {
  const route = `${BASE_PATH}${CHARACTERS_PANEL_HASH[panel]}`
  window.history.replaceState({}, '', route)
}
