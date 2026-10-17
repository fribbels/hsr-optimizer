import { Button } from '@mantine/core'
import {
  IconCamera,
  IconCheck,
  IconDownload,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react'
import styles from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsSidebar.module.css'
import { ScreenshotAction } from 'lib/utils/screenshotUtils'
import { useTranslation } from 'react-i18next'

const ACTION_ICON_SIZE = 16

export function SavedTeamsActions({
  canSyncBenchmarks,
  hasSyncedBenchmarks,
  hasTeam,
  activeScreenshotAction,
  onSyncBenchmarks,
  onClear,
  onScreenshot,
}: {
  canSyncBenchmarks: boolean,
  hasSyncedBenchmarks: boolean,
  hasTeam: boolean,
  activeScreenshotAction: ScreenshotAction | null,
  onSyncBenchmarks: () => void,
  onClear: () => void,
  onScreenshot: (action: ScreenshotAction) => void,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const screenshotPending = activeScreenshotAction != null

  return (
    <div className={styles.root}>
      <div className={styles.group}>
        <Button
          fullWidth
          size='sm'
          variant='filled'
          leftSection={<IconCamera size={ACTION_ICON_SIZE} />}
          loading={activeScreenshotAction === ScreenshotAction.Clipboard}
          disabled={!hasTeam || screenshotPending}
          onClick={() => onScreenshot(ScreenshotAction.Clipboard)}
        >
          {t('Buttons.CopyScreenshot')}
        </Button>
        <Button
          fullWidth
          size='sm'
          variant='default'
          leftSection={<IconDownload size={ACTION_ICON_SIZE} />}
          loading={activeScreenshotAction === ScreenshotAction.Download}
          disabled={!hasTeam || screenshotPending}
          onClick={() => onScreenshot(ScreenshotAction.Download)}
        >
          {t('Buttons.DownloadScreenshot')}
        </Button>
      </div>

      <div className={styles.group}>
        <h3 className={styles.title}>{t('Panels.Controls')}</h3>
        <Button
          fullWidth
          size='sm'
          variant='default'
          leftSection={hasSyncedBenchmarks
            ? <IconCheck size={ACTION_ICON_SIZE} />
            : <IconRefresh size={ACTION_ICON_SIZE} />}
          disabled={!canSyncBenchmarks || screenshotPending}
          onClick={onSyncBenchmarks}
        >
          {t('Buttons.SyncBenchmarkTeams')}
        </Button>
        <Button
          fullWidth
          size='sm'
          variant='transparent'
          className={styles.clearButton}
          leftSection={<IconTrash size={ACTION_ICON_SIZE} />}
          disabled={!hasTeam || screenshotPending}
          onClick={onClear}
        >
          {t('Buttons.Clear')}
        </Button>
      </div>
    </div>
  )
}
