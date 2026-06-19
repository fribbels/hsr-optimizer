import { CONFIG_DISPLAY_ORDER } from 'lib/scoring/scoringConfig'
import {
  computeScoringCacheKey,
  getOrComputePreview,
  type PreparedState,
  releaseOrchestrator,
  requestScore,
  requestScoreUpgrades,
  resultCache,
  upgradeResultCache,
} from 'lib/scoring/scoringService'
import type { SimulationFlags, SimulationScore } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  createContext,
  memo,
  type PropsWithChildren,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import {
  type ScoringConfig,
  ScoringConfigType,
  type ShowcaseTemporaryOptions,
  type SimulationMetadata,
} from 'types/metadata'
import type { InjectedScoreData, InjectedScoringInput } from './characterPreviewTypes'
import { type PreviewRelics } from './characterPreviewController'

export type ScoringPipeline = {
  preview: PreparedState | null,
  scoringPromise: Promise<SimulationScore | null>,
  upgradePromise: Promise<SimulationScore | null>,
  cachedScore: SimulationScore | null,
  cachedUpgrades: SimulationScore | null,
}

type SimScoringContextValue = {
  pipelines: Partial<Record<ScoringConfigType, ScoringPipeline>>,
}

// Stable reference to avoid re-renders when no promise exists
const nullPromise = Promise.resolve(null)

const EMPTY_FLAGS: SimulationFlags = {
  overcapCritRate: false,
  simPoetActive: false,
  characterPoetActive: false,
  forceErrRope: false,
  benchmarkBasicSpdTarget: 0,
  benchmarkBasicResTarget: 0,
}

const EMPTY_PIPELINES: SimScoringContextValue = { pipelines: {} }

// Promise caches for deduplication — keyed by cacheKey string
const scorePromiseCache = new Map<string, Promise<SimulationScore | null>>()
const scoreUpgradePromiseCache = new Map<string, Promise<SimulationScore | null>>()

export const SimScoringContext = createContext<SimScoringContextValue>(EMPTY_PIPELINES)

function buildScoringPipeline(
  cacheKey: string | null,
  character: Character,
  configType: ScoringConfigType,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
): ScoringPipeline {
  if (cacheKey === null) {
    return {
      preview: null,
      scoringPromise: nullPromise,
      upgradePromise: nullPromise,
      cachedScore: null,
      cachedUpgrades: null,
    }
  }

  const config: ScoringConfig = {
    configType,
    simulation: simulationMetadata,
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

  return { preview, scoringPromise, upgradePromise, cachedScore, cachedUpgrades }
}

function buildInjectedScorePipeline(
  cacheKey: string | null,
  character: Character,
  configType: ScoringConfigType,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: PreviewRelics,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
  scoreData: InjectedScoreData,
): ScoringPipeline {
  if (cacheKey === null) {
    return {
      preview: null,
      scoringPromise: nullPromise,
      upgradePromise: nullPromise,
      cachedScore: null,
      cachedUpgrades: null,
    }
  }

  const config: ScoringConfig = {
    configType,
    simulation: simulationMetadata,
  }

  const preview = getOrComputePreview(cacheKey, character, config, singleRelicByPart, showcaseTemporaryOptions)

  // Release the prepared orchestrator immediately — injected-score mode never calls
  // requestScore, so nothing will consume it. Without this, orchestrators leak.
  releaseOrchestrator(cacheKey)

  if (preview === null) {
    return {
      preview: null,
      scoringPromise: nullPromise,
      upgradePromise: nullPromise,
      cachedScore: null,
      cachedUpgrades: null,
    }
  }

  const cachedScore = buildInjectedScoreStub(scoreData, preview, simulationMetadata, character)

  return {
    preview,
    scoringPromise: nullPromise,
    upgradePromise: nullPromise,
    cachedScore,
    cachedUpgrades: null,
  }
}

function buildInjectedScoreStub(
  scoreData: InjectedScoreData,
  preview: PreparedState,
  simulationMetadata: SimulationMetadata,
  character: Character,
): SimulationScore {
  return {
    percent: scoreData.percent,

    originalSim: preview.originalSim,
    baselineSim: preview.baselineSim,
    benchmarkSim: preview.baselineSim,
    maximumSim: preview.baselineSim,

    originalSimResult: preview.originalSimResult,
    baselineSimResult: preview.baselineSimResult,
    benchmarkSimResult: preview.baselineSimResult,
    maximumSimResult: preview.baselineSimResult,

    originalSimScore: preview.originalSimResult.simScore,
    baselineSimScore: scoreData.baselineSimScore,
    benchmarkSimScore: scoreData.benchmarkSimScore,
    maximumSimScore: scoreData.maximumSimScore,

    substatUpgrades: [],
    setUpgrades: [],
    mainUpgrades: [],
    teammateOrnamentUpgradeResults: [],

    simulationForm: preview.simForm,
    simulationMetadata,
    characterMetadata: getGameMetadata().characters[character.id],

    originalSpd: preview.originalSpd,
    spdBenchmark: undefined,
    simulationFlags: EMPTY_FLAGS,
  }
}

interface SimScoringContextProps extends PropsWithChildren {
  character: Character
  configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>>
  singleRelicByPart: PreviewRelics
  showcaseTemporaryOptions: ShowcaseTemporaryOptions
  injectedScoring?: InjectedScoringInput
}

export const SimScoringContextProvider = memo(function SimScoringContextProvider(props: SimScoringContextProps) {
  const { character, configMetadata, singleRelicByPart, showcaseTemporaryOptions, injectedScoring } = props

  const injectedScore = injectedScoring?.score
  const injectedScoreConfigType = injectedScoring?.configType
  const hasInjectedScore = injectedScoring != null

  const dpsCacheKey = (!hasInjectedScore || injectedScoreConfigType === ScoringConfigType.DPS)
    ? computeScoringCacheKey(character, ScoringConfigType.DPS, configMetadata[ScoringConfigType.DPS] ?? null, singleRelicByPart, showcaseTemporaryOptions)
    : null
  const bufferCacheKey = (!hasInjectedScore || injectedScoreConfigType === ScoringConfigType.BUFFER)
    ? computeScoringCacheKey(character, ScoringConfigType.BUFFER, configMetadata[ScoringConfigType.BUFFER] ?? null, singleRelicByPart, showcaseTemporaryOptions)
    : null
  const healCacheKey = (!hasInjectedScore || injectedScoreConfigType === ScoringConfigType.HEAL)
    ? computeScoringCacheKey(character, ScoringConfigType.HEAL, configMetadata[ScoringConfigType.HEAL] ?? null, singleRelicByPart, showcaseTemporaryOptions)
    : null
  const shieldCacheKey = (!hasInjectedScore || injectedScoreConfigType === ScoringConfigType.SHIELD)
    ? computeScoringCacheKey(character, ScoringConfigType.SHIELD, configMetadata[ScoringConfigType.SHIELD] ?? null, singleRelicByPart, showcaseTemporaryOptions)
    : null

  const cacheKeys: Record<ScoringConfigType, string | null> = {
    [ScoringConfigType.DPS]: dpsCacheKey,
    [ScoringConfigType.BUFFER]: bufferCacheKey,
    [ScoringConfigType.HEAL]: healCacheKey,
    [ScoringConfigType.SHIELD]: shieldCacheKey,
  }

  const context = useMemo(() => {
    const pipelines: Partial<Record<ScoringConfigType, ScoringPipeline>> = {}

    for (const configType of CONFIG_DISPLAY_ORDER) {
      const meta = configMetadata[configType]
      if (!meta) continue

      if (injectedScoring) {
        if (configType === injectedScoring.configType) {
          pipelines[configType] = buildInjectedScorePipeline(cacheKeys[configType], character, configType, meta, singleRelicByPart, showcaseTemporaryOptions, injectedScoring.score)
        }
      } else {
        pipelines[configType] = buildScoringPipeline(cacheKeys[configType], character, configType, meta, singleRelicByPart, showcaseTemporaryOptions)
      }
    }

    return { pipelines }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [dpsCacheKey, bufferCacheKey, healCacheKey, shieldCacheKey, injectedScoring])

  return (
    <SimScoringContext value={context}>
      {props.children}
    </SimScoringContext>
  )
})
