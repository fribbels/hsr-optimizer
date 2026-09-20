import {
  closestCenter,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  pointerWithin,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
  type useDraggable,
  type useSensors,
} from '@dnd-kit/core'
import {
  POINTER_DRAG_ACCESSIBILITY,
  usePointerDragSensors,
} from 'lib/tabs/tabTeamShowcase/pointerDragSensors'
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

/**
 * Card and overlay cells live in different coordinate spaces, so drag movement writes both DOM layers
 * together without routing per-frame work through React. Crossing a slot swaps against the currently
 * visible order; those swaps accumulate into the order committed on drop.
 */

/** Prefer the slot under the pointer; use the nearest card only after the pointer leaves the grid. */
const slotCollisionDetection: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args)
  return underPointer.length > 0 ? underPointer : closestCenter(args)
}

/** Drop clears transitions before React commits the reordered slots. */
const SLIDE_TRANSITION = 'transform 120ms cubic-bezier(0.2, 0, 0, 1)'
const NO_TRANSITION = 'none'
/** Above all isolated card internals while moving and settling. */
const LIFTED_Z_INDEX = '100'
const WILL_CHANGE_TRANSFORM = 'transform'
const TRANSITION_END_EVENT = 'transitionend'

/** Deferred so an ordinary dnd-kit drop can consume the final order before recovery resets it. */
const DRAG_RECOVERY_DELAY = 100
const RECOVERY_EVENTS = ['pointerup', 'pointercancel', 'blur']

/** Stationary overlay edges hide while a card passes over them. */
const CELL_EDGE_OPACITY_PROPERTY = '--cell-edge-opacity'
const HIDDEN_CELL_EDGE = '0'

/** Opaque mat backing prevents underlying cards showing through the lifted card's glass. */
const CARD_BACKING = 'var(--layer-inset)'
/** Full-resolution card radius; this node sits inside the scaled capture layer */
const CARD_BACKING_RADIUS = 'var(--radius-md)'

type DraggableResult = ReturnType<typeof useDraggable>

/** What a slot's overlay needs to make its card a drag source. Null when the grid has drag disabled. */
export interface SlotDragHandle {
  setActivatorNodeRef: DraggableResult['setActivatorNodeRef']
  /**
   * Only the listeners. dnd-kit's matching `attributes` are deliberately left off: they describe the
   * element to a screen reader as keyboard-draggable, and dragging here is pointer-only.
   */
  listeners: DraggableResult['listeners']
  /** This slot is the one being dragged */
  isDragging: boolean
  /** Some slot is being dragged, which is when the card controls stay out of the way */
  dragActive: boolean
}

export const SlotDragContext = createContext<SlotDragHandle | null>(null)

export interface SlotDragApi {
  /** Spread onto the DndContext that wraps both layers */
  dndProps: {
    sensors: ReturnType<typeof useSensors>,
    collisionDetection: CollisionDetection,
    accessibility: { screenReaderInstructions: ScreenReaderInstructions },
    onDragStart: (event: DragStartEvent) => void,
    onDragMove: (event: DragMoveEvent) => void,
    onDragOver: (event: DragOverEvent) => void,
    onDragEnd: (event: DragEndEvent) => void,
    onDragCancel: () => void,
  }
  /**
   * React key per slot. The keys are permuted on drop so each key stays with its character, which makes
   * React move the card's DOM node into its new position instead of re-rendering two cards' worth of
   * content in place. Picking a different character into a slot leaves the key alone, so that still
   * re-renders rather than remounting.
   */
  slotKeys: string[]
  /** Some slot is being dragged, which is what puts the card controls away */
  dragActive: boolean
  /** Stable per-slot ref callbacks for the two layers' cells */
  cardRefs: ((node: HTMLDivElement | null) => void)[]
  overlayRefs: ((node: HTMLDivElement | null) => void)[]
}

export function useSlotDrag({
  count,
  columns,
  scale,
  pitchX,
  pitchY,
  onReorder,
  onDrop,
}: {
  count: number,
  columns: number,
  /** Display scale of the card layer. The overlay layer is unscaled, so it works in display pixels. */
  scale: number,
  /** Full-resolution distance between the left edges of adjacent columns */
  pitchX: number,
  /** Full-resolution distance between the top edges of adjacent rows */
  pitchY: number,
  /** The arrangement the drag settled on, as the slot each position now takes its card from */
  onReorder?: (order: number[]) => void,
  /** The position the dragged card came to rest in, whether or not anything moved */
  onDrop?: (landed: number) => void,
}): SlotDragApi {
  const [slotKeys, setSlotKeys] = useState(() => createSlotKeys(count))
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const cardNodes = useRef<(HTMLDivElement | null)[]>([])
  const overlayNodes = useRef<(HTMLDivElement | null)[]>([])
  /** Live drag state keeps movement handlers independent of React renders. */
  const activeRef = useRef<number | null>(null)
  const sourceByPositionRef = useRef<number[]>([])
  const draggedPositionRef = useRef<number | null>(null)
  const pointerOffsetRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(0)

  if (slotKeys.length !== count) setSlotKeys(createSlotKeys(count))

  const cardRefs = useMemo(() => createNodeRefs(count, cardNodes), [count])
  const overlayRefs = useMemo(() => createNodeRefs(count, overlayNodes), [count])

  const stepX = pitchX * scale
  const stepY = pitchY * scale

  /** Moves one slot's two cells by a display-pixel offset. The card layer is inside the scaled wrapper. */
  const writeSlot = useCallback((index: number, dx: number, dy: number) => {
    applyTransform(cardNodes.current[index], dx / scale, dy / scale)
    applyTransform(overlayNodes.current[index], dx, dy)
  }, [scale])

  const setSlotTransition = useCallback((index: number, transition: string) => {
    applyTransition(cardNodes.current[index], transition)
    applyTransition(overlayNodes.current[index], transition)
  }, [])

  /** Puts every cell back to rest, with nothing armed that could animate afterwards */
  const clearAll = useCallback(() => {
    for (let index = 0; index < count; index++) {
      setSlotTransition(index, NO_TRANSITION)
      writeSlot(index, 0, 0)
      restCard(cardNodes.current[index])
      restOverlay(overlayNodes.current[index])
    }
  }, [count, setSlotTransition, writeSlot])

  /** Offset, in display pixels, from slot `from` to slot `to` */
  const offsetBetween = useCallback((from: number, to: number) => ({
    x: ((to % columns) - (from % columns)) * stepX,
    y: (Math.floor(to / columns) - Math.floor(from / columns)) * stepY,
  }), [columns, stepX, stepY])

  /** Puts every card where the previewed arrangement says it belongs. The dragged one follows the pointer. */
  const renderPreviewOrder = useCallback((order: number[], dragged: number) => {
    for (let position = 0; position < order.length; position++) {
      const slot = order[position]
      if (slot === dragged) continue
      const offset = offsetBetween(slot, position)
      writeSlot(slot, offset.x, offset.y)
    }
  }, [offsetBetween, writeSlot])

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const from = toIndex(active.id)
    if (from == null) return
    activeRef.current = from
    sourceByPositionRef.current = Array.from({ length: count }, (_, position) => position)
    draggedPositionRef.current = from
    pointerOffsetRef.current = { x: 0, y: 0 }

    // The card in flight has to track the pointer exactly; only the cards it displaces ease into place
    const slide = prefersReducedMotion() ? NO_TRANSITION : SLIDE_TRANSITION
    for (let index = 0; index < count; index++) setSlotTransition(index, index === from ? NO_TRANSITION : slide)

    liftCard(cardNodes.current[from])
    liftOverlay(overlayNodes.current[from])
    for (let index = 0; index < count; index++) {
      if (index !== from) hideCellEdge(overlayNodes.current[index])
    }

    setActiveIndex(from)
  }, [count, setSlotTransition])

  /** Puts the latest position on the card, once, immediately before the browser paints */
  const flushMove = useCallback(() => {
    frameRef.current = 0
    const from = activeRef.current
    if (from == null) return
    const offset = pointerOffsetRef.current
    writeSlot(from, offset.x, offset.y)
  }, [writeSlot])

  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    const from = activeRef.current
    if (from == null) return
    // Followed one for one. Holding the card inside the grid instead leaves the cursor able to travel on
    // without it, which reads as the card lagging rather than as a card that has been kept in bounds.
    pointerOffsetRef.current = delta

    // A high-polling mouse reports this ten times per displayed frame, and only the last report before a
    // paint can ever be seen. Booking a frame collapses them into the one write that is worth making.
    if (frameRef.current === 0) frameRef.current = requestAnimationFrame(flushMove)
  }, [flushMove])

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    const from = activeRef.current
    const held = draggedPositionRef.current
    if (from == null || held == null) return
    const to = over ? toIndex(over.id) : null
    if (to == null || to === held) return

    // Exchange with what is on screen at the new position, not with what started there, so cards the
    // drag has already passed over keep the places it put them
    const order = [...sourceByPositionRef.current]
    const displaced = order[to]
    order[to] = order[held]
    order[held] = displaced

    sourceByPositionRef.current = order
    draggedPositionRef.current = to
    renderPreviewOrder(order, from)
  }, [renderPreviewOrder])

  const reset = useCallback(() => {
    if (frameRef.current !== 0) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    clearAll()
    activeRef.current = null
    sourceByPositionRef.current = []
    draggedPositionRef.current = null
    pointerOffsetRef.current = { x: 0, y: 0 }
    setActiveIndex(null)
  }, [clearAll])

  /**
   * A drag whose end is never reported leaves the grid stuck mid-drag: the controls stay hidden and the
   * cursor stays a grab, with no way back short of a reload. dnd-kit misses the end when the press is
   * released somewhere it is not listening or the window is taken away mid-drag, so the window is watched
   * too and the cells are let down if the drag has outlived the press that started it.
   *
   * The check is deferred rather than run on the spot, because this fires on ordinary drops as well and
   * clearing there would take the arrangement away before the drop has read it.
   */
  useEffect(() => {
    if (activeIndex == null) return

    let pending = 0
    const recover = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        if (activeRef.current != null) reset()
      }, DRAG_RECOVERY_DELAY)
    }

    for (const event of RECOVERY_EVENTS) window.addEventListener(event, recover)
    return () => {
      window.clearTimeout(pending)
      for (const event of RECOVERY_EVENTS) window.removeEventListener(event, recover)
    }
  }, [activeIndex, reset])

  const handleDragEnd = useCallback(({ active }: DragEndEvent) => {
    const from = toIndex(active.id)
    if (from == null) {
      reset()
      return
    }
    // What the drag arrived at, rather than what dnd-kit reports at the drop, so the committed
    // arrangement is always the one that was on screen
    const order = sourceByPositionRef.current
    const landed = draggedPositionRef.current ?? from

    // The node objects outlive the reorder; their slot index does not, so take them before committing
    const cardNode = cardNodes.current[from]
    const overlayNode = overlayNodes.current[from]
    const offset = pointerOffsetRef.current
    const target = offsetBetween(from, landed)
    const settled = [...order]

    // Every transform goes away in the same commit that reorders the slots, so nothing is painted in
    // between: each displaced card is already standing exactly where the reorder is about to put it.
    reset()
    if (!isIdentity(settled)) {
      setSlotKeys((keys) => settled.map((slot) => keys[slot]))
      onReorder?.(settled)
    }
    onDrop?.(landed)

    // The dropped card is the one exception. It is left under the pointer and eased into its new slot,
    // which would otherwise be a jump of up to half a card.
    glide(cardNode, overlayNode, offset.x - target.x, offset.y - target.y, scale)
  }, [offsetBetween, onDrop, onReorder, reset, scale])

  const sensors = usePointerDragSensors()

  const dndProps = useMemo(() => ({
    sensors,
    collisionDetection: slotCollisionDetection,
    accessibility: POINTER_DRAG_ACCESSIBILITY,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: reset,
  }), [sensors, handleDragStart, handleDragMove, handleDragOver, handleDragEnd, reset])

  return {
    dndProps,
    slotKeys,
    dragActive: activeIndex != null,
    cardRefs,
    overlayRefs,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applyTransform(node: HTMLElement | null | undefined, dx: number, dy: number) {
  if (!node) return
  // translate3d keeps the moving cell on its own compositor layer
  node.style.transform = dx === 0 && dy === 0 ? '' : `translate3d(${dx}px, ${dy}px, 0)`
}

function applyTransition(node: HTMLElement | null | undefined, transition: string) {
  if (!node) return
  node.style.transition = transition
}

/**
 * Leaves the two cells of the dropped card where the pointer released them, then lets them ease back to
 * their slot. The reorder has already moved these nodes, so the starting offset is what is left over
 * between where the card was let go and where its new slot sits.
 *
 * Reading `offsetHeight` between the two writes is what makes it an animation rather than a jump: it
 * forces the browser to take the starting transform as a computed value, which the transition needs
 * something to animate from.
 */
function glide(
  cardNode: HTMLElement | null | undefined,
  overlayNode: HTMLElement | null | undefined,
  dx: number,
  dy: number,
  scale: number,
) {
  if (prefersReducedMotion() || (dx === 0 && dy === 0)) {
    restCard(cardNode)
    restOverlay(overlayNode)
    return
  }

  liftCard(cardNode)
  liftOverlay(overlayNode)
  applyTransform(cardNode, dx / scale, dy / scale)
  applyTransform(overlayNode, dx, dy)

  void cardNode?.offsetHeight
  void overlayNode?.offsetHeight

  applyTransition(cardNode, SLIDE_TRANSITION)
  applyTransition(overlayNode, SLIDE_TRANSITION)
  applyTransform(cardNode, 0, 0)
  applyTransform(overlayNode, 0, 0)

  onSettled(cardNode, restCard)
  onSettled(overlayNode, restOverlay)
}

/** Lets a cell down once it has finished easing into the slot it was dropped on */
function onSettled(node: HTMLElement | null | undefined, rest: (settled: HTMLElement) => void) {
  if (!node) return
  node.addEventListener(TRANSITION_END_EVENT, () => {
    node.style.transition = NO_TRANSITION
    rest(node)
  }, { once: true })
}

function liftCard(node: HTMLElement | null | undefined) {
  if (!node) return
  node.style.zIndex = LIFTED_Z_INDEX
  node.style.willChange = WILL_CHANGE_TRANSFORM
  node.style.backgroundColor = CARD_BACKING
  node.style.borderRadius = CARD_BACKING_RADIUS
}

function restCard(node: HTMLElement | null | undefined) {
  if (!node) return
  node.style.zIndex = ''
  node.style.willChange = ''
  node.style.backgroundColor = ''
  node.style.borderRadius = ''
}

/** The overlay cell carries no art, so it only needs to travel above its neighbours */
function liftOverlay(node: HTMLElement | null | undefined) {
  if (!node) return
  node.style.zIndex = LIFTED_Z_INDEX
  node.style.willChange = WILL_CHANGE_TRANSFORM
}

function restOverlay(node: HTMLElement | null | undefined) {
  if (!node) return
  node.style.zIndex = ''
  node.style.willChange = ''
  node.style.removeProperty(CELL_EDGE_OPACITY_PROPERTY)
}

function hideCellEdge(node: HTMLElement | null | undefined) {
  if (!node) return
  node.style.setProperty(CELL_EDGE_OPACITY_PROPERTY, HIDDEN_CELL_EDGE)
}

function createNodeRefs(count: number, store: { current: (HTMLDivElement | null)[] }) {
  return Array.from({ length: count }, (_, index) => (node: HTMLDivElement | null) => {
    store.current[index] = node
  })
}

function createSlotKeys(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `slot${index}`)
}

/** Whether the drag ended up putting everything back where it found it */
function isIdentity(order: number[]): boolean {
  return order.every((slot, position) => slot === position)
}

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Droppable ids are slot indices; anything else is not a slot */
function toIndex(id: UniqueIdentifier): number | null {
  return typeof id === 'number' ? id : null
}
