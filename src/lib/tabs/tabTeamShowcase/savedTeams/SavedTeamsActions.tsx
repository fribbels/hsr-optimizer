import { Button } from '@mantine/core'
import {
  IconBookmarkPlus,
  IconCamera,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'
import styles from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsActions.module.css'
import type { ScreenshotAction } from 'lib/utils/screenshotUtils'
import { useTranslation } from 'react-i18next'

const ACTION_ICON_SIZE = 16

export function SavedTeamsActions({
  canSave,
  hasTeam,
  screenshotLoading,
  onSave,
  onClear,
  onScreenshot,
}: {
  canSave: boolean,
  hasTeam: boolean,
  screenshotLoading: boolean,
  onSave: () => void,
  onClear: () => void,
  onScreenshot: (action: ScreenshotAction) => void,
}) {
  const { t } = useTranslation('teamShowcaseTab')

  return (
    <div className={styles.root}>
      <div className={`${styles.group} ${styles.ruledGroup}`}>
        <Button
          fullWidth
          size='sm'
          variant='filled'
          leftSection={<IconCamera size={ACTION_ICON_SIZE} />}
          loading={screenshotLoading}
          disabled={!hasTeam}
          onClick={() => onScreenshot('clipboard')}
        >
          {t('Buttons.CopyScreenshot')}
        </Button>
        <Button
          fullWidth
          size='sm'
          variant='default'
          leftSection={<IconDownload size={ACTION_ICON_SIZE} />}
          loading={screenshotLoading}
          disabled={!hasTeam}
          onClick={() => onScreenshot('download')}
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
