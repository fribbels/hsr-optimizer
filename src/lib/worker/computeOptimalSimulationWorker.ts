import { SubStats } from 'lib/constants/constants'
import {
  applyScoringFunction,
  substatRollsModifier,
} from 'lib/scoring/simScoringUtils'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  Simulation,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import {
  ComputeOptimalSimulationWorkerInput,
  ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { OptimalSubstatDistributionSearchTree } from 'lib/worker/maxima/tree/optimalSubstatDistributionSearchTree'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export function computeOptimalSimulationWorker(e: MessageEvent<ComputeOptimalSimulationWorkerInput>) {
  const input = e.data

  const context = input.context
  initializeContextConditionals(context)
  const optimalSimulation = computeOptimalSimulation(input)

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

function divideEvenly(n: number, d: number): Float32Array {
  const base = Math.floor(n / d)
  const remainder = n % d
  const result = new Float32Array(d).fill(base)

  for (let i = 0; i < remainder; i++) {
    result[i]++
  }

  return result
}

export function computeOptimalSimulation(input: ComputeOptimalSimulationWorkerInput) {
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

  const breakpoints = metadata.breakpoints
  const goal = scoringParams.substatGoal
  let sum = sumSubstatRolls(maxSubstatRollCounts)
  let currentSimulation: Simulation = partialSimulationWrapper.simulation

  const effectiveStats = Object.entries(currentSimulation.request.stats)
    .filter(([key, value]) => value > scoringParams.freeRolls)
    .map(([key]) => key)

  const dimensions = effectiveStats.length

  console.debug(dimensions, effectiveStats)

  function damageFunction(stats: SubstatCounts): number {
    currentSimulation.request.stats = stats
    currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
      ...scoringParams,
      substatRollsModifier: scoringParams.substatRollsModifier,
      simulationFlags: simulationFlags,
    })[0]

    applyScoringFunction(currentSimulation.result, metadata)
    return currentSimulation.result.simScore
  }

  const substatValidator = new SubstatDistributionValidator(input)
  const tree = new OptimalSubstatDistributionSearchTree(
    dimensions,
    goal,
    minSubstatRollCounts,
    maxSubstatRollCounts,
    effectiveStats,
    damageFunction,
  )
  // tree.debugRootRegion()
  // tree.debugStartingPoint()
  tree.debugRootNode()

  // TODO

  // This is just to make the output happy in the meantime
  currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
    ...scoringParams,
    substatRollsModifier: scoringParams.substatRollsModifier,
    simulationFlags: simulationFlags,
  })[0]

  return currentSimulation
}

function sumSubstatRolls(maxSubstatRollCounts: SubstatCounts) {
  let sum = 0
  for (const stat of SubStats) {
    sum += maxSubstatRollCounts[stat]
  }
  return sum
}

export function DEBUG() {
}
