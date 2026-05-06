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
import {
  Parts,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import type { Form } from 'types/form'
import type { ScoringConfigType, SimulationMetadata } from 'types/metadata'
import type { OptimizerContext } from 'types/optimizer'

export function runPoolBaselineSim(
  originalSimRequest: SimulationRequest,
  setCombination: SimulationSets,
  form: Form,
  context: OptimizerContext,
  flags: SimulationFlags,
  metadata: SimulationMetadata,
  scoringActionKey?: string,
  configType?: ScoringConfigType,
): { sim: Simulation; result: RunStatSimulationsResult } {
  const correctedFlags: SimulationFlags = { ...flags, simPoetActive: isPoetSet(setCombination) }
  const isNonDps = configType && configType !== 'dps'

  if (isNonDps) {
    return runNonDpsPoolBaselineSim(originalSimRequest, setCombination, form, context, correctedFlags, metadata, scoringActionKey, configType)
  }

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

  const params: RunSimulationsParams = {
    ...baselineScoringParams,
    mainStatMultiplier: 0,
    simulationFlags: correctedFlags,
  }

  const result = cloneSimResult(runStatSimulations([sim], form, context, params)[0])
  applyScoringFunction(result, metadata, false, false, scoringActionKey, context, configType)
  return { sim, result }
}

function runNonDpsPoolBaselineSim(
  originalSimRequest: SimulationRequest,
  setCombination: SimulationSets,
  form: Form,
  context: OptimizerContext,
  correctedFlags: SimulationFlags,
  metadata: SimulationMetadata,
  scoringActionKey?: string,
  configType?: ScoringConfigType,
): { sim: Simulation; result: RunStatSimulationsResult } {
  const baselineStats: Record<string, number> = {}
  for (const sub of SubStats) {
    baselineStats[sub] = 2
  }

  const params: RunSimulationsParams = {
    ...baselineScoringParams,
    mainStatMultiplier: 1,
    simulationFlags: correctedFlags,
  }

  const forceErrRope = correctedFlags.forceErrRope
  const ropeParts = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  let bestSim: Simulation | undefined
  let bestResult: RunStatSimulationsResult | undefined
  let bestScore = -Infinity

  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of metadata.parts[Parts.Feet]) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of ropeParts) {
          const request: SimulationRequest = {
            simRelicSet1: setCombination.relicSet1,
            simRelicSet2: setCombination.relicSet2,
            simOrnamentSet: setCombination.ornamentSet,
            simBody: body,
            simFeet: feet,
            simPlanarSphere: planarSphere,
            simLinkRope: linkRope,
            stats: baselineStats,
          }

          const sim: Simulation = {
            simType: StatSimTypes.SubstatRolls,
            request: request,
          } as Simulation

          const result = cloneSimResult(runStatSimulations([sim], form, context, params)[0])
          applyScoringFunction(result, metadata, false, false, scoringActionKey, context, configType)

          if (result.simScore > bestScore) {
            bestScore = result.simScore
            bestSim = sim
            bestResult = result
          }
        }
      }
    }
  }

  return { sim: bestSim!, result: bestResult! }
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
