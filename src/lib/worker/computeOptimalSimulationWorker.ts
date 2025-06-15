import { SubStats } from 'lib/constants/constants'
import { substatRollsModifier } from 'lib/scoring/simScoringUtils'
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

  const substatValidator = new SubstatDistributionValidator(input)

  const breakpoints = metadata.breakpoints
  const goal = scoringParams.substatGoal
  let sum = sumSubstatRolls(maxSubstatRollCounts)
  let currentSimulation: Simulation = partialSimulationWrapper.simulation

  const effectiveStats = Object.entries(currentSimulation.request.stats)
    .filter(([key, value]) => value > scoringParams.freeRolls)
    .map(([key]) => key)

  const dimensions = effectiveStats.length

  console.debug(dimensions, effectiveStats)
  // search(input)

  const validator = new SubstatDistributionValidator(input)
  // const constraintSolver = new StatConstraintSolver(validator, effectiveStats)

  // const minArr = substatCountsToArray(minSubstatRollCounts, effectiveStats)
  // const maxArr = substatCountsToArray(maxSubstatRollCounts, effectiveStats)

  // const tree = new StatTreeManager(dimensions, { lower: minArr, upper: maxArr })

  // tree.initializeRoot(goal, constraintSolver)

  // root.damage = damageFunction(root.representative!, dimensions)

  // console.log(tree.getTreeStats())
  // console.log(tree)

  currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
    ...scoringParams,
    substatRollsModifier: scoringParams.substatRollsModifier,
    simulationFlags: simulationFlags,
  })[0]

  return currentSimulation

  // let breakpointsCap = true
  // let speedCap = true
  // let simulationRuns = 0
  //
  // const sumRequest: number = sumArray(Object.values(currentSimulation.request.stats))
  // const sumMin: number = sumArray(Object.values(minSubstatRollCounts))
  // if (sumRequest == sumMin || sumRequest < goal) {
  //   currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
  //     ...scoringParams,
  //     substatRollsModifier: scoringParams.substatRollsModifier,
  //   })[0]
  //   applyScoringFunction(currentSimulation.result, metadata)
  //   return currentSimulation
  // }
  //
  // if (scoringParams.enforcePossibleDistribution) {
  //   speedCap = false
  //   maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
  //   currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
  //   sum = sumSubstatRolls(maxSubstatRollCounts)
  // }
  //
  // // Tracker for stats that cant be reduced further
  // const excludedStats: Record<string, boolean> = {}
  //
  // let iteration = 0
  //
  // while (sum > goal) {
  //   let bestSim: Simulation = undefined as unknown as Simulation
  //   let bestSimStats: StatSimulationTypes = undefined as unknown as StatSimulationTypes
  //   let bestSimResult: SimulationResult = undefined as unknown as SimulationResult
  //   let reducedStat: string = undefined as unknown as string
  //
  //   const remainingStats = Object.entries(currentSimulation.request.stats)
  //     .filter(([key, value]) => value > scoringParams.freeRolls)
  //     .map(([key]) => key)
  //     .filter((stat) => !excludedStats[stat])
  //
  //   for (const stat of remainingStats) {
  //     // Can't reduce further so we skip
  //     if (currentSimulation.request.stats[stat] <= scoringParams.freeRolls) continue
  //     if (Utils.sumArray(Object.values(currentSimulation.request.stats)) <= scoringParams.substatGoal) continue
  //     if (stat == Stats.SPD && currentSimulation.request.stats[Stats.SPD] <= Math.ceil(partialSimulationWrapper.speedRollsDeduction)) continue
  //     if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue
  //
  //     // Cache the value so we can undo a modification
  //     const undo = currentSimulation.request.stats[stat]
  //
  //     // Try reducing this stat
  //     const newSimulation: Simulation = currentSimulation
  //     newSimulation.request.stats[stat] -= 1
  //
  //     const runStatSimulationsResults = runStatSimulations([newSimulation], simulationForm, context, {
  //       ...scoringParams,
  //       substatRollsModifier: scoringParams.substatRollsModifier,
  //       simulationFlags: simulationFlags,
  //     })
  //
  //     const newSimResult = runStatSimulationsResults[0]
  //
  //     simulationRuns++
  //
  //     if (breakpointsCap && breakpoints?.[stat]) {
  //       if (newSimResult.xa[StatToKey[stat]] < breakpoints[stat]) {
  //         currentSimulation.request.stats[stat] = undo
  //         continue
  //       }
  //     }
  //
  //     applyScoringFunction(newSimResult, metadata)
  //
  //     if (!bestSim || newSimResult.simScore > bestSimResult.simScore) {
  //       bestSim = newSimulation
  //       bestSimStats = Object.assign({}, newSimulation.request.stats)
  //       // @ts-ignore we only care if it exists, type matching isn't important
  //       bestSimResult = newSimResult
  //       reducedStat = stat
  //     }
  //
  //     currentSimulation.request.stats[stat] = undo
  //   }
  //
  //   if (!bestSimResult) {
  //     // We can't reach the target speed and breakpoints, stop trying to match breakpoints and try again
  //     if (breakpointsCap) {
  //       breakpointsCap = false
  //       continue
  //     }
  //
  //     // We still can't reach the target speed and breakpoints, stop trying to match speed and try again
  //     if (speedCap) {
  //       speedCap = false
  //       continue
  //     }
  //
  //     // No solution possible, skip
  //     sum -= 1
  //     continue
  //   }
  //
  //   iteration++
  //
  //   if (scoringParams.enforcePossibleDistribution && bestSimStats[reducedStat] < 6) {
  //     if (!substatValidator.isValidDistribution(bestSimStats)) {
  //       console.log(iteration, 'INVALID', TsUtils.clone(bestSimStats))
  //       excludedStats[reducedStat] = true
  //       continue
  //     }
  //   }
  //
  //   currentSimulation = bestSim
  //   currentSimulation.request.stats = bestSimStats
  //   sum -= 1
  // }
  //
  // // Rerun simulation to make result stable
  // currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
  //   ...scoringParams,
  //   substatRollsModifier: scoringParams.substatRollsModifier,
  //   simulationFlags: simulationFlags,
  // })[0]
  //
  // applyScoringFunction(currentSimulation.result, metadata)
  //
  // console.log(
  //   'simulationRuns',
  //   simulationRuns,
  //   partialSimulationWrapper.simulation.request.simBody,
  //   partialSimulationWrapper.simulation.request.simFeet,
  //   partialSimulationWrapper.simulation.request.simLinkRope,
  //   partialSimulationWrapper.simulation.request.simPlanarSphere,
  // )
  //
  // return currentSimulation
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
