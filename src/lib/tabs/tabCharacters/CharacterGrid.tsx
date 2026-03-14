import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'
import { ActionIcon, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useMergedRef } from '@mantine/hooks'
import { IconPencil, IconX } from '@tabler/icons-react'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { AppPages } from 'lib/constants/appPages'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { useGlobalStore } from 'lib/stores/appStore'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { updateCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Character, CharacterId } from 'types/character'
import { afterPaint } from 'lib/utils/afterPaint'
import { applyColorTransform, CharacterGridDebugPanel, ColorTransform, DebugToggles, DEFAULT_COLOR_TRANSFORM, DEFAULT_TOGGLES } from './CharacterGridDebugPanel'
import classes from './CharacterGrid.module.css'

const noop = () => {}
const DROP_ANIMATION_DURATION = 200

const dropAnimationConfig: DropAnimation = {
  duration: DROP_ANIMATION_DURATION,
  easing: 'ease',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0' } },
  }),
}

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
  const [toggles, setToggles] = useState<DebugToggles>(DEFAULT_TOGGLES)
  const [colorTransform, setColorTransform] = useState<ColorTransform>(DEFAULT_COLOR_TRANSFORM)

  useEffect(() => {
    setLocalFocus(null)
  }, [focusCharacter])

  const displayFocus = localFocus ?? focusCharacter

  const tGameData = i18next.getFixedT(null, 'gameData', 'Characters')

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as CharacterId)
  }

  function handleDragEnd(event: DragEndEvent) {
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
    void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions')
      .then(({ recalculatePermutations }) => recalculatePermutations())
    SaveState.delayedSave()
  }

  function handleDragCancel() {
    setTimeout(() => setActiveId(null), DROP_ANIMATION_DURATION)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()

    const currentIndex = filteredCharacters.findIndex((c) => c.id === focusCharacter)
    let nextIndex: number
    if (e.key === 'ArrowUp') {
      nextIndex = Math.max(0, currentIndex - 1)
    } else {
      nextIndex = Math.min(filteredCharacters.length - 1, currentIndex + 1)
    }
    if (nextIndex < 0 || nextIndex >= filteredCharacters.length) return

    const nextChar = filteredCharacters[nextIndex]
    if (nextChar) {
      useCharacterTabStore.getState().setFocusCharacter(nextChar.id)
    }
  }

  const handleRowClick = useCallback((characterId: CharacterId) => {
    setLocalFocus(characterId)
    afterPaint(() => useCharacterTabStore.getState().setFocusCharacter(characterId))
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
    <>
      <CharacterGridDebugPanel targetRef={gridRef} toggles={toggles} onTogglesChange={setToggles} colorTransform={colorTransform} onColorTransformChange={setColorTransform} />
      <OverlayScrollbarsComponent
        ref={osRef}
        className={classes.gridContainer}
        data-container-border={toggles.showContainerBorder}
        options={{ scrollbars: { autoHide: 'move', autoHideDelay: 500 } }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {filteredCharacters.map((character) => (
              <SortableCharacterRow
                key={character.id}
                character={character}
                rank={characters.indexOf(character)}
                isFocused={character.id === displayFocus}
                toggles={toggles}
                colorTransform={colorTransform}
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
                rank={characters.findIndex((c) => c.id === activeId)}
                toggles={toggles}
                colorTransform={colorTransform}
              />
            )}
          </DragOverlay>
        </DndContext>
      </OverlayScrollbarsComponent>
    </>
  )
}

type CharacterRowProps = {
  character: Character
  rank: number
  isFocused: boolean
  toggles: DebugToggles
  colorTransform: ColorTransform
  onClick: (id: CharacterId) => void
  onDoubleClick: (id: CharacterId) => void
  onEdit: (id: CharacterId) => void
  onRemove: (id: CharacterId) => void
}

const SortableCharacterRow = memo(function SortableCharacterRow({ character, rank, isFocused, toggles, colorTransform, onClick, onDoubleClick, onEdit, onRemove }: CharacterRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: character.id,
    animateLayoutChanges: () => false,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFocused) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isFocused])

  const mergedRef = useMergedRef(setNodeRef, scrollRef)

  const showcaseColor = getCharacterConfig(character.id)?.display.showcaseColor

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    backgroundColor: showcaseColor ? applyColorTransform(showcaseColor, colorTransform) : undefined,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <div
      ref={mergedRef}
      className={classes.root}
      data-selected={isFocused}
      data-scrim-mode={toggles.scrimMode}
      style={style}
      onClick={() => onClick(character.id)}
      onDoubleClick={() => onDoubleClick(character.id)}
      {...attributes}
      {...listeners}
    >
      <CharacterRowContent
        character={character}
        rank={rank}
        toggles={toggles}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  )
}, (prev, next) => {
  return prev.character.id === next.character.id
    && prev.rank === next.rank
    && prev.character.form === next.character.form
    && prev.isFocused === next.isFocused
    && prev.toggles === next.toggles
    && prev.colorTransform === next.colorTransform
})

function DragOverlayRow({ character, rank, toggles, colorTransform }: {
  character: Character
  rank: number
  toggles: DebugToggles
  colorTransform: ColorTransform
}) {
  const showcaseColor = getCharacterConfig(character.id)?.display.showcaseColor

  const style: React.CSSProperties = {
    backgroundColor: showcaseColor ? applyColorTransform(showcaseColor, colorTransform) : undefined,
    cursor: 'grabbing',
  }

  return (
    <div
      className={classes.root}
      data-dragging="true"
      data-scrim-mode={toggles.scrimMode}
      style={style}
    >
      <CharacterRowContent
        character={character}
        rank={rank}
        toggles={toggles}
        onEdit={noop}
        onRemove={noop}
      />
    </div>
  )
}

const CharacterRowContent = memo(function CharacterRowContent({ character, rank, toggles, onEdit, onRemove }: {
  character: Character
  rank: number
  toggles: DebugToggles
  onEdit: (id: CharacterId) => void
  onRemove: (id: CharacterId) => void
}) {
  const tGameData = i18next.getFixedT(null, 'gameData', 'Characters')
  const meta = getGameMetadata().characters[character.id]
  const characterName = tGameData(`${character.id}.LongName`)

  // Form data for eidolon/LC
  const eidolon = character.form?.characterEidolon ?? 0
  const lightConeId = character.form?.lightCone
  const superimposition = character.form?.lightConeSuperimposition ?? 1

  return (
    <>
      {/* Portrait background */}
      {toggles.showPortrait && (
        <div className={classes.portraitBg}>
          <img src={Assets.getCharacterPreviewById(character.id)} alt="" draggable={false} loading="lazy" />
        </div>
      )}

      {/* Scrim gradient */}
      <div className={classes.scrim} data-scrim-mode={toggles.scrimMode} />

      {/* Right-side frosted strip for LC area */}
      {toggles.showLcStrip && (
        <div className={classes.lcStrip} />
      )}

      {/* Content */}
      <div className={classes.inner}>
        {/* Rank / drag grip — grip replaces rank on hover */}
        {toggles.showRank && (
          <div className={classes.rankGripSlot}>
            <span className={classes.rank}>{rank + 1}</span>
            <div className={classes.dragGrip}>
              <span className={classes.gripLine} />
              <span className={classes.gripLine} />
              <span className={classes.gripLine} />
            </div>
          </div>
        )}

        {/* Name + subtitle (E/S badges) */}
        <div
          className={classes.info}
          data-name-shadow={toggles.nameShadow}
        >
          <div className={classes.name}>{characterName}</div>
          <div className={classes.subtitle}>
            {toggles.showEidolon && (
              <span className={classes.subtitleBadge}>E{eidolon}</span>
            )}
            {toggles.showLightCone && lightConeId && (
              <span className={classes.subtitleBadge}>S{superimposition}</span>
            )}
          </div>
        </div>

        {/* Light cone icon */}
        {toggles.showLightCone && lightConeId && (
          <div className={classes.lcWrap} data-lc-style={toggles.lcStyle}>
            <img src={Assets.getLightConeIconById(lightConeId)} alt="" draggable={false} />
          </div>
        )}
      </div>

      {/* Hover action buttons — overlay on the left */}
      {toggles.showActionButtons && (
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
      )}
    </>
  )
}, (prev, next) => {
  return prev.character.id === next.character.id
    && prev.rank === next.rank
    && prev.character.form === next.character.form
    && prev.toggles === next.toggles
})
