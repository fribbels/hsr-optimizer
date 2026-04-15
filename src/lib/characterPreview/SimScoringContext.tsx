import { usePromise } from 'hooks/usePromise'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
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
  use,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import type {
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

interface SimScoringContext {
  preview: PreparedState | null
  scoringPromise: Promise<SimulationScore | null>
  upgradePromise: Promise<SimulationScore | null>
  cachedScore: SimulationScore | null
  cachedUpgrades: SimulationScore | null
}

// Stable reference to avoid re-renders when no promise exists
const nullPromise = Promise.resolve(null)

// Promise caches for deduplication
const scorePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const scoreUpgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()

export const SimScoringContext = createContext<SimScoringContext>({
  preview: null,
  scoringPromise: nullPromise,
  upgradePromise: nullPromise,
  cachedScore: null,
  cachedUpgrades: null,
})

interface SimScoringContextProps extends PropsWithChildren {
  character: Character
  simulationMetadata: SimulationMetadata | null
  singleRelicByPart: SingleRelicByPart
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
}

export const SimScoringContextProvider = memo(function SimScoringContextProvider(props: SimScoringContextProps) {
  const { character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions } = props
  const cacheKey = computeScoringCacheKey(character, simulationMetadata, singleRelicByPart, showcaseTemporaryOptions)

  const context = useMemo(() => {
    if (cacheKey === null) {
      return {
        preview: null,
        scoringPromise: nullPromise,
        upgradePromise: nullPromise,
        cachedScore: null,
        cachedUpgrades: null,
      }
    }

    const preview = getOrComputePreview(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions)

    const scoringPromise = scorePromiseCache.get(cacheKey) ?? scorePromiseCache
      .set(cacheKey, requestScore(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions))
      .get(cacheKey)!

    const upgradePromise = scoreUpgradePromiseCache.get(cacheKey) ?? scoreUpgradePromiseCache
      .set(cacheKey, requestScoreUpgrades(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions))
      .get(cacheKey)!

    const cachedScore = resultCache.get(cacheKey) ?? null
    const cachedUpgrades = upgradeResultCache.get(cacheKey) ?? null

    return { preview, scoringPromise, upgradePromise, cachedScore, cachedUpgrades }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

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
}

// Uses usePromise instead of use() to avoid Suspense and React profiler crashes
// Returns cached result immediately if available, avoiding flash during transitions
export function useSimScoringContext(selector: ScoringSelector.Preview): PreparedState | null
export function useSimScoringContext(selector: ScoringSelector.Score | ScoringSelector.Upgrades): SimulationScore | null
export function useSimScoringContext(selector: ScoringSelector) {
  const ctx = use(SimScoringContext)
  const promise = selector === ScoringSelector.Score
    ? ctx.scoringPromise
    : selector === ScoringSelector.Upgrades
    ? ctx.upgradePromise
    : null
  const cached = selector === ScoringSelector.Score
    ? ctx.cachedScore
    : selector === ScoringSelector.Upgrades
    ? ctx.cachedUpgrades
    : null
  const promised = usePromise(promise)
  return selector === ScoringSelector.Preview ? ctx.preview : cached ?? promised
}
