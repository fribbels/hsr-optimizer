import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  applyScoringFunction,
  substatRollsModifier,
} from 'lib/scoring/simScoringUtils'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  type Simulation,
  type SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import { clone } from 'lib/utils/objectUtils'
import {
  type ComputeOptimalSimulationWorkerInput,
  type ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
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

  // @ts-expect-error - removing ComputedStatsContainer before postMessage (not serializable)
  delete optimalSimulation.result.x

  const workerOutput: ComputeOptimalSimulationWorkerOutput = {
    simulation: optimalSimulation,
  }

  if (globalThis.SEQUENTIAL_BENCHMARKS) {
    return workerOutput
  }

  self.postMessage(workerOutput)
}

function getSubstatRollsModifier(input: ComputeOptimalSimulationWorkerInput) {
  // Manual adjustment for Hysilens scoring - Using non-EHR light cones forces the benchmark to be unable to hit 120%
  // EHR due to diminishing returns. To fix, relax diminishing returns on non-EHR LC builds
  if (input.context.characterId === Hysilens.id) {
    const ehrLightCone = input.context.characterStatsBreakdown.lightCone[Stats.EHR]
    if (!ehrLightCone) {
      return (rolls: number, stat: string, sim: Simulation) =>
        substatRollsModifier(rolls, stat, sim, (mainsCount, rolls) => {
          const lowerLimit = 24 - 2 * mainsCount
          if (rolls <= lowerLimit) {
            return rolls
          }

          const excess = Math.max(0, rolls - lowerLimit)
          const diminishedExcess = excess / (Math.pow(excess, 0.25))

          return lowerLimit + diminishedExcess
        })
    }
  }

  return substatRollsModifier
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
  } = input

  scoringParams.substatRollsModifier = scoringParams.quality === 0.8
    ? getSubstatRollsModifier(input)
    : (rolls: number) => rolls

  const minSubstatRollCounts = inputMinSubstatRollCounts
  const maxSubstatRollCounts = inputMaxSubstatRollCounts

  const goal = scoringParams.substatGoal
  const currentSimulation: Simulation = clone(partialSimulationWrapper.simulation)

  if (scoringParams.enforcePossibleDistribution) {
    maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD]) // Fixes SPD
    currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
  }

  // Cached container reused across all damageFunction calls to avoid repeated allocations
  const cachedComputedStatsContainer = new ComputedStatsContainer()
  cachedComputedStatsContainer.initializeArrays(context.maxContainerArrayLength, context)

  const mergedScoringParams = {
    ...scoringParams,
    substatRollsModifier: scoringParams.substatRollsModifier,
    simulationFlags: simulationFlags,
    stabilize: false,
    skipDefaults: true,
  }

  function damageFunction(stats: SubstatCounts, stabilize = false): number {
    currentSimulation.request.stats = stats
    mergedScoringParams.stabilize = stabilize
    mergedScoringParams.skipDefaults = !stabilize
    currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, mergedScoringParams, cachedComputedStatsContainer)[0]

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
