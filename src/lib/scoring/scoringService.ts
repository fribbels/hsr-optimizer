import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  executeOrchestrator,
  prepareOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import type { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import type { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { objectHash } from 'lib/utils/objectUtils'
import type {
  Character,
} from 'types/character'
import type {
  DBMetadataCharacter,
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

// --- Types ---

export type PreparedState = {
  originalSimResult: RunStatSimulationsResult
  originalSpd: number
  characterMetadata: DBMetadataCharacter
  deprioritizeBuffs: boolean
}

// --- Cache ---

const resultCache: Record<string, SimulationScore> = {}
const promiseCache: Record<string, Promise<SimulationScore | null>> = {}
const MAX_RETRIES = 3
const failedRetries = new Map<string, number>()

// Orchestrator cache: holds prepared orchestrators for requestScore to consume.
// Entries are deleted on consumption. Content-addressed — orphans are harmless.
const orchestratorCache: Record<string, BenchmarkSimulationOrchestrator> = {}

// Preview cache: holds PreparedState for synchronous reads during render.
// Cleaned up when the full result arrives (preview data becomes redundant).
const previewCache: Record<string, PreparedState> = {}

// --- Listeners (for useSyncExternalStore) ---
// Per-key listeners: only the subscriber watching a specific cacheKey is notified,
// avoiding spurious re-renders of components watching different keys.

const listenersByKey = new Map<string, Set<() => void>>()
const noop = () => {}

export function subscribeToCacheUpdates(cacheKey: string | null, listener: () => void): () => void {
  if (!cacheKey) return noop
  let set = listenersByKey.get(cacheKey)
  if (!set) {
    set = new Set()
    listenersByKey.set(cacheKey, set)
  }
  set.add(listener)
  return () => {
    set!.delete(listener)
    if (set!.size === 0) listenersByKey.delete(cacheKey)
  }
}

function notifyListeners(cacheKey: string) {
  listenersByKey.get(cacheKey)?.forEach((cb) => cb())
}

// --- Public API ---

export function computeScoringCacheKey(
  character: Character,
  simulationMetadata: SimulationMetadata | null,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): string | null {
  if (!simulationMetadata) return null

  return objectHash({
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

// Called synchronously during render (useMemo). The cache write is an acceptable
// side-effect because it is idempotent and content-addressed — same cacheKey always
// produces identical results.
//
// INVARIANT: PreparedState.originalSimResult is a shared reference with the
// orchestrator instance. The execute phase (calculateScores) calls
// applyScoringFunction which mutates originalSimResult.simScore, but we
// pre-apply it in prepareOrchestrator so the value is already correct.
// No other execute-phase step mutates originalSimResult fields.
export function getOrComputePreview(
  cacheKey: string,
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): PreparedState | null {
  if (previewCache[cacheKey]) return previewCache[cacheKey]

  try {
    const orchestrator = prepareOrchestrator(
      character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions,
    )

    const preview: PreparedState = {
      originalSimResult: orchestrator.originalSimResult!,
      originalSpd: orchestrator.originalSpd!,
      characterMetadata: getGameMetadata().characters[character.id],
      deprioritizeBuffs: orchestrator.metadata.deprioritizeBuffs ?? false,
    }

    previewCache[cacheKey] = preview
    // Only cache the orchestrator if the full pipeline hasn't already completed.
    // This prevents orphaned orchestrator entries when revisiting already-scored characters.
    if (!(cacheKey in resultCache)) {
      orchestratorCache[cacheKey] = orchestrator
    }
    return preview
  } catch (error) {
    console.error('Preview preparation failed:', error)
    return null
  }
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

  // Defer expensive work off the current task
  const promise = new Promise<SimulationScore | null>((resolve) => {
    setTimeout(async () => {
      try {
        // Reuse prepared orchestrator if available (from getOrComputePreview),
        // otherwise prepare fresh. This eliminates all duplication.
        let orchestrator = orchestratorCache[cacheKey]
        if (orchestrator) {
          delete orchestratorCache[cacheKey]
        } else {
          orchestrator = prepareOrchestrator(
            character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions,
          )
        }

        await executeOrchestrator(orchestrator, () => {
          // Score is available — deliver before upgrades finish
          const earlyScore = orchestrator.simulationScore ?? null
          if (earlyScore) {
            earlyScore.characterMetadata = getGameMetadata().characters[character.id]
            resultCache[cacheKey] = earlyScore
            delete previewCache[cacheKey]
            delete orchestratorCache[cacheKey]
          }
          notifyListeners(cacheKey)
        })

        // Upgrades now included — update cache and notify again
        const score = orchestrator.simulationScore ?? null
        if (score) {
          score.characterMetadata = getGameMetadata().characters[character.id]
          resultCache[cacheKey] = score
        }
        notifyListeners(cacheKey)
        resolve(score)
      } catch (error) {
        console.error('Scoring error:', error)
        failedRetries.set(cacheKey, (failedRetries.get(cacheKey) ?? 0) + 1)
        notifyListeners(cacheKey)
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
