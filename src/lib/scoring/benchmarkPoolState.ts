import type { SimulationSets } from 'lib/scoring/dpsScore'
import {
  applyScoringFunction,
  baselineScoringParams,
  cloneSimResult,
  isPoetSet,
  type SimulationFlags,
} from 'lib/scoring/simScoringUtils'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import type {
  RunSimulationsParams,
  RunStatSimulationsResult,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { applyBasicSpeedTargetFlag } from 'lib/simulations/utils/benchmarkSpeedTargets'
import type { Form } from 'types/form'
import type { SimulationMetadata } from 'types/metadata'
import type { OptimizerContext } from 'types/optimizer'

export function runPoolBaselineSim(
  originalSimRequest: SimulationRequest,
  setCombination: SimulationSets,
  form: Form,
  context: OptimizerContext,
  flags: SimulationFlags,
  metadata: SimulationMetadata,
): { sim: Simulation; result: RunStatSimulationsResult } {
  const request = {
    ...originalSimRequest,
    stats: {},
    simRelicSet1: setCombination.relicSet1,
    simRelicSet2: setCombination.relicSet2,
    simOrnamentSet: setCombination.ornamentSet,
  } as SimulationRequest

  const sim: Simulation = {
    simType: StatSimTypes.SubstatRolls,
    request,
  } as Simulation

  const correctedFlags: SimulationFlags = { ...flags, simPoetActive: isPoetSet(setCombination) }

  const params: RunSimulationsParams = {
    ...baselineScoringParams,
    mainStatMultiplier: 0,
    simulationFlags: correctedFlags,
  }

  const result = cloneSimResult(runStatSimulations([sim], form, context, params)[0])
  applyScoringFunction(result, metadata)
  return { sim, result }
}

export function resolveComboSpdTarget(
  setCombination: SimulationSets,
  baselineSim: Simulation,
  baselineResult: RunStatSimulationsResult,
  form: Form,
  context: OptimizerContext,
  baseFlags: SimulationFlags,
  originalSpd: number,
  spdBenchmark: number | undefined,
): { combatSpdTarget: number; basicSpdTarget: number; flags: SimulationFlags } {
  const setCombinationFlags: SimulationFlags = { ...baseFlags, simPoetActive: isPoetSet(setCombination) }
  applyBasicSpeedTargetFlag(setCombinationFlags, baselineResult, originalSpd, spdBenchmark)

  const conversionParams: RunSimulationsParams = {
    ...baselineScoringParams,
    mainStatMultiplier: 0,
    simulationFlags: setCombinationFlags,
  }
  const conversionResult = runStatSimulations([baselineSim], form, context, conversionParams)[0]
  const combatSpdTarget = conversionResult.x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)

  return {
    combatSpdTarget,
    basicSpdTarget: setCombinationFlags.benchmarkBasicSpdTarget,
    flags: setCombinationFlags,
  }
}
