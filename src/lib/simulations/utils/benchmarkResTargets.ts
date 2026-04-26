import type { SimulationFlags } from 'lib/scoring/simScoringUtils'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import type { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'

/**
 * If the player's combat RES >= 50%, set a target so benchmarks equalize RES.
 * Mirrors SPD equalization: the benchmark must match the player's RES investment.
 */
export function applyBasicResTargetFlag(
  simulationFlags: SimulationFlags,
  originalSimResult: RunStatSimulationsResult,
): void {
  const combatRes = originalSimResult.x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX)
  if (combatRes >= 0.50) {
    simulationFlags.benchmarkBasicResTarget = combatRes
  }
}
