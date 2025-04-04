import { Stats, SubStats } from 'lib/constants/constants'
import { Key, StatToKey } from 'lib/optimization/computedStatsArray'
import { StatCalculator } from 'lib/relics/statCalculator'
import { benchmarkScoringParams, ScoringFunction, ScoringParams, SimulationResult } from 'lib/scoring/simScoringUtils'
import { runStatSimulations } from 'lib/simulations/new/statSimulation'
import { Simulation, SimulationStats } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { ComputeOptimalSimulationWorkerInput, ComputeOptimalSimulationWorkerOutput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { SimulationMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

export function computeOptimalSimulationWorker(e: MessageEvent<ComputeOptimalSimulationWorkerInput>) {
  console.time('Promise1')

  const input = e.data

  const optimalSimulation = computeOptimalSimulation(input)

  // TODO
  delete optimalSimulation.result.x

  const workerOutput: ComputeOptimalSimulationWorkerOutput = {
    simulation: optimalSimulation,
  }

  self.postMessage(workerOutput)
}

function substatRollsModifier(
  rolls: number,
  stat: string,
  relics: {
    [key: string]: Relic
  },
) {
  // if (stat == Stats.SPD) return rolls
  // Diminishing returns

  const mainsCount = Object.values(relics)
    .filter((x) => x?.augmentedStats?.mainStat == stat)
    .length

  return stat == Stats.SPD ? spdDiminishingReturnsFormula(mainsCount, rolls) : diminishingReturnsFormula(mainsCount, rolls)
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

  const applyScoringFunction: ScoringFunction = (result: SimulationResult, penalty = true) => {
    if (!result) return

    result.unpenalizedSimScore = result.xa[Key.COMBO_DMG]
    result.penaltyMultiplier = calculatePenaltyMultiplier(result, metadata, benchmarkScoringParams) // TODO: This should be using standardized params
    result.simScore = result.unpenalizedSimScore * (penalty ? result.penaltyMultiplier : 1)
  }

  scoringParams.substatRollsModifier = scoringParams.quality == 0.8
    ? substatRollsModifier
    : (rolls: number) => rolls

  const minSubstatRollCounts = inputMinSubstatRollCounts
  const maxSubstatRollCounts = inputMaxSubstatRollCounts

  const breakpoints = metadata.breakpoints
  const goal = scoringParams.substatGoal
  let sum = sumSubstatRolls(maxSubstatRollCounts)
  let currentSimulation: Simulation = partialSimulationWrapper.simulation
  let currentSimulationResult: SimulationResult = undefined

  let breakpointsCap = true
  let speedCap = true
  let simulationRuns = 0

  const sumRequest: number = TsUtils.sumArray(Object.values(currentSimulation.request.stats))
  const sumMin: number = TsUtils.sumArray(Object.values(minSubstatRollCounts))
  if (sumRequest == sumMin || sumRequest < goal) {
    currentSimulation.result = runStatSimulations([currentSimulation], simulationForm, context, {
      ...scoringParams,
      substatRollsModifier: scoringParams.substatRollsModifier,
    })[0]
    return currentSimulation
  }

  // For the perfect 200% sim, we have to force the build to be a possible build
  // Track the substats per part and make sure there are enough slots being used
  const possibleDistributionTracker: {
    parts: {
      main: string
      substats: {
        [key: string]: boolean
      }
    }[]
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
    let bestSim: Simulation = undefined
    let bestSimStats: SimulationStats = undefined
    let bestSimResult: SimulationResult = undefined
    let reducedStat: string = undefined

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

      applyScoringFunction(newSimResult)

      if (!bestSim || newSimResult.simScore > bestSimResult.simScore) {
        bestSim = newSimulation
        bestSimStats = Object.assign({}, newSimulation.request.stats)
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
    currentSimulationResult = bestSimResult
    currentSimulation.request.stats = bestSimStats
    sum -= 1
  }

  currentSimulation.result = currentSimulationResult

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

function sumSubstatRolls(maxSubstatRollCounts: SimulationStats) {
  let sum = 0
  for (const stat of SubStats) {
    sum += maxSubstatRollCounts[stat]
  }
  return sum
}

export function DEBUG() {

}

function diminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
  const diminishedExcess = excess / (Math.pow(excess, 0.25))

  return lowerLimit + diminishedExcess
}

function spdDiminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
  const diminishedExcess = excess / (Math.pow(excess, 0.10))

  return lowerLimit + diminishedExcess
}

function invertDiminishingReturnsSpdFormula(mainsCount: number, target: number, rollValue: number) {
  let current = 0
  let rolls = 0

  while (current < target) {
    rolls++
    current = spdDiminishingReturnsFormula(mainsCount, rolls) * rollValue
  }

  const previousRolls = rolls - 1
  const previousValue = spdDiminishingReturnsFormula(mainsCount, previousRolls) * rollValue

  if (current === target) {
    return rolls
  }

  // Narrow down interpolation of fractional rolls by binary search
  let low = previousRolls
  let high = rolls
  let mid = 0
  const precision = 1e-6

  while (high - low > precision) {
    mid = (low + high) / 2
    const interpolatedValue = spdDiminishingReturnsFormula(mainsCount, mid) * rollValue

    if (interpolatedValue < target) {
      low = mid
    } else {
      high = mid
    }
  }

  return mid
}

export function calculatePenaltyMultiplier(
  simulationResult: SimulationResult,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
) {
  let newPenaltyMultiplier = 1
  if (metadata.breakpoints) {
    for (const stat of Object.keys(metadata.breakpoints)) {
      if (Utils.isFlat(stat)) {
        // Flats are penalized by their percentage
        newPenaltyMultiplier *= (Math.min(1, simulationResult.xa[StatToKey[stat]] / metadata.breakpoints[stat]) + 1) / 2
      } else {
        // Percents are penalize by half of the missing stat's breakpoint roll percentage
        newPenaltyMultiplier *= Math.min(1,
          1 - (metadata.breakpoints[stat] - simulationResult.xa[StatToKey[stat]]) / StatCalculator.getMaxedSubstatValue(stat as SubStats, scoringParams.quality))
      }
    }
  }
  simulationResult.penaltyMultiplier = newPenaltyMultiplier
  return newPenaltyMultiplier
}
