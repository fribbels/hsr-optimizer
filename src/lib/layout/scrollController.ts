/**
 * Helpers to control screen scrolling when drawers are open. See ComboDrawer for usage.
 *
 * Uses reference counting so overlapping overlays (e.g. ComboDrawer + RelicModal)
 * keep scroll locked until ALL overlays close.
 */

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface LockedState {
  offset: number
  isLocked: true
}

interface UnLockedState {
  offset: null
  isLocked: false
}

type StateValues = LockedState | UnLockedState

interface StateActions {
  lock(): void
  unlock(): void
}

type State = StateActions & StateValues

// Module-level lock counter — not reactive, no re-renders on increment/decrement.
// Only the isLocked boolean (Zustand state) is reactive for LayoutSider/OptimizerSidebar.
let lockCount = 0

// Exported for testing only — resets both lockCount and Zustand store atomically
export function _resetForTesting() {
  lockCount = 0
  useScrollLockStore.setState({ isLocked: false, offset: null })
}

export function _getLockCount() {
  return lockCount
}

const useScrollLockStore = create<State>()((set, get) => ({
  offset: null,
  isLocked: false,

  lock() {
    lockCount++
    if (lockCount > 1) return // already locked by another overlay
    const offset = window.scrollY
    set({ isLocked: true, offset })
    document.body.style.position = 'fixed'
    document.body.style.top = `-${offset}px`
    document.body.style.width = '100%'
  },
  unlock() {
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount > 0) return // still has active locks from other overlays
    const state = get()
    if (!state.isLocked) return
    set({ isLocked: false, offset: null })
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, state.offset)
  },
}))

// Imperative helpers for non-React code and testing
export function scrollLock() {
  useScrollLockStore.getState().lock()
}

export function scrollUnlock() {
  useScrollLockStore.getState().unlock()
}

export function useScrollLock(shouldLock: boolean) {
  // Use selectors — action references are stable, avoids re-subscription on isLocked/offset changes
  const lock = useScrollLockStore((s) => s.lock)
  const unlock = useScrollLockStore((s) => s.unlock)
  const lockedRef = useRef(false)
  useEffect(() => {
    if (shouldLock && !lockedRef.current) {
      lock()
      lockedRef.current = true
    } else if (!shouldLock && lockedRef.current) {
      unlock()
      lockedRef.current = false
    }
    return () => {
      if (lockedRef.current) {
        unlock()
        lockedRef.current = false
      }
    }
  }, [shouldLock, lock, unlock])
}

export function useScrollLockState(): StateValues {
  // Cast is safe: lock()/unlock() always set offset+isLocked atomically,
  // preserving the LockedState | UnLockedState discriminant.
  return useScrollLockStore(useShallow((s) => ({ offset: s.offset, isLocked: s.isLocked }))) as StateValues
}
