import {
  ActionIcon,
  TextInput,
  Tooltip,
} from '@mantine/core'
import {
  IconPencil,
  IconPlus,
  IconX,
} from '@tabler/icons-react'
import styles from 'lib/tabs/tabTeamShowcase/SavedTeamsPanel.module.css'
import { TEAM_SIZE } from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import type { SlotAppearance } from 'lib/tabs/tabTeamShowcase/useSlotAppearance'
import { useSlotAppearances } from 'lib/tabs/tabTeamShowcase/useSlotAppearance'
import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import type {
  CSSProperties,
  KeyboardEvent,
} from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TeamShowcaseSavedTeam } from 'types/store'

const SMALL_ICON_SIZE = 14
const KEY_ENTER = 'Enter'
const KEY_ESCAPE = 'Escape'
const KEY_SPACE = ' '

interface StripColorStyle extends CSSProperties {
  '--strip-c0': string
  '--strip-c1': string
  '--strip-c2': string
  '--strip-c3': string
}

function stripColorStyle(appearances: (SlotAppearance | null)[]): StripColorStyle | undefined {
  const seeds = appearances.flatMap((appearance) => (appearance ? [appearance.seedColor] : []))
  const firstSeed = seeds[0]
  if (!firstSeed) return undefined
  const stopSeed = (stop: number) => seeds[Math.floor(stop * seeds.length / TEAM_SIZE)] ?? firstSeed
  return {
    '--strip-c0': stopSeed(0),
    '--strip-c1': stopSeed(1),
    '--strip-c2': stopSeed(2),
    '--strip-c3': stopSeed(3),
  }
}

export function SavedTeamsPanel({ state }: { state: TeamShowcaseState }) {
  const { t } = useTranslation('teamShowcaseTab')
  const {
    activeSavedTeamId,
    hasTeam,
    savedTeams,
    saveCurrentTeam,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
  } = state
  const canSave = hasTeam && activeSavedTeamId == null

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>{t('SavedTeams.Header')}</span>
        <button
          type='button'
          className={styles.saveButton}
          disabled={!canSave}
          onClick={() => saveCurrentTeam()}
        >
          <IconPlus size={SMALL_ICON_SIZE} />
          <span>{t('SavedTeams.Save')}</span>
        </button>
      </div>

      <div className={styles.scroll}>
        {savedTeams.length === 0 && <div className={styles.empty}>{t('SavedTeams.Empty')}</div>}
        {savedTeams.map((team) => (
          <SavedTeamStrip
            key={team.id}
            team={team}
            active={team.id === activeSavedTeamId}
            deleteLabel={t('SavedTeams.Delete')}
            renameLabel={t('SavedTeams.Rename')}
            onLoad={() => loadSavedTeam(team.id)}
            onDelete={() => deleteSavedTeam(team.id)}
            onRename={(name) => renameSavedTeam(team.id, name)}
          />
        ))}
      </div>
    </aside>
  )
}

function SavedTeamStrip({
  team,
  active,
  deleteLabel,
  renameLabel,
  onLoad,
  onDelete,
  onRename,
}: {
  team: TeamShowcaseSavedTeam,
  active: boolean,
  deleteLabel: string,
  renameLabel: string,
  onLoad: () => void,
  onDelete: () => void,
  onRename: (name: string) => void,
}) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(team.name)
  const appearances = useSlotAppearances(team.characterIds)
  const cells = Array.from({ length: TEAM_SIZE }, (_, index) => appearances[index] ?? null)

  const startEditing = () => {
    setDraftName(team.name)
    setEditing(true)
  }

  const commitName = () => {
    setEditing(false)
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== team.name) onRename(trimmed)
  }

  const handleStripKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (editing) return
    if (event.key === KEY_ENTER || event.key === KEY_SPACE) {
      event.preventDefault()
      onLoad()
    }
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === KEY_ENTER) {
      commitName()
    } else if (event.key === KEY_ESCAPE) {
      setEditing(false)
    }
  }

  return (
    <div
      role='button'
      tabIndex={0}
      aria-label={team.name}
      className={styles.strip}
      data-active={active}
      style={stripColorStyle(appearances)}
      onClick={() => {
        if (!editing) onLoad()
      }}
      onKeyDown={handleStripKeyDown}
    >
      <div className={styles.slices}>
        {cells.map((appearance, index) => (
          <span key={index} className={styles.sliceFrame}>
            {appearance && (
              <img
                className={styles.sliceArt}
                data-custom={appearance.customPortrait != null}
                src={appearance.artUrl}
                style={appearance.artObjectPosition ? { objectPosition: appearance.artObjectPosition } : undefined}
                alt=''
                draggable={false}
                decoding='async'
              />
            )}
          </span>
        ))}
      </div>

      <div className={styles.metaRow}>
        {editing
          ? (
            <div className={styles.editor} onClick={(event) => event.stopPropagation()}>
              <TextInput
                size='xs'
                autoFocus
                value={draftName}
                onChange={(event) => setDraftName(event.currentTarget.value)}
                onBlur={commitName}
                onKeyDown={handleInputKeyDown}
              />
            </div>
          )
          : (
            <>
              <span
                className={styles.name}
                title={team.name}
                onDoubleClick={(event) => {
                  event.stopPropagation()
                  startEditing()
                }}
              >
                {team.name}
              </span>
              <div
                className={styles.tools}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Tooltip label={renameLabel}>
                  <ActionIcon variant='subtle' color='gray' size='xs' aria-label={renameLabel} onClick={startEditing}>
                    <IconPencil size={SMALL_ICON_SIZE} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={deleteLabel}>
                  <ActionIcon variant='subtle' color='gray' size='xs' aria-label={deleteLabel} onClick={onDelete}>
                    <IconX size={SMALL_ICON_SIZE} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </>
          )}
      </div>
    </div>
  )
}
