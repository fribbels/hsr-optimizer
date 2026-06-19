import type { LeaderboardMetrics } from 'leaderboard/shared/types'
import { clone } from 'lib/utils/objectUtils'
import type {
  ComputeOptimalSimulationSearchRunner,
  ComputeOptimalSimulationWorkerInput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'

export function createLeaderboardSearchRunner(input: {
  metrics: LeaderboardMetrics,
  dispatch: ComputeOptimalSimulationSearchRunner,
}): ComputeOptimalSimulationSearchRunner {
  const { metrics, dispatch } = input

  const searchRunner: ComputeOptimalSimulationSearchRunner = async (workerInput, context) => {
    const startMs = performance.now()
    const dispatchInput: ComputeOptimalSimulationWorkerInput = {
      ...workerInput,
      context: clone(workerInput.context),
      inputMinSubstatRollCounts: { ...workerInput.inputMinSubstatRollCounts },
      inputMaxSubstatRollCounts: { ...workerInput.inputMaxSubstatRollCounts },
      scoringParams: { ...workerInput.scoringParams },
    }

    const result = await dispatch(dispatchInput, context)
    if (result.simulation == null) {
      throw new Error(`Leaderboard search returned no simulation for ${context.phase}`)
    }

    metrics.timing('leaderboardSearch.dispatch', performance.now() - startMs, { phase: context.phase })
    return result
  }

  return searchRunner
}
