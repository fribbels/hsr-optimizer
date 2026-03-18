import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  runDpsScoreBenchmarkOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { TsUtils } from 'lib/utils/TsUtils'
import type {
  Character,
} from 'types/character'
import type {
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

// --- Cache ---

const resultCache: Record<string, SimulationScore> = {}
const promiseCache: Record<string, Promise<SimulationScore | null>> = {}
const MAX_RETRIES = 3
const failedRetries = new Map<string, number>()

// --- Listeners (for useSyncExternalStore) ---

const listeners = new Set<() => void>()

export function subscribeToCacheUpdates(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners() {
  listeners.forEach((cb) => cb())
}

// --- Public API ---

export function computeScoringCacheKey(
  character: Character,
  simulationMetadata: SimulationMetadata | null,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): string | null {
  if (!simulationMetadata) return null

  return TsUtils.objectHash({
    form: character.form,
    singleRelicByPart,
    simulationMetadata,
    showcaseTemporaryOptions,
  })
}

export function getCachedResult(cacheKey: string): SimulationScore | null {
  return resultCache[cacheKey] ?? null
}

export function hasExceededRetries(cacheKey: string): boolean {
  return (failedRetries.get(cacheKey) ?? 0) >= MAX_RETRIES
}

export function requestScore(
  cacheKey: string,
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): Promise<SimulationScore | null> {
  // Return cached result as resolved promise
  if (resultCache[cacheKey]) {
    return Promise.resolve(resultCache[cacheKey])
  }

  // Don't retry after max retries exceeded
  if (hasExceededRetries(cacheKey)) {
    return Promise.resolve(null)
  }

  // Deduplicate in-flight requests
  if (cacheKey in promiseCache) {
    return promiseCache[cacheKey]
  }

  // Defer orchestrator setup off the current task
  const promise = new Promise<SimulationScore | null>((resolve) => {
    setTimeout(async () => {
      try {
        const orchestrator = await runDpsScoreBenchmarkOrchestrator(
          character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions,
        )
        const score = orchestrator.simulationScore ?? null
        if (score) {
          score.characterMetadata = getGameMetadata().characters[character.id]
          resultCache[cacheKey] = score
        }
        notifyListeners()
        resolve(score)
      } catch (error) {
        console.error('Scoring error:', error)
        failedRetries.set(cacheKey, (failedRetries.get(cacheKey) ?? 0) + 1)
        notifyListeners()
        resolve(null)
      } finally {
        delete promiseCache[cacheKey]
      }
    }, 0)
  })

  promiseCache[cacheKey] = promise
  return promise
}

// No cache invalidation needed: the cache is content-addressed (keyed on objectHash of inputs).
// If relics, form, metadata, or options change, the hash changes → different cache key → old entry
// is simply never looked up again. Orphaned entries are acceptable (typically 10-30 per session).
