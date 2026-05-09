import { useContext } from 'react'
import { usePromise } from 'hooks/usePromise'
import { type ScoringPipeline, SimScoringContext } from 'lib/characterPreview/SimScoringContext'
import type { PreparedState } from 'lib/scoring/scoringService'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { ScoringConfigType } from 'types/metadata'

export function useSimPreview(configType: ScoringConfigType): PreparedState | null {
  const simScoringContext = useContext(SimScoringContext)
  return simScoringContext.pipelines[configType]?.preview ?? null
}

export function useSimScore(configType: ScoringConfigType): SimulationScore | null {
  const simScoringContext = useContext(SimScoringContext)
  const slot = simScoringContext.pipelines[configType]

  const promise = slot?.scoringPromise ?? null
  const cached = slot?.cachedScore ?? null
  const promised = usePromise(promise)

  return cached ?? promised
}

export function useSimUpgrades(configType: ScoringConfigType): SimulationScore | null {
  const simScoringContext = useContext(SimScoringContext)
  const slot = simScoringContext.pipelines[configType]

  const promise = slot?.upgradePromise ?? null
  const cached = slot?.cachedUpgrades ?? null
  const promised = usePromise(promise)

  return cached ?? promised
}

export function useScoringPipeline(configType: ScoringConfigType): ScoringPipeline | undefined {
  const simScoringContext = useContext(SimScoringContext)
  return simScoringContext.pipelines[configType]
}
