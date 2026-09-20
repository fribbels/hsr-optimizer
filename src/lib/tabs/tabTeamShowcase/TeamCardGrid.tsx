import {
  DndContext,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  cardBorderRadius,
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import {
  type SlotDragHandle,
  SlotDragContext,
  useSlotDrag,
} from 'lib/tabs/tabTeamShowcase/slotDrag'
import styles from 'lib/tabs/tabTeamShowcase/TeamCardGrid.module.css'
import {
  DISPLAY_SCALE,
  GRID_ELEMENT_ID,
  GRID_GAP,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react'
import type { Character } from 'types/character'

const COLUMNS = 2
/** Full-resolution distance between the left edges of adjacent cards, and between their top edges */
const PITCH_X = cardTotalW + GRID_GAP
const PITCH_Y = parentH + GRID_GAP

/**
 * The 2x2 card grid that the screenshot captures, rendered at full card resolution and
 * shrunk for display. The cards are inert: they take no clicks, hovers, or focus. All
 * interaction comes from `renderSlotOverlay`, which sits in a layer above the grid, outside
 * the captured element, so it never appears in the screenshot. The overlay also draws each
 * card's hairline edge, for the same reason.
 *
 * Both layers are laid out as cells in the same order, and a drag moves the two cells of one slot
 * together. The drag itself lives in `slotDrag.ts`; the overlay reaches its handle through
 * `SlotDragContext` rather than through the render prop, so the prop stays a plain view of a slot.
 */
export function TeamCardGrid({
  characters,
  scale = DISPLAY_SCALE,
  renderSlotOverlay,
  onSlotReorder,
  onSlotDrop,
  className,
}: {
  characters: (Character | null)[],
  /** Display scale of the full-resolution grid */
  scale?: number,
  /** Per-slot controls layered over each card, kept out of the capture */
  renderSlotOverlay?: (index: number, character: Character | null) => ReactNode,
  /** A drag rearranged the cards, given as the slot each position now takes its card from */
  onSlotReorder?: (order: number[]) => void,
  /** The position a dragged card came to rest in, whether or not anything moved */
  onSlotDrop?: (landed: number) => void,
  className?: string,
}) {
  const overlayGap = GRID_GAP * scale
  const drag = useSlotDrag({
    count: characters.length,
    columns: COLUMNS,
    scale,
    pitchX: PITCH_X,
    pitchY: PITCH_Y,
    onReorder: onSlotReorder,
    onDrop: onSlotDrop,
  })

  return (
    <DndContext {...drag.dndProps}>
      <div
        className={[styles.viewport, className].filter(Boolean).join(' ')}
        style={{
          width: GRID_SIZE.width * scale,
          height: GRID_SIZE.height * scale,
        }}
      >
        <div
          className={styles.scaleWrapper}
          style={{ transform: `scale(${scale})` }}
          inert
        >
          <div
            id={GRID_ELEMENT_ID}
            className={styles.grid}
            style={{
              gridTemplateColumns: `${cardTotalW}px ${cardTotalW}px`,
              gap: GRID_GAP,
              width: GRID_SIZE.width,
            }}
          >
            {characters.map((character, index) => (
              <div
                key={drag.slotKeys[index]}
                ref={drag.cardRefs[index]}
                className={styles.cardCell}
              >
                <CharacterPreview
                  id={`teamShowcaseCard${drag.slotKeys[index]}`}
                  source={ShowcaseSource.TEAM}
                  character={character}
                />
              </div>
            ))}
          </div>
        </div>

        {renderSlotOverlay && (
          <div
            className={styles.overlayLayer}
            style={{
              gridTemplateColumns: '1fr 1fr',
              gap: overlayGap,
              '--team-card-radius': `${cardBorderRadius * scale}px`,
            } as CSSProperties}
          >
            {characters.map((character, index) => (
              <SlotDragCell
                key={drag.slotKeys[index]}
                index={index}
                innerRef={drag.overlayRefs[index]}
                dragActive={drag.dragActive}
              >
                {renderSlotOverlay(index, character)}
              </SlotDragCell>
            ))}
          </div>
        )}
      </div>
    </DndContext>
  )
}

/**
 * One cell of the overlay layer. The outer node is what dnd-kit measures and is never transformed, so a
 * drag can move the inner node without shifting the drop target out from under the pointer.
 *
 * dnd-kit re-renders every draggable on every pointer move. That is why the handle it hands down is
 * memoized on values that only change when a drag starts or ends: the overlay reads it from context, and
 * an unchanged context value leaves the overlay and the card inside it alone for the length of the drag.
 */
function SlotDragCell({ index, innerRef, dragActive, children }: {
  index: number,
  innerRef: (node: HTMLDivElement | null) => void,
  dragActive: boolean,
  children: ReactNode,
}) {
  const { setNodeRef: setDroppableRef } = useDroppable({ id: index })
  const {
    setNodeRef: setDraggableRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
  } = useDraggable({ id: index })

  const setCellRef = useCallback((node: HTMLDivElement | null) => {
    setDroppableRef(node)
    setDraggableRef(node)
  }, [setDroppableRef, setDraggableRef])

  const handle = useMemo<SlotDragHandle>(
    () => ({ setActivatorNodeRef, listeners, isDragging, dragActive }),
    [setActivatorNodeRef, listeners, isDragging, dragActive],
  )

  return (
    <div ref={setCellRef} className={styles.overlayCell}>
      <div ref={innerRef} className={styles.overlayCellInner}>
        <SlotDragContext.Provider value={handle}>{children}</SlotDragContext.Provider>
      </div>
    </div>
  )
}
