import styles from 'lib/tabs/tabTeamShowcase/trials/savedTeams/SavedTeamsColumn.module.css'
import { SavedTeamsDock } from 'lib/tabs/tabTeamShowcase/trials/savedTeams/SavedTeamsDock'
import { SavedTeamsList } from 'lib/tabs/tabTeamShowcase/trials/savedTeams/SavedTeamsList'
import type { TeamShowcaseSavedTeamsProps } from 'lib/tabs/tabTeamShowcase/trials/trialTypes'

/**
 * The saved-teams column: the actions above, the scrolling list filling what is left. It owns only the
 * surface and the footprint; the dock decides what the actions are and the list decides how a saved
 * team looks.
 */
export function SavedTeamsColumn({ state, width, height }: TeamShowcaseSavedTeamsProps) {
  return (
    <aside className={styles.panel} style={{ width, height }}>
      <SavedTeamsDock state={state} />

      <div className={styles.listSlot}>
        <SavedTeamsList state={state} />
      </div>
    </aside>
  )
}
