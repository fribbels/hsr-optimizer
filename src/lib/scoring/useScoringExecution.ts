import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import {
  computeScoringCacheKey,
  getOrComputePreview,
  type PreparedState,
  requestScore,
  requestScoreUpgrades,
} from 'lib/scoring/scoringService'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import {
  use,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import type {
  ShowcaseTemporaryOptions,
  SimulationMetadata,
} from 'types/metadata'

// top level promises need to be cached in order to play nicely with the `use` hook(?)
const scorePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const scoreUpgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()

type PreviewArgs = [Character, SimulationMetadata | null, SingleRelicByPart, ShowcaseTemporaryOptions]
type ScoringArgs = [string | null]
type UpgradeArgs = [string | null, Character]
type Args = PreviewArgs | ScoringArgs | UpgradeArgs

function isScoringArgs(args: Args): args is ScoringArgs {
  return args.length === 1
}

function isPreviewArgs(args: Args): args is PreviewArgs {
  return args.length === 4
}

export function useScoringExecution(cacheKey: string | null): SimulationScore | null
export function useScoringExecution(cacheKey: string | null, character: Character): SimulationScore | null
export function useScoringExecution(
  character: Character,
  simulationMetadata: SimulationMetadata | null,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): { preview: PreparedState | null, cacheKey: string | null }
export function useScoringExecution(...args: Args): SimulationScore | null | { preview: PreparedState | null, cacheKey: string | null } {
  const { preview, cacheKey } = useMemo(() => {
    if (!isPreviewArgs(args)) {
      return { cacheKey: null, preview: null }
    }
    const cacheKey = computeScoringCacheKey(...args)
    if (cacheKey === null) return { cacheKey: null, preview: null }
    // @ts-expect-error ts will complain about simulationMetada being null
    // if simulationMetadata is null then cacheKey will be null
    // therefore the above guard is sufficient
    const preview = getOrComputePreview(cacheKey, ...args)
    return { cacheKey, preview }
  }, [args])

  if (isPreviewArgs(args)) return { preview, cacheKey }

  if (args[0] === null) return null

  if (isScoringArgs(args)) {
    return use(scorePromiseCache.getOrInsertComputed(args[0], () => requestScore(...args)))
  }

  return use(scoreUpgradePromiseCache.getOrInsertComputed(args[0], () => requestScoreUpgrades(...args)))
}
