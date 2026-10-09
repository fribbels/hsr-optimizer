import {
  TabVisibilityContext,
  type TabVisibilityValue,
} from 'lib/hooks/useTabVisibility'
import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type NestedTabVisibilityProviderProps = {
  active: boolean,
  children: ReactNode,
}

/**
 * Adds a tab visibility boundary below an existing boundary. Descendants are
 * active only while both this boundary and its parent are active.
 */
export function NestedTabVisibilityProvider({ active, children }: NestedTabVisibilityProviderProps) {
  const parent = useContext(TabVisibilityContext)
  const selectedRef = useRef(active)
  const isActiveRef = useRef(active && parent.isActiveRef.current)
  const activationListenersRef = useRef(new Set<() => void>())
  const deactivationListenersRef = useRef(new Set<() => void>())
  const notificationIdRef = useRef(0)

  selectedRef.current = active

  const updateActive = useCallback((nextActive: boolean, notifyAfterPaint: boolean) => {
    if (isActiveRef.current === nextActive) return

    isActiveRef.current = nextActive
    const notificationId = ++notificationIdRef.current
    const listeners = nextActive ? activationListenersRef.current : deactivationListenersRef.current
    const notify = () => {
      if (notificationIdRef.current !== notificationId || isActiveRef.current !== nextActive) return
      for (const listener of listeners) listener()
    }

    if (notifyAfterPaint) {
      setTimeout(notify, 0)
    } else {
      notify()
    }
  }, [])

  const effectiveActive = active && parent.isActiveRef.current
  updateActive(effectiveActive, true)

  const [contextValue] = useState<TabVisibilityValue>(() => ({
    isActiveRef,
    addActivationListener: (listener) => {
      activationListenersRef.current.add(listener)
      return () => activationListenersRef.current.delete(listener)
    },
    addDeactivationListener: (listener) => {
      deactivationListenersRef.current.add(listener)
      return () => deactivationListenersRef.current.delete(listener)
    },
  }))

  useEffect(() => {
    const unsubscribeActivation = parent.addActivationListener(() => {
      updateActive(selectedRef.current && parent.isActiveRef.current, false)
    })
    const unsubscribeDeactivation = parent.addDeactivationListener(() => {
      updateActive(false, false)
    })

    return () => {
      unsubscribeActivation()
      unsubscribeDeactivation()
    }
  }, [parent, updateActive])

  return (
    <TabVisibilityContext value={contextValue}>
      {children}
    </TabVisibilityContext>
  )
}
