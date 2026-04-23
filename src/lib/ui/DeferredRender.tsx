import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react'

// DeferCreate defers React mount via a rAF queue. Children don't exist until
// their ticket is revealed by the provider's rAF loop. Requires DeferCreateProvider.

// ---------------------------------------------------------------------------
// Queue store (external, not React state — avoids parent re-renders)
// ---------------------------------------------------------------------------

type Listener = () => void

interface DeferredQueue {
  /** Current reveal counter — increments by batchSize per rAF */
  counter: number
  /** Next ticket number to assign */
  nextTicket: number
  /** Generation — increments on reset, invalidates stale tickets */
  generation: number
  /** Per-ticket listeners. Only the "next" tickets are notified each tick. */
  listeners: Map<number, Listener>
  /** Subscribe to a specific ticket becoming visible */
  subscribe: (ticket: number, cb: Listener) => () => void
  /** Read whether a ticket is visible */
  isVisible: (ticket: number) => boolean
  /** Claim the next ticket number (called during render) */
  claim: () => number
  /** rAF loop state */
  rafId: number | null
  batchSize: number
  enabled: boolean
}

function createQueue(batchSize: number, enabled: boolean): DeferredQueue {
  const queue: DeferredQueue = {
    counter: 0,
    nextTicket: 0,
    generation: 0,
    listeners: new Map(),
    rafId: null,
    batchSize,
    enabled,

    subscribe(ticket: number, cb: Listener): () => void {
      // Already visible — no subscription needed
      if (queue.counter >= ticket) return () => {}
      queue.listeners.set(ticket, cb)
      if (queue.enabled) ensureRafRunning(queue)
      return () => {
        queue.listeners.delete(ticket)
      }
    },

    isVisible(ticket: number): boolean {
      return queue.counter >= ticket
    },

    claim(): number {
      return queue.nextTicket++
    },
  }
  return queue
}

function advanceQueue(queue: DeferredQueue): void {
  // Advance past any gaps (abandoned tickets from aborted renders in strict mode)
  let target = queue.counter + queue.batchSize
  while (target < queue.nextTicket && !queue.listeners.has(target)) {
    target++
  }

  const prevCounter = queue.counter
  queue.counter = target

  // Notify listeners for tickets that just became visible
  for (let t = prevCounter + 1; t <= queue.counter; t++) {
    const listener = queue.listeners.get(t)
    if (listener) {
      listener()
      queue.listeners.delete(t)
    }
  }
}

function ensureRafRunning(queue: DeferredQueue): void {
  if (queue.rafId != null || !queue.enabled) return
  function tick() {
    advanceQueue(queue)
    if (queue.listeners.size > 0) {
      queue.rafId = requestAnimationFrame(tick)
    } else {
      queue.rafId = null
    }
  }
  queue.rafId = requestAnimationFrame(tick)
}

function resetQueue(queue: DeferredQueue): void {
  if (queue.rafId != null) {
    cancelAnimationFrame(queue.rafId)
    queue.rafId = null
  }
  // Snapshot existing listeners before clearing — DeferCreate components
  // need to be notified so they re-check visibility and hide themselves.
  const pendingListeners = [...queue.listeners.values()]
  queue.counter = 0
  queue.nextTicket = 0
  queue.generation++
  queue.listeners.clear()
  // Notify after clearing so useSyncExternalStore detects the state change
  for (const listener of pendingListeners) listener()
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DeferredContext = createContext<DeferredQueue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Establishes a deferred render queue. Children wrapped in `<DeferCreate>` or
 * using `useDeferredSlot()` are revealed one per animation frame.
 *
 * - `resetKey`: when this changes, all slots reset and re-reveal progressively.
 * - `batchSize`: how many slots to reveal per frame (default 1).
 * - `enabled`: when false, the queue is paused — slots stay hidden (render null/fallback)
 *   until enabled. Common pattern: gate on first tab activation so the queue doesn't
 *   run during background stagger mount.
 *
 * Without this provider, `<DeferCreate>` and `useDeferredSlot()` render immediately.
 */
export function DeferCreateProvider({
  children,
  resetKey,
  batchSize = 1,
  enabled = true,
}: {
  children: ReactNode,
  resetKey: unknown,
  batchSize?: number,
  enabled?: boolean,
}) {
  const queueRef = useRef<DeferredQueue | null>(null)
  if (!queueRef.current) {
    queueRef.current = createQueue(batchSize, enabled)
  }

  const queue = queueRef.current
  const prevKeyRef = useRef<unknown>(undefined)
  if (resetKey !== prevKeyRef.current) {
    prevKeyRef.current = resetKey
    resetQueue(queue)
  }

  // Sync settings — detect enabled transitions to kick-start the queue
  const wasEnabled = queue.enabled
  queue.batchSize = batchSize
  queue.enabled = enabled
  if (enabled && !wasEnabled) {
    // Paused → active: start the rAF loop to reveal pending slots
    ensureRafRunning(queue)
  }

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (queueRef.current?.rafId != null) {
        cancelAnimationFrame(queueRef.current.rafId)
      }
    }
  }, [])

  return (
    <DeferredContext.Provider value={queue}>
      {children}
    </DeferredContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook: useDeferredSlot
// ---------------------------------------------------------------------------

const noopSubscribe = () => () => {}
const alwaysTrue = () => true

/**
 * Claims a slot in the nearest `DeferCreateProvider` queue.
 * Returns `true` when this slot has been revealed by the rAF loop.
 *
 * Without a provider ancestor, returns `true` immediately (no deferral).
 */
export function useDeferredSlot(): boolean {
  const queue = useContext(DeferredContext)

  const ticketRef = useRef<{ ticket: number, generation: number } | null>(null)

  // Claim ticket during render (preserves tree order).
  // Re-claim if generation changed (resetKey changed).
  if (queue) {
    if (!ticketRef.current || ticketRef.current.generation !== queue.generation) {
      ticketRef.current = { ticket: queue.claim(), generation: queue.generation }
    }
  }

  const ticket = ticketRef.current?.ticket ?? 0
  const generation = ticketRef.current?.generation ?? 0

  const subscribe = useCallback(
    queue
      ? (cb: Listener) => queue.subscribe(ticket, cb)
      : noopSubscribe,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, ticket, generation],
  )

  const getSnapshot = useCallback(
    queue
      ? () => queue.isVisible(ticket)
      : alwaysTrue,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, ticket, generation],
  )

  return useSyncExternalStore(subscribe, getSnapshot)
}

// ---------------------------------------------------------------------------
// Wrapper components
// ---------------------------------------------------------------------------

/**
 * Defers **creating** children until this slot's turn in the rAF queue.
 * Children are not mounted until revealed — use for first-mount progressive rendering.
 * Shows `fallback` (default: nothing) while waiting.
 *
 * Without a `DeferCreateProvider` ancestor, renders children immediately.
 */
export function DeferCreate({
  children,
  fallback = null,
}: {
  children: ReactNode,
  fallback?: ReactNode,
}) {
  const visible = useDeferredSlot()
  return visible ? children : fallback
}

