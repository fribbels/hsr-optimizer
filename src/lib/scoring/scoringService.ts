import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import {
  executeOrchestrator,
  executeUpgradeOrchestrator,
  prepareOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import type {
  RunStatSimulationsResult,
  Simulation,
} from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { objectHash } from 'lib/utils/objectUtils'
import type {
  Character,
} from 'types/character'
import type { Form } from 'types/form'
import type {
  DBMetadataCharacter,
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

// --- Types ---

export type PreparedState = {
  originalSimResult: RunStatSimulationsResult,
  baselineSimResult: RunStatSimulationsResult,
  originalSpd: number,
  characterMetadata: DBMetadataCharacter,
  deprioritizeBuffs: boolean,
  originalSim: Simulation,
  simForm: Form,
}

// --- Cache ---

export const resultCache = new Map<string, SimulationScore>()
export const upgradeResultCache = new Map<string, SimulationScore>()
const promiseCache = new Map<string, Promise<SimulationScore | null>>()
const upgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const MAX_RETRIES = 3
const failedRetries = new Map<string, number>()
const failedUpgradeRetries = new Map<string, number>()

// Orchestrator cache: holds prepared orchestrators for requestScore to consume.
// Entries are deleted on consumption. Content-addressed — orphans are harmless.
const orchestratorCache = new Map<string, BenchmarkSimulationOrchestrator>()

// Preview cache: holds PreparedState for synchronous reads during render.
// Cleaned up when the full result arrives (preview data becomes redundant).
const previewCache = new Map<string, PreparedState>()

// --- Public API ---
export function computeScoringCacheKey(
  character: Character,
  simulationMetadata: SimulationMetadata | null,
  singleRelicByPart: PreviewRelics,
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
  return resultCache.get(cacheKey) ?? null
}

export function hasExceededRetries(cacheKey: string): boolean {
  return (failedRetries.get(cacheKey) ?? 0) >= MAX_RETRIES
}

export function hasExceededUpgradeRetries(cacheKey: string): boolean {
  return (failedUpgradeRetries.get(cacheKey) ?? 0) >= MAX_RETRIES
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
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): PreparedState | null {
  if (cacheKey === null) return null
  if (previewCache.has(cacheKey)) return previewCache.get(cacheKey)!

  try {
    const orchestrator = prepareOrchestrator(
      character,
      simulationMetadata,
      singleRelicByPart,
      showcaseTemporaryOptions,
    )

    const preview: PreparedState = {
      originalSimResult: orchestrator.originalSimResult!,
      baselineSimResult: orchestrator.baselineSimResult!,
      originalSpd: orchestrator.originalSpd!,
      characterMetadata: getGameMetadata().characters[character.id],
      deprioritizeBuffs: orchestrator.metadata.deprioritizeBuffs ?? false,
      originalSim: orchestrator.originalSim!,
      simForm: orchestrator.form!,
    }

    previewCache.set(cacheKey, preview)
    // Only cache the orchestrator if the full pipeline hasn't already completed.
    // This prevents orphaned orchestrator entries when revisiting already-scored characters.
    if (!upgradeResultCache.has(cacheKey)) {
      orchestratorCache.set(cacheKey, orchestrator)
    }
    return preview
  } catch (error) {
    console.error('Preview preparation failed:', error)
    return null
  }
}

export function requestScore(
  cacheKey: string | null,
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): Promise<SimulationScore | null> {
  if (cacheKey === null) return Promise.resolve(null)
  // Return cached result as resolved promise
  if (resultCache.has(cacheKey)) {
    return Promise.resolve(resultCache.get(cacheKey)!)
  }

  // Don't retry after max retries exceeded
  if (hasExceededRetries(cacheKey)) {
    return Promise.resolve(null)
  }

  // Deduplicate in-flight requests
  if (promiseCache.has(cacheKey)) {
    return promiseCache.get(cacheKey)!
  }

  // Defer expensive work off the current task
  const promise = new Promise<SimulationScore | null>((resolve) => {
    setTimeout(async () => {
      try {
        // Reuse prepared orchestrator if available (from getOrComputePreview),
        // otherwise prepare fresh. This eliminates all duplication.
        // orchestrator is needed for, and removed from cache by, requestScoreUpgrades
        const orchestrator = orchestratorCache.get(cacheKey) ?? orchestratorCache
          .set(
            cacheKey,
            prepareOrchestrator(character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions),
          )
          .get(cacheKey)!

        await executeOrchestrator(orchestrator)

        const score = orchestrator.simulationScore!
        score.characterMetadata = getGameMetadata().characters[character.id]
        resultCache.set(cacheKey, score)
        previewCache.delete(cacheKey)
        resolve(score)
      } catch (error) {
        console.error('Scoring error:', error)
        failedRetries.set(cacheKey, (failedRetries.get(cacheKey) ?? 0) + 1)
        resolve(null)
      } finally {
        promiseCache.delete(cacheKey)
      }
    }, 0)
  })

  promiseCache.set(cacheKey, promise)
  return promise
}

export function requestScoreUpgrades(
  cacheKey: string | null,
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): Promise<SimulationScore | null> {
  if (cacheKey === null) return Promise.resolve(null)
  // Return cached result as resolved promise
  if (upgradeResultCache.has(cacheKey)) {
    return Promise.resolve(upgradeResultCache.get(cacheKey)!)
  }

  // Don't retry after max retries exceeded
  if (hasExceededUpgradeRetries(cacheKey)) {
    return Promise.resolve(null)
  }

  // Deduplicate in-flight requests
  if (upgradePromiseCache.has(cacheKey)) {
    return upgradePromiseCache.get(cacheKey)!
  }

  const promise = new Promise<SimulationScore | null>((resolve) => {
    requestScore(cacheKey, character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)
      .then(async () => {
        try {
          // requestScore ensures an orchestrator is always available in the cache by this point
          const orchestrator = orchestratorCache.get(cacheKey)!
          orchestratorCache.delete(cacheKey)

          await executeUpgradeOrchestrator(orchestrator)

          const score = orchestrator.simulationScore!
          upgradeResultCache.set(cacheKey, score)
          resolve(score)
        } catch (error) {
          console.error('Scoring upgrades error:', error)
          failedUpgradeRetries.set(cacheKey, (failedUpgradeRetries.get(cacheKey) ?? 0) + 1)
          resolve(null)
        } finally {
          orchestratorCache.delete(cacheKey)
          upgradePromiseCache.delete(cacheKey)
        }
      })
  })

  upgradePromiseCache.set(cacheKey, promise)
  return promise
}

// No cache invalidation needed: the cache is content-addressed (keyed on objectHash of inputs).
// If relics, form, metadata, or options change, the hash changes → different cache key → old entry
// is simply never looked up again. Orphaned entries are acceptable (typically 10-30 per session).
