import { Button } from '@mantine/core'
import {
  IconBookmarkPlus,
  IconCamera,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'
import styles from 'lib/tabs/tabTeamShowcase/trials/savedTeams/SavedTeamsDock.module.css'
import type { SavedTeamsDockProps } from 'lib/tabs/tabTeamShowcase/trials/trialTypes'
import { useTranslation } from 'react-i18next'

const ACTION_ICON_SIZE = 16

/** Which image export an export control triggers. The showcase state's own action takes the wire value. */
enum ExportKind {
  COPY = 'copy',
  DOWNLOAD = 'download',
}

/**
 * Everything an arrangement needs, flattened out of the showcase state so a leaf control takes one prop
 * and no arrangement has to know where any of it came from.
 */
interface DockActions {
  /** Saving is pointless when the live team is already in the list */
  canSave: boolean
  hasTeam: boolean
  screenshotLoading: boolean
  save: () => void
  clear: () => void
  exportImage: (kind: ExportKind) => void
}

/**
 * The action group above the saved-teams list: Copy and Download on their own rows, a hairline, then the
 * heading with Save and Clear beneath it.
 *
 * The screenshots act on the card grid, so they form their own group; the heading opens the saved-teams
 * section and the two actions that belong to it sit under it. Copy and Save are both filled, because each
 * is the obvious action of its group; Clear is subdued, being the one that throws work away.
 */
export function SavedTeamsDock({ state }: SavedTeamsDockProps) {
  const {
    activeSavedTeamId,
    hasTeam,
    saveCurrentTeam,
    clearTeam,
    screenshot,
    screenshotLoading,
  } = state

  const actions: DockActions = {
    canSave: hasTeam && activeSavedTeamId == null,
    hasTeam,
    screenshotLoading,
    save: () => saveCurrentTeam(),
    clear: clearTeam,
    exportImage: (kind) => screenshot(kind === ExportKind.COPY ? 'clipboard' : 'download'),
  }

  return (
    <div className={`${styles.stack} ${styles.spaced} ${styles.top}`}>
      <div className={`${styles.group} ${styles.ruledGroup}`}>
        <ExportButton actions={actions} kind={ExportKind.COPY} />
        <ExportButton actions={actions} kind={ExportKind.DOWNLOAD} />
      </div>

      <div className={styles.group}>
        <Heading />
        <SaveButton actions={actions} />
        <ClearButton actions={actions} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Leaf controls
// ---------------------------------------------------------------------------

function Heading() {
  const { t } = useTranslation('teamShowcaseTab')
  return <h3 className={styles.title}>{t('SavedTeams.Header')}</h3>
}

/** Filled, as the action its group exists for */
function SaveButton({ actions }: { actions: DockActions }) {
  const { t } = useTranslation('teamShowcaseTab')
  return (
    <Button
      fullWidth
      size='sm'
      variant='filled'
      leftSection={<IconBookmarkPlus size={ACTION_ICON_SIZE} />}
      disabled={!actions.canSave}
      onClick={actions.save}
    >
      {t('SavedTeams.Save')}
    </Button>
  )
}

/** Softly outlined: destructive without disappearing into the dock surface */
function ClearButton({ actions }: { actions: DockActions }) {
  const { t } = useTranslation('teamShowcaseTab')
  return (
    <Button
      fullWidth
      size='sm'
      variant='transparent'
      className={styles.clearButton}
      leftSection={<IconTrash size={ACTION_ICON_SIZE} />}
      disabled={!actions.hasTeam}
      onClick={actions.clear}
    >
      {t('Buttons.Clear')}
    </Button>
  )
}

function ExportIcon({ kind }: { kind: ExportKind }) {
  if (kind === ExportKind.COPY) return <IconCamera size={ACTION_ICON_SIZE} />
  return <IconDownload size={ACTION_ICON_SIZE} />
}

/** Copy is the filled primary and Download the default beside it */
function ExportButton({ actions, kind }: { actions: DockActions, kind: ExportKind }) {
  const { t } = useTranslation('teamShowcaseTab')
  const isCopy = kind === ExportKind.COPY

  return (
    <Button
      fullWidth
      size='sm'
      variant={isCopy ? 'filled' : 'default'}
      leftSection={<ExportIcon kind={kind} />}
      loading={actions.screenshotLoading}
      disabled={!actions.hasTeam}
      onClick={() => actions.exportImage(kind)}
    >
      {isCopy ? t('Buttons.CopyScreenshot') : t('Buttons.DownloadScreenshot')}
    </Button>
  )
}
