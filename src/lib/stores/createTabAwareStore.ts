import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useCallback, useContext, useRef, useSyncExternalStore } from 'react'
import { createStore, StateCreator, StoreApi } from 'zustand/vanilla'

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

type UseBoundTabAwareStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S>
  <U>(selector: (state: ExtractState<S>) => U): U
} & S

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>

/**
 * Creates a Zustand store whose React hook gates subscription notifications
 * based on TabVisibilityContext.
 *
 * Hidden tab: store updates internally, React is never notified → zero re-renders.
 * Tab becomes active: subscribe function identity changes → useSyncExternalStore
 * re-subscribes → calls getSnapshot() → catches up in one render.
 *
 * Components use useMyStore(selector) exactly like normal Zustand.
 * Imperative access (getState, subscribe, setState) is unaffected.
 */
export function createTabAwareStore<T>(
  initializer: StateCreator<T, [], []>,
): UseBoundTabAwareStore<StoreApi<T>> {
  const api = createStore(initializer) as StoreApi<T>
  const identity = (s: T) => s

  const useTabAwareHook = (<U>(selector?: (state: T) => U) => {
    const sel = (selector ?? identity) as (state: T) => U
    const isActive = useContext(TabVisibilityContext)
    const isActiveRef = useRef(isActive)
    isActiveRef.current = isActive

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return api.subscribe(() => {
          if (isActiveRef.current) {
            onStoreChange()
          }
        })
      },
      // isActive in deps → identity changes on tab switch →
      // useSyncExternalStore re-subscribes → getSnapshot() called → catch-up
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isActive],
    )

    const getSnapshot = useCallback(
      () => sel(api.getState()),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sel],
    )

    const getServerSnapshot = useCallback(
      () => sel(api.getInitialState()),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sel],
    )

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  }) as UseBoundTabAwareStore<StoreApi<T>>

  Object.assign(useTabAwareHook, api)
  return useTabAwareHook
}
