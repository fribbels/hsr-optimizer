import { SavedTeamsActions } from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsActions'
import { SavedTeamsList } from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsList'
import styles from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsSidebar.module.css'
import type { ScreenshotAction } from 'lib/utils/screenshotUtils'
import { memo } from 'react'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'

export const SavedTeamsSidebar = memo(function SavedTeamsSidebar({
  width,
  height,
  hasTeam,
  screenshotLoading,
  savedTeams,
  activeSavedTeamId,
  saveCurrentTeam,
  clearTeam,
  screenshot,
  loadSavedTeam,
  deleteSavedTeam,
  renameSavedTeam,
  moveSavedTeam,
}: {
  width: number,
  height: number,
  hasTeam: boolean,
  screenshotLoading: boolean,
  savedTeams: TeamShowcaseSavedTeam[],
  activeSavedTeamId: SavedTeamId | null,
  saveCurrentTeam: () => void,
  clearTeam: () => void,
  screenshot: (action: ScreenshotAction) => void,
  loadSavedTeam: (id: SavedTeamId) => void,
  deleteSavedTeam: (id: SavedTeamId) => void,
  renameSavedTeam: (id: SavedTeamId, name: string) => void,
  moveSavedTeam: (from: number, to: number) => void,
}) {
  return (
    <aside className={styles.panel} style={{ width, height }}>
      <SavedTeamsActions
        canSave={hasTeam && activeSavedTeamId == null}
        hasTeam={hasTeam}
        screenshotLoading={screenshotLoading}
        onSave={saveCurrentTeam}
        onClear={clearTeam}
        onScreenshot={screenshot}
      />

      <div className={styles.listSlot}>
        <SavedTeamsList
          savedTeams={savedTeams}
          activeSavedTeamId={activeSavedTeamId}
          onLoad={loadSavedTeam}
          onDelete={deleteSavedTeam}
          onRename={renameSavedTeam}
          onMove={moveSavedTeam}
        />
      </div>
    </aside>
  )
})
