import { Key } from 'lib/optimization/computedStatsArray'
import { SimulationFlags } from 'lib/scoring/simScoringUtils'
import { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'

export function applyBasicSpeedTargetFlag(
  simulationFlags: SimulationFlags,
  baselineSimResult: RunStatSimulationsResult,
  originalSpd: number,
  spdBenchmark?: number,
  force?: boolean,
): void {
  if (force) {
    simulationFlags.benchmarkBasicSpdTarget = spdBenchmark!
    return
  }

  // When the sim has poet, use the lowest possible poet SPD breakpoint for benchmarks - though match the custom benchmark spd within the breakpoint range
  if (simulationFlags.simPoetActive) {
    if (baselineSimResult.ca[Key.SPD] < 95) {
      simulationFlags.benchmarkBasicSpdTarget = Math.min(originalSpd, 94.999, spdBenchmark ?? 94.999)
      return
    } else if (baselineSimResult.ca[Key.SPD] < 110) {
      simulationFlags.benchmarkBasicSpdTarget = Math.min(originalSpd, 109.999, spdBenchmark ?? 109.999)
      return
    }
  }

  // When the sim does not have poet, target the original spd and proceed as regular
  simulationFlags.benchmarkBasicSpdTarget = Math.min(spdBenchmark ?? originalSpd, originalSpd)
}
