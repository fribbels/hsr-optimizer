import { Button } from '@mantine/core'
import { IconBookmarkPlus } from '@tabler/icons-react'
import { SavedTeamsActions } from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsActions'
import { SavedTeamsList } from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsList'
import styles from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsSidebar.module.css'
import type { ScreenshotAction } from 'lib/utils/screenshotUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'

const ACTION_ICON_SIZE = 16

export const SavedTeamsSidebar = memo(function SavedTeamsSidebar({
  hasTeam,
  canSyncBenchmarks,
  hasSyncedBenchmarks,
  activeScreenshotAction,
  savedTeams,
  activeSavedTeamId,
  saveCurrentTeam,
  syncBenchmarkTeams,
  clearTeam,
  screenshot,
  loadSavedTeam,
  deleteSavedTeam,
  renameSavedTeam,
  moveSavedTeam,
}: {
  hasTeam: boolean,
  canSyncBenchmarks: boolean,
  hasSyncedBenchmarks: boolean,
  activeScreenshotAction: ScreenshotAction | null,
  savedTeams: TeamShowcaseSavedTeam[],
  activeSavedTeamId: SavedTeamId | null,
  saveCurrentTeam: () => void,
  syncBenchmarkTeams: () => void,
  clearTeam: () => void,
  screenshot: (action: ScreenshotAction) => void,
  loadSavedTeam: (id: SavedTeamId) => void,
  deleteSavedTeam: (id: SavedTeamId) => void,
  renameSavedTeam: (id: SavedTeamId, name: string) => void,
  moveSavedTeam: (from: number, to: number) => void,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const screenshotPending = activeScreenshotAction != null
  const canSave = hasTeam && activeSavedTeamId == null && !screenshotPending

  return (
    <aside className={styles.panel}>
      <SavedTeamsActions
        canSyncBenchmarks={canSyncBenchmarks}
        hasSyncedBenchmarks={hasSyncedBenchmarks}
        hasTeam={hasTeam}
        activeScreenshotAction={activeScreenshotAction}
        onSyncBenchmarks={syncBenchmarkTeams}
        onClear={clearTeam}
        onScreenshot={screenshot}
      />

      <div className={styles.gallerySection}>
        <h3 className={styles.title}>{t('SavedTeams.Header')}</h3>
        <Button
          fullWidth
          size='sm'
          variant='filled'
          leftSection={<IconBookmarkPlus size={ACTION_ICON_SIZE} />}
          disabled={!canSave}
          onClick={saveCurrentTeam}
        >
          {t('SavedTeams.Save')}
        </Button>
        <div className={styles.listSlot} inert={screenshotPending}>
          <SavedTeamsList
            savedTeams={savedTeams}
            activeSavedTeamId={activeSavedTeamId}
            onLoad={loadSavedTeam}
            onDelete={deleteSavedTeam}
            onRename={renameSavedTeam}
            onMove={moveSavedTeam}
          />
        </div>
      </div>
    </aside>
  )
})
