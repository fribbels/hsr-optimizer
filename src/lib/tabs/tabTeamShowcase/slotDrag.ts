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

const slotCollisionDetection: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args)
  return underPointer.length > 0 ? underPointer : closestCenter(args)
}

const SLIDE_DURATION_MS = 120
const SETTLE_FALLBACK_DELAY_MS = SLIDE_DURATION_MS + 50
const SLIDE_TRANSITION = `transform ${SLIDE_DURATION_MS}ms cubic-bezier(0.2, 0, 0, 1)`
const NO_TRANSITION = 'none'
const LIFTED_Z_INDEX = '100'
const WILL_CHANGE_TRANSFORM = 'transform'
const TRANSITION_END_EVENT = 'transitionend'
const TRANSITION_CANCEL_EVENT = 'transitioncancel'
const pendingSettleCleanup = new WeakMap<HTMLElement, () => void>()

const DRAG_RECOVERY_DELAY = 100
const RECOVERY_EVENTS = ['pointerup', 'pointercancel', 'blur'] as const

const CELL_EDGE_OPACITY_PROPERTY = '--cell-edge-opacity'
const HIDDEN_CELL_EDGE = '0'

const CARD_BACKING = 'var(--layer-inset)'
const CARD_BACKING_RADIUS = 'var(--radius-md)'

type DraggableResult = ReturnType<typeof useDraggable>

export interface SlotDragHandle {
  setActivatorNodeRef: DraggableResult['setActivatorNodeRef']
  // Attributes are omitted because this drag surface is pointer-only.
  listeners: DraggableResult['listeners']
  isDragging: boolean
  dragActive: boolean
}

export const SlotDragContext = createContext<SlotDragHandle | null>(null)

export interface SlotDragApi {
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
  // Keys move with characters so a reorder moves existing card DOM instead of rebuilding it.
  slotKeys: string[]
  dragActive: boolean
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
  scale: number,
  pitchX: number,
  pitchY: number,
  onReorder?: (order: number[]) => void,
  onDrop?: (landed: number) => void,
}): SlotDragApi {
  const [slotKeys, setSlotKeys] = useState(() => createSlotKeys(count))
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null)

  const cardNodes = useRef<(HTMLDivElement | null)[]>([])
  const overlayNodes = useRef<(HTMLDivElement | null)[]>([])
  const draggedSlotRef = useRef<number | null>(null)
  const slotOrderRef = useRef<number[]>([])
  const draggedPositionRef = useRef<number | null>(null)
  const pointerOffsetRef = useRef({ x: 0, y: 0 })
  const moveFrameRef = useRef(0)

  if (slotKeys.length !== count) setSlotKeys(createSlotKeys(count))

  const cardRefs = useMemo(() => createNodeRefs(count, cardNodes), [count])
  const overlayRefs = useMemo(() => createNodeRefs(count, overlayNodes), [count])

  const stepX = pitchX * scale
  const stepY = pitchY * scale

  const moveSlot = useCallback((index: number, dx: number, dy: number) => {
    applyTransform(cardNodes.current[index], dx / scale, dy / scale)
    applyTransform(overlayNodes.current[index], dx, dy)
  }, [scale])

  const setSlotTransition = useCallback((index: number, transition: string) => {
    applyTransition(cardNodes.current[index], transition)
    applyTransition(overlayNodes.current[index], transition)
  }, [])

  const resetSlots = useCallback(() => {
    for (let index = 0; index < count; index++) {
      setSlotTransition(index, NO_TRANSITION)
      moveSlot(index, 0, 0)
      restCard(cardNodes.current[index])
      restOverlay(overlayNodes.current[index])
    }
  }, [count, moveSlot, setSlotTransition])

  const getSlotOffset = useCallback((from: number, to: number) => ({
    x: ((to % columns) - (from % columns)) * stepX,
    y: (Math.floor(to / columns) - Math.floor(from / columns)) * stepY,
  }), [columns, stepX, stepY])

  const renderOrder = useCallback((order: number[], draggedSlot: number) => {
    for (let position = 0; position < order.length; position++) {
      const slot = order[position]
      if (slot === draggedSlot) continue
      const offset = getSlotOffset(slot, position)
      moveSlot(slot, offset.x, offset.y)
    }
  }, [getSlotOffset, moveSlot])

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const draggedSlot = toIndex(active.id)
    if (draggedSlot == null) return
    resetSlots()
    draggedSlotRef.current = draggedSlot
    slotOrderRef.current = Array.from({ length: count }, (_, position) => position)
    draggedPositionRef.current = draggedSlot
    pointerOffsetRef.current = { x: 0, y: 0 }

    const slide = prefersReducedMotion() ? NO_TRANSITION : SLIDE_TRANSITION
    for (let index = 0; index < count; index++) {
      setSlotTransition(index, index === draggedSlot ? NO_TRANSITION : slide)
    }

    liftCard(cardNodes.current[draggedSlot])
    liftOverlay(overlayNodes.current[draggedSlot])
    for (let index = 0; index < count; index++) {
      if (index !== draggedSlot) hideCellEdge(overlayNodes.current[index])
    }

    setDraggingSlot(draggedSlot)
  }, [count, resetSlots, setSlotTransition])

  const flushMove = useCallback(() => {
    moveFrameRef.current = 0
    const draggedSlot = draggedSlotRef.current
    if (draggedSlot == null) return
    const offset = pointerOffsetRef.current
    moveSlot(draggedSlot, offset.x, offset.y)
  }, [moveSlot])

  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    if (draggedSlotRef.current == null) return
    pointerOffsetRef.current = delta

    if (moveFrameRef.current === 0) moveFrameRef.current = requestAnimationFrame(flushMove)
  }, [flushMove])

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    const draggedSlot = draggedSlotRef.current
    const currentPosition = draggedPositionRef.current
    if (draggedSlot == null || currentPosition == null) return

    const nextPosition = over ? toIndex(over.id) : null
    if (nextPosition == null || nextPosition === currentPosition) return

    const nextOrder = [...slotOrderRef.current]
    const displacedSlot = nextOrder[nextPosition]
    nextOrder[nextPosition] = nextOrder[currentPosition]
    nextOrder[currentPosition] = displacedSlot

    slotOrderRef.current = nextOrder
    draggedPositionRef.current = nextPosition
    renderOrder(nextOrder, draggedSlot)
  }, [renderOrder])

  const resetDrag = useCallback(() => {
    if (moveFrameRef.current !== 0) {
      cancelAnimationFrame(moveFrameRef.current)
      moveFrameRef.current = 0
    }
    resetSlots()
    draggedSlotRef.current = null
    slotOrderRef.current = []
    draggedPositionRef.current = null
    pointerOffsetRef.current = { x: 0, y: 0 }
    setDraggingSlot(null)
  }, [resetSlots])

  // Recover when dnd-kit misses a release outside its listeners. The delay lets normal drops commit first.
  useEffect(() => {
    if (draggingSlot == null) return

    let pending = 0
    const recover = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        if (draggedSlotRef.current != null) resetDrag()
      }, DRAG_RECOVERY_DELAY)
    }

    for (const event of RECOVERY_EVENTS) window.addEventListener(event, recover)
    return () => {
      window.clearTimeout(pending)
      for (const event of RECOVERY_EVENTS) window.removeEventListener(event, recover)
    }
  }, [draggingSlot, resetDrag])

  const handleDragEnd = useCallback(({ active }: DragEndEvent) => {
    const draggedSlot = toIndex(active.id)
    if (draggedSlot == null) {
      resetDrag()
      return
    }
    const order = slotOrderRef.current
    const dropPosition = draggedPositionRef.current ?? draggedSlot

    const cardNode = cardNodes.current[draggedSlot]
    const overlayNode = overlayNodes.current[draggedSlot]
    const offset = pointerOffsetRef.current
    const target = getSlotOffset(draggedSlot, dropPosition)
    const settled = [...order]

    resetDrag()
    if (!isIdentity(settled)) {
      setSlotKeys((keys) => settled.map((slot) => keys[slot]))
      onReorder?.(settled)
    }
    onDrop?.(dropPosition)

    glide(cardNode, overlayNode, offset.x - target.x, offset.y - target.y, scale)
  }, [getSlotOffset, onDrop, onReorder, resetDrag, scale])

  const sensors = usePointerDragSensors()

  const dndProps = useMemo(() => ({
    sensors,
    collisionDetection: slotCollisionDetection,
    accessibility: POINTER_DRAG_ACCESSIBILITY,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: resetDrag,
  }), [sensors, handleDragStart, handleDragMove, handleDragOver, handleDragEnd, resetDrag])

  return {
    dndProps,
    slotKeys,
    dragActive: draggingSlot != null,
    cardRefs,
    overlayRefs,
  }
}

function applyTransform(node: HTMLElement | null | undefined, dx: number, dy: number) {
  if (!node) return
  node.style.transform = dx === 0 && dy === 0 ? '' : `translate3d(${dx}px, ${dy}px, 0)`
}

function applyTransition(node: HTMLElement | null | undefined, transition: string) {
  if (!node) return
  node.style.transition = transition
}

/** Animates the dropped card from the pointer to its reordered slot. */
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

function onSettled(node: HTMLElement | null | undefined, rest: (settled: HTMLElement) => void) {
  if (!node) return
  clearPendingSettle(node)

  let settled = false
  let timeoutId: number | null = null
  const cleanup = () => {
    if (timeoutId != null) window.clearTimeout(timeoutId)
    node.removeEventListener(TRANSITION_END_EVENT, handleTransition)
    node.removeEventListener(TRANSITION_CANCEL_EVENT, handleTransition)
    pendingSettleCleanup.delete(node)
  }
  const finish = () => {
    if (settled) return
    settled = true
    cleanup()
    node.style.transition = NO_TRANSITION
    rest(node)
  }
  const handleTransition = (event: TransitionEvent) => {
    if (event.target === node && event.propertyName === WILL_CHANGE_TRANSFORM) finish()
  }

  pendingSettleCleanup.set(node, cleanup)
  node.addEventListener(TRANSITION_END_EVENT, handleTransition)
  node.addEventListener(TRANSITION_CANCEL_EVENT, handleTransition)
  timeoutId = window.setTimeout(finish, SETTLE_FALLBACK_DELAY_MS)
}

function clearPendingSettle(node: HTMLElement) {
  pendingSettleCleanup.get(node)?.()
}

function liftCard(node: HTMLElement | null | undefined) {
  if (!node) return
  clearPendingSettle(node)
  node.style.zIndex = LIFTED_Z_INDEX
  node.style.willChange = WILL_CHANGE_TRANSFORM
  node.style.backgroundColor = CARD_BACKING
  node.style.borderRadius = CARD_BACKING_RADIUS
}

function restCard(node: HTMLElement | null | undefined) {
  if (!node) return
  clearPendingSettle(node)
  node.style.zIndex = ''
  node.style.willChange = ''
  node.style.backgroundColor = ''
  node.style.borderRadius = ''
}

function liftOverlay(node: HTMLElement | null | undefined) {
  if (!node) return
  clearPendingSettle(node)
  node.style.zIndex = LIFTED_Z_INDEX
  node.style.willChange = WILL_CHANGE_TRANSFORM
}

function restOverlay(node: HTMLElement | null | undefined) {
  if (!node) return
  clearPendingSettle(node)
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

function isIdentity(order: number[]): boolean {
  return order.every((slot, position) => slot === position)
}

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function toIndex(id: UniqueIdentifier): number | null {
  return typeof id === 'number' ? id : null
}
