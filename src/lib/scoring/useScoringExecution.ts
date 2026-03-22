import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSyncExternalStore } from 'react'
import { debugLog } from 'lib/debug/renderDebug'
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
  const prevCacheKeyRef = useRef<string | null>(null)
  if (cacheKey !== prevCacheKeyRef.current) {
    debugLog('useScoringExecution', `cacheKey changed: ${prevCacheKeyRef.current?.slice(0, 20) ?? 'null'} → ${cacheKey?.slice(0, 20) ?? 'null'}`)
    prevCacheKeyRef.current = cacheKey
  }

  // Synchronous cache read — runs on EVERY render, zero flicker on cache hit
  const result = useSyncExternalStore(
    subscribeToCacheUpdates,
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

  debugLog('useScoringExecution', `render: result=${result ? 'HIT' : 'MISS'} done=${execution.done}`)

  // Request scoring on cache miss (effect, not during render)
  useEffect(() => {
    if (!cacheKey || !requestFn || result || hasExceededRetries(cacheKey)) return
    debugLog('useScoringExecution', `requesting score for ${cacheKey.slice(0, 20)}...`)
    requestFn()
    // requestFn is memoized on cacheKey upstream — no need in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, result])

  return execution
}
