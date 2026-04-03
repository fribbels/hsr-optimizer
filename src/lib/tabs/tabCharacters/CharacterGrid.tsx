import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { OverlayScrollbarsComponent, type OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'
import { ActionIcon, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useMergedRef } from '@mantine/hooks'
import { IconPencil, IconX } from '@tabler/icons-react'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { showImageOnLoad } from 'lib/utils/frontendUtils'
import { AppPages } from 'lib/constants/appPages'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { updateCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import React, {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Character, CharacterId } from 'types/character'
import { afterPaint } from 'lib/utils/frontendUtils'
import { oklchCharacterListColor } from 'lib/characterPreview/color/colorUtilsOklch'
import { DEFAULT_CONFIG } from 'lib/characterPreview/color/colorPipelineConfig'
import { PartsArray } from 'lib/constants/constants'
import classes from './CharacterGrid.module.css'

const noop = () => {}
const DROP_ANIMATION_DURATION = 200

// --- Equip dot indicator ---

const EQUIP_DOT_COLORS = { partial: '#b89040', empty: '#903040', size: 5 }

function EquipDotInline({ characterId }: { characterId: CharacterId }) {
  // Read equipped directly from store to bypass stale-prop issues caused by
  // Mantine's flushSync in the relic modal save path. Without this, the
  // CharacterRowContent memo can see stale fiber state and skip re-rendering
  // EquipDotInline after an equipment change.
  const equipped = useCharacterStore((s) => s.charactersById[characterId]?.equipped)

  const count = PartsArray.filter((p) => equipped?.[p]).length
  if (count === 6) return null

  const color = count === 0 ? EQUIP_DOT_COLORS.empty : EQUIP_DOT_COLORS.partial

  return (
    <span
      className={classes.equipDot}
      style={{
        background: color,
        width: EQUIP_DOT_COLORS.size,
        height: EQUIP_DOT_COLORS.size,
      }}
    />
  )
}

const dropAnimationConfig: DropAnimation = {
  duration: DROP_ANIMATION_DURATION,
  easing: 'ease',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0' } },
  }),
}

// Progressive image loading: set src on the first visible rows immediately,
// then trickle one-by-one to avoid concurrent requests competing for bandwidth.
const INITIAL_LOAD_COUNT = 12
const TRICKLE_DELAY = 50

export function CharacterGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const osRef = useCallback((instance: OverlayScrollbarsComponentRef<'div'> | null) => {
    (gridRef as React.MutableRefObject<HTMLDivElement | null>).current = instance?.getElement() ?? null
  }, [])
  const characters = useCharacterStore((s) => s.characters)
  const filters = useCharacterTabStore((s) => s.filters)
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)

  const [localFocus, setLocalFocus] = useState<CharacterId | null>(null)
  const [activeId, setActiveId] = useState<CharacterId | null>(null)

  useEffect(() => {
    setLocalFocus(null)
  }, [focusCharacter])

  const displayFocus = localFocus ?? focusCharacter

  const tGameData = useMemo(() => i18next.getFixedT(null, 'gameData', 'Characters'), [])

  const filteredCharacters = useMemo(() => {
    if (filters.element.length + filters.path.length + filters.name.length === 0) {
      return characters
    }
    return characters.filter((char) => {
      const meta = getGameMetadata().characters[char.id]
      if (filters.element.length && !filters.element.includes(meta.element)) return false
      if (filters.path.length && !filters.path.includes(meta.path)) return false
      return tGameData(`${meta.id}.LongName`).toLowerCase().includes(filters.name)
    })
  }, [characters, filters, tGameData])

  const rankMap = useMemo(
    () => new Map(characters.map((c, i) => [c.id, i])),
    [characters],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as CharacterId)
    gridRef.current?.setAttribute('data-dragging-active', '')
  }

  function handleDragEnd(event: DragEndEvent) {
    gridRef.current?.removeAttribute('data-dragging-active')

    // Suppress row transitions for one paint so reordered rows snap into place
    // instead of animating from stale positions (the "float from top" glitch)
    const container = gridRef.current
    if (container) {
      container.setAttribute('data-suppress-transition', 'true')
      afterPaint(() => container.removeAttribute('data-suppress-transition'))
    }

    // Clear activeId after drop animation so the overlay content stays rendered
    setTimeout(() => setActiveId(null), DROP_ANIMATION_DURATION)

    const { active, over } = event
    if (!over || active.id === over.id) return

    const newIndex = characters.findIndex((c) => c.id === over.id)
    if (newIndex === -1) return

    useCharacterStore.getState().insertCharacter(active.id as CharacterId, newIndex)
    SaveState.delayedSave()
  }

  function handleDragCancel() {
    gridRef.current?.removeAttribute('data-dragging-active')
    setTimeout(() => setActiveId(null), DROP_ANIMATION_DURATION)
  }

  const handleRowClick = useCallback((characterId: CharacterId) => {
    setLocalFocus(characterId)
    startTransition(() => useCharacterTabStore.getState().setFocusCharacter(characterId))
  }, [])

  const handleRowDoubleClick = useCallback((characterId: CharacterId) => {
    useGlobalStore.getState().setActiveKey(AppPages.OPTIMIZER)
    updateCharacter(characterId)
  }, [])

  const handleEdit = useCallback((characterId: CharacterId) => {
    useCharacterModalStore.getState().openOverlay({
      initialCharacter: getCharacterById(characterId) ?? null,
      onOk: CharacterTabController.onCharacterModalOk,
    })
  }, [])

  const handleRemove = useCallback((characterId: CharacterId) => {
    const t = i18next.getFixedT(null, 'charactersTab')
    modals.openConfirmModal({
      title: i18next.t('common:Confirm'),
      children: t('Messages.DeleteWarning', { charId: characterId }),
      labels: { confirm: i18next.t('common:Confirm'), cancel: i18next.t('common:Cancel') },
      centered: true,
      onConfirm: () => CharacterTabController.removeCharacter(characterId),
    })
  }, [])

  const itemIds = useMemo(() => filteredCharacters.map((c) => c.id), [filteredCharacters])

  return (
      <OverlayScrollbarsComponent
        ref={osRef}
        className={classes.gridContainer}
        data-container-border="true"
        options={{ scrollbars: { autoHide: 'move', autoHideDelay: 500 } }}
        tabIndex={0}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {filteredCharacters.map((character, i) => (
              <SortableCharacterRow
                key={character.id}
                character={character}
                rank={rankMap.get(character.id) ?? 0}
                isFocused={character.id === displayFocus}
                loadDelay={i < INITIAL_LOAD_COUNT ? 0 : (i - INITIAL_LOAD_COUNT + 1) * TRICKLE_DELAY}
                onClick={handleRowClick}
                onDoubleClick={handleRowDoubleClick}
                onEdit={handleEdit}
                onRemove={handleRemove}
              />
            ))}
          </SortableContext>
          <DragOverlay dropAnimation={dropAnimationConfig} modifiers={[restrictToVerticalAxis]}>
            {activeId && getCharacterById(activeId) && (
              <DragOverlayRow
                character={getCharacterById(activeId)!}
                rank={rankMap.get(activeId) ?? 0}
              />
            )}
          </DragOverlay>
        </DndContext>
      </OverlayScrollbarsComponent>
  )
}

type CharacterRowProps = {
  character: Character
  rank: number
  isFocused: boolean
  loadDelay: number
  onClick: (id: CharacterId) => void
  onDoubleClick: (id: CharacterId) => void
  onEdit: (id: CharacterId) => void
  onRemove: (id: CharacterId) => void
}

const SortableCharacterRow = memo(function SortableCharacterRow({ character, rank, isFocused, loadDelay, onClick, onDoubleClick, onEdit, onRemove }: CharacterRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: character.id,
    animateLayoutChanges: () => false,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Per-row staggered image loading — replaces parent-level trickle to avoid parent re-renders
  const [loadImages, setLoadImages] = useState(loadDelay === 0)
  useEffect(() => {
    if (loadDelay === 0) return
    const timer = setTimeout(() => setLoadImages(true), loadDelay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only: delay is captured from initial render

  useEffect(() => {
    if (isFocused) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isFocused])

  const mergedRef = useMergedRef(setNodeRef, scrollRef)

  const showcaseColor = getCharacterConfig(character.id)?.display.showcaseColor

  const backgroundColor = useMemo(
    () => showcaseColor ? oklchCharacterListColor(showcaseColor, true, DEFAULT_CONFIG) : undefined,
    [showcaseColor],
  )

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    backgroundColor,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <div
      ref={mergedRef}
      className={classes.root}
      data-selected={isFocused}
      data-scrim-mode="frosted"
      style={style}
      onClick={() => onClick(character.id)}
      onDoubleClick={() => onDoubleClick(character.id)}
      {...attributes}
      {...listeners}
    >
      <CharacterRowContent
        character={character}
        rank={rank}
        loadImages={loadImages}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  )
}, (prev, next) => {
  return prev.character.id === next.character.id
    && prev.rank === next.rank
    && prev.character.form === next.character.form
    && prev.character.equipped === next.character.equipped
    && prev.isFocused === next.isFocused
})

function DragOverlayRow({ character, rank }: {
  character: Character
  rank: number
}) {
  const showcaseColor = getCharacterConfig(character.id)?.display.showcaseColor

  const style: React.CSSProperties = {
    backgroundColor: showcaseColor ? oklchCharacterListColor(showcaseColor, true, DEFAULT_CONFIG) : undefined,
    cursor: 'grabbing',
  }

  return (
    <div
      className={classes.root}
      data-dragging="true"
      data-scrim-mode="frosted"
      style={style}
    >
      <CharacterRowContent
        character={character}
        rank={rank}
        loadImages={true}
        onEdit={noop}
        onRemove={noop}
      />
    </div>
  )
}

const CharacterRowContent = memo(function CharacterRowContent({ character, rank, loadImages, onEdit, onRemove }: {
  character: Character
  rank: number
  loadImages: boolean
  onEdit: (id: CharacterId) => void
  onRemove: (id: CharacterId) => void
}) {
  const tGameData = i18next.getFixedT(null, 'gameData', 'Characters')
  const longName = tGameData(`${character.id}.LongName`) as string
  const characterName = longName.includes('(') ? longName : tGameData(`${character.id}.Name`)

  // Form data for eidolon/LC
  const eidolon = character.form?.characterEidolon ?? 0
  const lightConeId = character.form?.lightCone
  const superimposition = character.form?.lightConeSuperimposition ?? 1

  return (
    <>
      {/* Portrait background */}
      <div className={classes.portraitBg}>
        <img
          src={loadImages ? Assets.getCharacterPreviewById(character.id) : undefined}
          alt=""
          draggable={false}
          decoding="async"
          style={getCharacterConfig(character.id)?.display.gridPortraitOffset
            ? { marginTop: -(getCharacterConfig(character.id)?.display.gridPortraitOffset ?? 0) }
            : undefined}
        />
      </div>

      {/* Scrim gradient */}
      <div className={classes.scrim} data-scrim-mode="frosted" />

      {/* Right-side frosted strip for LC area */}
      <div className={classes.lcStrip} />

      {/* Content */}
      <div className={classes.inner}>

        {/* Rank / drag grip — grip replaces rank on hover */}
        <div className={classes.rankGripSlot}>
          <span className={classes.rank}>{rank + 1}</span>
          <div className={classes.dragGrip}>
            <span className={classes.gripLine} />
            <span className={classes.gripLine} />
            <span className={classes.gripLine} />
          </div>
        </div>

        {/* Name + subtitle (E/S badges) */}
        <div
          className={classes.info}
          data-name-shadow="true"
        >
          <div className={classes.name}>{characterName}</div>
          <div className={classes.subtitle}>
            <span className={classes.subtitleBadge}>E{eidolon}</span>
            <span className={classes.subtitleBadge}>S{lightConeId ? superimposition : 0}</span>
            <EquipDotInline characterId={character.id} />
          </div>
        </div>

        {/* Light cone icon */}
        {lightConeId && (
          <div className={classes.lcWrap} data-lc-style="shadow">
            <img src={loadImages ? Assets.getLightConeIconById(lightConeId) : undefined} alt="" draggable={false} decoding="async" onLoad={showImageOnLoad} />
          </div>
        )}
      </div>

      {/* Hover action buttons — overlay on the left */}
      <div className={classes.actions}>
        <Tooltip label="Edit" position="top" withArrow>
          <ActionIcon
            size={24}
            variant="subtle"
            className={classes.actionBtn}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(character.id)
            }}
          >
            <IconPencil size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Remove" position="top" withArrow>
          <ActionIcon
            size={24}
            variant="subtle"
            className={classes.actionBtn}
            onClick={(e) => {
              e.stopPropagation()
              onRemove(character.id)
            }}
          >
            <IconX size={12} />
          </ActionIcon>
        </Tooltip>
      </div>
    </>
  )
}, (prev, next) => {
  return prev.character.id === next.character.id
    && prev.rank === next.rank
    && prev.character.form === next.character.form
    && prev.loadImages === next.loadImages
})
