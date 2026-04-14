import { useEffect, useState } from 'react'

/** Clears to null, skipping re-render if already null (returns same reference) */
const clear = <T>(prev: T | null): T | null => prev === null ? prev : null

/**
 * Workaround for React DevTools Profiler crash with Suspense.
 * See: https://github.com/facebook/react/issues/35818
 *
 * Resolves a promise without suspending. Returns null while pending, result when resolved.
 * When the profiler bug is fixed, migrate back to React's use() hook + Suspense boundaries.
 */
export function usePromise<T>(promise: Promise<T> | null): T | null {
  const [result, setResult] = useState<T | null>(null)

  useEffect(() => {
    setResult(clear)
    if (!promise) return

    let cancelled = false
    promise
      .then((value) => { if (!cancelled) setResult(value) })
      .catch(() => {})

    return () => { cancelled = true }
  }, [promise])

  return result
}
