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
import { TEAM_SIZE } from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import styles from 'lib/tabs/tabTeamShowcase/trials/savedTeams/SavedTeamsList.module.css'
import type { SavedTeamsListProps } from 'lib/tabs/tabTeamShowcase/trials/trialTypes'
import { useSlotAppearances } from 'lib/tabs/tabTeamShowcase/useSlotAppearance'
import { OVERLAY_SCROLLBAR_OPTIONS } from 'lib/ui/selectors/selectConstants'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { KeyboardEvent } from 'react'
import {
  useCallback,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  TeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'

const TOOL_ICON_SIZE = 14
const KEY_ENTER = 'Enter'
const KEY_ESCAPE = 'Escape'
/** Dragging only ever moves a tile up or down, so sideways travel is discarded rather than drawn */
const DRAG_MODIFIERS = [restrictToVerticalAxis]

/**
 * The scrolling list of saved teams, which can be dragged into any order.
 *
 * A tile is both the drag handle and the button that loads its team, so the two have to be told apart.
 * Movement does that on the way in, through the shared activation thresholds. On the way out a drag still
 * ends in a click, which would load the team the user had only meant to move, so a drag latches a flag
 * that the next click spends.
 */
export function SavedTeamsList({ state }: SavedTeamsListProps) {
  const { t } = useTranslation('teamShowcaseTab')
  const {
    activeSavedTeamId,
    savedTeams,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    moveSavedTeam,
  } = state

  const sensors = usePointerDragSensors()
  const draggedRef = useRef(false)
  const teamIds = savedTeams.map((team) => team.id)

  const handleDragStart = useCallback(() => {
    draggedRef.current = true
  }, [])

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = teamIds.indexOf(active.id as TeamId)
    const to = teamIds.indexOf(over.id as TeamId)
    if (from >= 0 && to >= 0) moveSavedTeam(from, to)
  }, [moveSavedTeam, teamIds])

  /** True once per drag, so the click the drag ends in does not also load the team */
  const consumeDrag = useCallback(() => {
    const dragged = draggedRef.current
    draggedRef.current = false
    return dragged
  }, [])

  return (
    <OverlayScrollbarsComponent className={styles.scroll} options={OVERLAY_SCROLLBAR_OPTIONS} defer>
      {savedTeams.length === 0
        ? (
          <div className={styles.empty}>
            <span className={styles.emptyTitle}>{t('SavedTeams.Empty')}</span>
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
          >
            <SortableContext items={teamIds} strategy={verticalListSortingStrategy}>
              {savedTeams.map((team) => (
                <SavedTeamTile
                  key={team.id}
                  team={team}
                  active={team.id === activeSavedTeamId}
                  deleteLabel={t('SavedTeams.Delete')}
                  renameLabel={t('SavedTeams.Rename')}
                  consumeDrag={consumeDrag}
                  onLoad={loadSavedTeam}
                  onDelete={deleteSavedTeam}
                  onRename={renameSavedTeam}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
    </OverlayScrollbarsComponent>
  )
}

/**
 * One saved team. The cover is the load target and the drag handle both; rename and delete appear over it
 * on hover or focus, and being above it they never start a drag of their own.
 */
function SavedTeamTile({
  team,
  active,
  deleteLabel,
  renameLabel,
  consumeDrag,
  onLoad,
  onDelete,
  onRename,
}: {
  team: TeamShowcaseSavedTeam,
  active: boolean,
  deleteLabel: string,
  renameLabel: string,
  consumeDrag: () => boolean,
  onLoad: (id: TeamId) => void,
  onDelete: (id: TeamId) => void,
  onRename: (id: TeamId, name: string) => void,
}) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(team.name)
  // Enter and Escape close the editor, and removing a focused input may still fire blur afterwards.
  // This guard keeps that trailing blur from renaming twice or undoing a cancel.
  const editClosedRef = useRef(false)
  const appearances = useSlotAppearances(team.characterIds)
  const cells = Array.from({ length: TEAM_SIZE }, (_, slot) => appearances[slot] ?? null)

  // dnd-kit's matching `attributes` are left off deliberately: they describe the tile to a screen reader
  // as keyboard-draggable, and dragging here is pointer-only.
  const {
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id })

  const handleLoad = () => {
    if (consumeDrag()) return
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
    <div
      ref={setNodeRef}
      className={styles.tile}
      data-active={active}
      data-dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <UnstyledButton
        className={styles.cover}
        aria-label={team.name}
        aria-current={active || undefined}
        onClick={handleLoad}
        {...listeners}
      >
        <span className={styles.mosaic}>
          {cells.map((appearance, slot) => (
            <span key={slot} className={styles.cell}>
              {appearance && (
                <img
                  className={styles.art}
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
            <ActionIcon variant='default' size='sm' aria-label={renameLabel} onClick={startEditing}>
              <IconPencil size={TOOL_ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={deleteLabel}>
            <ActionIcon variant='default' size='sm' aria-label={deleteLabel} onClick={() => onDelete(team.id)}>
              <IconTrash size={TOOL_ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
