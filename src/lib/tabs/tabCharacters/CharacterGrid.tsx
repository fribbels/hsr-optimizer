import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Flex } from '@mantine/core'
import { useMergedRef } from '@mantine/hooks'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { AppPages } from 'lib/constants/appPages'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useCharacterStore } from 'lib/stores/characterStore'
import { useGlobalStore } from 'lib/stores/appStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
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
import classes from './CharacterGrid.module.css'

export function CharacterGrid() {
  const characters = useCharacterStore((s) => s.characters)
  const filters = useCharacterTabStore((s) => s.filters)
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)

  const [localFocus, setLocalFocus] = useState<CharacterId | null>(null)

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const newIndex = characters.findIndex((c) => c.id === over.id)
    if (newIndex === -1) return

    useCharacterStore.getState().insertCharacter(active.id as CharacterId, newIndex)
    void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions')
      .then(({ recalculatePermutations }) => recalculatePermutations())
    SaveState.delayedSave()
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

  const itemIds = useMemo(() => filteredCharacters.map((c) => c.id), [filteredCharacters])

  return (
    <div
      className={classes.gridContainer}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {filteredCharacters.map((character) => (
            <SortableCharacterRow
              key={character.id}
              character={character}
              isFocused={character.id === displayFocus}
              onClick={handleRowClick}
              onDoubleClick={handleRowDoubleClick}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Thin wrapper — useSortable forces re-renders on every drag move via context.
// This component is intentionally minimal: just the drag transform wrapper.
// The expensive content is in CharacterRowContent which is memoized separately.

type CharacterRowProps = {
  character: Character
  isFocused: boolean
  onClick: (id: CharacterId) => void
  onDoubleClick: (id: CharacterId) => void
}

function SortableCharacterRow({ character, isFocused, onClick, onDoubleClick }: CharacterRowProps) {
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

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={mergedRef}
      className={`${classes.row} ${isFocused ? classes.rowFocused : ''}`}
      style={style}
      onClick={() => onClick(character.id)}
      onDoubleClick={() => onDoubleClick(character.id)}
      {...attributes}
      {...listeners}
    >
      <CharacterRowContent character={character} />
    </div>
  )
}

// Memoized content — skips re-rendering during drag because props don't change.
// Only re-renders when character data (id, rank, equipped) actually changes.

const CharacterRowContent = memo(function CharacterRowContent({ character }: { character: Character }) {
  const tGameData = i18next.getFixedT(null, 'gameData', 'Characters')
  const characterNameString = tGameData(`${character.id}.LongName`)

  const nameSections = characterNameString.includes(' (')
    ? characterNameString.split(' (')
      .map((section) => section.trim())
      .map((section, index) => index === 1 ? ` (${section} ` : section)
    : characterNameString.split(/ - |•/)
      .map((section) => section.trim())

  const nameSectionRender = nameSections
    .map((section, index) => <span key={index} className={classes.nameSection}>{section}</span>)

  const equippedNumber = character.equipped ? Object.values(character.equipped).filter((x) => x != undefined).length : 0
  let color = '#81d47e'
  if (equippedNumber < 6) color = 'rgb(229, 135, 66)'
  if (equippedNumber < 1) color = '#d72f2f'

  return (
    <>
      <div className={classes.iconCell}>
        <img src={Assets.getCharacterAvatarById(character.id)} className={classes.characterIcon} />
      </div>

      <div className={classes.rankCell}>
        <span>{character.rank + 1}</span>
      </div>

      <Flex align='center' className={classes.nameContainer}>
        <div className={classes.nameText}>
          {nameSectionRender}
        </div>
        <div className={classes.equippedIndicator} style={{ backgroundColor: color }} />
      </Flex>
    </>
  )
}, (prev, next) => {
  return prev.character.id === next.character.id
    && prev.character.rank === next.character.rank
    && prev.character.equipped === next.character.equipped
})
