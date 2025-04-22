import { Key } from 'lib/optimization/computedStatsArray'
import { SimulationFlags } from 'lib/scoring/simScoringUtils'
import { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'

export function calculateTargetSpeedNew(
  originalSimResult: RunStatSimulationsResult,
  forcedSpdSimResult: RunStatSimulationsResult,
  simulationFlags: SimulationFlags,
) {
  let targetSpd: number

  if (simulationFlags.characterPoetActive) {
    // When the original character has poet, benchmark against the original character
    return forcedSpdSimResult.xa[Key.SPD]
  }

  if (simulationFlags.simPoetActive) {
    // We don't want to have the original character's combat stats penalized by poet if they're not on poet
    targetSpd = simulationFlags.forceBasicSpdValue
  } else {
    targetSpd = forcedSpdSimResult.xa[Key.SPD]
  }

  return targetSpd
}

export function applySpeedFlags(
  simulationFlags: SimulationFlags,
  baselineSimResult: RunStatSimulationsResult,
  originalSpd: number,
  spdBenchmark?: number,
  force?: boolean,
): void {
  // Special handling for poet - force the spd to certain thresholds when poet is active

  if (simulationFlags.simPoetActive) {
    // When the sim has poet, use the lowest possible poet SPD breakpoint for benchmarks - though match the custom benchmark spd within the breakpoint range
    if (baselineSimResult.ca[Key.SPD] < 95) {
      simulationFlags.forceBasicSpdValue = Math.min(originalSpd, 94.999, spdBenchmark ?? 94.999)
    } else if (baselineSimResult.ca[Key.SPD] < 110) {
      simulationFlags.forceBasicSpdValue = Math.min(originalSpd, 109.999, spdBenchmark ?? 109.999)
    } else {
      // No-op
    }
  } else {
    if (force) {
      // For custom benchmarking, ignore restrictions and force the spd
      simulationFlags.forceBasicSpdValue = spdBenchmark!
    } else {
      // When the sim does not have poet, force the original spd and proceed as regular
      simulationFlags.forceBasicSpdValue = Math.min(spdBenchmark ?? originalSpd, originalSpd)
    }
  }
}
