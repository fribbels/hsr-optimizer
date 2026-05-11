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
} from 'lib/constants/constants'
import type { Form } from 'types/form'
import type { ScoringConfigType, SimulationMetadata } from 'types/metadata'
import type { OptimizerContext } from 'types/optimizer'

type PoolCandidate = {
  sim: Simulation
  result: RunStatSimulationsResult
  combatSpd: number
}

export function runPoolBaselineSim(
  originalSimRequest: SimulationRequest,
  setCombination: SimulationSets,
  form: Form,
  context: OptimizerContext,
  flags: SimulationFlags,
  metadata: SimulationMetadata,
  configType: ScoringConfigType,
  targetCombatSpd?: number,
): { sim: Simulation; result: RunStatSimulationsResult } {
  const correctedFlags: SimulationFlags = { ...flags, simPoetActive: isPoetSet(setCombination) }

  const params: RunSimulationsParams = {
    ...baselineScoringParams,
    mainStatMultiplier: 0,
    simulationFlags: correctedFlags,
  }

  const forceErrRope = correctedFlags.forceErrRope
  const ropeParts = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  const qualifying: PoolCandidate[] = []
  let bestFallback: PoolCandidate | undefined

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
            stats: {},
          }

          const sim: Simulation = {
            simType: StatSimTypes.SubstatRolls,
            request: request,
          } as Simulation

          const result = cloneSimResult(runStatSimulations([sim], form, context, params)[0])
          applyScoringFunction(result, metadata, true, false, context, configType)
          const combatSpd = result.x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)

          const candidate: PoolCandidate = { sim, result, combatSpd }

          if (targetCombatSpd && combatSpd < targetCombatSpd) {
            if (!bestFallback || combatSpd > bestFallback.combatSpd) {
              bestFallback = candidate
            }
          } else {
            qualifying.push(candidate)
          }
        }
      }
    }
  }

  let best: PoolCandidate | undefined
  if (qualifying.length > 0) {
    best = qualifying.reduce((a, b) => b.result.simScore > a.result.simScore ? b : a)
  } else {
    best = bestFallback
  }

  return { sim: best!.sim, result: best!.result }
}

export function resolveComboSpdTarget(
  setCombination: SimulationSets,
  baselineSim: Simulation,
  form: Form,
  context: OptimizerContext,
  baseFlags: SimulationFlags,
  originalSpd: number,
  spdBenchmark: number | undefined,
): { combatSpdTarget: number; basicSpdTarget: number; flags: SimulationFlags } {
  const setCombinationFlags: SimulationFlags = { ...baseFlags, simPoetActive: isPoetSet(setCombination) }

  // Zero-mains sim to determine the natural basic SPD for Poet breakpoint detection.
  // Sets like Poet give negative SPD, so each combo needs its own check.
  const zeroSpdFlags: SimulationFlags = { ...setCombinationFlags, benchmarkBasicSpdTarget: 0 }
  const zeroSpdResult = runStatSimulations([baselineSim], form, context, {
    ...baselineScoringParams,
    mainStatMultiplier: 0,
    simulationFlags: zeroSpdFlags,
  })[0]

  applyBasicSpeedTargetFlag(setCombinationFlags, zeroSpdResult, originalSpd, spdBenchmark)

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
