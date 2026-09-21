import { Button } from '@mantine/core'
import {
  IconBookmarkPlus,
  IconCamera,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'
import styles from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsActions.module.css'
import { ScreenshotAction } from 'lib/utils/screenshotUtils'
import { useTranslation } from 'react-i18next'

const ACTION_ICON_SIZE = 16

export function SavedTeamsActions({
  canSave,
  hasTeam,
  activeScreenshotAction,
  onSave,
  onClear,
  onScreenshot,
}: {
  canSave: boolean,
  hasTeam: boolean,
  activeScreenshotAction: ScreenshotAction | null,
  onSave: () => void,
  onClear: () => void,
  onScreenshot: (action: ScreenshotAction) => void,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const screenshotPending = activeScreenshotAction != null

  return (
    <div className={styles.root}>
      <div className={`${styles.group} ${styles.ruledGroup}`}>
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
        <h3 className={styles.title}>{t('SavedTeams.Header')}</h3>
        <Button
          fullWidth
          size='sm'
          variant='filled'
          leftSection={<IconBookmarkPlus size={ACTION_ICON_SIZE} />}
          disabled={!canSave}
          onClick={onSave}
        >
          {t('SavedTeams.Save')}
        </Button>
        <Button
          fullWidth
          size='sm'
          variant='transparent'
          className={styles.clearButton}
          leftSection={<IconTrash size={ACTION_ICON_SIZE} />}
          disabled={!hasTeam}
          onClick={onClear}
        >
          {t('Buttons.Clear')}
        </Button>
      </div>
    </div>
  )
}
