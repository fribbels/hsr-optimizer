import {
  DndContext,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import type { SimulationMetadataOverrides } from 'lib/characterPreview/characterPreviewTypes'
import {
  cardBorderRadius,
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import {
  SlotDragContext,
  type SlotDragHandle,
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
const PITCH_X = cardTotalW + GRID_GAP
const PITCH_Y = parentH + GRID_GAP

/**
 * Full-resolution screenshot grid with an unscaled interaction overlay. The captured card
 * layer is inert, so controls and hover effects stay out of exported images.
 */
export function TeamCardGrid({
  characters,
  simulationMetadataOverrides,
  interactionsEnabled,
  renderSlotOverlay,
  onSlotReorder,
  onSlotDrop,
}: {
  characters: (Character | null)[],
  simulationMetadataOverrides: (SimulationMetadataOverrides | undefined)[],
  interactionsEnabled: boolean,
  renderSlotOverlay: (index: number, character: Character | null) => ReactNode,
  onSlotReorder: (order: number[]) => void,
  onSlotDrop: (landed: number) => void,
}) {
  const scale = DISPLAY_SCALE
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
        className={styles.viewport}
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
                  simulationMetadataOverrides={simulationMetadataOverrides[index]}
                />
              </div>
            ))}
          </div>
        </div>

        {interactionsEnabled && (
          <div
            className={styles.overlayLayer}
            style={{
              'gridTemplateColumns': '1fr 1fr',
              'gap': overlayGap,
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

/** Keeps dnd-kit's measured drop target stationary while its inner cell moves. */
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
