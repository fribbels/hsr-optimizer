import { createContext } from 'react'

export type TabVisibilityValue = {
  /** Ref that always reflects the current tab's active state */
  isActiveRef: { current: boolean },
  /** Register a callback to be called when the tab activates (hidden → visible).
   *  Returns an unsubscribe function. */
  addActivationListener: (cb: () => void) => () => void,
}

const defaultValue: TabVisibilityValue = {
  isActiveRef: { current: true },
  addActivationListener: () => () => {},
}

/**
 * Provides tab visibility info via a STABLE context value.
 *
 * The context object identity NEVER changes, so consumers never re-render
 * from context changes alone. Instead, activation listeners are used to
 * notify useSyncExternalStore hooks, which then check their snapshots
 * and only re-render if their selected value actually changed.
 */
export const TabVisibilityContext = createContext<TabVisibilityValue>(defaultValue)
