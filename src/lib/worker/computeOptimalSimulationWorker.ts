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
  StatSimulationTypes,
} from 'lib/simulations/statSimulationTypes'
import { sumArray } from 'lib/utils/mathUtils'
import { Utils } from 'lib/utils/utils'
import {
  ComputeOptimalSimulationWorkerInput,
  ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'

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

function computeOptimalSimulation(input: ComputeOptimalSimulationWorkerInput) {
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

  let breakpointsCap = true
  let speedCap = true
  let simulationRuns = 0

  const sumRequest: number = sumArray(Object.values(currentSimulation.request.stats))
  const sumMin: number = sumArray(Object.values(minSubstatRollCounts))
  if (sumRequest == sumMin || sumRequest < goal) {
    currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
      ...scoringParams,
      substatRollsModifier: scoringParams.substatRollsModifier,
    })[0]
    applyScoringFunction(currentSimulation.result, metadata)
    return currentSimulation
  }

  // For the perfect 200% sim, we have to force the build to be a possible build
  // Track the substats per part and make sure there are enough slots being used
  const possibleDistributionTracker: {
    parts: {
      main: string,
      substats: {
        [key: string]: boolean,
      },
    }[],
  } = { parts: [] }
  if (scoringParams.enforcePossibleDistribution) {
    speedCap = false
    maxSubstatRollCounts[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    currentSimulation.request.stats[Stats.SPD] = Math.max(6, maxSubstatRollCounts[Stats.SPD])
    sum = sumSubstatRolls(maxSubstatRollCounts)

    const candidateStats = [...metadata.substats, Stats.SPD]

    const generate = (excluded: string) => {
      const substats: Record<string, boolean> = {}
      candidateStats.forEach((stat) => {
        if (stat != excluded) {
          substats[stat] = true
        }
      })
      return {
        main: excluded,
        substats: substats,
      }
    }

    const request = partialSimulationWrapper.simulation.request
    // Backwards so main stats go first
    possibleDistributionTracker.parts = [
      generate(request.simLinkRope),
      generate(request.simPlanarSphere),
      generate(request.simFeet),
      generate(request.simBody),
      generate(Stats.ATK),
      generate(Stats.HP),
    ]
  }

  // Tracker for stats that cant be reduced further
  const excludedStats: Record<string, boolean> = {}

  while (sum > goal) {
    let bestSim: Simulation = undefined as unknown as Simulation
    let bestSimStats: StatSimulationTypes = undefined as unknown as StatSimulationTypes
    let bestSimResult: SimulationResult = undefined as unknown as SimulationResult
    let reducedStat: string = undefined as unknown as string

    const remainingStats = Object.entries(currentSimulation.request.stats)
      .filter(([key, value]) => value > scoringParams.freeRolls)
      .map(([key]) => key)
      .filter((stat) => !excludedStats[stat])

    const debug = currentSimulation.request.stats

    for (const stat of remainingStats) {
      // Can't reduce further so we skip
      if (currentSimulation.request.stats[stat] <= scoringParams.freeRolls) continue
      if (Utils.sumArray(Object.values(currentSimulation.request.stats)) <= scoringParams.substatGoal) continue
      if (stat == Stats.SPD && currentSimulation.request.stats[Stats.SPD] <= Math.ceil(partialSimulationWrapper.speedRollsDeduction)) continue
      if (currentSimulation.request.stats[stat] <= minSubstatRollCounts[stat]) continue

      // Cache the value so we can undo a modification
      const undo = currentSimulation.request.stats[stat]

      // Try reducing this stat
      const newSimulation: Simulation = currentSimulation
      newSimulation.request.stats[stat] -= 1

      const runStatSimulationsResults = runStatSimulations([newSimulation], simulationForm, context, {
        ...scoringParams,
        substatRollsModifier: scoringParams.substatRollsModifier,
        simulationFlags: simulationFlags,
      })

      const newSimResult = runStatSimulationsResults[0]

      simulationRuns++

      if (breakpointsCap && breakpoints?.[stat]) {
        if (newSimResult.xa[StatToKey[stat]] < breakpoints[stat]) {
          currentSimulation.request.stats[stat] = undo
          continue
        }
      }

      applyScoringFunction(newSimResult, metadata)

      if (!bestSim || newSimResult.simScore > bestSimResult.simScore) {
        bestSim = newSimulation
        bestSimStats = Object.assign({}, newSimulation.request.stats)
        // @ts-ignore we only care if it exists, type matching isn't important
        bestSimResult = newSimResult
        reducedStat = stat
      }

      currentSimulation.request.stats[stat] = undo
    }

    if (!bestSimResult) {
      // We can't reach the target speed and breakpoints, stop trying to match breakpoints and try again
      if (breakpointsCap) {
        breakpointsCap = false
        continue
      }

      // We still can't reach the target speed and breakpoints, stop trying to match speed and try again
      if (speedCap) {
        speedCap = false
        continue
      }

      // No solution possible, skip
      sum -= 1
      continue
    }

    // if (scoringParams.enforcePossibleDistribution) {
    //   console.log(debug)
    // }

    if (scoringParams.enforcePossibleDistribution && bestSimStats[reducedStat] < 6) {
      const stat = reducedStat

      // How many stats the sim's iteration is attempting
      const simStatCount = bestSimStats[stat]
      // How many slots are open for the stat in question
      const statSlotCount = possibleDistributionTracker
        .parts
        .map((part) => part.substats[stat])
        .filter((hasSubstat) => hasSubstat)
        .length

      if (simStatCount < statSlotCount) {
        // We need to reduce the slots to fit the sim
        let deleted = false
        for (const part of possibleDistributionTracker.parts) {
          // Can't do anything since it's not in the subs
          if (!part.substats[stat]) continue
          // Can't do anything since we need all 4 slots filled
          if (Object.values(part.substats).length <= 4) continue

          // Found one that we can reduce, and exit
          delete part.substats[stat]
          deleted = true
          break
        }

        if (!deleted) {
          // We didn't delete anything, so this distribution must be invalid
          // Don't reduce the stat and continue the search
          excludedStats[stat] = true
          continue
        }
      }
    }

    currentSimulation = bestSim
    currentSimulation.request.stats = bestSimStats
    sum -= 1
  }

  // Rerun simulation to make result stable
  currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
    ...scoringParams,
    substatRollsModifier: scoringParams.substatRollsModifier,
    simulationFlags: simulationFlags,
  })[0]

  applyScoringFunction(currentSimulation.result, metadata)

  console.log(
    'simulationRuns',
    simulationRuns,
    partialSimulationWrapper.simulation.request.simBody,
    partialSimulationWrapper.simulation.request.simFeet,
    partialSimulationWrapper.simulation.request.simLinkRope,
    partialSimulationWrapper.simulation.request.simPlanarSphere,
  )

  return currentSimulation
}

function sumSubstatRolls(maxSubstatRollCounts: StatSimulationTypes) {
  let sum = 0
  for (const stat of SubStats) {
    sum += maxSubstatRollCounts[stat]
  }
  return sum
}

export function DEBUG() {
}
