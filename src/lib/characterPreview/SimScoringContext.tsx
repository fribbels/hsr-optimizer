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
  scoringDone: boolean
  upgradesDone: boolean
}

const nullPromise = Promise.resolve(null)

// top level promises need to be cached in order to play nicely with the `use` hook
const scorePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const scoreUpgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()

export const SimScoringContext = createContext<SimScoringContext>({
  preview: null,
  scoringPromise: Promise.resolve(null),
  upgradePromise: Promise.resolve(null),
  scoringDone: false,
  upgradesDone: false,
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
        scoringDone: false,
        upgradesDone: false,
      }
    }
    // if simulationMetadata is null then cacheKey will be null
    // therefore the above guard is sufficient and simulationMetada can safely have null excluded via `!`
    const preview = getOrComputePreview(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions)

    const scoringPromise = scorePromiseCache.get(cacheKey) ?? scorePromiseCache
      .set(
        cacheKey,
        requestScore(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions),
      ).get(cacheKey)!

    const upgradePromise = scoreUpgradePromiseCache.get(cacheKey) ?? scoreUpgradePromiseCache
      .set(
        cacheKey,
        requestScoreUpgrades(cacheKey, character, simulationMetadata!, singleRelicByPart, showcaseTemporaryOptions),
      ).get(cacheKey)!

    const scoringDone = resultCache.has(cacheKey)

    const upgradesDone = upgradeResultCache.has(cacheKey)

    return { preview, scoringPromise, upgradePromise, scoringDone, upgradesDone }

    // a change in any of the other arguments leads to a change in cacheKey, no need to add them in the dependancy array
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
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

export function useSimScoringContext(selector: ScoringSelector.Preview): PreparedState | null
export function useSimScoringContext(selector: ScoringSelector.Score | ScoringSelector.Upgrades): SimulationScore | null
export function useSimScoringContext(selector: ScoringSelector) {
  const ctx = use(SimScoringContext)
  switch (selector) {
    case ScoringSelector.Preview:
      return ctx.preview
    case ScoringSelector.Score:
      return use(ctx.scoringPromise)
    case ScoringSelector.Upgrades:
      return use(ctx.upgradePromise)
  }
}
