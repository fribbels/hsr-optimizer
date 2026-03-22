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
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { useGlobalStore } from 'lib/stores/appStore'
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
import { applyColorTransform, CharacterGridDebugPanel, type ColorTransform, type DebugToggles, EQUIP_DOT_PRESETS, DEFAULT_COLOR_TRANSFORM, DEFAULT_TOGGLES } from './CharacterGridDebugPanel'
import { PartsArray } from 'lib/constants/constants'
import classes from './CharacterGrid.module.css'

const noop = () => {}
const DROP_ANIMATION_DURATION = 200

// --- Equip dot indicator ---

type EquipStatus = 'full' | 'partial' | 'empty'

function getEquipStatus(character: Character): EquipStatus {
  const count = PartsArray.filter((p) => character.equipped?.[p]).length
  return count === 6 ? 'full' : count === 0 ? 'empty' : 'partial'
}

function EquipDotInline({ character, toggles }: { character: Character; toggles: DebugToggles }) {
  if (toggles.equipIndicator === 'off') return null
  const preset = EQUIP_DOT_PRESETS.find((p) => p.value === toggles.equipIndicator)
  if (!preset) return null

  const status = getEquipStatus(character)
  const color = preset.style[status]

  return (
    <span
      className={classes.equipDot}
      style={{
        background: color,
        width: preset.style.size,
        height: preset.style.size,
        opacity: preset.style.opacity,
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
  const [toggles, setToggles] = useState<DebugToggles>(DEFAULT_TOGGLES)
  const [colorTransform, setColorTransform] = useState<ColorTransform>(DEFAULT_COLOR_TRANSFORM)

  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD_COUNT)

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

  useEffect(() => {
    if (loadedCount >= filteredCharacters.length) return
    const timer = setTimeout(() => setLoadedCount((c) => c + 1), TRICKLE_DELAY)
    return () => clearTimeout(timer)
  }, [loadedCount, filteredCharacters.length])

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
    SaveState.delayedSave()
  }

  function handleDragCancel() {
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
    <>
      <CharacterGridDebugPanel targetRef={gridRef} toggles={toggles} onTogglesChange={setToggles} colorTransform={colorTransform} onColorTransformChange={setColorTransform} />
      <OverlayScrollbarsComponent
        ref={osRef}
        className={classes.gridContainer}
        data-container-border={toggles.showContainerBorder}
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
                loadImages={i < loadedCount}
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
                rank={rankMap.get(activeId) ?? 0}
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
  loadImages: boolean
  toggles: DebugToggles
  colorTransform: ColorTransform
  onClick: (id: CharacterId) => void
  onDoubleClick: (id: CharacterId) => void
  onEdit: (id: CharacterId) => void
  onRemove: (id: CharacterId) => void
}

const SortableCharacterRow = memo(function SortableCharacterRow({ character, rank, isFocused, loadImages, toggles, colorTransform, onClick, onDoubleClick, onEdit, onRemove }: CharacterRowProps) {
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

  const backgroundColor = useMemo(
    () => showcaseColor ? applyColorTransform(showcaseColor, colorTransform) : undefined,
    [showcaseColor, colorTransform],
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
        loadImages={loadImages}
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
    && prev.loadImages === next.loadImages
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
        loadImages={true}
        toggles={toggles}
        onEdit={noop}
        onRemove={noop}
      />
    </div>
  )
}

const CharacterRowContent = memo(function CharacterRowContent({ character, rank, loadImages, toggles, onEdit, onRemove }: {
  character: Character
  rank: number
  loadImages: boolean
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
          <img src={loadImages ? Assets.getCharacterPreviewById(character.id) : undefined} alt="" draggable={false} decoding="async" />
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
            <EquipDotInline character={character} toggles={toggles} />
          </div>
        </div>

        {/* Light cone icon */}
        {toggles.showLightCone && lightConeId && (
          <div className={classes.lcWrap} data-lc-style={toggles.lcStyle}>
            <img src={loadImages ? Assets.getLightConeIconById(lightConeId) : undefined} alt="" draggable={false} decoding="async" onLoad={showImageOnLoad} />
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
    && prev.loadImages === next.loadImages
    && prev.toggles === next.toggles
})
