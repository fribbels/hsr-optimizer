import {
  computeScoringCacheKey,
  getOrComputePreview,
  type PreparedState,
  requestScore,
  requestScoreUpgrades,
  resultCache,
  upgradeResultCache,
} from 'lib/scoring/scoringService'
import { CONFIG_DISPLAY_ORDER, SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  createContext,
  memo,
  type PropsWithChildren,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import {
  ScoringConfigType,
  type ScoringConfig,
  type ShowcaseTemporaryOptions,
  type SimulationMetadata,
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

export const SimScoringContext = createContext<SimScoringContextValue>(EMPTY_PIPELINES)

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
    scoringActionKey: SCORING_CONFIG_REGISTRY[configType].scoringActionKey,
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

  const pipelineComplete = cachedScore != null && cachedUpgrades != null
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
  configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>>
  singleRelicByPart: PreviewRelics
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
}

export const SimScoringContextProvider = memo(function SimScoringContextProvider(props: SimScoringContextProps) {
  const { character, configMetadata, singleRelicByPart, showcaseTemporaryOptions } = props

  const dpsCacheKey = computeScoringCacheKey(character, ScoringConfigType.DPS, configMetadata[ScoringConfigType.DPS] ?? null, singleRelicByPart, showcaseTemporaryOptions)
  const bufferCacheKey = computeScoringCacheKey(character, ScoringConfigType.BUFFER, configMetadata[ScoringConfigType.BUFFER] ?? null, singleRelicByPart, showcaseTemporaryOptions)
  const healCacheKey = computeScoringCacheKey(character, ScoringConfigType.HEAL, configMetadata[ScoringConfigType.HEAL] ?? null, singleRelicByPart, showcaseTemporaryOptions)
  const shieldCacheKey = computeScoringCacheKey(character, ScoringConfigType.SHIELD, configMetadata[ScoringConfigType.SHIELD] ?? null, singleRelicByPart, showcaseTemporaryOptions)

  const context = useMemo(() => {
    const pipelines: Partial<Record<ScoringConfigType, PipelineSlot>> = {}

    for (const configType of CONFIG_DISPLAY_ORDER) {
      const meta = configMetadata[configType]
      if (meta) {
        pipelines[configType] = buildPipelineSlot(character, configType, meta, singleRelicByPart, showcaseTemporaryOptions).slot
      }
    }

    return { pipelines }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [dpsCacheKey, bufferCacheKey, healCacheKey, shieldCacheKey])

  return (
    <SimScoringContext value={context}>
      {props.children}
    </SimScoringContext>
  )
})

