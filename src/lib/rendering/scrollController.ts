/**
 * Helpers to control screen scrolling when drawers are open. See ComboDrawer for usage.
 */

import { useEffect } from 'react'
import { create } from 'zustand'

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

const useScrollLockStore = create<State>()((set, get) => ({
  offset: null,
  isLocked: false,

  lock() {
    if (get().isLocked) return
    const offset = window.scrollY
    set({ isLocked: true, offset })
    document.body.style.position = 'fixed'
    document.body.style.top = `-${offset}px`
    document.body.style.width = '100%'
    return
  },
  unlock() {
    const { isLocked, offset } = get()
    if (!isLocked) return
    set({ isLocked: false, offset: null })
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, offset)
    return
  },
}))

export function useScrollLock(shouldLock: boolean) {
  const { lock, unlock } = useScrollLockStore()
  useEffect(() => {
    if (shouldLock) {
      lock()
    } else {
      unlock()
    }
    // Unlock scroll if the component unmounts while locked
    return () => {
      unlock()
    }
  }, [shouldLock, lock, unlock])
}

export function useScrollLockState() {
  const { offset, isLocked } = useScrollLockStore()
  return { offset, isLocked } as unknown as StateValues
}
