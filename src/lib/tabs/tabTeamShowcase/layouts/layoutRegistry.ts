import type { TeamShowcaseLayoutProps } from 'lib/tabs/tabTeamShowcase/layouts/layoutTypes'
import { TintedWallLayout } from 'lib/tabs/tabTeamShowcase/layouts/TintedWallLayout'
import type { ComponentType } from 'react'

export enum TeamShowcaseLayoutKey {
  TINTED_WALL = 'tintedWall',
}

export interface TeamShowcaseLayoutEntry {
  key: TeamShowcaseLayoutKey
  label: string
  Component: ComponentType<TeamShowcaseLayoutProps>
}

/** The chosen layout. The harness stays in place so a future comparison only needs another entry. */
export const TEAM_SHOWCASE_LAYOUTS: TeamShowcaseLayoutEntry[] = [
  { key: TeamShowcaseLayoutKey.TINTED_WALL, label: 'Tinted wall', Component: TintedWallLayout },
]

export const DEFAULT_TEAM_SHOWCASE_LAYOUT = TeamShowcaseLayoutKey.TINTED_WALL
