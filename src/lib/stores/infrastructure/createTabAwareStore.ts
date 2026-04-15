import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import {
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react'
import type {
  StateCreator,
  StoreApi,
} from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

type UseBoundTabAwareStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S>,
  <U>(selector: (state: ExtractState<S>) => U): U,
} & S

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>

/**
 * Creates a Zustand store whose React hook gates subscription notifications
 * based on TabVisibilityContext.
 *
 * Hidden tab: store updates internally, React is never notified → zero re-renders.
 * Tab becomes active: activation listener fires onStoreChange →
 *   useSyncExternalStore calls getSnapshot() → only re-renders if value changed.
 * Tab becomes inactive: isActiveRef flipped, no context change → zero re-renders.
 *
 * The context value is STABLE (never changes identity), so useContext never
 * triggers consumer re-renders. Only actual store value changes cause re-renders.
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
    const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)

    // STABLE subscribe — never changes identity.
    // Subscribes to both the store (gated) and activation events (for catch-up).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        // Track whether the store changed while this tab was hidden.
        // On activation, only fire onStoreChange if something actually changed —
        // avoids 184 unnecessary snapshot checks per tab switch.
        let changedWhileHidden = false

        // Gate store notifications by tab visibility
        const unsubStore = api.subscribe(() => {
          if (isActiveRef.current) {
            onStoreChange()
          } else {
            changedWhileHidden = true
          }
        })

        // On activation: fire onStoreChange only if the store changed while hidden
        const unsubActivation = addActivationListener(() => {
          if (changedWhileHidden) {
            changedWhileHidden = false
            onStoreChange()
          }
        })

        return () => {
          unsubStore()
          unsubActivation()
        }
      },
      [], // stable — context value never changes
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
