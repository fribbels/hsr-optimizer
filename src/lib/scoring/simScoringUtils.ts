import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { OptimizerDisplayData } from 'lib/optimization/bufferPacker'
import {
  ComputedStatsArray,
  ComputedStatsArrayCore,
  Key,
  StatToKey,
} from 'lib/optimization/computedStatsArray'
import { StatCalculator } from 'lib/relics/statCalculator'

import { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import {
  RunStatSimulationsResult,
  Simulation,
} from 'lib/simulations/statSimulationTypes'
import { Utils } from 'lib/utils/utils'
import { Form } from 'types/form'
import {
  DBMetadataCharacter,
  SimulationMetadata,
} from 'types/metadata'
import { Relic } from 'types/relic'

export enum ScoringType {
  COMBAT_SCORE,
  SUBSTAT_SCORE,
  NONE,
}

export type ScoringParams = {
  quality: number,
  speedRollValue: number,
  substatGoal: number,
  freeRolls: number,
  maxPerSub: number,
  deductionPerMain: number,
  baselineFreeRolls: number,
  limitFlatStats: boolean,
  enforcePossibleDistribution: boolean,
  substatRollsModifier: (
    rolls: number,
    stat: string,
    sim: Simulation,
  ) => number,
}

export type SimulationResult = OptimizerDisplayData & {
  unpenalizedSimScore: number,
  penaltyMultiplier: number,
  simScore: number,
  xa: Float32Array,
  ca: Float32Array,
}

export type SimulationScore = {
  percent: number,

  originalSim: Simulation,
  baselineSim: Simulation,
  benchmarkSim: Simulation,
  maximumSim: Simulation,

  originalSimResult: RunStatSimulationsResult,
  baselineSimResult: RunStatSimulationsResult,
  benchmarkSimResult: RunStatSimulationsResult,
  maximumSimResult: RunStatSimulationsResult,

  originalSimScore: number,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,

  substatUpgrades: SimulationStatUpgrade[],
  setUpgrades: SimulationStatUpgrade[],
  mainUpgrades: SimulationStatUpgrade[],

  simulationForm: Form,
  simulationMetadata: SimulationMetadata,
  characterMetadata?: DBMetadataCharacter,

  originalSpd: number,
  spdBenchmark: number | undefined,
  simulationFlags: SimulationFlags,
}

export type RelicBuild = {
  [key: string]: Relic,
}

export type PartialSimulationWrapper = {
  simulation: Simulation,
  speedRollsDeduction: number,
  effectiveSubstats: string[],
}

export type SimulationFlags = {
  overcapCritRate: boolean,
  simPoetActive: boolean,
  characterPoetActive: boolean,
  forceErrRope: boolean,
  benchmarkBasicSpdTarget: number,
}

export const benchmarkScoringParams: ScoringParams = {
  quality: 0.8,
  speedRollValue: 2.3,
  substatGoal: 48,
  freeRolls: 2,
  maxPerSub: 30,
  deductionPerMain: 5,
  baselineFreeRolls: 2,
  limitFlatStats: true,
  enforcePossibleDistribution: false,
  substatRollsModifier: substatRollsModifier,
}

export const baselineScoringParams: ScoringParams = benchmarkScoringParams

export const originalScoringParams: ScoringParams = {
  ...benchmarkScoringParams,
  substatRollsModifier: (rolls: number) => rolls,
}

export const maximumScoringParams: ScoringParams = {
  quality: 1.0,
  speedRollValue: 2.6,
  substatGoal: 54,
  freeRolls: 0,
  maxPerSub: 36,
  deductionPerMain: 6,
  baselineFreeRolls: 0,
  limitFlatStats: false,
  enforcePossibleDistribution: true,
  substatRollsModifier: (rolls: number) => rolls,
}

export function substatRollsModifier(
  rolls: number,
  stat: string,
  sim: Simulation,
) {
  const mainsCount = [
    sim.request.simBody,
    sim.request.simFeet,
    sim.request.simPlanarSphere,
    sim.request.simLinkRope,
  ].filter((x) => x == stat).length

  return stat == Stats.SPD ? spdDiminishingReturnsFormula(mainsCount, rolls) : diminishingReturnsFormula(mainsCount, rolls)
}

export function diminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - lowerLimit)
  const diminishedExcess = excess / (Math.pow(excess, 0.25))

  return lowerLimit + diminishedExcess
}

export function spdDiminishingReturnsFormula(mainsCount: number, rolls: number) {
  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - lowerLimit)
  const diminishedExcess = excess / (Math.pow(excess, 0.10))

  return lowerLimit + diminishedExcess
}

export function invertDiminishingReturnsSpdFormula(mainsCount: number, target: number, rollValue: number) {
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

export function isSpdBoots(simulation: Simulation) {
  return simulation.request.simFeet == Stats.SPD
}

export function spdRollsCap(
  simulation: Simulation,
  scoringParams: ScoringParams,
) {
  const spdBoots = isSpdBoots(simulation)

  if (scoringParams.substatGoal == 48) {
    return spdBoots ? 25 : 26
  } else {
    return spdBoots ? 30 : 36
  }
}

export function simSorter(a: Simulation, b: Simulation) {
  const aResult = a.result
  const bResult = b.result

  if (!aResult && !bResult) return 0
  if (!aResult) return 1
  if (!bResult) return -1

  return bResult.simScore - aResult.simScore
}

export function applyScoringFunction(result: RunStatSimulationsResult, metadata: SimulationMetadata, penalty = true) {
  if (!result) return

  const unpenalizedSimScore = result.xa[Key.COMBO_DMG]
  const penaltyMultiplier = calculatePenaltyMultiplier(result, metadata, benchmarkScoringParams)
  result.simScore = unpenalizedSimScore * (penalty ? penaltyMultiplier : 1)
}

export function calculatePenaltyMultiplier(
  simulationResult: RunStatSimulationsResult,
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
        newPenaltyMultiplier *= Math.min(
          1,
          1
            - (metadata.breakpoints[stat] - simulationResult.xa[StatToKey[stat]])
              / StatCalculator.getMaxedSubstatValue(stat as SubStats, scoringParams.quality),
        )
      }
    }
  }

  return newPenaltyMultiplier
}

export function cloneComputedStatsArray(x: ComputedStatsArray) {
  const clone = new ComputedStatsArrayCore(false)
  clone.a.set(new Float32Array(x.a))
  clone.c.a.set(new Float32Array(x.c.a))

  clone.c.id = x.c.id
  clone.c.relicSetIndex = x.c.relicSetIndex
  clone.c.ornamentSetIndex = x.c.ornamentSetIndex

  return clone as ComputedStatsArray
}

export function cloneSimResult(result: RunStatSimulationsResult) {
  const x = cloneComputedStatsArray(result.x)
  result.x = x
  result.xa = x.a
  result.ca = x.c.a

  return result
}

// Does not clone relic/ornament set index
export function cloneWorkerResult(result: RunStatSimulationsResult) {
  const clone = new ComputedStatsArrayCore(false)
  const xa = new Float32Array(result.xa)
  const ca = new Float32Array(result.ca)
  clone.a.set(xa)
  clone.c.a.set(ca)

  result.x = clone as ComputedStatsArray
  result.xa = xa
  result.ca = ca

  return result
}
