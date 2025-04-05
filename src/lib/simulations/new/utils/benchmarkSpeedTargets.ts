// speedCalculator.ts
import { Stats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'
import { SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { Simulation } from 'lib/simulations/statSimulationController'

export function calculateTargetSpeed(
  originalSim: Simulation,
  originalSimResult: SimulationResult,
  forcedSpdSim: Simulation,
  forcedSpdSimResult: SimulationResult,
  simulationFlags: SimulationFlags,
) {
  let targetSpd: number

  if (simulationFlags.characterPoetActive) {
    // When the original character has poet, benchmark against the original character
    targetSpd = forcedSpdSimResult.xa[Key.SPD]
  } else {
    if (simulationFlags.simPoetActive) {
      // We don't want to have the original character's combat stats penalized by poet if they're not on poet
      targetSpd = simulationFlags.forceBasicSpdValue
    } else {
      originalSimResult = forcedSpdSimResult
      originalSim = forcedSpdSim
      targetSpd = originalSimResult.xa[Key.SPD]
    }
  }

  return { targetSpd, originalSimResult, originalSim }
}

export function applySpeedAdjustments(
  simulationFlags: SimulationFlags,
  baselineSimResult: SimulationResult,
  originalSpd: number,
  spdBenchmark?: number,
): void {
  // Special handling for poet - force the spd to certain thresholds when poet is active

  if (simulationFlags.simPoetActive) {
    // When the sim has poet, use the lowest possible poet SPD breakpoint for benchmarks - though match the custom benchmark spd within the breakpoint range
    if (baselineSimResult[Stats.SPD] < 95) {
      simulationFlags.forceBasicSpdValue = Math.min(originalSpd, 94.999, spdBenchmark ?? 94.999)
    } else if (baselineSimResult[Stats.SPD] < 110) {
      simulationFlags.forceBasicSpdValue = Math.min(originalSpd, 109.999, spdBenchmark ?? 109.999)
    } else {
      // No-op
    }
  } else {
    // When the sim does not have poet, force the original spd and proceed as regular
    simulationFlags.forceBasicSpdValue = Math.min(spdBenchmark ?? originalSpd, originalSpd)
  }
}
