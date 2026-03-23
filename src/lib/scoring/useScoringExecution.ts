import { useCallback, useEffect, useMemo } from 'react'
import { useSyncExternalStore } from 'react'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  getCachedResult,
  hasExceededRetries,
  subscribeToCacheUpdates,
} from 'lib/scoring/scoringService'

export type ScoringExecution = {
  done: boolean
  result: SimulationScore | null
}

const IDLE: ScoringExecution = { done: true, result: null }
const PENDING: ScoringExecution = { done: false, result: null }
const FAILED: ScoringExecution = { done: true, result: null }

export function useScoringExecution(
  cacheKey: string | null,
  requestFn: (() => Promise<SimulationScore | null>) | null,
): ScoringExecution {
  // Per-key subscription: only notified when THIS cacheKey's result is written
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToCacheUpdates(cacheKey, onStoreChange),
    [cacheKey],
  )

  // Synchronous cache read — runs on EVERY render, zero flicker on cache hit
  const result = useSyncExternalStore(
    subscribe,
    useCallback(
      () => cacheKey ? getCachedResult(cacheKey) : null,
      [cacheKey],
    ),
  )

  // Derive done status
  const execution = useMemo((): ScoringExecution => {
    if (!cacheKey) return IDLE
    if (result) return { done: true, result }
    if (hasExceededRetries(cacheKey)) return FAILED
    return PENDING
  }, [cacheKey, result])

  // Request scoring on cache miss (effect, not during render)
  useEffect(() => {
    if (!cacheKey || !requestFn || result || hasExceededRetries(cacheKey)) return
    requestFn()
    // requestFn is memoized on cacheKey upstream — no need in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, result])

  return execution
}
