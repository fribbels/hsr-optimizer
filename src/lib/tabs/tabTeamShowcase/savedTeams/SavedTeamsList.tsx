import {
  closestCenter,
  DndContext,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ActionIcon,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import {
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'
import {
  POINTER_DRAG_ACCESSIBILITY,
  usePointerDragSensors,
} from 'lib/tabs/tabTeamShowcase/pointerDragSensors'
import styles from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsList.module.css'
import { useSavedTeamAppearances } from 'lib/tabs/tabTeamShowcase/savedTeams/useSavedTeamAppearances'
import { TEAM_SIZE } from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import { OVERLAY_SCROLLBAR_OPTIONS } from 'lib/ui/selectors/selectConstants'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { KeyboardEvent } from 'react'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'

const TOOL_ICON_SIZE = 14
const KEY_ENTER = 'Enter'
const KEY_ESCAPE = 'Escape'
const DRAG_MODIFIERS = [restrictToVerticalAxis]
const CLICK_SUPPRESSION_RELEASE_DELAY = 0
const CLICK_SUPPRESSION_RECOVERY_EVENTS = ['pointerup', 'pointercancel', 'blur']

export function SavedTeamsList({
  activeSavedTeamId,
  savedTeams,
  onLoad,
  onDelete,
  onRename,
  onMove,
}: {
  activeSavedTeamId: SavedTeamId | null,
  savedTeams: TeamShowcaseSavedTeam[],
  onLoad: (id: SavedTeamId) => void,
  onDelete: (id: SavedTeamId) => void,
  onRename: (id: SavedTeamId, name: string) => void,
  onMove: (from: number, to: number) => void,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const sensors = usePointerDragSensors()
  const suppressNextClickRef = useRef(false)
  const suppressionTimerRef = useRef<number | null>(null)
  const teamIds = useMemo(() => savedTeams.map((team) => team.id), [savedTeams])
  const deleteLabel = t('SavedTeams.Delete')
  const renameLabel = t('SavedTeams.Rename')

  const handleDragStart = useCallback(() => {
    if (suppressionTimerRef.current != null) window.clearTimeout(suppressionTimerRef.current)
    suppressNextClickRef.current = true
  }, [])

  const scheduleSuppressionRelease = useCallback(() => {
    if (suppressionTimerRef.current != null) window.clearTimeout(suppressionTimerRef.current)
    suppressionTimerRef.current = window.setTimeout(() => {
      suppressionTimerRef.current = null
      suppressNextClickRef.current = false
    }, CLICK_SUPPRESSION_RELEASE_DELAY)
  }, [])

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    scheduleSuppressionRelease()
    if (!over || active.id === over.id) return
    const from = teamIds.indexOf(active.id as SavedTeamId)
    const to = teamIds.indexOf(over.id as SavedTeamId)
    if (from >= 0 && to >= 0) onMove(from, to)
  }, [onMove, scheduleSuppressionRelease, teamIds])

  const consumeSuppressedClick = useCallback(() => {
    if (!suppressNextClickRef.current) return false
    if (suppressionTimerRef.current != null) window.clearTimeout(suppressionTimerRef.current)
    suppressionTimerRef.current = null
    suppressNextClickRef.current = false
    return true
  }, [])

  useEffect(() => {
    const releaseIfDragging = () => {
      if (suppressNextClickRef.current) scheduleSuppressionRelease()
    }
    for (const event of CLICK_SUPPRESSION_RECOVERY_EVENTS) window.addEventListener(event, releaseIfDragging)
    return () => {
      if (suppressionTimerRef.current != null) window.clearTimeout(suppressionTimerRef.current)
      for (const event of CLICK_SUPPRESSION_RECOVERY_EVENTS) window.removeEventListener(event, releaseIfDragging)
    }
  }, [scheduleSuppressionRelease])

  return (
    <OverlayScrollbarsComponent className={styles.scroll} options={OVERLAY_SCROLLBAR_OPTIONS} defer>
      {savedTeams.length === 0
        ? (
          <div className={styles.empty}>
            <span>{t('SavedTeams.Empty')}</span>
          </div>
        )
        : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={DRAG_MODIFIERS}
            accessibility={POINTER_DRAG_ACCESSIBILITY}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={scheduleSuppressionRelease}
          >
            <SortableContext items={teamIds} strategy={verticalListSortingStrategy}>
              {savedTeams.map((team) => (
                <SavedTeamTile
                  key={team.id}
                  team={team}
                  active={team.id === activeSavedTeamId}
                  deleteLabel={deleteLabel}
                  renameLabel={renameLabel}
                  consumeSuppressedClick={consumeSuppressedClick}
                  onLoad={onLoad}
                  onDelete={onDelete}
                  onRename={onRename}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
    </OverlayScrollbarsComponent>
  )
}

interface SavedTeamTileProps {
  team: TeamShowcaseSavedTeam
  active: boolean
  deleteLabel: string
  renameLabel: string
  consumeSuppressedClick: () => boolean
  onLoad: (id: SavedTeamId) => void
  onDelete: (id: SavedTeamId) => void
  onRename: (id: SavedTeamId, name: string) => void
}

function SavedTeamTile(props: SavedTeamTileProps) {
  // Attributes are omitted because they advertise keyboard dragging, while this surface is pointer-only.
  const {
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.team.id })

  return (
    <div
      ref={setNodeRef}
      className={styles.tile}
      data-active={props.active}
      data-dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SavedTeamTileContent {...props} dragListeners={listeners} />
    </div>
  )
}

const SavedTeamTileContent = memo(function SavedTeamTileContent({
  team,
  active,
  deleteLabel,
  renameLabel,
  consumeSuppressedClick,
  onLoad,
  onDelete,
  onRename,
  dragListeners,
}: SavedTeamTileProps & {
  dragListeners: ReturnType<typeof useSortable>['listeners'],
}) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(team.name)
  const editClosedRef = useRef(false)
  const appearances = useSavedTeamAppearances(team.characterIds)
  const cells = Array.from({ length: TEAM_SIZE }, (_, slot) => appearances[slot] ?? null)

  const handleLoad = () => {
    if (consumeSuppressedClick()) return
    onLoad(team.id)
  }

  const startEditing = () => {
    editClosedRef.current = false
    setDraftName(team.name)
    setEditing(true)
  }

  const commitName = () => {
    if (editClosedRef.current) return
    editClosedRef.current = true
    setEditing(false)
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== team.name) onRename(team.id, trimmed)
  }

  const cancelEditing = () => {
    editClosedRef.current = true
    setEditing(false)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === KEY_ENTER) {
      commitName()
    } else if (event.key === KEY_ESCAPE) {
      cancelEditing()
    }
  }

  return (
    <>
      <UnstyledButton
        className={styles.cover}
        aria-label={team.name}
        aria-current={active || undefined}
        onClick={handleLoad}
        {...dragListeners}
      >
        <span className={styles.mosaic}>
          {cells.map((appearance, slot) => (
            <span key={slot} className={styles.cell}>
              {appearance && (
                <img
                  className={styles.art}
                  data-custom={appearance.usesCustomPortrait}
                  src={appearance.artUrl}
                  style={appearance.artObjectPosition ? { objectPosition: appearance.artObjectPosition } : undefined}
                  alt=''
                  draggable={false}
                  decoding='async'
                  loading='lazy'
                />
              )}
            </span>
          ))}
        </span>
        {!editing && (
          <>
            <span className={styles.scrim} />
            <span className={styles.name} title={team.name}>{team.name}</span>
          </>
        )}
      </UnstyledButton>

      {editing && (
        <div className={styles.editor}>
          <TextInput
            size='xs'
            autoFocus
            aria-label={renameLabel}
            value={draftName}
            onChange={(event) => setDraftName(event.currentTarget.value)}
            onBlur={commitName}
            onKeyDown={handleInputKeyDown}
          />
        </div>
      )}

      {!editing && (
        <div className={styles.tools}>
          <Tooltip label={renameLabel}>
            <ActionIcon className={styles.toolButton} variant='default' size='sm' aria-label={renameLabel} onClick={startEditing}>
              <IconPencil size={TOOL_ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={deleteLabel}>
            <ActionIcon
              className={styles.toolButton}
              variant='default'
              size='sm'
              aria-label={deleteLabel}
              onClick={() => onDelete(team.id)}
            >
              <IconTrash size={TOOL_ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}
    </>
  )
})
