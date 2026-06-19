import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
import {
  applyScoringFunction,
} from 'lib/scoring/simScoringUtils'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import {
  buildBenchmarkSimulationState,
  runSingleStatSimulation,
} from 'lib/simulations/statSimulation'
import type {
  Simulation,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import { clone } from 'lib/utils/objectUtils'
import {
  type ComputeOptimalSimulationWorkerInput,
  type ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import {
  DIMINISHING_RETURNS_CURVES,
  getDiminishingReturnsCurve,
} from 'lib/worker/diminishingReturnsCurve'
import { SearchTree } from 'lib/worker/maxima/tree/searchTree'
import {
  SUBSTAT_COUNT,
  toSubstatCounts,
} from 'lib/worker/maxima/tree/statIndexMap'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export function computeOptimalSimulationWorker(e: MessageEvent<ComputeOptimalSimulationWorkerInput>) {
  const input = e.data

  const context = input.context
  initializeContextConditionals(context)
  const optimalSimulation = computeOptimalSimulationSearch(input)

  const { x: _x, ...serializableResult } = optimalSimulation.result!
  optimalSimulation.result = serializableResult as typeof optimalSimulation.result

  const workerOutput: ComputeOptimalSimulationWorkerOutput = {
    simulation: optimalSimulation,
  }

  if (globalThis.SEQUENTIAL_BENCHMARKS) {
    return workerOutput
  }

  self.postMessage(workerOutput)
}

function computeOptimalSimulationSearch(input: ComputeOptimalSimulationWorkerInput) {
  const {
    partialSimulationWrapper,
    inputMinSubstatRollCounts,
    inputMaxSubstatRollCounts,
    simulationForm,
    context,
    metadata,
    scoringParams,
    simulationFlags,
    configType,
  } = input

  const curveConfig = DIMINISHING_RETURNS_CURVES[getDiminishingReturnsCurve(input)]
  scoringParams.substatRollsModifier = curveConfig.substatRollsModifier

  const minSubstatRollCounts = inputMinSubstatRollCounts
  const maxSubstatRollCounts = inputMaxSubstatRollCounts

  const goal = scoringParams.substatGoal
  const currentSimulation: Simulation = clone(partialSimulationWrapper.simulation)

  if (scoringParams.enforcePossibleDistribution) {
    maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD]) // Fixes SPD
    currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    if (maxSubstatRollCounts[Stats.RES] > 0) {
      maxSubstatRollCounts[Stats.RES] = Math.max(6, maxSubstatRollCounts[Stats.RES])
      currentSimulation.request.stats[Stats.RES] = Math.max(6, maxSubstatRollCounts[Stats.RES])
    }
  }

  // Cached container reused across all damageFunction calls to avoid repeated allocations
  const cachedComputedStatsContainer = new ComputedStatsContainer()
  cachedComputedStatsContainer.initializeArrays(context.maxContainerArrayLength, context)

  const benchmarkSimState = buildBenchmarkSimulationState(
    currentSimulation,
    { ...scoringParams, mainStatMultiplier: 1, simulationFlags, stabilize: false, skipDefaults: true },
    curveConfig.diminishingReturns,
  )

  function damageFunction(stats: SubstatCounts, stabilize = false): number {
    currentSimulation.request.stats = stats
    benchmarkSimState.params.stabilize = stabilize
    benchmarkSimState.params.skipDefaults = SCORING_CONFIG_REGISTRY[configType].requiresDefaultActions ? false : !stabilize
    currentSimulation.result = runSingleStatSimulation(benchmarkSimState, currentSimulation, simulationForm, context, cachedComputedStatsContainer)

    applyScoringFunction(currentSimulation.result, metadata, true, false, context, configType)
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

  let maxAssignments = 0
  for (let i = 0; i < SUBSTAT_COUNT; i++) {
    maxAssignments += Math.min(
      maxSubstatRollCounts[SubStats[i]] ?? 0,
      substatValidator.getAvailablePieces(i),
    )
  }
  if (maxAssignments < 24) {
    throw new Error(
      `Search space assignment-infeasible: ${maxAssignments}/24 slots fillable. `
        + `Character's effectiveSubstats needs more filler stats.`,
    )
  }

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

  const bestPoint = toSubstatCounts(tree.search())
  damageFunction(bestPoint, true)

  return currentSimulation
}
