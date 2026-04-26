import { usePromise } from 'hooks/usePromise'
import {
  computeScoringCacheKey,
  computeSupportScoringCacheKey,
  getOrComputePreview,
  getOrComputeSupportPreview,
  type PreparedState,
  requestScore,
  requestScoreUpgrades,
  requestSupportScore,
  resultCache,
  upgradeResultCache,
} from 'lib/scoring/scoringService'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  createContext,
  memo,
  type PropsWithChildren,
  use,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import type {
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'
import { type PreviewRelics } from './characterPreviewController'

interface SimScoringContext {
  preview: PreparedState | null
  scoringPromise: Promise<SimulationScore | null>
  upgradePromise: Promise<SimulationScore | null>
  cachedScore: SimulationScore | null
  cachedUpgrades: SimulationScore | null
  // Support scoring
  supportPreview: PreparedState | null
  supportScoringPromise: Promise<SimulationScore | null>
  cachedSupportScore: SimulationScore | null
}

// Stable reference to avoid re-renders when no promise exists
const nullPromise = Promise.resolve(null)

// Promise caches for deduplication
const scorePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const scoreUpgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const supportScorePromiseCache = new Map<string, Promise<SimulationScore | null>>()

export const SimScoringContext = createContext<SimScoringContext>({
  preview: null,
  scoringPromise: nullPromise,
  upgradePromise: nullPromise,
  cachedScore: null,
  cachedUpgrades: null,
  supportPreview: null,
  supportScoringPromise: nullPromise,
  cachedSupportScore: null,
})

interface SimScoringContextProps extends PropsWithChildren {
  character: Character
  simulationMetadata: SimulationMetadata | null
  supportSimulationMetadata: SimulationMetadata | null
  singleRelicByPart: PreviewRelics
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
}

export const SimScoringContextProvider = memo(function SimScoringContextProvider(props: SimScoringContextProps) {
  const { character, simulationMetadata, supportSimulationMetadata, singleRelicByPart, showcaseTemporaryOptions } = props
  const cacheKey = computeScoringCacheKey(character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)
  const supportCacheKey = computeSupportScoringCacheKey(character, supportSimulationMetadata, singleRelicByPart, showcaseTemporaryOptions)

  const context = useMemo(() => {
    // DPS scoring
    let preview: PreparedState | null = null
    let scoringPromise: Promise<SimulationScore | null> = nullPromise
    let upgradePromise: Promise<SimulationScore | null> = nullPromise
    let cachedScore: SimulationScore | null = null
    let cachedUpgrades: SimulationScore | null = null

    if (cacheKey !== null) {
      preview = getOrComputePreview(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions)
      scoringPromise = scorePromiseCache.get(cacheKey) ?? scorePromiseCache
        .set(cacheKey, requestScore(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions))
        .get(cacheKey)!
      upgradePromise = scoreUpgradePromiseCache.get(cacheKey) ?? scoreUpgradePromiseCache
        .set(cacheKey, requestScoreUpgrades(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions))
        .get(cacheKey)!
      cachedScore = resultCache.get(cacheKey) ?? null
      cachedUpgrades = upgradeResultCache.get(cacheKey) ?? null
    }

    // Support scoring
    let supportPreview: PreparedState | null = null
    let supportScoringPromise: Promise<SimulationScore | null> = nullPromise
    let cachedSupportScore: SimulationScore | null = null

    if (supportCacheKey !== null) {
      supportPreview = getOrComputeSupportPreview(supportCacheKey, character, supportSimulationMetadata!, singleRelicByPart, showcaseTemporaryOptions)
      supportScoringPromise = supportScorePromiseCache.get(supportCacheKey) ?? supportScorePromiseCache
        .set(supportCacheKey, requestSupportScore(supportCacheKey, character, supportSimulationMetadata!, singleRelicByPart, showcaseTemporaryOptions))
        .get(supportCacheKey)!
      cachedSupportScore = resultCache.get(supportCacheKey) ?? null
    }

    return { preview, scoringPromise, upgradePromise, cachedScore, cachedUpgrades, supportPreview, supportScoringPromise, cachedSupportScore }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, supportCacheKey])

  return (
    <SimScoringContext value={context}>
      {props.children}
    </SimScoringContext>
  )
})

export enum ScoringSelector {
  Preview,
  Score,
  Upgrades,
  SupportPreview,
  SupportScore,
}

// Uses usePromise instead of use() to avoid Suspense and React profiler crashes
// Returns cached result immediately if available, avoiding flash during transitions
export function useSimScoringContext(selector: ScoringSelector.Preview | ScoringSelector.SupportPreview): PreparedState | null
export function useSimScoringContext(selector: ScoringSelector.Score | ScoringSelector.Upgrades | ScoringSelector.SupportScore): SimulationScore | null
export function useSimScoringContext(selector: ScoringSelector) {
  const ctx = use(SimScoringContext)

  const promise = selector === ScoringSelector.Score
    ? ctx.scoringPromise
    : selector === ScoringSelector.Upgrades
      ? ctx.upgradePromise
      : selector === ScoringSelector.SupportScore
        ? ctx.supportScoringPromise
        : null

  const cached = selector === ScoringSelector.Score
    ? ctx.cachedScore
    : selector === ScoringSelector.Upgrades
      ? ctx.cachedUpgrades
      : selector === ScoringSelector.SupportScore
        ? ctx.cachedSupportScore
        : null

  const promised = usePromise(promise)

  if (selector === ScoringSelector.Preview) return ctx.preview
  if (selector === ScoringSelector.SupportPreview) return ctx.supportPreview
  return cached ?? promised
}
