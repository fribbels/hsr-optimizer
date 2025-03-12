import { Parts, Stats, SubStats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'
import { computeOptimalSimulation } from 'lib/scoring/characterScorer'
import { calculateMaxSubstatRollCounts, calculateMinSubstatRollCounts } from 'lib/scoring/rollCounter'
import { maximumScoringParams, PartialSimulationWrapper, ScoringFunction, simSorter, SimulationFlags, SimulationResult, spdRollsCap } from 'lib/scoring/simScoringUtils'
import { Simulation } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export function simulateMaximumBuild(
  bestSim: Simulation,
  targetSpd: number,
  metadata: SimulationMetadata,
  simulationForm: Form,
  context: OptimizerContext,
  applyScoringFunction: ScoringFunction,
  baselineSimResult: SimulationResult,
  originalSimResult: SimulationResult,
  simulationFlags: SimulationFlags,
) {
  // Convert the benchmark spd rolls to max spd rolls
  const spdDiff = targetSpd - baselineSimResult.xa[Key.SPD]

  const maximumSimulations: Simulation[] = []

  // Spheres with DMG % are unique because they can alter a build due to DMG % not being a substat.
  // Permute the sphere options to find the best
  for (const feetMainStat of metadata.parts[Parts.Feet]) {
    for (const sphereMainStat of metadata.parts[Parts.PlanarSphere]) {
      const bestSimClone: Simulation = TsUtils.clone(bestSim)
      bestSimClone.request.simPlanarSphere = sphereMainStat
      bestSimClone.request.simFeet = feetMainStat

      const spdRolls = feetMainStat == Stats.SPD
        ? Math.max(0, TsUtils.precisionRound((spdDiff - 25.032) / maximumScoringParams.speedRollValue))
        : Math.max(0, TsUtils.precisionRound((spdDiff) / maximumScoringParams.speedRollValue))

      if (spdRolls > 36 && feetMainStat != Stats.SPD) {
        continue
      }

      const partialSimulationWrapper: PartialSimulationWrapper = {
        simulation: bestSimClone,
        finalSpeed: 0, // not needed
        speedRollsDeduction: Math.min(spdRolls, spdRollsCap(bestSimClone, maximumScoringParams)),
      }

      const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, maximumScoringParams, simulationFlags)
      const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, maximumScoringParams, baselineSimResult, simulationFlags)
      Object.values(SubStats).map((x) => partialSimulationWrapper.simulation.request.stats[x] = maxSubstatRollCounts[x])
      const maxSim = computeOptimalSimulation(
        partialSimulationWrapper,
        minSubstatRollCounts,
        maxSubstatRollCounts,
        simulationForm,
        context,
        applyScoringFunction,
        metadata,
        maximumScoringParams,
        simulationFlags,
      )

      maximumSimulations.push(maxSim)
    }
  }

  // Find the highest scoring
  maximumSimulations.sort(simSorter)

  return maximumSimulations[0]
}
