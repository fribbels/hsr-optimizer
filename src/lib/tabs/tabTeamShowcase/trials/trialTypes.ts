import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'

/**
 * Contracts the saved-teams column and its two halves implement.
 *
 * The column is split so that the dock axis and the list axis can be worked on independently: the
 * column owns the footprint, the dock owns everything about the action groups, and the list owns
 * everything about the saved-team tiles. Neither half changes the other's files.
 *
 * `width` and `height` are not suggestions. The column must start and end exactly where the card grid
 * does, so a variant may lay out its insides however it likes but must not change its own box.
 */
export interface TeamShowcaseSavedTeamsProps {
  state: TeamShowcaseState
  width: number
  height: number
}

export interface SavedTeamsDockProps {
  state: TeamShowcaseState
}

export interface SavedTeamsListProps {
  state: TeamShowcaseState
}
