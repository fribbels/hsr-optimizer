import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { StatToKey } from 'lib/optimization/computedStatsArray'
import {
  applyScoringFunction,
  SimulationResult,
  substatRollsModifier,
} from 'lib/scoring/simScoringUtils'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  Simulation,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  ComputeOptimalSimulationWorkerInput,
  ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { SearchTree } from 'lib/worker/maxima/tree/searchTree'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export function computeOptimalSimulationWorker(e: MessageEvent<ComputeOptimalSimulationWorkerInput>) {
  const input = e.data

  const context = input.context
  initializeContextConditionals(context)
  const optimalSimulation = computeOptimalSimulationSearch(input)

  // @ts-ignore
  delete optimalSimulation.result.x

  const workerOutput: ComputeOptimalSimulationWorkerOutput = {
    simulation: optimalSimulation,
  }

  if (globalThis.SEQUENTIAL_BENCHMARKS) {
    return workerOutput
  }

  self.postMessage(workerOutput)
}

export function computeOptimalSimulationSearch(input: ComputeOptimalSimulationWorkerInput) {
  const {
    partialSimulationWrapper,
    inputMinSubstatRollCounts,
    inputMaxSubstatRollCounts,
    simulationForm,
    context,
    metadata,
    scoringParams,
    simulationFlags,
  } = input

  scoringParams.substatRollsModifier = scoringParams.quality == 0.8
    ? substatRollsModifier
    : (rolls: number) => rolls

  const minSubstatRollCounts = inputMinSubstatRollCounts
  const maxSubstatRollCounts = inputMaxSubstatRollCounts

  const goal = scoringParams.substatGoal
  const currentSimulation: Simulation = TsUtils.clone(partialSimulationWrapper.simulation)

  if (scoringParams.enforcePossibleDistribution) {
    maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD]) // Fixes SPD
    currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
  }

  function damageFunction(stats: SubstatCounts, stabilize = false): number {
    currentSimulation.request.stats = stats
    currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
      ...scoringParams,
      substatRollsModifier: scoringParams.substatRollsModifier,
      simulationFlags: simulationFlags,
      stabilize: stabilize,
    })[0]

    applyScoringFunction(currentSimulation.result, metadata)
    return currentSimulation.result.simScore
  }

  const request = input.partialSimulationWrapper.simulation.request
  const mainStats = [
    Stats.HP,
    Stats.ATK,
    request.simBody,
    request.simFeet,
    request.simPlanarSphere,
    request.simLinkRope,
  ]

  const substatValidator = new SubstatDistributionValidator(goal, request)

  const tree = new SearchTree(
    goal,
    minSubstatRollCounts,
    maxSubstatRollCounts,
    mainStats,
    damageFunction,
    substatValidator,
  )

  if (tree.root == null) {
    damageFunction(currentSimulation.request.stats, true)
    return currentSimulation
  }

  const bestPoint = tree.search()
  damageFunction(bestPoint, true)

  return currentSimulation
}

export function DEBUG() {
}
