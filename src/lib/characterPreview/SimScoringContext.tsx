import { usePromise } from 'hooks/usePromise'
import {
  computeScoringCacheKey,
  getOrComputePreview,
  type PreparedState,
  requestScore,
  requestScoreUpgrades,
  resultCache,
  upgradeResultCache,
} from 'lib/scoring/scoringService'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  createContext,
  memo,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import type {
  ScoringConfig,
  ScoringConfigType,
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'
import { type PreviewRelics } from './characterPreviewController'

export type PipelineSlot = {
  preview: PreparedState | null
  scoringPromise: Promise<SimulationScore | null>
  upgradePromise: Promise<SimulationScore | null>
  cachedScore: SimulationScore | null
  cachedUpgrades: SimulationScore | null
}

type SimScoringContextValue = {
  pipelines: Partial<Record<ScoringConfigType, PipelineSlot>>
}

// Stable reference to avoid re-renders when no promise exists
const nullPromise = Promise.resolve(null)

const EMPTY_PIPELINES: SimScoringContextValue = { pipelines: {} }

// Promise caches for deduplication — keyed by cacheKey string
const scorePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const scoreUpgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()

export const SimScoringCtx = createContext<SimScoringContextValue>(EMPTY_PIPELINES)

// Config type to scoring action key mapping
const SCORING_ACTION_KEYS: Partial<Record<ScoringConfigType, string>> = {
  buffer: 'BUFF',
}

function buildPipelineSlot(
  character: Character,
  configType: ScoringConfigType,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): { cacheKey: string | null, slot: PipelineSlot } {
  const config: ScoringConfig = {
    configType,
    simulation: simulationMetadata,
    scoringActionKey: SCORING_ACTION_KEYS[configType],
  }
  const cacheKey = computeScoringCacheKey(character, configType, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)

  if (cacheKey === null) {
    return {
      cacheKey: null,
      slot: {
        preview: null,
        scoringPromise: nullPromise,
        upgradePromise: nullPromise,
        cachedScore: null,
        cachedUpgrades: null,
      },
    }
  }

  const preview = getOrComputePreview(cacheKey, character, config, singleRelicByPart, showcaseTemporaryOptions)

  const scoringPromise = scorePromiseCache.get(cacheKey) ?? scorePromiseCache
    .set(cacheKey, requestScore(cacheKey, character, config, singleRelicByPart, showcaseTemporaryOptions))
    .get(cacheKey)!

  const upgradePromise = scoreUpgradePromiseCache.get(cacheKey) ?? scoreUpgradePromiseCache
    .set(cacheKey, requestScoreUpgrades(cacheKey, character, config, singleRelicByPart, showcaseTemporaryOptions))
    .get(cacheKey)!

  const cachedScore = resultCache.get(cacheKey) ?? null
  const cachedUpgrades = upgradeResultCache.get(cacheKey) ?? null

  // Clean up promise caches once the pipeline is fully complete for this key.
  // For DPS: both score and upgrades must be cached. For non-DPS: score only (upgrades are skipped).
  const pipelineComplete = configType === 'dps'
    ? cachedScore != null && cachedUpgrades != null
    : cachedScore != null
  if (pipelineComplete) {
    scorePromiseCache.delete(cacheKey)
    scoreUpgradePromiseCache.delete(cacheKey)
  }

  return {
    cacheKey,
    slot: { preview, scoringPromise, upgradePromise, cachedScore, cachedUpgrades },
  }
}

interface SimScoringContextProps extends PropsWithChildren {
  character: Character
  simulationMetadata: SimulationMetadata | null
  supportSimulationMetadata: SimulationMetadata | null
  singleRelicByPart: PreviewRelics
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
}

export const SimScoringContextProvider = memo(function SimScoringContextProvider(props: SimScoringContextProps) {
  const { character, simulationMetadata, supportSimulationMetadata, singleRelicByPart, showcaseTemporaryOptions } = props

  const dpsCacheKey = computeScoringCacheKey(character, 'dps', simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)
  const bufferCacheKey = computeScoringCacheKey(character, 'buffer', supportSimulationMetadata, singleRelicByPart, showcaseTemporaryOptions)

  const context = useMemo(() => {
    const pipelines: Partial<Record<ScoringConfigType, PipelineSlot>> = {}

    if (simulationMetadata) {
      pipelines.dps = buildPipelineSlot(character, 'dps', simulationMetadata, singleRelicByPart, showcaseTemporaryOptions).slot
    }

    if (supportSimulationMetadata) {
      pipelines.buffer = buildPipelineSlot(character, 'buffer', supportSimulationMetadata, singleRelicByPart, showcaseTemporaryOptions).slot
    }

    return { pipelines }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [dpsCacheKey, bufferCacheKey])

  return (
    <SimScoringCtx value={context}>
      {props.children}
    </SimScoringCtx>
  )
})

// --- Hooks ---

export function useSimPreview(configType: ScoringConfigType): PreparedState | null {
  const ctx = useContext(SimScoringCtx)
  return ctx.pipelines[configType]?.preview ?? null
}

export function useSimScore(configType: ScoringConfigType): SimulationScore | null {
  const ctx = useContext(SimScoringCtx)
  const slot = ctx.pipelines[configType]

  const promise = slot?.scoringPromise ?? null
  const cached = slot?.cachedScore ?? null
  const promised = usePromise(promise)

  return cached ?? promised
}

export function useSimUpgrades(configType: ScoringConfigType): SimulationScore | null {
  const ctx = useContext(SimScoringCtx)
  const slot = ctx.pipelines[configType]

  const promise = slot?.upgradePromise ?? null
  const cached = slot?.cachedUpgrades ?? null
  const promised = usePromise(promise)

  return cached ?? promised
}

// Access the raw pipeline slot (for promise-based components like SuspenseNode)
export function usePipelineSlot(configType: ScoringConfigType): PipelineSlot | undefined {
  const ctx = useContext(SimScoringCtx)
  return ctx.pipelines[configType]
}
